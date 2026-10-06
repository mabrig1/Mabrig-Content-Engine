'use client';

import { useMemo, useState } from 'react';
import type { FilmBlueprint, FilmProjectInput } from '../../../lib/movie-masterclass';
import type { ProfessionalFilmPackage, ProfessionalShot } from '../../../lib/pro-film-os';
import type { QCScore, StoryboardFrame, TimelinePlan } from '../../../lib/storyboard-engine';

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
  const [timeline,setTimeline]=useState<TimelinePlan|null>(null);
  const [jobs,setJobs]=useState<Record<string,{jobId:string;status:string;outputUrls:string[]}>>({});
  const [busy,setBusy]=useState('');
  const [notice,setNotice]=useState('');

  const selectedBoard=useMemo(()=>storyboard.find(x=>x.shotId===selected?.id)||null,[storyboard,selected]);

  function set<K extends keyof FilmProjectInput>(key:K,value:FilmProjectInput[K]){setInput(v=>({...v,[key]:value}));}

  async function compile(){
    setBusy('compile');setNotice('');
    try{
      const b=await fetch('/api/masterclass',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
      const bp=await b.json();if(!b.ok)throw new Error(bp.error||'Blueprint failed');
      const c=await fetch('/api/cinema-os/compile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({blueprint:bp.blueprint as FilmBlueprint})});
      const cp=await c.json();if(!c.ok)throw new Error(cp.error||'Professional compile failed');
      const s=await fetch('/api/cinema-os/storyboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({film:cp.professional})});
      const sp=await s.json();if(!s.ok)throw new Error(sp.error||'Storyboard failed');
      setFilm(cp.professional);setStoryboard(sp.storyboard);setSelected(cp.professional.shots[0]||null);
      setQc(null);setTimeline(null);setNotice('Storyboard package compiled.');
    }catch(e){setNotice(e instanceof Error?e.message:'Compile failed')}finally{setBusy('')}
  }

  async function runQc(){
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
      const p=await r.json();if(!r.ok)throw new Error(p.error||'QC failed');setQc(p.qc);
    }catch(e){setNotice(e instanceof Error?e.message:'QC failed')}finally{setBusy('')}
  }

  async function renderLocal(){
    if(!selected)return;
    setBusy('render');setNotice('');
    try{
      const r=await fetch('/api/cinema-os/execute-local',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({shot:selected,aspectRatio:input.aspectRatio})});
      const p=await r.json();if(!r.ok)throw new Error(p.error||p.warnings?.join(' ')||'Render submission failed');
      const sub=p.submission;if(!sub)throw new Error('No local render route accepted this shot.');
      setJobs(v=>({...v,[selected.id]:{jobId:sub.providerJobId,status:sub.status,outputUrls:[]}}));
      setNotice('Local Wan render submitted.');
    }catch(e){setNotice(e instanceof Error?e.message:'Render failed')}finally{setBusy('')}
  }

  async function poll(){
    if(!selected)return;
    const job=jobs[selected.id];if(!job)return;
    setBusy('poll');
    try{
      const r=await fetch('/api/cinema-os/execute-local/status?jobId='+encodeURIComponent(job.jobId),{cache:'no-store'});
      const p=await r.json();if(!r.ok)throw new Error(p.error||'Status failed');
      setJobs(v=>({...v,[selected.id]:{jobId:job.jobId,status:p.status.status,outputUrls:p.status.outputUrls||[]}}));
      setNotice('Render status: '+p.status.status);
    }catch(e){setNotice(e instanceof Error?e.message:'Status failed')}finally{setBusy('')}
  }

  async function assemble(){
    if(!film)return;
    const sourceUrls:Record<string,string>={};
    for(const shot of film.shots){const url=jobs[shot.id]?.outputUrls?.[0];if(url)sourceUrls[shot.id]=url;}
    const r=await fetch('/api/cinema-os/timeline',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:film.title,shots:film.shots,sourceUrls})});
    const p=await r.json();if(r.ok)setTimeline(p.timeline);else setNotice(p.error||'Timeline failed');
  }

  function dl(name:string,content:string,type='text/plain'){
    const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);
  }

  return <main className="memberMain storyboardStudio">
    <section className="memberHero compactHero"><p className="eyebrow">STORYBOARD STUDIO · CONTINUITY QC · TIMELINE</p><h1>See the movie before you spend the render.</h1><p>Compile a storyboard, inspect shot-to-shot continuity, submit safe local renders, score QC and build a real edit timeline from approved outputs.</p></section>

    <section className="mcGrid">
      <div className="panel"><h2>FILM INPUT</h2>
        <label>Title</label><input value={input.title} onChange={e=>set('title',e.target.value)}/>
        <label>Logline</label><textarea value={input.logline} onChange={e=>set('logline',e.target.value)}/>
        <label>Visual DNA</label><textarea value={input.visualStyle} onChange={e=>set('visualStyle',e.target.value)}/>
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
        {storyboard.map(frame=><button key={frame.shotId} className={'boardCard '+(selected?.id===frame.shotId?'on':'')} onClick={()=>{setSelected(film.shots.find(s=>s.id===frame.shotId)||null);setQc(null)}}>
          <img src={frame.svgDataUrl} alt={frame.shotId}/>
          <div><b>{frame.shotId}</b><span>{frame.caption}</span><small>{frame.sceneTitle}</small></div>
        </button>)}
      </section>

      {selected&&selectedBoard&&<section className="mcGrid">
        <div className="panel"><h2>SHOT REVIEW · {selected.id}</h2>
          <img className="boardLarge" src={selectedBoard.svgDataUrl} alt={selected.id}/>
          <div className="scenePackage"><small>FIRST FRAME</small><p>{selected.firstFrameSource}</p><small>LAST FRAME HANDOFF</small><p>{selected.lastFrameHandoff}</p><small>GENERATION PROMPT</small><p>{selected.generationPrompt}</p></div>
          <div className="shotButtons">
            <button className="secondaryButton" onClick={runQc} disabled={busy==='qc'}>{busy==='qc'?'Scoring…':'RUN QC'}</button>
            <button className="secondaryButton" onClick={renderLocal} disabled={busy==='render'}>{busy==='render'?'Submitting…':'GENERATE WITH LOCAL WAN'}</button>
            {jobs[selected.id]&&<button className="secondaryButton" onClick={poll} disabled={busy==='poll'}>CHECK RENDER STATUS</button>}
          </div>
          {jobs[selected.id]&&<div className="departmentStatus"><b>{jobs[selected.id].status.toUpperCase()}</b><span>{jobs[selected.id].jobId}</span>{jobs[selected.id].outputUrls.map(u=><a key={u} href={u} target="_blank" rel="noreferrer">OPEN OUTPUT</a>)}</div>}
        </div>

        <div className="panel"><h2>AUTOMATIC QC / RESHOOT</h2>
          {qc?<><div className={'qcDecision '+qc.decision.toLowerCase()}><b>{qc.decision}</b><strong>{qc.overall}/10</strong></div>
            <div className="scoreGrid">{Object.entries(qc).filter(([k])=>['identity','continuity','anatomyPhysics','performance','lighting','editFitness'].includes(k)).map(([k,v])=><div key={k}><b>{k}</b><span>{String(v)}</span></div>)}</div>
            <div className="scenePackage"><small>ISSUES</small>{qc.issues.length?qc.issues.map(i=><p key={i}>• {i}</p>):<p>No mandatory issue detected.</p>}<small>REPAIR / RESHOOT PROMPT</small><p>{qc.repairPrompt}</p></div>
          </>:<div className="emptyFactory"><b>QC NOT RUN</b><span>Score the selected shot before accepting it into the timeline.</span></div>}
        </div>
      </section>}

      <section className="output"><p className="eyebrow">EDIT ASSEMBLY</p><h2>Build the timeline from successful shot outputs.</h2><button className="secondaryButton" onClick={assemble}>BUILD TIMELINE PLAN</button>
        {timeline&&<><div className="timelineBar">{timeline.clips.map(c=><div key={c.shotId} title={c.shotId} style={{flexGrow:c.durationSeconds}}>{c.shotId.replace('scene-','S')}</div>)}</div>
          <div className="departmentStatus"><b>{timeline.durationSeconds}s edit</b><span>{timeline.missingSources.length?timeline.missingSources.length+' shots still missing rendered media':'All shots have media sources'}</span></div>
          <button className="secondaryButton" onClick={()=>dl(film.title+'-ffmpeg-concat.txt',timeline.ffmpegConcatManifest)}>EXPORT FFMPEG MANIFEST</button>
        </>}
      </section>
    </>}
  </main>
}
