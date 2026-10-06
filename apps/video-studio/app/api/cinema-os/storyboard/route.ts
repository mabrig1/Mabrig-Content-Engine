import { NextResponse } from 'next/server';
import { currentUser, hasPaidAccess } from '../../../../lib/auth';
import type { ProfessionalFilmPackage } from '../../../../lib/pro-film-os';
import { buildStoryboard } from '../../../../lib/storyboard-engine';

export async function POST(request:Request){
  const user=await currentUser();
  if(!user||!hasPaidAccess(user)) return NextResponse.json({error:'Paid membership required.'},{status:401});
  const body=await request.json() as {film?:ProfessionalFilmPackage};
  if(!body.film?.shots?.length) return NextResponse.json({error:'Professional film package is required.'},{status:400});
  return NextResponse.json({ok:true,storyboard:buildStoryboard(body.film)});
}
