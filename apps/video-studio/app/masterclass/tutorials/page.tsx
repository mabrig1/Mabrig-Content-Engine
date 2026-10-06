'use client';
import { useEffect,useState } from 'react';
import { MASTERCLASS_MODULES } from '../../../lib/movie-masterclass';

const pathFor=(n:number)=>n<=4?'BEGINNER':n<=8?'DIRECTOR':'AGENTIC PRODUCER';

export default function TutorialsPage(){
  const [completed,setCompleted]=useState<string[]>([]);
  const [notice,setNotice]=useState('');
  useEffect(()=>{fetch('/api/progress',{cache:'no-store'}).then(r=>r.json()).then(p=>setCompleted(p.completed||[])).catch(()=>{})},[]);
  async function toggle(id:string){
    const done=completed.includes(id);
    const r=await fetch('/api/progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lessonId:id,completed:!done})});
    const p=await r.json();
    if(!r.ok){setNotice(p.error||'Progress update failed.');return}
    setCompleted(current=>done?current.filter(x=>x!==id):[...current,id]);
    setNotice(p.certificateEligible?'Certificate unlocked.':'Progress saved.');
  }
  return (
    <main className="memberMain">
      <section className="memberHero compactHero"><p className="eyebrow">AGENTIC TUTORIALS</p><h1>Beginner → Director → Agentic Producer.</h1><p>Every module creates an asset for the film, then opens the relevant production mode in the Workstation.</p></section>
      <section className="progressBand"><div><b>{completed.length}/12</b><span>modules complete</span></div><a className="secondaryButton" href="/masterclass/certificate">CERTIFICATE</a></section>
      {notice&&<div className="publicNote">{notice}</div>}
      <section className="moduleGrid memberModules">
        {MASTERCLASS_MODULES.map((m)=>(
          <article key={m.id} className={completed.includes(m.id)?'moduleDone':''}>
            <small>{pathFor(m.number)} · MODULE {String(m.number).padStart(2,'0')}</small>
            <h3>{m.title}</h3><p>{m.promise}</p>
            <div><b>SKILL</b><span>{m.skill}</span></div>
            <div><b>DELIVERABLE</b><span>{m.deliverable}</span></div>
            <a className="secondaryButton fullButton" href={'/masterclass/workstation?brief='+encodeURIComponent(m.promise)}>OPEN IN WORKSTATION</a>
            <button className="secondaryButton fullButton" onClick={()=>toggle(m.id)}>{completed.includes(m.id)?'✓ COMPLETED':'MARK COMPLETE'}</button>
          </article>
        ))}
      </section>
    </main>
  );
}
