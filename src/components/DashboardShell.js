"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/api";
import { useEffect, useState } from "react";
import { AdminFabProvider } from "@/components/AdminFabContext";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/collections", label: "Collections" },
  { href: "/dashboard/offers", label: "Offers" },
  { href: "/dashboard/ratings", label: "Ratings" },
];

export function DashboardShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!getToken()) router.replace("/login");
    else setOk(true);
  }, [router]);

  if (!ok) return <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-500">Loading…</div>;

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-900/30 p-4">
        <p className="px-3 font-serif text-lg text-amber-100">Perfume Admin</p>
        <nav className="mt-8 flex flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-lg px-3 py-2 text-sm ${
                pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href))
                  ? "bg-amber-600/20 text-amber-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => {
            clearToken();
            router.push("/login");
          }}
          className="mt-8 w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800"
        >
          Log out
        </button>
      </aside>
      <main className="relative flex-1 overflow-auto p-8 pt-20">
        <AdminFabProvider>{children}</AdminFabProvider>
      </main>
    </div>
  );
}
