import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../../lib/auth';
import { genericCollection } from '../../../../lib/db';

export const dynamic='force-dynamic';

export async function GET(request:NextRequest){
  const user=await currentUser();
  if(!user||!hasPaidAccess(user)) return NextResponse.json({error:'Paid membership required.'},{status:401});
  const id=request.nextUrl.searchParams.get('jobId')||'';
  if(!ObjectId.isValid(id)) return NextResponse.json({error:'Valid jobId required.'},{status:400});

  const jobs=await genericCollection('kaggle_jobs');
  const job=await jobs.findOne({_id:new ObjectId(id),userId:new ObjectId(user.id),status:'succeeded'});
  if(!job) return NextResponse.json({error:'Completed video not found.'},{status:404});
  if(Number(job.outputBytes||0)>30_000_000) return NextResponse.json({error:'Clip is too large for experimental playback.'},{status:413});

  const chunks=await genericCollection('kaggle_job_chunks');
  const rows=await chunks.find({jobId:new ObjectId(id)}).sort({index:1}).toArray();
  if(!rows.length) return NextResponse.json({error:'Video chunks are missing.'},{status:404});
  const buffer=Buffer.concat(rows.map((row:any)=>Buffer.from(String(row.dataBase64||''),'base64')));

  return new Response(buffer,{
    status:200,
    headers:{
      'Content-Type':String(job.outputMime||'video/mp4'),
      'Content-Length':String(buffer.byteLength),
      'Content-Disposition':`inline; filename="${String(job.shotId||'kaggle-shot')}.mp4"`,
      'Cache-Control':'private, no-store',
    }
  });
}
