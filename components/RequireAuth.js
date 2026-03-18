'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function RequireAuth({ children }) {
  const { token, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && pathname !== '/login' && !token) {
      router.replace('/login');
    }
  }, [token, loading, pathname, router]);

  if (pathname === '/login') return children;
  if (loading || !token) return null;
  return children;
}
