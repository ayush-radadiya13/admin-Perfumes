"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function RatingsAdmin() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/ratings/admin")
      .then((r) => setList(r.data || []))
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <p className="text-red-400">{err}</p>;

  return (
    <div className="w-full">
      <h1 className="font-serif text-2xl text-zinc-100">Ratings & reviews</h1>
      <p className="mt-1 text-sm text-zinc-500">Customer ratings on products</p>
      <div className="mt-8 w-full overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Comment</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r._id} className="border-b border-zinc-800/50 align-top">
                <td className="px-4 py-3 text-zinc-200">{r.product?.name || "—"}</td>
                <td className="px-4 py-3 text-zinc-300">
                  {r.user?.name || "—"}
                  <br />
                  <span className="text-xs text-zinc-500">{r.user?.email || ""}</span>
                </td>
                <td className="px-4 py-3 text-amber-500">{"★".repeat(r.rating || 0)}</td>
                <td className="px-4 py-3 max-w-xs text-zinc-400">{r.comment || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-zinc-500">
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!list.length && <p className="mt-4 text-zinc-500">No reviews yet.</p>}
    </div>
  );
}
