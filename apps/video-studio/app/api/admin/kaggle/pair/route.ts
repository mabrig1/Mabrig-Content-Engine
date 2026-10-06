import { NextResponse } from 'next/server';
import { currentUser } from '../../../../../lib/auth';
import { genericCollection } from '../../../../../lib/db';
import { hashKaggleToken, newKaggleWorkerToken } from '../../../../../lib/kaggle-worker';

export const dynamic='force-dynamic';

export async function POST(){
  const user=await currentUser();
  if(user?.role!=='admin') return NextResponse.json({error:'Admin access required.'},{status:403});

  const token=newKaggleWorkerToken();
  const workers=await genericCollection('kaggle_workers');
  await workers.updateMany({ownerUserId:user.id},{$set:{active:false,revokedAt:new Date()}});
  await workers.insertOne({
    ownerUserId:user.id,
    name:'Kaggle Wan Worker',
    tokenHash:hashKaggleToken(token),
    active:true,
    createdAt:new Date(),
    lastSeenAt:null,
  });

  return NextResponse.json({
    ok:true,
    token,
    studioUrl:process.env.NEXT_PUBLIC_APP_URL||'https://aivideo.mabrigkorie.org',
    note:'This token is shown once. Store it in Kaggle Secrets or the worker cell.',
  });
}
