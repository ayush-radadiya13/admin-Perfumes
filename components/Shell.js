'use client';

import { usePathname } from 'next/navigation';
import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useMemo,
  Suspense,
} from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar, { useSidebarCollapsed } from './AdminSidebar';

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

  const getLabel = () => {
    if (pathname.includes('categories')) return 'Add Category';
    if (pathname.includes('collections')) return 'Add Collection';
    if (pathname.includes('products')) return 'Add Product';
    if (pathname.includes('offers')) return 'Add Offer';
    return 'Add';
  };

  return (
    <main className="relative min-h-0 flex-1 overflow-auto bg-admin-bg p-6 sm:p-8">
      {showFab && (
        <button
          type="button"
          onClick={openForm}
          className="fixed right-6 top-24 z-50 flex h-12 items-center gap-2 rounded-full bg-admin-primary px-4 text-sm font-semibold text-white shadow-admin-md transition hover:bg-admin-secondary focus:outline-none focus:ring-2 focus:ring-admin-primary/40 focus:ring-offset-2"
          aria-label="Open form"
        >
          <span className="text-xl leading-none">+</span>
          <span className="hidden sm:inline">{getLabel()}</span>
        </button>
      )}

      <div className="w-full max-w-none">{children}</div>
    </main>
  );
}

function SidebarFallback() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-admin-sidebar" aria-hidden>
      <div className="h-16 border-b border-white/10" />
    </aside>
  );
}

export default function Shell({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useSidebarCollapsed();

  if (pathname === '/login') return children;

  return (
    <AdminFormOpenerProvider>
      <div className="flex min-h-screen bg-admin-bg">
        <Suspense fallback={<SidebarFallback />}>
          <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </Suspense>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AdminHeader />
          <MainWithFab>{children}</MainWithFab>
        </div>
      </div>
    </AdminFormOpenerProvider>
  );
}
