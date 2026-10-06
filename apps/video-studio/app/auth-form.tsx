'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'register' ? { name, email, password } : { email, password },
        ),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Authentication failed.');
      const next = params.get('next') || '/masterclass';
      router.push(next);
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="authCard" onSubmit={submit}>
      <p className="eyebrow">{mode === 'register' ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}</p>
      <h1>{mode === 'register' ? 'Enter the film studio.' : 'Continue your production.'}</h1>
      {mode === 'register' && (
        <>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </>
      )}
      <label>Email</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <label>Password</label>
      <input
        type="password"
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button className="generate" disabled={busy}>
        {busy ? 'Please wait…' : mode === 'register' ? 'CREATE ACCOUNT' : 'LOGIN'}
      </button>
      {notice && <div className="render"><b>Account notice</b><span>{notice}</span></div>}
      <small className="authSwitch">
        {mode === 'register' ? 'Already registered?' : 'New to MABRIG CINEMA?'}{' '}
        <a href={mode === 'register' ? '/login' : '/register'}>
          {mode === 'register' ? 'Login' : 'Create an account'}
        </a>
      </small>
    </form>
  );
}
