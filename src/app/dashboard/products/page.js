"use client";

import Link from "next/link";
import { api, API_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  DashboardEditIconLink,
  DashboardDeleteIconButton,
} from "../../../../components/TableActionIcons";

export default function ProductsAdmin() {
  const [list, setList] = useState([]);

  function load() {
    api("/products?limit=100").then((r) => setList(r.items || r.data || []));
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    if (!confirm("Delete product?")) return;
    await api(`/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-zinc-100">Products</h1>
        <Link
          href="/dashboard/products/new"
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-black"
        >
          New product
        </Link>
      </div>
      <ul className="mt-8 space-y-2">
        {list.map((p) => {
          const img = p.images?.[0];
          const src = img?.startsWith("http") ? img : img ? `${API_URL}${img}` : "";
          return (
            <li
              key={p._id}
              className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3"
            >
              {src && <img src={src} alt="" className="h-14 w-14 rounded object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-200">{p.name}</p>
                <p className="text-xs text-zinc-500">
                  ${p.price} · {p.category?.name} · stock {p.stock}
                </p>
              </div>
              <DashboardEditIconLink href={`/dashboard/products/${p._id}`} />
              <DashboardDeleteIconButton onClick={() => remove(p._id)} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
