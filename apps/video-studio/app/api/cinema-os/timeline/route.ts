import { NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../../lib/auth';
import type { ProfessionalShot } from '../../../../lib/pro-film-os';
import { buildTimeline } from '../../../../lib/storyboard-engine';

export async function POST(request:Request){
  const user=await currentUser();
  if(!user||!hasPaidAccess(user)) return NextResponse.json({error:'Paid membership required.'},{status:401});
  const body=await request.json() as {title?:string;shots?:ProfessionalShot[];sourceUrls?:Record<string,string>};
  if(!body.shots?.length) return NextResponse.json({error:'Shots are required.'},{status:400});
  return NextResponse.json({ok:true,timeline:buildTimeline(String(body.title||'Untitled Film'),body.shots,body.sourceUrls||{})});
}
