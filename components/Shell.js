'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useAuth } from './AuthProvider';

const AdminFormCtx = createContext(null);

function AdminFormOpenerProvider({ children }) {
  const ref = useRef(() => {});
  const registerOpenForm = useCallback((fn) => {
    ref.current = typeof fn === 'function' ? fn : () => {};
    return () => {
      ref.current = () => {};
    };
  }, []);
  const openForm = useCallback(() => {
    try {
      ref.current();
    } catch (e) {
      console.error(e);
    }
  }, []);
  const value = useMemo(() => ({ registerOpenForm, openForm }), [registerOpenForm, openForm]);
  return <AdminFormCtx.Provider value={value}>{children}</AdminFormCtx.Provider>;
}

export function useAdminFormOpener() {
  const c = useContext(AdminFormCtx);
  if (!c) {
    return { registerOpenForm: () => () => {}, openForm: () => {} };
  }
  return c;
}

function MainWithFab({ children }) {
  const pathname = usePathname();
  const { openForm } = useAdminFormOpener();

  const showFab =
      pathname !== '/login' &&
      !['/dashboard', '/orders', '/reviews', '/wishlists'].includes(pathname);

  // Dynamic label based on route
  const getLabel = () => {
    if (pathname.includes('categories')) return 'Add Category';
    if (pathname.includes('collections')) return 'Add Collection';
    if (pathname.includes('products')) return 'Add Product';
    if (pathname.includes('offers')) return 'Add Offer';
    return 'Add';
  };

  return (
      <main className="flex-1 overflow-auto p-8 w-full min-w-0 relative">
        {showFab && (
            <button
                type="button"
                onClick={openForm}
                className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 h-12 rounded-full bg-sidebar text-white shadow-lg transition hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                aria-label="Open form"
            >
              <span className="text-xl leading-none">+</span>
              <span className="text-sm font-medium hidden sm:inline">
            {getLabel()}
          </span>
            </button>
        )}

        <div className="w-full max-w-none">{children}</div>
      </main>
  );
}

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/categories', label: 'Categories' },
  { href: '/collections', label: 'Collections' },
  { href: '/products', label: 'Products' },
  { href: '/offers', label: 'Offers' },
  { href: '/orders', label: 'Orders' },
  { href: '/reviews', label: 'Ratings' },
  { href: '/wishlists', label: 'Wishlist' },
];

export default function Shell({ children }) {
  const pathname = usePathname();
  const { admin, logout } = useAuth();

  if (pathname === '/login') return children;

  return (
    <AdminFormOpenerProvider>
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-56 bg-sidebar text-slate-300 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-700">
          <p className="text-white font-semibold">Perfumes Admin</p>
          <p className="text-xs truncate mt-1 opacity-70">{admin?.email}</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`block px-3 py-2 rounded text-sm ${
                pathname.startsWith(n.href) ? 'bg-accent text-white' : 'hover:bg-slate-800'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="m-2 px-3 py-2 text-sm text-left rounded hover:bg-slate-800"
        >
          Log out
        </button>
      </aside>
      <MainWithFab>{children}</MainWithFab>
    </div>
    </AdminFormOpenerProvider>
  );
}
