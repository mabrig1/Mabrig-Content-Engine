import Stripe from 'stripe';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { usersCollection } from '../../../../../lib/db';

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret || !webhookSecret) return new NextResponse('Not configured', { status: 503 });

  const stripe = new Stripe(secret);
  const raw = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) return new NextResponse('Missing signature', { status: 401 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, webhookSecret);
  } catch {
    return new NextResponse('Invalid signature', { status: 401 });
  }

  const users = await usersCollection();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = String(session.metadata?.userId || session.client_reference_id || '');
    const plan = session.metadata?.plan === 'premium' ? 'premium' : 'member';
    if (ObjectId.isValid(userId)) {
      const now = new Date();
      await users.updateOne(
        { _id: new ObjectId(userId) },
        { $set: {
          role: plan === 'premium' ? 'premium' : 'member',
          'subscription.status': 'active',
          'subscription.plan': plan,
          'subscription.provider': 'stripe',
          'subscription.providerCustomerId': typeof session.customer === 'string' ? session.customer : undefined,
          'subscription.providerSubscriptionId': typeof session.subscription === 'string' ? session.subscription : undefined,
          'subscription.updatedAt': now,
          updatedAt: now,
        } },
      );
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    await users.updateOne(
      { 'subscription.providerSubscriptionId': subscription.id },
      { $set: { 'subscription.status': 'canceled', 'subscription.updatedAt': new Date(), updatedAt: new Date() } },
    );
  }

  return NextResponse.json({ received: true });
}
