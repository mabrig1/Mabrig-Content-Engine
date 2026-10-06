import { createHmac, timingSafeEqual } from 'crypto';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { usersCollection } from '../../../../../lib/db';

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) return new NextResponse('Not configured', { status: 503 });
  const raw = await request.text();
  const expected = createHmac('sha512', secret).update(raw).digest('hex');
  const supplied = request.headers.get('x-paystack-signature') || '';
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return new NextResponse('Invalid signature', { status: 401 });

  const event = JSON.parse(raw);
  const metadata = event?.data?.metadata || {};
  const userId = String(metadata.userId || '');
  const plan = metadata.plan === 'premium' ? 'premium' : 'member';
  if (event?.event === 'charge.success' && ObjectId.isValid(userId)) {
    const users = await usersCollection();
    const now = new Date();
    const end = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000);
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: {
        role: plan === 'premium' ? 'premium' : 'member',
        'subscription.status': 'active',
        'subscription.plan': plan,
        'subscription.provider': 'paystack',
        'subscription.currentPeriodEnd': end,
        'subscription.updatedAt': now,
        updatedAt: now,
      } },
    );
  }
  return NextResponse.json({ received: true });
}
