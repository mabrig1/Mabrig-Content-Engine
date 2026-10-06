'use client';
import { useEffect,useState } from 'react';

export default function MembersAdminPage(){
  const [members,setMembers]=useState<any[]>([]);const [notice,setNotice]=useState('');
  useEffect(()=>{fetch('/api/admin/members',{cache:'no-store'}).then(async r=>{const p=await r.json();if(r.ok)setMembers(p.members||[]);else setNotice(p.error||'Could not load members.')}).catch(()=>setNotice('Could not load members.'))},[]);
  return <main className="memberMain"><section className="memberHero compactHero"><p className="eyebrow">MEMBERS & SUBSCRIPTIONS</p><h1>Access operations.</h1><p>Review account roles, plans and subscription state. Password hashes and provider secrets never appear here.</p></section>{notice&&<div className="publicNote">{notice}</div>}<section className="projectList">{members.map((m:any)=><article key={m.id}><div><small>{m.role} · {m.subscription?.status}</small><h3>{m.name}</h3><p>{m.email}</p></div><div><span>{m.subscription?.plan||'member'} · {m.subscription?.provider||'unpaid'}</span></div></article>)}</section></main>
}
