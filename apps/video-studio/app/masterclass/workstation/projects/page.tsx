'use client';
import { useEffect,useState } from 'react';

type Project={id:string;title:string;kind:string;payload:any;updatedAt:string};

export default function ProjectsPage(){
 const [projects,setProjects]=useState<Project[]>([]);const [notice,setNotice]=useState('');
 async function load(){const r=await fetch('/api/projects',{cache:'no-store'});const p=await r.json();if(r.ok)setProjects(p.projects||[]);else setNotice(p.error||'Could not load projects.')}
 useEffect(()=>{load()},[]);
 async function remove(id:string){await fetch('/api/projects?id='+encodeURIComponent(id),{method:'DELETE'});load()}
 function download(p:Project){const blob=new Blob([JSON.stringify(p.payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=p.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.json';a.click();URL.revokeObjectURL(url)}
 return <main className="memberMain"><section className="memberHero compactHero"><p className="eyebrow">MY PROJECTS</p><h1>Cloud-saved workflows.</h1><p>Projects are attached to your member account so you can move between devices.</p></section>{notice&&<div className="publicNote">{notice}</div>}<section className="projectList">{projects.map(p=><article key={p.id}><div><small>{p.kind}</small><h3>{p.title}</h3><p>Updated {new Date(p.updatedAt).toLocaleString()}</p></div><div><button className="secondaryButton" onClick={()=>download(p)}>EXPORT</button><button className="secondaryButton" onClick={()=>remove(p.id)}>DELETE</button></div></article>)}{!projects.length&&<div className="emptyFactory"><b>NO CLOUD PROJECTS YET</b><span>Save a workflow from the Workstation.</span></div>}</section></main>
}
