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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 space-y-4"
      >
        <h1 className="text-2xl font-bold text-slate-800">Admin sign in</h1>
        <p className="text-sm text-slate-500">JWT-secured panel</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full border rounded-lg px-3 py-2"
        />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
        >
          Sign in
        </button>
        <p className="text-xs text-slate-400 text-center">
          First time? POST /api/admin/auth/register or run npm run seed in backend.
        </p>
      </form>
    </div>
  );
}
