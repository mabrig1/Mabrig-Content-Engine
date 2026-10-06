'use client';
import { useEffect,useState } from 'react';

const collections=['lessons','templates','prompts','tools'];

export default function ContentStudioPage(){
  const [collection,setCollection]=useState('lessons');
  const [items,setItems]=useState<any[]>([]);
  const [json,setJson]=useState(JSON.stringify({title:'New lesson',order:1,published:true},null,2));
  const [notice,setNotice]=useState('');
  async function load(){
    const r=await fetch('/api/admin/content?collection='+collection,{cache:'no-store'});
    const p=await r.json();if(r.ok)setItems(p.items||[]);else setNotice(p.error||'Could not load content.');
  }
  useEffect(()=>{load()},[collection]);
  async function publish(){
    setNotice('');
    try{
      const item=JSON.parse(json);
      const r=await fetch('/api/admin/content',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({collection,item})});
      const p=await r.json();if(!r.ok)throw new Error(p.error||'Publish failed.');setNotice('Published '+p.slug);load();
    }catch(e){setNotice(e instanceof Error?e.message:'Publish failed.')}
  }
  return <main className="memberMain">
    <section className="memberHero compactHero"><p className="eyebrow">CONTENT CMS</p><h1>Publish the member experience.</h1><p>Manage tutorials, director templates, prompt packs and tool-directory records without touching production code.</p></section>
    <section className="mcGrid"><div className="panel"><h2>CONTENT COLLECTION</h2><select value={collection} onChange={e=>setCollection(e.target.value)}>{collections.map(x=><option key={x}>{x}</option>)}</select><div className="projectList compactList">{items.map((x:any)=><article key={x.id||x.slug}><div><small>{x.published===false?'DRAFT':'PUBLISHED'}</small><h3>{x.title||x.name||x.slug}</h3><p>{x.slug}</p></div></article>)}</div></div><div className="panel"><h2>PUBLISH JSON RECORD</h2><textarea className="screenplayBox" value={json} onChange={e=>setJson(e.target.value)}/><button className="generate" onClick={publish}>PUBLISH / UPDATE</button>{notice&&<div className="render"><b>CMS</b><span>{notice}</span></div>}</div></section>
  </main>
}
