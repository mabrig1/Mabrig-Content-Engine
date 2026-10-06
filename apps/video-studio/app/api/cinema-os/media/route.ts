import { NextRequest, NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../../lib/auth';

export const dynamic='force-dynamic';

function worker(){
  const url=process.env.GPU_WORKER_URL?.trim().replace(/\/$/,'');
  const token=process.env.GPU_WORKER_TOKEN?.trim();
  if(!url||!token) throw new Error('GPU worker is not configured.');
  return {url,token};
}

export async function GET(request:NextRequest){
  const user=await currentUser();
  if(!user||!hasPaidAccess(user)) return NextResponse.json({error:'Paid membership required.'},{status:401});
  const kind=request.nextUrl.searchParams.get('kind');
  const id=request.nextUrl.searchParams.get('id')||'';
  let path='';
  if(kind==='shot'&&id.startsWith('wan_')) path=`/outputs/${encodeURIComponent(id)}.mp4`;
  else if(kind==='assembly'&&id.startsWith('film_')) path=`/assemblies/${encodeURIComponent(id)}/output`;
  else return NextResponse.json({error:'Unsupported media request.'},{status:400});

  try{
    const {url,token}=worker();
    const response=await fetch(url+path,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});
    if(!response.ok) return NextResponse.json({error:`Worker media returned ${response.status}.`},{status:response.status});
    return new Response(response.body,{
      status:200,
      headers:{
        'Content-Type':response.headers.get('content-type')||'video/mp4',
        'Content-Disposition':`inline; filename="${id}.mp4"`,
        'Cache-Control':'private, no-store',
      },
    });
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:'Media proxy failed.'},{status:502});
  }
}
