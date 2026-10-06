import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { currentUser, hasPaidAccess } from '../../../../lib/auth';
import { genericCollection } from '../../../../lib/db';
import type { ProfessionalShot } from '../../../../lib/pro-film-os';

export const dynamic='force-dynamic';

export async function POST(request:NextRequest){
  const user=await currentUser();
  if(!user||!hasPaidAccess(user)) return NextResponse.json({error:'Paid membership required.'},{status:401});
  const body=await request.json() as {shot?:ProfessionalShot;aspectRatio?:string};
  if(!body.shot?.id) return NextResponse.json({error:'Shot is required.'},{status:400});

  const jobs=await genericCollection('kaggle_jobs');
  const now=new Date();
  const result=await jobs.insertOne({
    userId:new ObjectId(user.id),
    shotId:body.shot.id,
    title:body.shot.sceneTitle,
    prompt:body.shot.generationPrompt,
    durationSeconds:Math.max(1,Math.min(12,Number(body.shot.durationSeconds||3))),
    aspectRatio:String(body.aspectRatio||'16:9'),
    status:'queued',
    progress:0,
    outputMime:null,
    outputBytes:0,
    totalChunks:0,
    createdAt:now,
    updatedAt:now,
  });

  return NextResponse.json({ok:true,jobId:result.insertedId.toHexString(),status:'queued'},{status:201});
}

export async function GET(request:NextRequest){
  const user=await currentUser();
  if(!user||!hasPaidAccess(user)) return NextResponse.json({error:'Paid membership required.'},{status:401});
  const id=request.nextUrl.searchParams.get('jobId')||'';
  if(!ObjectId.isValid(id)) return NextResponse.json({error:'Valid jobId required.'},{status:400});
  const jobs=await genericCollection('kaggle_jobs');
  const job=await jobs.findOne({_id:new ObjectId(id),userId:new ObjectId(user.id)});
  if(!job) return NextResponse.json({error:'Job not found.'},{status:404});
  return NextResponse.json({
    ok:true,
    job:{
      id:job._id.toHexString(),
      shotId:job.shotId,
      status:job.status,
      progress:job.progress||0,
      error:job.error||null,
      outputUrl:job.status==='succeeded'?'/api/cinema-os/kaggle/media?jobId='+job._id.toHexString():null,
      updatedAt:job.updatedAt,
    }
  });
}
