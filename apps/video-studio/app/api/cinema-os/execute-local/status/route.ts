import { NextRequest, NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../../../lib/auth';
import { getExecutionStatus } from '../../../../../lib/video-execution/orchestrator';

export const dynamic='force-dynamic';

export async function GET(request:NextRequest){
  const user=await currentUser();
  if(!user||!hasPaidAccess(user)) return NextResponse.json({error:'Paid membership required.'},{status:401});
  const jobId=request.nextUrl.searchParams.get('jobId')?.trim();
  if(!jobId) return NextResponse.json({error:'jobId is required.'},{status:400});
  try{
    const status=await getExecutionStatus('local-wan',jobId);
    return NextResponse.json({ok:true,status});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:'Worker status failed.'},{status:502});
  }
}
