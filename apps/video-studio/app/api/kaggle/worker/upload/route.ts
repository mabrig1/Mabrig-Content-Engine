import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { genericCollection } from '../../../../../lib/db';
import { requireKaggleWorker } from '../../../../../lib/kaggle-worker';

const MAX_RAW_CHUNK=1_500_000;
const MAX_TOTAL=30_000_000;

export async function POST(request:Request){
  const worker=await requireKaggleWorker(request);
  if(!worker) return NextResponse.json({error:'Unauthorized worker.'},{status:401});
  const body=await request.json() as {
    jobId?:string;index?:number;total?:number;dataBase64?:string;mime?:string;rawBytes?:number
  };
  const id=String(body.jobId||'');
  const index=Number(body.index);
  const total=Number(body.total);
  const rawBytes=Number(body.rawBytes||0);
  if(!ObjectId.isValid(id)||!Number.isInteger(index)||index<0||!Number.isInteger(total)||total<1||total>40){
    return NextResponse.json({error:'Invalid upload metadata.'},{status:400});
  }
  if(rawBytes<1||rawBytes>MAX_RAW_CHUNK) return NextResponse.json({error:'Chunk exceeds size limit.'},{status:413});
  const data=String(body.dataBase64||'');
  if(!data||data.length>2_100_000) return NextResponse.json({error:'Chunk payload exceeds size limit.'},{status:413});

  const jobs=await genericCollection('kaggle_jobs');
  const job=await jobs.findOne({_id:new ObjectId(id),workerId:worker._id});
  if(!job) return NextResponse.json({error:'Job not found for this worker.'},{status:404});

  const projected=(Number(job.outputBytes||0)+rawBytes);
  if(projected>MAX_TOTAL) return NextResponse.json({error:'Experimental Kaggle bridge limits each clip to 30 MB.'},{status:413});

  const chunks=await genericCollection('kaggle_job_chunks');
  await chunks.updateOne(
    {jobId:new ObjectId(id),index},
    {$set:{jobId:new ObjectId(id),index,total,dataBase64:data,rawBytes,createdAt:new Date()}},
    {upsert:true}
  );

  const received=await chunks.countDocuments({jobId:new ObjectId(id)});
  const complete=received>=total;
  await jobs.updateOne(
    {_id:new ObjectId(id)},
    {$set:{
      status:complete?'succeeded':'uploading',
      progress:complete?100:Math.min(99,Math.round((received/total)*100)),
      outputMime:String(body.mime||'video/mp4').slice(0,80),
      outputBytes:projected,
      totalChunks:total,
      updatedAt:new Date(),
      ...(complete?{completedAt:new Date()}:{})
    }}
  );

  return NextResponse.json({ok:true,received,total,complete});
}
