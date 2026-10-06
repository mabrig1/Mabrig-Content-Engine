import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '../../../../lib/auth';
import { genericCollection } from '../../../../lib/db';

export const dynamic='force-dynamic';
const ALLOWED=new Set(['lessons','templates','prompts','tools']);

async function admin(){
  const user=await currentUser();
  return user?.role==='admin'?user:null;
}

export async function GET(request:NextRequest){
  if(!(await admin()))return NextResponse.json({error:'Admin access required.'},{status:403});
  const collection=request.nextUrl.searchParams.get('collection')||'lessons';
  if(!ALLOWED.has(collection))return NextResponse.json({error:'Unsupported collection.'},{status:400});
  const store=await genericCollection(collection);
  const rows=await store.find({}).sort({order:1,updatedAt:-1}).limit(500).toArray();
  return NextResponse.json({collection,items:rows.map((row:any)=>({...row,id:row._id?.toHexString(),_id:undefined}))});
}

export async function POST(request:NextRequest){
  if(!(await admin()))return NextResponse.json({error:'Admin access required.'},{status:403});
  const body=await request.json();
  const collection=String(body?.collection||'');
  if(!ALLOWED.has(collection))return NextResponse.json({error:'Unsupported collection.'},{status:400});
  const item=body?.item;
  if(!item||typeof item!=='object')return NextResponse.json({error:'item object is required.'},{status:400});
  const store=await genericCollection(collection);
  const now=new Date();
  const slug=String(item.slug||item.id||item.title||item.name||'')
    .trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,120);
  if(!slug)return NextResponse.json({error:'A slug, title or name is required.'},{status:400});
  const clean={...item,slug,updatedAt:now,published:item.published!==false};
  delete (clean as any)._id;delete (clean as any).id;
  await store.updateOne({slug},{$set:clean,$setOnInsert:{createdAt:now}},{upsert:true});
  return NextResponse.json({ok:true,slug});
}
