import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { usersCollection } from '../../../../../lib/db';

export async function POST(request: NextRequest) {
  const expected = process.env.FLW_WEBHOOK_HASH?.trim();
  const supplied = request.headers.get('verif-hash');
  if (!expected || supplied !== expected) return new NextResponse('Invalid signature', { status: 401 });

  const event = await request.json();
  const meta = event?.data?.meta || event?.data?.metadata || {};
  const userId = String(meta.userId || '');
  const plan = meta.plan === 'premium' ? 'premium' : 'member';
  const paid = event?.event === 'charge.completed' && ['successful', 'succeeded'].includes(String(event?.data?.status || '').toLowerCase());
  if (paid && ObjectId.isValid(userId)) {
    const users = await usersCollection();
    const now = new Date();
    const end = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000);
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: {
        role: plan === 'premium' ? 'premium' : 'member',
        'subscription.status': 'active',
        'subscription.plan': plan,
        'subscription.provider': 'flutterwave',
        'subscription.currentPeriodEnd': end,
        'subscription.updatedAt': now,
        updatedAt: now,
      } },
    );
  }
  return NextResponse.json({ received: true });
}
