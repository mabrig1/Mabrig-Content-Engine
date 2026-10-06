import { NextResponse } from 'next/server';
import { currentUser } from '../../../../lib/auth';
import { usersCollection } from '../../../../lib/db';

export const dynamic='force-dynamic';

export async function GET(){
  const user=await currentUser();
  if(user?.role!=='admin')return NextResponse.json({error:'Admin access required.'},{status:403});
  const users=await usersCollection();
  const rows=await users.find({}, {projection:{passwordHash:0}} as any).sort({createdAt:-1}).limit(500).toArray();
  return NextResponse.json({members:rows.map((row:any)=>({
    id:row._id?.toHexString(),name:row.name,email:row.email,role:row.role,
    subscription:row.subscription,createdAt:row.createdAt,updatedAt:row.updatedAt
  }))});
}
