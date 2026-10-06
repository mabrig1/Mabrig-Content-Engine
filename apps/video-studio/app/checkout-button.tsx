'use client';

import { useState } from 'react';

export function CheckoutButton({
  plan,
  provider,
  label,
}: {
  plan: 'member' | 'premium';
  provider: 'paystack' | 'flutterwave' | 'stripe';
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function checkout() {
    setBusy(true);
    setNotice('');
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, provider }),
      });
      const payload = await response.json();
      if (response.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent('/pricing')}`;
        return;
      }
      if (!response.ok) throw new Error(payload?.error || 'Checkout is unavailable.');
      window.location.href = payload.url;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Checkout is unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="checkoutAction">
      <button className="secondaryButton fullButton" onClick={checkout} disabled={busy}>
        {busy ? 'Opening checkout…' : label}
      </button>
      {notice && <small>{notice}</small>}
    </div>
  );
}
