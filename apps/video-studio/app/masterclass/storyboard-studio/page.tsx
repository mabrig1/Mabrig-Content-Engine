'use client';

import { useMemo, useState } from 'react';
import type { FilmBlueprint, FilmProjectInput } from '../../../lib/movie-masterclass';
import type { ProfessionalFilmPackage, ProfessionalShot } from '../../../lib/pro-film-os';
import type { QCScore, StoryboardFrame, TimelinePlan } from '../../../lib/storyboard-engine';

type RenderJobState={
  jobId:string;
  status:string;
  outputUrls:string[];
  history:string[];
};

type AssemblyState={
  assemblyId:string;
  status:string;
  outputUrl?:string|null;
  error?:string|null;
};

export default function StoryboardStudioPage(){
  const [input,setInput]=useState<FilmProjectInput>({
    title:'THE CALL',
    logline:'A visionary builder must turn private conviction into public service before repeated failure convinces him to abandon the assignment.',
    genre:'Faith Epic',
    durationMinutes:3,
    audience:'Global faith, purpose and innovation audience',
    visualStyle:'Afro-cinematic prestige · rich skin tones · anamorphic highlights · controlled film grain',
    protagonist:'A focused Nigerian visionary, builder and revivalist',
    conflict:'limited resources, repeated failure and pressure to abandon the assignment',
    ending:'He chooses service over recognition and builds what the next generation needs.',
    aspectRatio:'2.39:1',
  });
  const [film,setFilm]=useState<ProfessionalFilmPackage|null>(null);
  const [storyboard,setStoryboard]=useState<StoryboardFrame[]>([]);
  const [selected,setSelected]=useState<ProfessionalShot|null>(null);
  const [qc,setQc]=useState<QCScore|null>(null);
  const [qcSource,setQcSource]=useState('');
  const [visionFrames,setVisionFrames]=useState<{firstFrameDataUrl:string;lastFrameDataUrl:string}|null>(null);
  const [timeline,setTimeline]=useState<TimelinePlan|null>(null);
  const [jobs,setJobs]=useState<Record<string,RenderJobState>>({});
  const [assembly,setAssembly]=useState<AssemblyState|null>(null);
  const [autoRepair,setAutoRepair]=useState(true);
  const [busy,setBusy]=useState('');
  const [notice,setNotice]=useState('');
  const [actorRefs,setActorRefs]=useState<string[]>([]);

  const selectedBoard=useMemo(()=>storyboard.find(x=>x.shotId===selected?.id)||null,[storyboard,selected]);

  function set<K extends keyof FilmProjectInput>(key:K,value:FilmProjectInput[K]){setInput(v=>({...v,[key]:value}));}

  async function imageFileToJpeg(file:File){
    return new Promise<string>((resolve,reject)=>{
      const objectUrl=URL.createObjectURL(file);
      const image=new Image();
      image.onload=()=>{
        try{
          const scale=Math.min(1,1024/Math.max(image.naturalWidth,image.naturalHeight));
          const canvas=document.createElement('canvas');
          canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
          canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
          const ctx=canvas.getContext('2d');
          if(!ctx) throw new Error('Canvas unavailable.');
          ctx.drawImage(image,0,0,canvas.width,canvas.height);
          URL.revokeObjectURL(objectUrl);
          resolve(canvas.toDataURL('image/jpeg',.82));
        }catch(error){URL.revokeObjectURL(objectUrl);reject(error)}
      };
      image.onerror=()=>{URL.revokeObjectURL(objectUrl);reject(new Error('Identity reference could not be read.'))};
      image.src=objectUrl;
    });
  }

  async function addActorRefs(files:FileList|null){
    if(!files)return;
    try{
      const remaining=Math.max(0,3-actorRefs.length);
      const next=await Promise.all(Array.from(files).slice(0,remaining).map(imageFileToJpeg));
      setActorRefs(current=>[...current,...next].slice(0,3));
    }catch(error){setNotice(error instanceof Error?error.message:'Reference import failed.')}
  }

  async function svgToPng(svgDataUrl:string){
    return new Promise<string>((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>{
        try{
          const canvas=document.createElement('canvas');
          canvas.width=1280;canvas.height=720;
          const ctx=canvas.getContext('2d');
          if(!ctx) throw new Error('Canvas unavailable.');
          ctx.fillStyle='#0a0a0d';ctx.fillRect(0,0,canvas.width,canvas.height);
          ctx.drawImage(image,0,0,canvas.width,canvas.height);
          resolve(canvas.toDataURL('image/png',.92));
        }catch(error){reject(error)}
      };
      image.onerror=()=>reject(new Error('Storyboard conversion failed.'));
      image.src=svgDataUrl;
    });
  }

  async function compile(){
    setBusy('compile');setNotice('');setQc(null);setVisionFrames(null);setAssembly(null);
    try{
      const b=await fetch('/api/masterclass',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
      const bp=await b.json();if(!b.ok)throw new Error(bp.error||'Blueprint failed');
      const c=await fetch('/api/cinema-os/compile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({blueprint:bp.blueprint as FilmBlueprint})});
      const cp=await c.json();if(!c.ok)throw new Error(cp.error||'Professional compile failed');
      const s=await fetch('/api/cinema-os/storyboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({film:cp.professional})});
      const sp=await s.json();if(!s.ok)throw new Error(sp.error||'Storyboard failed');
      setFilm(cp.professional);setStoryboard(sp.storyboard);setSelected(cp.professional.shots[0]||null);
      setTimeline(null);setNotice('Storyboard package compiled.');
    }catch(e){setNotice(e instanceof Error?e.message:'Compile failed')}finally{setBusy('')}
  }

  async function runRuleQc(){
    if(!selected||!film)return;
    setBusy('qc');setNotice('');
    try{
      const idx=film.shots.findIndex(x=>x.id===selected.id);
      const r=await fetch('/api/cinema-os/qc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        shot:selected,
        previousShot:idx>0?film.shots[idx-1]:null,
        hasReferenceFrame:Boolean(selectedBoard),
        hasGeneratedVideo:Boolean(jobs[selected.id]?.outputUrls?.length),
      })});
      const p=await r.json();if(!r.ok)throw new Error(p.error||'QC failed');
      setQc(p.qc);setQcSource('production-rules');
    }catch(e){setNotice(e instanceof Error?e.message:'QC failed')}finally{setBusy('')}
  }

  async function submitLocal(promptOverride?:QCScore){
    if(!selected)return null;
    const endpoint=promptOverride?'/api/cinema-os/reshoot-local':'/api/cinema-os/execute-local';
    const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      shot:selected,
      ...(promptOverride?{qc:promptOverride}:{}),
      aspectRatio:input.aspectRatio,
    })});
    const p=await r.json();
    if(!r.ok)throw new Error(p.error||p.warnings?.join(' ')||'Render submission failed');
    if(!p.submission)throw new Error('No local render route accepted this shot.');
    const previous=jobs[selected.id];
    const next:RenderJobState={
      jobId:p.submission.providerJobId,
      status:p.submission.status,
      outputUrls:[],
      history:[...(previous?.history||[]),...(previous?.jobId?[previous.jobId]:[])],
    };
    setJobs(v=>({...v,[selected.id]:next}));
    return next;
  }

  async function renderLocal(){
    if(!selected)return;
    setBusy('render');setNotice('');
    try{
      await submitLocal();
      setNotice('Local Wan render submitted.');
    }catch(e){setNotice(e instanceof Error?e.message:'Render failed')}finally{setBusy('')}
  }

  async function autoReshoot(result:QCScore){
    if(!selected||result.decision==='PASS')return;
    setBusy('reshoot');setNotice('');
    try{
      await submitLocal(result);
      setQc(null);setVisionFrames(null);
      setNotice(`Automatic ${result.decision.toLowerCase()} submitted with continuity repair prompt.`);
    }catch(e){setNotice(e instanceof Error?e.message:'Automatic reshoot failed')}finally{setBusy('')}
  }

  async function poll(){
    if(!selected)return;
    const job=jobs[selected.id];if(!job)return;
    setBusy('poll');
    try{
      const r=await fetch('/api/cinema-os/execute-local/status?jobId='+encodeURIComponent(job.jobId),{cache:'no-store'});
      const p=await r.json();if(!r.ok)throw new Error(p.error||'Status failed');
      const next={...job,status:p.status.status,outputUrls:p.status.outputUrls||[]};
      setJobs(v=>({...v,[selected.id]:next}));
      setNotice('Render status: '+p.status.status);
    }catch(e){setNotice(e instanceof Error?e.message:'Status failed')}finally{setBusy('')}
  }

  async function runVisualQc(){
    if(!selected||!film||!selectedBoard)return;
    const job=jobs[selected.id];
    if(!job||job.status!=='succeeded') {setNotice('The selected shot must finish rendering before visual QC.');return;}
    setBusy('vision');setNotice('');
    try{
      const storyboardPng=await svgToPng(selectedBoard.svgDataUrl);
      const idx=film.shots.findIndex(x=>x.id===selected.id);
      const r=await fetch('/api/cinema-os/visual-qc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        shot:selected,
        jobId:job.jobId,
        approvedStoryboardDataUrl:storyboardPng,
        previousShot:idx>0?film.shots[idx-1]:null,
        actorReferenceDataUrls:actorRefs,
      })});
      const p=await r.json();if(!r.ok)throw new Error(p.error||'Visual QC failed');
      setQc(p.qc);setQcSource(p.source||'visual-qc');setVisionFrames(p.frames||null);
      setNotice(`Visual QC: ${p.qc.decision} at ${p.qc.overall}/10.`);
      if(autoRepair&&p.qc.decision!=='PASS'){
        await submitLocal(p.qc);
        setNotice(`Visual QC requested ${p.qc.decision}. A corrected local reshoot was submitted automatically.`);
      }
    }catch(e){setNotice(e instanceof Error?e.message:'Visual QC failed')}finally{setBusy('')}
  }

  async function assembleTimeline(){
    if(!film)return;
    const sourceUrls:Record<string,string>={};
    for(const shot of film.shots){
      const job=jobs[shot.id];
      if(job?.status==='succeeded')sourceUrls[shot.id]=`/api/cinema-os/media?kind=shot&id=${encodeURIComponent(job.jobId)}`;
    }
    const r=await fetch('/api/cinema-os/timeline',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:film.title,shots:film.shots,sourceUrls})});
    const p=await r.json();if(r.ok)setTimeline(p.timeline);else setNotice(p.error||'Timeline failed');
  }

  async function assembleFinal(){
    if(!film)return;
    const ordered=film.shots.map(shot=>jobs[shot.id]).filter(Boolean);
    if(ordered.length!==film.shots.length||ordered.some(job=>job.status!=='succeeded')){
      setNotice('Every shot must have a succeeded render before final movie assembly.');
      return;
    }
    setBusy('assembly');setNotice('');
    try{
      const r=await fetch('/api/cinema-os/assemble-local',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        title:film.title,
        jobIds:ordered.map(job=>job.jobId),
        width:input.aspectRatio==='9:16'?1080:input.aspectRatio==='1:1'?1080:1920,
        height:input.aspectRatio==='9:16'?1920:input.aspectRatio==='1:1'?1080:1080,
        fps:24,
      })});
      const p=await r.json();if(!r.ok)throw new Error(p.error||p.detail||'Assembly failed');
      setAssembly({assemblyId:p.assemblyId,status:p.status});
      setNotice('Final movie assembly queued on the GPU worker.');
    }catch(e){setNotice(e instanceof Error?e.message:'Assembly failed')}finally{setBusy('')}
  }

  async function pollAssembly(){
    if(!assembly)return;
    setBusy('assembly-status');
    try{
      const r=await fetch('/api/cinema-os/assemble-local?assemblyId='+encodeURIComponent(assembly.assemblyId),{cache:'no-store'});
      const p=await r.json();if(!r.ok)throw new Error(p.error||p.detail||'Assembly status failed');
      setAssembly({assemblyId:assembly.assemblyId,status:p.status,outputUrl:p.outputUrl,error:p.error});
      setNotice('Assembly status: '+p.status);
    }catch(e){setNotice(e instanceof Error?e.message:'Assembly status failed')}finally{setBusy('')}
  }

  function dl(name:string,content:string,type='text/plain'){
    const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);
  }

  return <main className="memberMain storyboardStudio">
    <section className="memberHero compactHero"><p className="eyebrow">STORYBOARD STUDIO · VISION QC · AUTO RESHOOT · FINAL ASSEMBLY</p><h1>See it. Generate it. <em>Judge it.</em> Finish it.</h1><p>Storyboard the film, render shots, compare generated frames against the approved board, automatically repair failures and assemble accepted footage into a final MP4.</p></section>

    <section className="automationBar">
      <div><b>AUTO REPAIR / RESHOOT</b><span>When visual QC returns REPAIR or RESHOOT, submit the corrected prompt to local Wan automatically.</span></div>
      <button className={autoRepair?'on':''} onClick={()=>setAutoRepair(v=>!v)}>{autoRepair?'ON':'OFF'}</button>
    </section>

    <section className="mcGrid">
      <div className="panel"><h2>FILM INPUT</h2>
        <label>Title</label><input value={input.title} onChange={e=>set('title',e.target.value)}/>
        <label>Logline</label><textarea value={input.logline} onChange={e=>set('logline',e.target.value)}/>
        <label>Visual DNA</label><textarea value={input.visualStyle} onChange={e=>set('visualStyle',e.target.value)}/>
        <label>Approved actor identity references · up to 3</label>
        <input type="file" accept="image/*" multiple onChange={e=>addActorRefs(e.target.files)}/>
        <div className="actorRefGrid">{actorRefs.map((src,index)=><div key={index}><img src={src} alt={'Actor reference '+(index+1)}/><button type="button" onClick={()=>setActorRefs(current=>current.filter((_,i)=>i!==index))}>×</button></div>)}</div>
        <small className="hint">These references are compressed in your browser and used only to judge identity continuity during Vision QC.</small>
      </div>
      <div className="panel"><h2>STORY PRESSURE</h2>
        <label>Protagonist</label><textarea value={input.protagonist} onChange={e=>set('protagonist',e.target.value)}/>
        <label>Conflict</label><textarea value={input.conflict} onChange={e=>set('conflict',e.target.value)}/>
        <label>Transformation</label><textarea value={input.ending} onChange={e=>set('ending',e.target.value)}/>
        <button className="generate" disabled={busy==='compile'} onClick={compile}>{busy==='compile'?'Compiling…':'BUILD STORYBOARD STUDIO PROJECT'}</button>
        {notice&&<div className="render"><b>Studio</b><span>{notice}</span></div>}
      </div>
    </section>

    {film&&<>
      <section className="storyboardGrid">
        {storyboard.map(frame=><button key={frame.shotId} className={'boardCard '+(selected?.id===frame.shotId?'on':'')} onClick={()=>{setSelected(film.shots.find(s=>s.id===frame.shotId)||null);setQc(null);setVisionFrames(null)}}>
          <img src={frame.svgDataUrl} alt={frame.shotId}/>
          <div><b>{frame.shotId}</b><span>{frame.caption}</span><small>{frame.sceneTitle}</small>{jobs[frame.shotId]&&<em>{jobs[frame.shotId].status}</em>}</div>
        </button>)}
      </section>

      {selected&&selectedBoard&&<section className="mcGrid">
        <div className="panel"><h2>SHOT REVIEW · {selected.id}</h2>
          <img className="boardLarge" src={selectedBoard.svgDataUrl} alt={selected.id}/>
          <div className="scenePackage"><small>FIRST FRAME</small><p>{selected.firstFrameSource}</p><small>LAST FRAME HANDOFF</small><p>{selected.lastFrameHandoff}</p><small>GENERATION PROMPT</small><p>{selected.generationPrompt}</p></div>
          <div className="shotButtons">
            <button className="secondaryButton" onClick={runRuleQc} disabled={busy==='qc'}>{busy==='qc'?'Scoring…':'RULE QC'}</button>
            <button className="secondaryButton" onClick={renderLocal} disabled={busy==='render'}>{busy==='render'?'Submitting…':'GENERATE LOCAL WAN'}</button>
            {jobs[selected.id]&&<button className="secondaryButton" onClick={poll} disabled={busy==='poll'}>CHECK STATUS</button>}
            {jobs[selected.id]?.status==='succeeded'&&<button className="secondaryButton visionButton" onClick={runVisualQc} disabled={busy==='vision'}>{busy==='vision'?'Inspecting frames…':'VISION QC'}</button>}
          </div>
          {jobs[selected.id]&&<div className="departmentStatus"><b>{jobs[selected.id].status.toUpperCase()}</b><span>{jobs[selected.id].jobId}</span><span>{jobs[selected.id].history.length?jobs[selected.id].history.length+' prior take(s) preserved':'first take'}</span>{jobs[selected.id].status==='succeeded'&&<a href={'/api/cinema-os/media?kind=shot&id='+encodeURIComponent(jobs[selected.id].jobId)} target="_blank" rel="noreferrer">PLAY CURRENT TAKE</a>}</div>}
        </div>

        <div className="panel"><h2>AUTOMATIC QC / RESHOOT</h2>
          {visionFrames&&<div className="visionCompare"><div><small>GENERATED FIRST</small><img src={visionFrames.firstFrameDataUrl} alt="Generated first frame"/></div><div><small>GENERATED LAST</small><img src={visionFrames.lastFrameDataUrl} alt="Generated last frame"/></div></div>}
          {qc?<><div className={'qcDecision '+qc.decision.toLowerCase()}><div><b>{qc.decision}</b><small>{qcSource}</small></div><strong>{qc.overall}/10</strong></div>
            <div className="scoreGrid">{Object.entries(qc).filter(([k])=>['identity','continuity','anatomyPhysics','performance','lighting','editFitness'].includes(k)).map(([k,v])=><div key={k}><b>{k}</b><span>{String(v)}</span></div>)}</div>
            <div className="scenePackage"><small>ISSUES</small>{qc.issues.length?qc.issues.map(i=><p key={i}>• {i}</p>):<p>No mandatory issue detected.</p>}<small>REPAIR / RESHOOT PROMPT</small><p>{qc.repairPrompt}</p></div>
            {qc.decision!=='PASS'&&!autoRepair&&<button className="generate" onClick={()=>autoReshoot(qc)} disabled={busy==='reshoot'}>{busy==='reshoot'?'Submitting repair…':'AUTO REPAIR / RESHOOT NOW'}</button>}
          </>:<div className="emptyFactory"><b>QC NOT RUN</b><span>Render the shot, then use Vision QC to compare real generated frames with the approved storyboard.</span></div>}
        </div>
      </section>}

      <section className="output"><p className="eyebrow">EDIT ASSEMBLY</p><h2>Turn approved shot jobs into the finished movie.</h2>
        <div className="shotButtons"><button className="secondaryButton" onClick={assembleTimeline}>BUILD TIMELINE PLAN</button><button className="secondaryButton" onClick={assembleFinal} disabled={busy==='assembly'}>{busy==='assembly'?'Queueing final…':'ASSEMBLE FINAL MOVIE'}</button>{assembly&&<button className="secondaryButton" onClick={pollAssembly} disabled={busy==='assembly-status'}>CHECK FINAL MOVIE STATUS</button>}</div>
        {timeline&&<><div className="timelineBar">{timeline.clips.map(c=><div key={c.shotId} title={c.shotId} style={{flexGrow:c.durationSeconds}}>{c.shotId.replace('scene-','S')}</div>)}</div>
          <div className="departmentStatus"><b>{timeline.durationSeconds}s edit</b><span>{timeline.missingSources.length?timeline.missingSources.length+' shots still missing rendered media':'All shots have media sources'}</span></div>
          <button className="secondaryButton" onClick={()=>dl(film.title+'-ffmpeg-concat.txt',timeline.ffmpegConcatManifest)}>EXPORT FFMPEG MANIFEST</button>
        </>}
        {assembly&&<div className="finalMovieCard"><small>FINAL MOVIE</small><h3>{assembly.status.toUpperCase()}</h3><p>{assembly.assemblyId}</p>{assembly.error&&<p>{assembly.error}</p>}{assembly.status==='succeeded'&&<><video controls src={'/api/cinema-os/media?kind=assembly&id='+encodeURIComponent(assembly.assemblyId)}/><a className="generate masterLink" href={'/api/cinema-os/media?kind=assembly&id='+encodeURIComponent(assembly.assemblyId)} target="_blank" rel="noreferrer">OPEN FINAL MP4</a></>}</div>}
      </section>
    </>}
  </main>
}
