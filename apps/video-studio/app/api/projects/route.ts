import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../lib/auth';
import { projectsCollection } from '../../../lib/db';

export const dynamic='force-dynamic';

async function member() {
  const user=await currentUser();
  return user&&hasPaidAccess(user)?user:null;
}

export async function GET(){
  const user=await member();
  if(!user)return NextResponse.json({error:'Paid membership required.'},{status:401});
  const projects=await projectsCollection();
  const rows=await projects.find({userId:new ObjectId(user.id)}).sort({updatedAt:-1}).limit(100).toArray();
  return NextResponse.json({projects:rows.map(row=>({
    id:row._id?.toHexString(),title:row.title,kind:row.kind,payload:row.payload,createdAt:row.createdAt,updatedAt:row.updatedAt
  }))});
}

export async function POST(request:NextRequest){
  const user=await member();
  if(!user)return NextResponse.json({error:'Paid membership required.'},{status:401});
  const body=await request.json();
  const title=String(body?.title||'Untitled Project').trim().slice(0,160);
  const kind=['workflow','film-blueprint','agent-run'].includes(body?.kind)?body.kind:'workflow';
  const payload=body?.payload;
  if(!payload||typeof payload!=='object')return NextResponse.json({error:'payload object is required.'},{status:400});
  const projects=await projectsCollection();
  const now=new Date();
  const requestedId=String(body?.id||'');
  if(ObjectId.isValid(requestedId)){
    const id=new ObjectId(requestedId);
    const result=await projects.updateOne({_id:id,userId:new ObjectId(user.id)},{$set:{title,kind,payload,updatedAt:now}});
    if(result.matchedCount)return NextResponse.json({ok:true,id:requestedId});
  }
  const result=await projects.insertOne({userId:new ObjectId(user.id),title,kind,payload,createdAt:now,updatedAt:now});
  return NextResponse.json({ok:true,id:result.insertedId.toHexString()},{status:201});
}

export async function DELETE(request:NextRequest){
  const user=await member();
  if(!user)return NextResponse.json({error:'Paid membership required.'},{status:401});
  const id=request.nextUrl.searchParams.get('id')||'';
  if(!ObjectId.isValid(id))return NextResponse.json({error:'Valid project id required.'},{status:400});
  const projects=await projectsCollection();
  await projects.deleteOne({_id:new ObjectId(id),userId:new ObjectId(user.id)});
  return NextResponse.json({ok:true});
}
