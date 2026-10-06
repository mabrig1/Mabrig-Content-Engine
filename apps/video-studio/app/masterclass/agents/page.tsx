'use client';
import { useEffect,useState } from 'react';

const agents=[
['Executive Producer','Orchestrates the mission and validates delivery targets.'],
['Music Analyst','Maps tempo, energy, lyrics and edit points.'],
['Creative Director','Builds visual treatment and emotional arc.'],
['Cinematographer','Creates shot grammar, lenses, movement and light.'],
['Continuity Agent','Protects identity, wardrobe, props and geography.'],
['Lip-Sync Agent','Aligns visible performance to speech or vocals.'],
['Editor','Builds rhythm, reactions, montage and transitions.'],
['QC Critic','Rejects weak shots and creates surgical repair tasks.'],
];

export default function AgentsPage(){
 const [brief,setBrief]=useState('Create a cinematic short film with strong continuity, emotional escalation and a memorable final image.');
 const [runs,setRuns]=useState<any[]>([]);const [providers,setProviders]=useState<any[]>([]);const [notice,setNotice]=useState('');
 async function refresh(){try{const [a,b]=await Promise.all([fetch('/api/agent-runs',{cache:'no-store'}),fetch('/api/video-router',{cache:'no-store'})]);const ar=await a.json();const br=await b.json();if(a.ok)setRuns(ar.runs||[]);if(b.ok)setProviders(br.runtime||[])}catch{}}
 useEffect(()=>{refresh()},[]);
 async function run(){setNotice('');const r=await fetch('/api/agent-runs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({brief})});const p=await r.json();if(!r.ok)setNotice(p.error||'Run failed.');else{setNotice('Mission accepted.');refresh()}}
 return <main className="memberMain">
  <section className="memberHero compactHero"><p className="eyebrow">AGENTIC WORKER AI</p><h1>Mission Control.</h1><p>Assign a production mission, see the specialist crew and inspect provider readiness before execution.</p></section>
  <section className="mcGrid"><div className="panel"><h2>RUN AUTONOMOUS JOB</h2><label>Mission brief</label><textarea value={brief} onChange={e=>setBrief(e.target.value)}/><button className="generate" onClick={run}>ASSIGN AGENT CREW</button>{notice&&<div className="render"><b>Mission</b><span>{notice}</span></div>}</div><div className="panel"><h2>ROUTER & QUOTA STATUS</h2>{providers.map((p:any)=><div className="providerRow" key={p.providerId}><b>{p.available?'●':'○'} {p.providerId}</b><span>{p.available?'available':p.reason||'not configured'}</span></div>)}{!providers.length&&<p className="departmentIntro">Provider status will appear when the router is reachable.</p>}</div></section>
  <section className="output noTop"><p className="eyebrow">SPECIALIST CREW</p><div className="templateGrid">{agents.map(([name,copy])=><article className="templateCard" key={name}><b>{name}</b><span>{copy}</span><small>AGENTIC PIPELINE</small></article>)}</div></section>
  <section className="output"><p className="eyebrow">RUN HISTORY</p><div className="projectList">{runs.map((r:any)=><article key={r.id}><div><small>{r.state}</small><h3>{r.title}</h3><p>{r.brief}</p></div><div><span>{new Date(r.createdAt).toLocaleString()}</span></div></article>)}{!runs.length&&<div className="emptyFactory"><b>NO RUNS YET</b><span>Assign the first autonomous job above.</span></div>}</div></section>
 </main>
}
