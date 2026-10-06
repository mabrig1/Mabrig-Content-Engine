import { Suspense } from 'react';
import { AuthForm } from '../auth-form';

export default function LoginPage() {
  return (
    <main className="publicShell">
      <nav><a href="/"><b>MABRIG <span>CINEMA</span></b></a><a href="/pricing">PRICING</a></nav>
      <section className="authWrap">
        <Suspense fallback={<div className="authCard">Loading…</div>}>
          <AuthForm mode="login" />
        </Suspense>
      </section>
    </main>
  );
}
