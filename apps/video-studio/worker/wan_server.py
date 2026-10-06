import json
import os
import subprocess
import threading
import time
import uuid
from pathlib import Path
from typing import Literal

import torch
from diffusers import WanPipeline
from diffusers.utils import export_to_video
from fastapi import BackgroundTasks, FastAPI, Header, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

app = FastAPI(title='MABRIG Cinema Wan GPU Worker', version='2.0.0')

TOKEN = os.getenv('GPU_WORKER_TOKEN', '').strip()
PUBLIC_URL = os.getenv('GPU_WORKER_PUBLIC_URL', '').strip().rstrip('/')
MODEL_ID = os.getenv(
    'WAN_MODEL_ID',
    'Wan-AI/Wan2.1-T2V-1.3B-Diffusers',
).strip()
OUTPUT_DIR = Path(os.getenv('VIDEO_OUTPUT_DIR', '/data/outputs')).resolve()
FRAME_DIR = (OUTPUT_DIR / 'frames').resolve()
ASSEMBLY_DIR = (OUTPUT_DIR / 'assemblies').resolve()
CPU_OFFLOAD = os.getenv('WAN_CPU_OFFLOAD', 'true').strip().lower() in {
    '1',
    'true',
    'yes',
}
DEFAULT_FRAMES = int(os.getenv('WAN_NUM_FRAMES', '81'))
DEFAULT_FPS = int(os.getenv('WAN_FPS', '16'))
DEFAULT_STEPS = int(os.getenv('WAN_STEPS', '30'))
DEFAULT_GUIDANCE = float(os.getenv('WAN_GUIDANCE_SCALE', '5.0'))
DEFAULT_SEED = int(os.getenv('WAN_SEED', '42'))

for directory in (OUTPUT_DIR, FRAME_DIR, ASSEMBLY_DIR):
    directory.mkdir(parents=True, exist_ok=True)

jobs: dict[str, dict] = {}
assemblies: dict[str, dict] = {}
jobs_lock = threading.Lock()
assemblies_lock = threading.Lock()
pipeline_lock = threading.Lock()
generation_lock = threading.Lock()
assembly_lock = threading.Lock()
pipeline: WanPipeline | None = None


class RenderJob(BaseModel):
    project_id: str = Field(min_length=1, max_length=120)
    audio_url: str = ''
    reference_urls: list[str] = Field(default_factory=list, max_length=8)
    brief: str = Field(min_length=1, max_length=12000)
    aspect_ratio: Literal['16:9', '9:16', '1:1'] = '16:9'


class AssemblyJob(BaseModel):
    project_id: str = Field(min_length=1, max_length=120)
    title: str = Field(default='MABRIG Cinema Film', max_length=180)
    job_ids: list[str] = Field(min_length=1, max_length=200)
    width: int = Field(default=1920, ge=480, le=3840)
    height: int = Field(default=1080, ge=480, le=2160)
    fps: int = Field(default=24, ge=12, le=60)


def auth(authorization: str | None):
    if not TOKEN:
        raise HTTPException(
            status_code=503,
            detail='GPU_WORKER_TOKEN is not configured.',
        )
    if authorization != f'Bearer {TOKEN}':
        raise HTTPException(status_code=401, detail='Unauthorized')


def generation_ready() -> bool:
    return bool(torch.cuda.is_available() and PUBLIC_URL and TOKEN)


def ffmpeg_ready() -> bool:
    try:
        subprocess.run(
            ['ffmpeg', '-version'],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True,
            timeout=5,
        )
        return True
    except Exception:
        return False


def dimensions(aspect_ratio: str) -> tuple[int, int]:
    if aspect_ratio == '9:16':
        return 480, 832
    if aspect_ratio == '1:1':
        return 512, 512
    return 832, 480


def get_pipeline() -> WanPipeline:
    global pipeline
    if pipeline is not None:
        return pipeline

    with pipeline_lock:
        if pipeline is not None:
            return pipeline
        if not torch.cuda.is_available():
            raise RuntimeError('CUDA GPU is required for this Wan worker.')

        loaded = WanPipeline.from_pretrained(
            MODEL_ID,
            torch_dtype=torch.bfloat16,
        )

        if CPU_OFFLOAD:
            loaded.enable_model_cpu_offload()
        else:
            loaded.to('cuda')

        pipeline = loaded
        return pipeline


