import { NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../../lib/auth';
import { executeWithFallback } from '../../../../lib/video-execution/orchestrator';
import type { ProfessionalShot } from '../../../../lib/pro-film-os';
import type { QCScore } from '../../../../lib/storyboard-engine';

function enabled(){
  const value=process.env.VIDEO_EXECUTION_ENABLED?.trim().toLowerCase();
  return value==='true'||value==='1';
}
function ratio(value:string):'16:9'|'9:16'|'1:1'{return value==='9:16'||value==='1:1'?value:'16:9';}

export async function POST(request:Request){
  const user=await currentUser();
  if(!user||!hasPaidAccess(user)) return NextResponse.json({error:'Paid membership required.'},{status:401});
  if(!enabled()) return NextResponse.json({error:'Video execution is disabled by the operator.'},{status:503});
  const body=await request.json() as {shot?:ProfessionalShot;qc?:QCScore;aspectRatio?:string;referenceImageUrls?:string[]};
  if(!body.shot?.id||!body.qc) return NextResponse.json({error:'shot and QC result are required.'},{status:400});
  if(body.qc.decision==='PASS') return NextResponse.json({error:'Passing shots do not require automatic reshoot.'},{status:409});

  const result=await executeWithFallback({
    missionId:`repair_${user.id.slice(-8)}_${body.shot.id}_${Date.now().toString(36)}`,
    prompt:body.qc.repairPrompt||body.shot.generationPrompt,
    durationSeconds:Math.max(1,Math.min(180,body.shot.durationSeconds)),
    aspectRatio:ratio(String(body.aspectRatio||'16:9')),
    candidateProviderIds:['local-wan'],
    referenceImageUrls:(body.referenceImageUrls||[]).slice(0,8),
  });
  return NextResponse.json(result,{status:result.submission?202:503});
}
