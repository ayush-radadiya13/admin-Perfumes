"use client";

import { api } from "@/lib/api";
import { formatINR } from "@/lib/currency";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [top, setTop] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    Promise.all([
      api("/dashboard/stats?months=6"),
      api("/dashboard/analytics/monthly-sales"),
      api("/dashboard/analytics/top-products?limit=5"),
    ])
      .then(([s, m, t]) => {
        setStats(s.data);
        setMonthly(m.data);
        setTop(t.data || []);
      })
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <p className="text-red-400">{err}</p>;
  if (!stats) return <p className="text-zinc-500">Loading analytics…</p>;

  return (
    <div>
      <h1 className="font-serif text-3xl text-zinc-100">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">Sales, orders, and top perfumes</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">This month sales</p>
          <p className="mt-2 text-2xl font-semibold text-amber-500">{formatINR(stats.monthlySales)}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Month detail</p>
          <p className="mt-2 text-lg text-zinc-200">
            {monthly?.monthLabel}:{" "}
            {monthly?.salesTotal != null ? formatINR(monthly.salesTotal) : "—"}
          </p>
          <p className="text-xs text-zinc-500">{monthly?.orderCount ?? 0} orders</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Total orders</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-100">{stats.totalOrders}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Customers</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-100">{stats.totalCustomers}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <p className="text-xs uppercase text-zinc-500">Revenue (all time)</p>
        <p className="text-xl text-emerald-500">{formatINR(stats.revenueAllTime)}</p>
        {stats.mostPurchased && (
          <p className="mt-3 text-sm text-zinc-400">
            Most purchased: <strong className="text-amber-400">{stats.mostPurchased.name}</strong> (
            {stats.mostPurchased.quantity} units)
          </p>
        )}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-medium text-zinc-200">Sales graph (6 months)</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.salesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }}
                  labelStyle={{ color: "#fafafa" }}
                />
                <Bar dataKey="sales" fill="#d97706" name="Sales (₹)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-medium text-zinc-200">Orders per month</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.salesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }}
                  labelStyle={{ color: "#fafafa" }}
                />
                <Line type="monotone" dataKey="orders" stroke="#a855f7" strokeWidth={2} name="Orders" dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-medium text-zinc-200">Top purchased perfumes</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="pb-2">Product</th>
              <th className="pb-2">Units sold</th>
              <th className="pb-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {top.map((r, i) => (
              <tr key={i} className="border-b border-zinc-800/50">
                <td className="py-2 text-zinc-200">{r.name}</td>
                <td className="py-2 text-amber-500">{r.totalSold}</td>
                <td className="py-2">{formatINR(r.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {top.length === 0 && <p className="mt-4 text-zinc-500">No sales data yet.</p>}
      </div>
    </div>
  );
}
