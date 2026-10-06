import { NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../../lib/auth';
import { executeWithFallback } from '../../../../lib/video-execution/orchestrator';
import type { ProfessionalShot } from '../../../../lib/pro-film-os';

function enabled(){
  const v=process.env.VIDEO_EXECUTION_ENABLED?.trim().toLowerCase();
  return v==='true'||v==='1';
}

function ratio(value:string):'16:9'|'9:16'|'1:1'{
  if(value==='9:16'||value==='1:1') return value;
  return '16:9';
}

export async function POST(request:Request){
  const user=await currentUser();
  if(!user||!hasPaidAccess(user)) return NextResponse.json({error:'Paid membership required.'},{status:401});
  if(!enabled()) return NextResponse.json({error:'Video execution is disabled by the operator.'},{status:503});
  const body=await request.json() as {shot?:ProfessionalShot;aspectRatio?:string;referenceImageUrls?:string[]};
  if(!body.shot?.id) return NextResponse.json({error:'Shot is required.'},{status:400});

  const result=await executeWithFallback({
    missionId:`member_${user.id.slice(-8)}_${body.shot.id}_${Date.now().toString(36)}`,
    prompt:body.shot.generationPrompt,
    durationSeconds:Math.max(1,Math.min(180,body.shot.durationSeconds)),
    aspectRatio:ratio(String(body.aspectRatio||'16:9')),
    candidateProviderIds:['local-wan'],
    referenceImageUrls:(body.referenceImageUrls||[]).slice(0,8),
  });
  return NextResponse.json(result,{status:result.submission?202:503});
}
