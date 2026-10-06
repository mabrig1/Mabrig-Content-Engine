import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../lib/auth';
import { genericCollection } from '../../../lib/db';
import { AGENT_PIPELINE } from '../../../lib/production-workflow';

export const dynamic='force-dynamic';

async function member(){const user=await currentUser();return user&&hasPaidAccess(user)?user:null;}

export async function GET(){
 const user=await member();if(!user)return NextResponse.json({error:'Paid membership required.'},{status:401});
 const runs=await genericCollection('agent_runs');
 const rows=await runs.find({userId:new ObjectId(user.id)}).sort({createdAt:-1}).limit(50).toArray();
 return NextResponse.json({runs:rows.map(x=>({...x,id:x._id.toHexString(),_id:undefined}))});
}

export async function POST(request:NextRequest){
 const user=await member();if(!user)return NextResponse.json({error:'Paid membership required.'},{status:401});
 const body=await request.json();const brief=String(body?.brief||'').trim().slice(0,5000);
 if(!brief)return NextResponse.json({error:'brief is required.'},{status:400});
 const now=new Date();const runs=await genericCollection('agent_runs');
 const doc={userId:new ObjectId(user.id),title:String(body?.title||'Autonomous Production').slice(0,160),brief,state:'queued',stages:AGENT_PIPELINE.map((stage,index)=>({...stage,status:index===0?'working':'queued',attempt:0})),events:[`${now.toISOString()} Mission accepted by Executive Producer.`],createdAt:now,updatedAt:now};
 const result=await runs.insertOne(doc);
 return NextResponse.json({ok:true,id:result.insertedId.toHexString(),run:{...doc,userId:user.id}},{status:201});
}
