'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { adminFetch } from '../lib/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'admin_jwt';

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    setTokenState(t);
    if (!t) {
      setLoading(false);
      return;
    }
    adminFetch('/auth/me', { token: t })
      .then((d) => setAdmin(d.admin))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setTokenState(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const setToken = useCallback((t) => {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
    setTokenState(t);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAdmin(null);
    router.push('/login');
  }, [router, setToken]);

  const login = useCallback(
    async (email, password) => {
      const data = await adminFetch('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      setToken(data.token);
      setAdmin(data.admin);
      router.push('/dashboard');
      return data;
    },
    [router, setToken]
  );

  const value = { token, admin, loading, login, logout, setToken };

  if (loading && pathname !== '/login') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-gradient-to-br from-admin-primary to-admin-secondary shadow-admin-md" />
          <p className="text-sm text-admin-muted">Loading…</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth');
  return ctx;
}
