import { NextRequest, NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../../lib/auth';

export const dynamic='force-dynamic';

function worker(){
  const url=process.env.GPU_WORKER_URL?.trim().replace(/\/$/,'');
  const token=process.env.GPU_WORKER_TOKEN?.trim();
  if(!url||!token) throw new Error('GPU worker is not configured.');
  return {url,token};
}

export async function POST(request:Request){
  const user=await currentUser();
  if(!user||!hasPaidAccess(user)) return NextResponse.json({error:'Paid membership required.'},{status:401});
  try{
    const body=await request.json() as {title?:string;jobIds?:string[];width?:number;height?:number;fps?:number};
    const jobIds=(body.jobIds||[]).filter((id)=>typeof id==='string'&&id.startsWith('wan_')).slice(0,200);
    if(!jobIds.length) return NextResponse.json({error:'At least one succeeded Wan job is required.'},{status:400});
    const {url,token}=worker();
    const response=await fetch(`${url}/assemblies`,{
      method:'POST',
      headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
      body:JSON.stringify({
        project_id:`member_${user.id.slice(-8)}_${Date.now().toString(36)}`,
        title:String(body.title||'MABRIG Cinema Film').slice(0,180),
        job_ids:jobIds,
        width:Math.max(480,Math.min(3840,Number(body.width||1920))),
        height:Math.max(480,Math.min(2160,Number(body.height||1080))),
        fps:Math.max(12,Math.min(60,Number(body.fps||24))),
      }),
      cache:'no-store',
    });
    const payload=await response.json();
    return NextResponse.json(payload,{status:response.status});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:'Assembly submission failed.'},{status:502});
  }
}

export async function GET(request:NextRequest){
  const user=await currentUser();
  if(!user||!hasPaidAccess(user)) return NextResponse.json({error:'Paid membership required.'},{status:401});
  const id=request.nextUrl.searchParams.get('assemblyId')||'';
  if(!id.startsWith('film_')) return NextResponse.json({error:'Valid assemblyId required.'},{status:400});
  try{
    const {url,token}=worker();
    const response=await fetch(`${url}/assemblies/${encodeURIComponent(id)}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});
    const payload=await response.json();
    return NextResponse.json(payload,{status:response.status});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:'Assembly status failed.'},{status:502});
  }
}
