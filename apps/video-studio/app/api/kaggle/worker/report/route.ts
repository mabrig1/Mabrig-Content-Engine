import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { genericCollection } from '../../../../../lib/db';
import { requireKaggleWorker } from '../../../../../lib/kaggle-worker';

export async function POST(request:Request){
  const worker=await requireKaggleWorker(request);
  if(!worker) return NextResponse.json({error:'Unauthorized worker.'},{status:401});
  const body=await request.json() as {jobId?:string;status?:string;progress?:number;error?:string};
  const id=String(body.jobId||'');
  if(!ObjectId.isValid(id)) return NextResponse.json({error:'Valid jobId required.'},{status:400});
  const status=['working','failed'].includes(String(body.status))?String(body.status):'working';
  const jobs=await genericCollection('kaggle_jobs');
  await jobs.updateOne(
    {_id:new ObjectId(id),workerId:worker._id},
    {$set:{
      status,
      progress:Math.max(0,Math.min(99,Number(body.progress||0))),
      ...(body.error?{error:String(body.error).slice(0,4000)}:{}),
      leaseUntil:new Date(Date.now()+20*60*1000),
      updatedAt:new Date(),
    }}
  );
  return NextResponse.json({ok:true});
}
