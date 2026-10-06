import { NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../../lib/auth';
import type { ProfessionalShot } from '../../../../lib/pro-film-os';
import { deterministicQC, type QCScore } from '../../../../lib/storyboard-engine';

export const dynamic='force-dynamic';

function worker(){
  const url=process.env.GPU_WORKER_URL?.trim().replace(/\/$/,'');
  const token=process.env.GPU_WORKER_TOKEN?.trim();
  if(!url||!token) throw new Error('GPU worker is not configured.');
  return {url,token};
}

async function fetchDataUrl(url:string,token:string){
  const response=await fetch(url,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});
  if(!response.ok) throw new Error(`Worker frame fetch failed with ${response.status}.`);
  const type=response.headers.get('content-type')||'image/jpeg';
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.byteLength>6_000_000) throw new Error('Visual QC frame exceeds the 6 MB safety limit.');
  return `data:${type};base64,${bytes.toString('base64')}`;
}

function normalizeVision(raw:any,base:QCScore):QCScore{
  const number=(key:string,fallback:number)=>Math.max(0,Math.min(10,Number(raw?.[key]??fallback)));
  const scores={
    identity:number('identity',base.identity),
    continuity:number('continuity',base.continuity),
    anatomyPhysics:number('anatomyPhysics',base.anatomyPhysics),
    performance:number('performance',base.performance),
    lighting:number('lighting',base.lighting),
    editFitness:number('editFitness',base.editFitness),
  };
  const overall=Number(((scores.identity+scores.continuity+scores.anatomyPhysics+scores.performance+scores.lighting+scores.editFitness)/6).toFixed(2));
  const decision:QCScore['decision']=raw?.decision==='RESHOOT'?'RESHOOT':raw?.decision==='REPAIR'?'REPAIR':overall>=8.5?'PASS':overall>=7?'REPAIR':'RESHOOT';
  const issues=Array.isArray(raw?.issues)?raw.issues.slice(0,12).map((x:unknown)=>String(x).slice(0,500)):base.issues;
  return {
    ...scores,
    overall,
    decision,
    issues,
    repairPrompt:String(raw?.repairPrompt||base.repairPrompt).slice(0,12000),
  };
}

export async function POST(request:Request){
  const user=await currentUser();
  if(!user||!hasPaidAccess(user)) return NextResponse.json({error:'Paid membership required.'},{status:401});

  try{
    const body=await request.json() as {
      shot?:ProfessionalShot;
      jobId?:string;
      approvedStoryboardDataUrl?:string;
      previousShot?:ProfessionalShot|null;
    };
    if(!body.shot?.id||!body.jobId) return NextResponse.json({error:'shot and jobId are required.'},{status:400});

    const base=deterministicQC(body.shot,{
      previousShot:body.previousShot||null,
      hasReferenceFrame:Boolean(body.approvedStoryboardDataUrl),
      hasGeneratedVideo:true,
    });

    const {url,token}=worker();
    const framesRes=await fetch(`${url}/jobs/${encodeURIComponent(body.jobId)}/frames`,{
      headers:{Authorization:`Bearer ${token}`},
      cache:'no-store',
    });
    const frames=await framesRes.json();
    if(!framesRes.ok) throw new Error(frames?.detail||'Worker frame extraction failed.');

    const [first,last]=await Promise.all([
      fetchDataUrl(String(frames.firstFrameUrl),token),
      fetchDataUrl(String(frames.lastFrameUrl),token),
    ]);

    const key=process.env.OPENROUTER_API_KEY?.trim();
    const model=(process.env.OPENROUTER_VISION_MODEL||process.env.OPENROUTER_MODEL)?.trim();
    const approved=String(body.approvedStoryboardDataUrl||'');

    if(!key||!model||!approved.startsWith('data:image/')){
      return NextResponse.json({
        ok:true,
        source:'frame-extraction + deterministic-qc',
        frames:{firstFrameDataUrl:first,lastFrameDataUrl:last},
        qc:base,
        warning:'Vision model or approved storyboard PNG is unavailable; visual QC used deterministic production rules.',
      });
    }

    const response=await fetch('https://openrouter.ai/api/v1/chat/completions',{
      method:'POST',
      headers:{
        Authorization:`Bearer ${key}`,
        'Content-Type':'application/json',
        'HTTP-Referer':process.env.NEXT_PUBLIC_APP_URL||'https://aivideo.mabrigkorie.org',
        'X-Title':'MABRIG CINEMA Visual QC',
      },
      body:JSON.stringify({
        model,
        temperature:0.1,
        response_format:{type:'json_object'},
        messages:[{
          role:'user',
          content:[
            {type:'text',text:`You are a senior visual continuity supervisor. Compare the approved storyboard image with the generated FIRST and LAST frames for this shot. Score 0-10 for identity, continuity, anatomyPhysics, performance, lighting, editFitness. Return JSON only with those six fields, decision PASS/REPAIR/RESHOOT, issues array, repairPrompt. Preserve story intent and do not invent traits not visible or specified. Shot plan: ${JSON.stringify(body.shot)}`},
            {type:'text',text:'APPROVED STORYBOARD'},
            {type:'image_url',image_url:{url:approved}},
            {type:'text',text:'GENERATED FIRST FRAME'},
            {type:'image_url',image_url:{url:first}},
            {type:'text',text:'GENERATED LAST FRAME'},
            {type:'image_url',image_url:{url:last}},
          ],
        }],
      }),
      cache:'no-store',
    });

    if(!response.ok){
      return NextResponse.json({ok:true,source:'deterministic-fallback',frames:{firstFrameDataUrl:first,lastFrameDataUrl:last},qc:base,warning:'Vision provider was unavailable.'});
    }
    const payload=await response.json();
    const raw=payload?.choices?.[0]?.message?.content;
    let parsed:any={};
    try{parsed=typeof raw==='string'?JSON.parse(raw):{};}catch{}
    return NextResponse.json({
      ok:true,
      source:'openrouter-vision',
      frames:{firstFrameDataUrl:first,lastFrameDataUrl:last},
      qc:normalizeVision(parsed,base),
    });
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:'Visual QC failed.'},{status:502});
  }
}