def update_job(job_id: str, **changes):
    with jobs_lock:
        if job_id in jobs:
            jobs[job_id].update(changes)
            jobs[job_id]['updatedAt'] = time.time()


def update_assembly(assembly_id: str, **changes):
    with assemblies_lock:
        if assembly_id in assemblies:
            assemblies[assembly_id].update(changes)
            assemblies[assembly_id]['updatedAt'] = time.time()


def job_file(job_id: str) -> Path:
    if not job_id.startswith('wan_'):
        raise RuntimeError('Invalid Wan job id.')
    path = (OUTPUT_DIR / f'{job_id}.mp4').resolve()
    if path.parent != OUTPUT_DIR or not path.is_file():
        raise RuntimeError(f'Rendered media for {job_id} is unavailable.')
    return path


def media_duration(path: Path) -> float:
    result = subprocess.run(
        [
            'ffprobe',
            '-v',
            'error',
            '-show_entries',
            'format=duration',
            '-of',
            'default=noprint_wrappers=1:nokey=1',
            str(path),
        ],
        capture_output=True,
        text=True,
        check=True,
        timeout=20,
    )
    return max(0.0, float(result.stdout.strip() or '0'))


def ensure_frames(job_id: str) -> dict:
    source = job_file(job_id)
    first = (FRAME_DIR / f'{job_id}_first.jpg').resolve()
    last = (FRAME_DIR / f'{job_id}_last.jpg').resolve()

    if not first.is_file():
        subprocess.run(
            [
                'ffmpeg',
                '-y',
                '-ss',
                '0.05',
                '-i',
                str(source),
                '-frames:v',
                '1',
                '-q:v',
                '2',
                str(first),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            check=True,
            timeout=60,
        )

    if not last.is_file():
        duration = media_duration(source)
        seek = max(0.05, duration - 0.12)
        subprocess.run(
            [
                'ffmpeg',
                '-y',
                '-ss',
                f'{seek:.3f}',
                '-i',
                str(source),
                '-frames:v',
                '1',
                '-q:v',
                '2',
                str(last),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            check=True,
            timeout=60,
        )

    return {
        'jobId': job_id,
        'firstFrameUrl': f'{PUBLIC_URL}/frames/{first.name}',
        'lastFrameUrl': f'{PUBLIC_URL}/frames/{last.name}',
        'durationSeconds': media_duration(source),
    }


def generate(job_id: str, request: RenderJob):
    update_job(job_id, status='working')
    try:
        pipe = get_pipeline()
        width, height = dimensions(request.aspect_ratio)
        seed = DEFAULT_SEED
        generator = torch.Generator(device='cpu').manual_seed(seed)
        filename = f'{job_id}.mp4'
        output_path = OUTPUT_DIR / filename

        with generation_lock:
            result = pipe(
                prompt=request.brief,
                height=height,
                width=width,
                num_frames=max(17, min(DEFAULT_FRAMES, 129)),
                num_inference_steps=max(4, min(DEFAULT_STEPS, 80)),
                guidance_scale=max(1.0, min(DEFAULT_GUIDANCE, 20.0)),
                generator=generator,
            )

            frames = result.frames[0]
            export_to_video(
                frames,
                str(output_path),
                fps=max(8, min(DEFAULT_FPS, 30)),
            )

        if not output_path.is_file() or output_path.stat().st_size == 0:
            raise RuntimeError('Wan generation completed without an output file.')

        update_job(
            job_id,
            status='succeeded',
            outputUrls=[f'{PUBLIC_URL}/outputs/{filename}'],
            metadata={
                'model': MODEL_ID,
                'width': width,
                'height': height,
                'numFrames': max(17, min(DEFAULT_FRAMES, 129)),
                'fps': max(8, min(DEFAULT_FPS, 30)),
                'seed': seed,
                'referenceCount': len(request.reference_urls),
            },
        )
    except Exception as exc:
        update_job(job_id, status='failed', error=str(exc)[:4000])
    finally:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()


def assemble(assembly_id: str, request: AssemblyJob):
    update_assembly(assembly_id, status='working')
    manifest = ASSEMBLY_DIR / f'{assembly_id}.txt'
    output_path = ASSEMBLY_DIR / f'{assembly_id}.mp4'
    try:
        if not ffmpeg_ready():
            raise RuntimeError('ffmpeg is unavailable on the worker.')

        paths = [job_file(job_id) for job_id in request.job_ids]
        manifest.write_text(
            ''.join(
                f"file '{str(path).replace(chr(39), chr(39) + chr(92) + chr(39) + chr(39))}'\n"
                for path in paths
            ),
            encoding='utf-8',
        )

        vf = (
            f'scale={request.width}:{request.height}:'
            'force_original_aspect_ratio=decrease,'
            f'pad={request.width}:{request.height}:'
            '(ow-iw)/2:(oh-ih)/2,setsar=1,'
            f'fps={request.fps}'
        )

        with assembly_lock:
            subprocess.run(
                [
                    'ffmpeg',
                    '-y',
                    '-f',
                    'concat',
                    '-safe',
                    '0',
                    '-i',
                    str(manifest),
                    '-vf',
                    vf,
                    '-c:v',
                    'libx264',
                    '-preset',
                    'medium',
                    '-crf',
                    '18',
                    '-c:a',
                    'aac',
                    '-ar',
                    '48000',
                    '-movflags',
                    '+faststart',
                    str(output_path),
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                check=True,
                timeout=3600,
            )

        if not output_path.is_file() or output_path.stat().st_size == 0:
            raise RuntimeError('FFmpeg assembly completed without an output file.')

        update_assembly(
            assembly_id,
            status='succeeded',
            outputUrl=f'{PUBLIC_URL}/assemblies/{assembly_id}/output',
            sizeBytes=output_path.stat().st_size,
            durationSeconds=media_duration(output_path),
        )
    except Exception as exc:
        update_assembly(assembly_id, status='failed', error=str(exc)[:4000])
    finally:
        try:
            manifest.unlink(missing_ok=True)
        except Exception:
            pass


def enqueue(job: RenderJob, background_tasks: BackgroundTasks):
    if not generation_ready():
        raise HTTPException(
            status_code=503,
            detail=(
                'Wan worker is not generation-ready. Configure CUDA, '
                'GPU_WORKER_TOKEN and GPU_WORKER_PUBLIC_URL.'
            ),
        )

    job_id = f'wan_{uuid.uuid4().hex}'
    now = time.time()
    with jobs_lock:
        jobs[job_id] = {
            'jobId': job_id,
            'projectId': job.project_id,
            'status': 'queued',
            'outputUrls': [],
            'error': None,
            'model': MODEL_ID,
            'createdAt': now,
            'updatedAt': now,
        }

    background_tasks.add_task(generate, job_id, job)

    return {
        'accepted': True,
        'jobId': job_id,
        'projectId': job.project_id,
        'status': 'queued',
        'model': MODEL_ID,
        'statusUrl': f'/jobs/{job_id}',
    }


@app.get('/health')
def health():
    return {
        'ok': True,
        'gpuWorker': True,
        'backend': 'wan-diffusers',
        'model': MODEL_ID,
        'cudaAvailable': torch.cuda.is_available(),
        'ffmpegAvailable': ffmpeg_ready(),
        'modelLoaded': pipeline is not None,
        'generationReady': generation_ready(),
        'assemblyReady': bool(PUBLIC_URL and TOKEN and ffmpeg_ready()),
        'detail': (
            'Wan worker is ready.'
            if generation_ready()
            else 'Configure a CUDA GPU, GPU_WORKER_TOKEN and GPU_WORKER_PUBLIC_URL.'
        ),
    }


@app.post('/jobs', status_code=202)
def create_job(
    job: RenderJob,
    background_tasks: BackgroundTasks,
    authorization: str | None = Header(default=None),
):
    auth(authorization)
    return enqueue(job, background_tasks)


@app.post('/generate-video', status_code=202)
def generate_video(
    job: RenderJob,
    background_tasks: BackgroundTasks,
    authorization: str | None = Header(default=None),
):
    auth(authorization)
    return enqueue(job, background_tasks)


@app.get('/jobs/{job_id}')
def get_job(job_id: str, authorization: str | None = Header(default=None)):
    auth(authorization)
    with jobs_lock:
        job = jobs.get(job_id)
        if not job:
            raise HTTPException(status_code=404, detail='Job not found')
        return dict(job)


@app.get('/jobs/{job_id}/frames')
def get_job_frames(job_id: str, authorization: str | None = Header(default=None)):
    auth(authorization)
    with jobs_lock:
        job = jobs.get(job_id)
        if not job:
            raise HTTPException(status_code=404, detail='Job not found')
        if job.get('status') != 'succeeded':
            raise HTTPException(status_code=409, detail='Job has not succeeded yet.')
    try:
        return ensure_frames(job_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)[:1000])


@app.get('/outputs/{filename}')
def get_output(filename: str, authorization: str | None = Header(default=None)):
    auth(authorization)
    if Path(filename).name != filename:
        raise HTTPException(status_code=400, detail='Invalid filename')
    path = (OUTPUT_DIR / filename).resolve()
    if path.parent != OUTPUT_DIR or not path.is_file():
        raise HTTPException(status_code=404, detail='Output not found')
    return FileResponse(
        path,
        media_type='video/mp4',
        filename=filename,
        headers={'Cache-Control': 'private, no-store'},
    )


@app.get('/frames/{filename}')
def get_frame(filename: str, authorization: str | None = Header(default=None)):
    auth(authorization)
    if Path(filename).name != filename:
        raise HTTPException(status_code=400, detail='Invalid filename')
    path = (FRAME_DIR / filename).resolve()
    if path.parent != FRAME_DIR or not path.is_file():
        raise HTTPException(status_code=404, detail='Frame not found')
    return FileResponse(
        path,
        media_type='image/jpeg',
        filename=filename,
        headers={'Cache-Control': 'private, no-store'},
    )


@app.post('/assemblies', status_code=202)
def create_assembly(
    request: AssemblyJob,
    background_tasks: BackgroundTasks,
    authorization: str | None = Header(default=None),
):
    auth(authorization)
    if not ffmpeg_ready():
        raise HTTPException(status_code=503, detail='FFmpeg is not available.')
    for job_id in request.job_ids:
        with jobs_lock:
            job = jobs.get(job_id)
            if not job or job.get('status') != 'succeeded':
                raise HTTPException(
                    status_code=409,
                    detail=f'Job {job_id} is missing or not succeeded.',
                )

    assembly_id = f'film_{uuid.uuid4().hex}'
    now = time.time()
    with assemblies_lock:
        assemblies[assembly_id] = {
            'assemblyId': assembly_id,
            'projectId': request.project_id,
            'title': request.title,
            'jobIds': request.job_ids,
            'status': 'queued',
            'outputUrl': None,
            'error': None,
            'createdAt': now,
            'updatedAt': now,
        }

    background_tasks.add_task(assemble, assembly_id, request)
    return {
        'accepted': True,
        'assemblyId': assembly_id,
        'status': 'queued',
        'statusUrl': f'/assemblies/{assembly_id}',
    }


@app.get('/assemblies/{assembly_id}')
def get_assembly(
    assembly_id: str,
    authorization: str | None = Header(default=None),
):
    auth(authorization)
    with assemblies_lock:
        item = assemblies.get(assembly_id)
        if not item:
            raise HTTPException(status_code=404, detail='Assembly not found')
        return dict(item)


@app.get('/assemblies/{assembly_id}/output')
def get_assembly_output(
    assembly_id: str,
    authorization: str | None = Header(default=None),
):
    auth(authorization)
    if not assembly_id.startswith('film_'):
        raise HTTPException(status_code=400, detail='Invalid assembly id.')
    path = (ASSEMBLY_DIR / f'{assembly_id}.mp4').resolve()
    if path.parent != ASSEMBLY_DIR or not path.is_file():
        raise HTTPException(status_code=404, detail='Assembly output not found')
    return FileResponse(
        path,
        media_type='video/mp4',
        filename=f'{assembly_id}.mp4',
        headers={'Cache-Control': 'private, no-store'},
    )
