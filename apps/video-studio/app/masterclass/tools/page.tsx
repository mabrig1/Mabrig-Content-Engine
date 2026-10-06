'use client';
import { useMemo,useState } from 'react';
import { VIDEO_TOOL_CATALOG } from '../../../lib/tool-catalog';

export default function ToolsPage(){
 const [q,setQ]=useState('');const [cat,setCat]=useState('All');
 const cats=['All',...Array.from(new Set(VIDEO_TOOL_CATALOG.map(x=>x.category)))];
 const shown=useMemo(()=>VIDEO_TOOL_CATALOG.filter(x=>(cat==='All'||x.category===cat)&&((x.name+' '+x.bestUse).toLowerCase().includes(q.toLowerCase()))),[q,cat]);
 return <main className="memberMain">
  <section className="memberHero compactHero"><p className="eyebrow">100 FREE / FREE-TIER AI VIDEO TOOLS</p><h1>The production tool universe in one directory.</h1><p>Free quotas and commercial rights change frequently. The directory treats unverified limits as variable rather than assuming they are free.</p></section>
  <section className="toolFilters"><input placeholder="Search tools…" value={q} onChange={e=>setQ(e.target.value)}/><select value={cat} onChange={e=>setCat(e.target.value)}>{cats.map(c=><option key={c}>{c}</option>)}</select></section>
  <section className="toolsGrid">{shown.map((tool,i)=><article key={tool.name}><small>{String(i+1).padStart(3,'0')} · {tool.category}</small><h3>{tool.name}</h3><p>{tool.bestUse}</p><div><b>FREE ACCESS</b><span>{tool.access}</span></div><div><b>COMMERCIAL</b><span>{tool.commercial}</span></div></article>)}</section>
  <section className="publicNote">The Video Wallet/Router should only execute a provider after its live quota, cost and rights policy have been confirmed.</section>
 </main>
}
