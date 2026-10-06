import { NextResponse } from 'next/server';
import { genericCollection } from '../../../../../lib/db';
import { requireKaggleWorker } from '../../../../../lib/kaggle-worker';

export const dynamic='force-dynamic';

export async function POST(request:Request){
  const worker=await requireKaggleWorker(request);
  if(!worker) return NextResponse.json({error:'Unauthorized worker.'},{status:401});

  const jobs=await genericCollection('kaggle_jobs');
  const now=new Date();
  const leaseUntil=new Date(Date.now()+20*60*1000);

  const claimed=await jobs.findOneAndUpdate(
    {
      $or:[
        {status:'queued'},
        {status:'working',leaseUntil:{$lt:now}}
      ]
    },
    {
      $set:{
        status:'working',
        workerId:worker._id,
        leaseUntil,
        updatedAt:now,
        progress:1,
      }
    },
    {sort:{createdAt:1},returnDocument:'after'}
  );

  if(!claimed) return NextResponse.json({ok:true,job:null});
  return NextResponse.json({
    ok:true,
    job:{
      id:claimed._id.toHexString(),
      shotId:claimed.shotId,
      prompt:claimed.prompt,
      durationSeconds:claimed.durationSeconds,
      aspectRatio:claimed.aspectRatio,
    }
  });
}
