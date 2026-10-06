import { NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../../lib/auth';
import type { ProfessionalShot } from '../../../../lib/pro-film-os';
import { deterministicQC } from '../../../../lib/storyboard-engine';

export async function POST(request:Request){
  const user=await currentUser();
  if(!user||!hasPaidAccess(user)) return NextResponse.json({error:'Paid membership required.'},{status:401});
  const body=await request.json() as {
    shot?:ProfessionalShot;
    previousShot?:ProfessionalShot|null;
    hasReferenceFrame?:boolean;
    hasGeneratedVideo?:boolean;
    notes?:string;
  };
  if(!body.shot?.id) return NextResponse.json({error:'Shot is required.'},{status:400});
  return NextResponse.json({
    ok:true,
    source:'continuity-and-production-rules',
    qc:deterministicQC(body.shot,{
      previousShot:body.previousShot,
      hasReferenceFrame:Boolean(body.hasReferenceFrame),
      hasGeneratedVideo:Boolean(body.hasGeneratedVideo),
      notes:body.notes,
    })
  });
}
