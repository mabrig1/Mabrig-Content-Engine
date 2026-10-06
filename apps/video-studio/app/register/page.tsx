import { Suspense } from 'react';
import { AuthForm } from '../auth-form';

export default function RegisterPage() {
  return (
    <main className="publicShell">
      <nav><a href="/"><b>MABRIG <span>CINEMA</span></b></a><a href="/pricing">PRICING</a></nav>
      <section className="authWrap">
        <Suspense fallback={<div className="authCard">Loading…</div>}>
          <AuthForm mode="register" />
        </Suspense>
      </section>
    </main>
  );
}
