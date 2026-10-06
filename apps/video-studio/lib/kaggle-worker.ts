import { createHash, randomBytes } from 'crypto';
import { genericCollection } from './db';

export function newKaggleWorkerToken(){
  return 'mkw_'+randomBytes(32).toString('base64url');
}

export function hashKaggleToken(token:string){
  return createHash('sha256').update(token).digest('hex');
}

export async function requireKaggleWorker(request:Request){
  const header=request.headers.get('authorization')||'';
  const token=header.startsWith('Bearer ')?header.slice(7).trim():'';
  if(!token) return null;
  const workers=await genericCollection('kaggle_workers');
  const worker=await workers.findOne({
    tokenHash:hashKaggleToken(token),
    active:true,
  });
  if(!worker) return null;
  await workers.updateOne({_id:worker._id},{$set:{lastSeenAt:new Date()}});
  return worker;
}
