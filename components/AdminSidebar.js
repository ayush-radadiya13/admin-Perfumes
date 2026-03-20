'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'admin_sidebar_collapsed';

function IconHome({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBox({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFolder({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCart({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStar({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconHeart({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconUsers({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCog({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
    </svg>
  );
}

function IconChevron({ className, open }) {
  return (
    <svg
      className={`${className} transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPanelLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
    </svg>
  );
}

const NAV = [
  { type: 'link', id: 'dash', href: '/dashboard', label: 'Dashboard', icon: IconHome },
  {
    type: 'dropdown',
    id: 'catalog',
    label: 'Catalog',
    icon: IconFolder,
    children: [
      { href: '/categories', label: 'Categories' },
      { href: '/collections', label: 'Collections' },
      { href: '/offers', label: 'Offers' },
    ],
  },
  { type: 'link', id: 'products', href: '/products', label: 'Products', icon: IconBox },
  { type: 'link', id: 'orders', href: '/orders', label: 'Orders', icon: IconCart },
  { type: 'link', id: 'reviews', href: '/reviews', label: 'Ratings', icon: IconStar },
  { type: 'link', id: 'wishlists', href: '/wishlists', label: 'Wishlist', icon: IconHeart },
  { type: 'link', id: 'users', href: '/users', label: 'Users', icon: IconUsers },
  { type: 'link', id: 'settings', href: '/settings', label: 'Settings', icon: IconCog },
];

function pathMatches(pathname, href) {
  const [path, query] = href.split('?');
  if (pathname !== path && !pathname.startsWith(`${path}/`)) return false;
  if (!query) return pathname === path || pathname.startsWith(`${path}/`);
  const params = new URLSearchParams(query);
  if (typeof window === 'undefined') return pathname === path;
  const sp = new URLSearchParams(window.location.search);
  for (const [k, v] of params.entries()) {
    if (sp.get(k) !== v) return false;
  }
  return pathname === path;
}

export default function AdminSidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dropdownOpen, setDropdownOpen] = useState({});

  const isActiveHref = useCallback(
    (href) => {
      const [path, query] = href.split('?');
      if (pathname !== path && !pathname.startsWith(`${path}/`)) return false;
      if (!query) {
        if (path === '/products' && pathname === '/products') {
          return searchParams.get('new') !== '1';
        }
        return true;
      }
      const params = new URLSearchParams(query);
      for (const [k, v] of params.entries()) {
        if (searchParams.get(k) !== v) return false;
      }
      return true;
    },
    [pathname, searchParams]
  );

  useEffect(() => {
    setDropdownOpen((prev) => {
      const next = { ...prev };
      NAV.forEach((item) => {
        if (item.type === 'dropdown') {
          const match = item.children.some((c) => {
            const [p] = c.href.split('?');
            return pathname === p || pathname.startsWith(`${p}/`);
          });
          if (match) next[item.id] = true;
        }
      });
      return next;
    });
  }, [pathname]);

  const toggleDropdown = (id) => {
    setDropdownOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const iconClass = 'h-5 w-5 shrink-0';

  const linkBase =
    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150';
  const inactive = 'text-admin-sidebar-muted hover:bg-white/5 hover:text-admin-primary';
  const active =
    'bg-admin-primary/15 text-admin-primary border-l-[3px] border-admin-primary -ml-px pl-[calc(0.75rem-2px)]';

  const childLink = (href, label) => {
    const on = isActiveHref(href);
    return (
      <Link
        key={href + label}
        href={href}
        className={`block rounded-lg py-2 pl-10 pr-3 text-sm transition-colors duration-150 ${
          on ? 'font-medium text-admin-primary' : 'text-admin-sidebar-muted hover:text-admin-primary'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-white/10 bg-admin-sidebar text-admin-sidebar-muted transition-[width] duration-300 ease-out ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div className={`flex items-center gap-2 border-b border-white/10 p-3 ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed && (
          <div className="min-w-0 flex-1">
           Lumière <span className=" text-admin-primary/90">Perfumes</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            const next = !collapsed;
            setCollapsed(next);
            try {
              localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
            } catch {
              /* ignore */
            }
          }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-admin-sidebar-muted transition hover:bg-white/10 hover:text-admin-primary"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <IconPanelLeft className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden p-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          if (item.type === 'link') {
            const on = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.id}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`${linkBase} ${on ? active : inactive} ${collapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon className={iconClass} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          }

          const open = !!dropdownOpen[item.id];
          const childActive = item.children.some((c) => isActiveHref(c.href));
          const parentPath = item.children[0]?.href.split('?')[0];
          const parentOn =
            pathname === parentPath ||
            pathname.startsWith(`${parentPath}/`) ||
            childActive;

          if (collapsed) {
            return (
              <Link
                key={item.id}
                href={parentPath}
                title={item.label}
                className={`${linkBase} justify-center px-2 ${parentOn ? active : inactive}`}
              >
                <Icon className={iconClass} />
              </Link>
            );
          }

          return (
            <div key={item.id} className="rounded-xl">
              <button
                type="button"
                onClick={() => toggleDropdown(item.id)}
                className={`${linkBase} w-full justify-between ${
                  parentOn && !open ? 'text-admin-primary/90' : ''
                } ${open || childActive ? 'bg-white/5 text-white' : inactive}`}
                aria-expanded={open}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Icon className={iconClass} />
                  <span className="truncate">{item.label}</span>
                </span>
                <IconChevron className="h-4 w-4 shrink-0 opacity-70" open={open} />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="space-y-0.5 py-1 pl-1">{item.children.map((c) => childLink(c.href, c.label))}</div>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === '1') setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  return [collapsed, setCollapsed];
}
