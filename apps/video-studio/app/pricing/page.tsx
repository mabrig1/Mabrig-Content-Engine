import { CheckoutButton } from '../checkout-button';

export default function PricingPage() {
  const member = Number(process.env.MEMBER_PRICE_NGN || 5000);
  const premium = Number(process.env.PREMIUM_PRICE_NGN || 12000);

  return (
    <main className="publicShell">
      <nav>
        <a href="/"><b>MABRIG <span>CINEMA</span></b></a>
        <div className="navActions"><a href="/free-preview">FREE PREVIEW</a><a href="/login">LOGIN</a></div>
      </nav>
      <section className="publicHero compactHero">
        <p className="eyebrow">MEMBERSHIP</p>
        <h1>Learn filmmaking while the platform helps you make the film.</h1>
        <p>Paid access unlocks the Workstation, tutorials, prompt library, AI tools directory and Agentic Worker AI.</p>
      </section>
      <section className="pricingGrid">
        <article className="priceCard">
          <small>MEMBER</small>
          <h2>₦{member.toLocaleString()}<span>/month</span></h2>
          <p>Full Movie Masterclass, Workstation, tutorials, templates, prompt packs, tools directory and standard project storage.</p>
          <CheckoutButton plan="member" provider="paystack" label="PAY WITH PAYSTACK" />
          <CheckoutButton plan="member" provider="flutterwave" label="PAY WITH FLUTTERWAVE" />
          <CheckoutButton plan="member" provider="stripe" label="INTERNATIONAL / STRIPE" />
        </article>
        <article className="priceCard featured">
          <small>PREMIUM PRODUCER</small>
          <h2>₦{premium.toLocaleString()}<span>/month</span></h2>
          <p>Everything in Member plus higher render allowances, priority agent runs and premium production workflows when configured.</p>
          <CheckoutButton plan="premium" provider="paystack" label="PAY WITH PAYSTACK" />
          <CheckoutButton plan="premium" provider="flutterwave" label="PAY WITH FLUTTERWAVE" />
          <CheckoutButton plan="premium" provider="stripe" label="INTERNATIONAL / STRIPE" />
        </article>
      </section>
      <section className="publicNote">Provider charges for third-party generation models are separate from membership unless explicitly included in a plan.</section>
    </main>
  );
}
