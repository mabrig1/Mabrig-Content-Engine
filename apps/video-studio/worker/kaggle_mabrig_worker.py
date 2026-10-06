# MABRIG Cinema Kaggle Worker
# Run this AFTER your existing Wan install/load cell.
# It uses the Wan pipeline already in memory when available.

import base64
import math
import os
import time
from pathlib import Path

import requests
import torch
from diffusers import WanPipeline
from diffusers.utils import export_to_video

STUDIO_URL = os.environ.get("MABRIG_STUDIO_URL", "https://aivideo.mabrigkorie.org").rstrip("/")
WORKER_TOKEN = os.environ.get("MABRIG_KAGGLE_TOKEN", "").strip()
MODEL_ID = os.environ.get("MABRIG_WAN_MODEL", "Wan-AI/Wan2.1-T2V-1.3B-Diffusers")
POLL_SECONDS = 8
UPLOAD_CHUNK_BYTES = 1_500_000
OUT = Path("/kaggle/working/mabrig-cinema")
OUT.mkdir(parents=True, exist_ok=True)

if not WORKER_TOKEN:
    raise RuntimeError(
        "Set MABRIG_KAGGLE_TOKEN first. Generate it from "
        "https://aivideo.mabrigkorie.org/studio/kaggle"
    )

HEADERS = {"Authorization": f"Bearer {WORKER_TOKEN}"}

def api(path, method="GET", **kwargs):
    response = requests.request(
        method,
        STUDIO_URL + path,
        headers={**HEADERS, **kwargs.pop("headers", {})},
        timeout=120,
        **kwargs,
    )
    if not response.ok:
        raise RuntimeError(f"{path} -> {response.status_code}: {response.text[:800]}")
    return response.json()

def get_pipe():
    global pipe
    if "pipe" in globals() and pipe is not None:
        print("Using existing Wan pipeline already loaded in this notebook.")
        return pipe

    print("Loading", MODEL_ID)
    pipe = WanPipeline.from_pretrained(
        MODEL_ID,
        torch_dtype=torch.float16,
    )
    pipe.enable_model_cpu_offload()
    return pipe

def dimensions(aspect_ratio):
    # Conservative Kaggle-friendly defaults for experimentation.
    if aspect_ratio == "9:16":
        return 272, 480
    if aspect_ratio == "1:1":
        return 384, 384
    return 480, 272

def report(job_id, status="working", progress=0, error=None):
    body = {"jobId": job_id, "status": status, "progress": int(progress)}
    if error:
        body["error"] = str(error)[:4000]
    try:
        api("/api/kaggle/worker/report", method="POST", json=body)
    except Exception as exc:
        print("Report warning:", exc)

def render(job):
    job_id = job["id"]
    prompt = job["prompt"]
    aspect_ratio = job.get("aspectRatio", "16:9")
    width, height = dimensions(aspect_ratio)
    video_path = OUT / f"{job_id}.mp4"

    report(job_id, progress=5)
    wan = get_pipe()
    report(job_id, progress=12)

    generator = torch.Generator(device="cpu").manual_seed(42)

    # These match the lightweight setup you were already testing:
    # 33 frames, 15 steps, 16 fps.
    result = wan(
        prompt=prompt,
        width=width,
        height=height,
        num_frames=33,
        num_inference_steps=15,
        guidance_scale=5.0,
        generator=generator,
    )

    report(job_id, progress=78)
    export_to_video(result.frames[0], str(video_path), fps=16)
    if not video_path.exists() or video_path.stat().st_size == 0:
        raise RuntimeError("Wan finished without creating a video file.")

    size = video_path.stat().st_size
    if size > 30_000_000:
        raise RuntimeError(
            f"Clip is {size/1_000_000:.1f} MB. "
            "The experimental Studio bridge currently accepts up to 30 MB per clip."
        )

    total = math.ceil(size / UPLOAD_CHUNK_BYTES)
    with open(video_path, "rb") as handle:
        for index in range(total):
            raw = handle.read(UPLOAD_CHUNK_BYTES)
            payload = {
                "jobId": job_id,
                "index": index,
                "total": total,
                "rawBytes": len(raw),
                "mime": "video/mp4",
                "dataBase64": base64.b64encode(raw).decode("ascii"),
            }
            api("/api/kaggle/worker/upload", method="POST", json=payload)
            report(job_id, progress=80 + int(((index + 1) / total) * 19))
            print(f"Uploaded chunk {index+1}/{total}")

    print("DONE:", job_id, video_path)
    return video_path

def run_worker():
    print("MABRIG Cinema Kaggle Worker online.")
    print("Studio:", STUDIO_URL)
    print("GPU:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "NO CUDA")
    if not torch.cuda.is_available():
        raise RuntimeError("Enable a Kaggle GPU accelerator before running the worker.")

    while True:
        try:
            payload = api("/api/kaggle/worker/next", method="POST", json={})
            job = payload.get("job")
            if not job:
                print("No queued shot. Waiting...")
                time.sleep(POLL_SECONDS)
                continue

            print("\nCLAIMED:", job["id"], job["shotId"])
            try:
                render(job)
            except Exception as exc:
                report(job["id"], status="failed", progress=0, error=exc)
                print("FAILED:", exc)
            finally:
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()

        except KeyboardInterrupt:
            print("Worker stopped.")
            break
        except Exception as exc:
            print("Worker loop warning:", exc)
            time.sleep(POLL_SECONDS)

run_worker()
