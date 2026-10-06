import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../lib/auth';
import { genericCollection } from '../../../lib/db';

export const dynamic='force-dynamic';

async function member(){
  const user=await currentUser();
  return user&&hasPaidAccess(user)?user:null;
}

export async function GET(){
  const user=await member();
  if(!user)return NextResponse.json({error:'Paid membership required.'},{status:401});
  const progress=await genericCollection('progress');
  const rows=await progress.find({userId:new ObjectId(user.id)}).toArray();
  return NextResponse.json({
    completed:rows.map((row:any)=>String(row.lessonId)),
    count:rows.length,
    certificateEligible:rows.length>=12,
  });
}

export async function POST(request:NextRequest){
  const user=await member();
  if(!user)return NextResponse.json({error:'Paid membership required.'},{status:401});
  const body=await request.json();
  const lessonId=String(body?.lessonId||'').trim().slice(0,120);
  const completed=body?.completed!==false;
  if(!lessonId)return NextResponse.json({error:'lessonId is required.'},{status:400});
  const progress=await genericCollection('progress');
  const key={userId:new ObjectId(user.id),lessonId};
  if(completed){
    await progress.updateOne(key,{$set:{...key,completedAt:new Date()}},{upsert:true});
  }else{
    await progress.deleteOne(key);
  }
  const count=await progress.countDocuments({userId:new ObjectId(user.id)});
  return NextResponse.json({ok:true,count,certificateEligible:count>=12});
}
