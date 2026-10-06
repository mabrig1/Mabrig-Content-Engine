import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { currentUser } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://aivideo.mabrigkorie.org').replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Login required.' }, { status: 401 });

  try {
    const body = await request.json();
    const plan = body?.plan === 'premium' ? 'premium' : 'member';
    const provider = String(body?.provider || 'paystack');
    const amount = plan === 'premium'
      ? Number(process.env.PREMIUM_PRICE_NGN || 12000)
      : Number(process.env.MEMBER_PRICE_NGN || 5000);
    const callback = `${appUrl()}/account?checkout=success`;

    if (provider === 'paystack') {
      const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
      if (!secret) return NextResponse.json({ error: 'Paystack is not configured yet.' }, { status: 503 });
      const planCode = plan === 'premium'
        ? process.env.PAYSTACK_PREMIUM_PLAN_CODE
        : process.env.PAYSTACK_MEMBER_PLAN_CODE;
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          amount: Math.round(amount * 100),
          callback_url: callback,
          ...(planCode ? { plan: planCode } : {}),
          metadata: { userId: user.id, plan },
        }),
        cache: 'no-store',
      });
      const payload = await response.json();
      if (!response.ok || !payload?.data?.authorization_url) {
        throw new Error(payload?.message || 'Paystack checkout could not start.');
      }
      return NextResponse.json({ url: payload.data.authorization_url });
    }

    if (provider === 'flutterwave') {
      const secret = process.env.FLW_SECRET_KEY?.trim();
      if (!secret) return NextResponse.json({ error: 'Flutterwave is not configured yet.' }, { status: 503 });
      const paymentPlan = plan === 'premium'
        ? process.env.FLW_PREMIUM_PAYMENT_PLAN_ID
        : process.env.FLW_MEMBER_PAYMENT_PLAN_ID;
      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx_ref: `mabrig_${user.id}_${plan}_${Date.now()}`,
          amount,
          currency: 'NGN',
          redirect_url: callback,
          customer: { email: user.email, name: user.name },
          customizations: { title: 'MABRIG CINEMA', description: `${plan} membership` },
          meta: { userId: user.id, plan },
          ...(paymentPlan ? { payment_plan: Number(paymentPlan) } : {}),
        }),
        cache: 'no-store',
      });
      const payload = await response.json();
      if (!response.ok || !payload?.data?.link) {
        throw new Error(payload?.message || 'Flutterwave checkout could not start.');
      }
      return NextResponse.json({ url: payload.data.link });
    }

    if (provider === 'stripe') {
      const secret = process.env.STRIPE_SECRET_KEY?.trim();
      const price = plan === 'premium'
        ? process.env.STRIPE_PREMIUM_PRICE_ID?.trim()
        : process.env.STRIPE_MEMBER_PRICE_ID?.trim();
      if (!secret || !price) {
        return NextResponse.json({ error: 'Stripe subscription pricing is not configured yet.' }, { status: 503 });
      }
      const stripe = new Stripe(secret);
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price, quantity: 1 }],
        customer_email: user.email,
        client_reference_id: user.id,
        metadata: { userId: user.id, plan },
        success_url: callback,
        cancel_url: `${appUrl()}/pricing?checkout=cancelled`,
      });
      if (!session.url) throw new Error('Stripe did not return a checkout URL.');
      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: 'Unknown payment provider.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed.' },
      { status: 500 },
    );
  }
}
