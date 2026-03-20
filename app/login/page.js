'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';

export default function LoginPage() {
  const { login, token, admin, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!loading && token && admin) router.replace('/dashboard');
  }, [loading, token, admin, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
    } catch (er) {
      setErr(er.message || 'Login failed');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg px-4">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,163,115,0.15),transparent)]" />
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-md space-y-5 rounded-2xl border border-admin-border bg-admin-bg p-8 shadow-admin-lg"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-admin-primary to-admin-secondary text-lg font-bold text-white shadow-admin-md">
            P
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-admin-text">Admin sign in</h1>
          <p className="mt-1 text-sm text-admin-muted">JWT-secured panel</p>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="admin-input"
          autoComplete="email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="admin-input"
          autoComplete="current-password"
        />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button type="submit" className="admin-btn-primary w-full py-3">
          Sign in
        </button>
        <p className="text-center text-xs text-admin-muted">
          First time? POST /api/admin/auth/register or run npm run seed in backend.
        </p>
      </form>
    </div>
  );
}
