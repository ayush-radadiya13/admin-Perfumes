'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthProvider';

const TITLE_MAP = {
  '/dashboard': 'Dashboard',
  '/categories': 'Categories',
  '/collections': 'Collections',
  '/products': 'Products',
  '/offers': 'Offers',
  '/orders': 'Orders',
  '/reviews': 'Ratings',
  '/wishlists': 'Wishlist',
  '/users': 'Users',
  '/settings': 'Settings',
};

function titleFromPath(pathname) {
  if (TITLE_MAP[pathname]) return TITLE_MAP[pathname];
  const seg = pathname.split('/').filter(Boolean)[0];
  if (!seg) return 'Dashboard';
  return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
}

export default function AdminHeader() {
  const pathname = usePathname();
  const { admin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const title = titleFromPath(pathname);

  const close = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    function onDoc(e) {
      if (!menuRef.current?.contains(e.target)) close();
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [close]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  const initial = (admin?.email || 'A').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-admin-border bg-admin-bg px-6 shadow-admin">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/dashboard" className="group flex items-center gap-2">
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-xl font-semibold text-admin-text">{title}</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2" ref={menuRef}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-admin-border bg-admin-surface text-admin-text shadow-sm transition hover:border-admin-primary/40 hover:text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/25"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Account menu"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-admin-primary/15 text-sm font-semibold text-admin-secondary">
              {initial}
            </span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-admin-border bg-admin-bg py-1 shadow-admin-lg transition-opacity duration-150"
            >
              <div className="border-b border-admin-border px-3 py-2">
                <p className="truncate text-xs font-medium text-admin-muted">Signed in</p>
                <p className="truncate text-sm font-medium text-admin-text">{admin?.email}</p>
              </div>
              <Link
                href="/settings"
                role="menuitem"
                className="block px-3 py-2.5 text-sm text-admin-text transition hover:bg-admin-primary/10 hover:text-admin-primary"
                onClick={close}
              >
                Profile
              </Link>
              <Link
                href="/settings"
                role="menuitem"
                className="block px-3 py-2.5 text-sm text-admin-text transition hover:bg-admin-primary/10 hover:text-admin-primary"
                onClick={close}
              >
                Settings
              </Link>
              <button
                type="button"
                role="menuitem"
                className="w-full px-3 py-2.5 text-left text-sm text-admin-text transition hover:bg-admin-primary/10 hover:text-admin-primary"
                onClick={() => {
                  close();
                  logout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
