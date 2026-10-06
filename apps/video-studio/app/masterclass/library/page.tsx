'use client';
import { useState } from 'react';

const templates=[
['Epic Performance','Arena Performance','Arena-scale performance, moving lights, crowd energy and heroic camera moves.'],
['Gospel Worship','Gospel Radiance','Spirit-filled worship, congregation, warm light and intimate performance coverage.'],
['Storyteller','Hollywood Epic','Turn lyrics into a narrative film with performance inserts and recurring visual motifs.'],
['Faith & Victory','Hollywood Epic','Journey from adversity into victory, building toward a triumphant final chorus.'],
['Royal Dominion','Hollywood Epic','Prestige, throne-room scale, gold, authority and elegant cinematic movement.'],
['Prophetic Fire','Desert Prophetic','Prayer, scripture, firelight and spiritually charged storytelling.'],
['Afro-Cinematic','Afro-Cinematic','Contemporary African identity, culture, movement, landscape and premium fashion.'],
['City After Dark','Neo-Noir','Neon streets, rooftops, cars, reflections and nocturnal performance.'],
['Nature Escape','Hollywood Epic','Mountains, oceans, sunrise and expansive visual breathing room.'],
['Studio Session','Gospel Radiance','Controlled studio performance for facial detail and precise lip sync.'],
['Lyrics Visualizer','Hollywood Epic','Typography, lyric cues, abstract motion and selective artist appearances.'],
['One-Take Intimate','Gospel Radiance','Emotion-first close performance with subtle movement and minimal cuts.'],
];
const packs=[
['Camera Grammar','24mm world reveal · 35mm kinetic medium · 50mm natural perspective · 85mm emotional close-up · camera movement follows dramatic change.'],
['Lighting Grammar','Name the motivated source, direction, contrast, practicals, atmosphere and skin separation.'],
['Lip-Sync Precision','Prefer frontal or three-quarter face, stable jaw visibility, natural head motion, clean phoneme timing and reaction beats.'],
['Continuity Lock','Repeat identity, wardrobe state, hero props, screen direction, weather, time-of-day and light direction in every scene handoff.'],
];

export default function LibraryPage(){
 const [copied,setCopied]=useState('');
 async function copy(name:string,value:string){await navigator.clipboard.writeText(value);setCopied(name);setTimeout(()=>setCopied(''),1200)}
 return <main className="memberMain">
  <section className="memberHero compactHero"><p className="eyebrow">PROMPTS & TEMPLATES</p><h1>Director language you can reuse.</h1><p>Load a template into the Workstation, then combine it with camera, lighting, lip-sync and continuity prompt packs.</p></section>
  <section className="output noTop"><p className="eyebrow">12 DIRECTOR TEMPLATES</p><div className="templateGrid">{templates.map(([name,style,desc])=><article className="templateCard" key={name}><b>{name}</b><span>{desc}</span><small>{style}</small><a className="secondaryButton" href={'/masterclass/workstation?template='+encodeURIComponent(name)+'&brief='+encodeURIComponent(desc)}>SEND TO WORKSTATION</a></article>)}</div></section>
  <section className="output"><p className="eyebrow">PROMPT PACKS</p><div className="promptPackGrid">{packs.map(([name,value])=><article key={name}><b>{name}</b><p>{value}</p><button className="secondaryButton" onClick={()=>copy(name,value)}>{copied===name?'COPIED':'COPY PROMPT'}</button></article>)}</div></section>
 </main>
}
