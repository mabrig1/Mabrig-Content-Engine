'use client';

import { useMemo, useState } from 'react';

export default function KaggleBridgePage(){
  const [token,setToken]=useState('');
  const [notice,setNotice]=useState('');
  const [busy,setBusy]=useState(false);

  async function pair(){
    setBusy(true);setNotice('');
    try{
      const response=await fetch('/api/admin/kaggle/pair',{method:'POST'});
      const payload=await response.json();
      if(!response.ok) throw new Error(payload?.error||'Pairing failed.');
      setToken(payload.token);
      setNotice('New Kaggle worker key created. Any older Kaggle worker key is now revoked.');
    }catch(error){
      setNotice(error instanceof Error?error.message:'Pairing failed.');
    }finally{setBusy(false)}
  }

  const starter=useMemo(()=>token?[
    "import os, requests",
    "os.environ['MABRIG_STUDIO_URL'] = 'https://aivideo.mabrigkorie.org'",
    "os.environ['MABRIG_KAGGLE_TOKEN'] = '"+token+"'",
    "worker_url = 'https://raw.githubusercontent.com/mabrig1/Mabrig-Content-Engine/unify/aivideo-into-content-engine-20261006/apps/video-studio/worker/kaggle_mabrig_worker.py'",
    "worker_code = requests.get(worker_url, timeout=60).text",
    "exec(compile(worker_code, 'kaggle_mabrig_worker.py', 'exec'))",
  ].join("\n"):'', [token]);

  async function copy(value:string){
    await navigator.clipboard.writeText(value);
    setNotice('Copied.');
  }

  return <main className="memberMain">
    <section className="memberHero compactHero">
      <p className="eyebrow">KAGGLE GPU BRIDGE</p>
      <h1>Use your Kaggle GPU as a <em>movie render worker.</em></h1>
      <p>Your Studio queues shots securely. The notebook claims one shot at a time, renders it with Wan, and returns the MP4 to your account. No public tunnel is required.</p>
    </section>

    <section className="mcGrid">
      <div className="panel">
        <h2>01 · PAIR THIS STUDIO</h2>
        <p className="departmentIntro">Generate a worker key once. The server stores only its hash. Creating a new key revokes the previous one.</p>
        <button className="generate" onClick={pair} disabled={busy}>{busy?'PAIRING…':'GENERATE KAGGLE WORKER KEY'}</button>
        {notice&&<div className="render"><b>Kaggle Bridge</b><span>{notice}</span></div>}
        {token&&<>
          <label>One-time worker key</label>
          <textarea value={token} readOnly />
          <button className="secondaryButton fullButton" onClick={()=>copy(token)}>COPY KEY</button>
        </>}
      </div>

      <div className="panel">
        <h2>02 · START YOUR EXISTING WAN NOTEBOOK</h2>
        <div className="qcList">
          <p><b>01</b>Open your recent Kaggle Wan notebook.</p>
          <p><b>02</b>Turn GPU and Internet ON.</p>
          <p><b>03</b>Run your existing Wan install/load cells.</p>
          <p><b>04</b>Paste the connection cell below.</p>
          <p><b>05</b>Run the worker cell. Leave it running while you create shots in MABRIG Cinema.</p>
        </div>
        {starter?<><textarea className="screenplayBox kaggleCode" value={starter} readOnly/><button className="secondaryButton fullButton" onClick={()=>copy(starter)}>COPY CONNECTION CELL</button></>:<div className="emptyFactory"><b>PAIR FIRST</b><span>Your connection cell appears after a worker key is generated.</span></div>}
      </div>
    </section>

    <section className="output">
      <p className="eyebrow">HOW IT WORKS</p>
      <h2>Studio → Kaggle → Studio.</h2>
      <div className="innovationStrip">
        <div><b>Queue</b><span>Choose a professional shot and send it to Kaggle.</span></div>
        <div><b>Render</b><span>Wan uses the Kaggle GPU with your existing lightweight settings.</span></div>
        <div><b>Return</b><span>The MP4 uploads back in small authenticated chunks.</span></div>
        <div><b>Continue</b><span>Play the shot in Studio, then QC, repair and edit.</span></div>
      </div>
      <p className="departmentIntro">Experimental bridge limit: 30 MB per rendered clip. It is designed for low-cost shot experimentation, not long final masters.</p>
    </section>
  </main>
}
