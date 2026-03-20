'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { adminFetch } from '../../lib/api';
import AnalyticsGraphChart from '../../components/AnalyticsGraphChart';
import MostWishlistedChart from '../../components/MostWishlistedChart';
import GenderRegistrationChart from '../../components/GenderRegistrationChart';
import { formatINR } from '../../lib/currency';

export default function DashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [graph, setGraph] = useState(null);
  const [wishlisted, setWishlisted] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!token) return;
    Promise.all([
      adminFetch('/analytics/dashboard', { token }),
      adminFetch('/analytics/graph?months=12', { token }).catch(() => null),
      adminFetch('/wishlists/analytics/most-wishlisted?limit=10', { token }).catch(() => ({
        products: [],
      })),
    ])
      .then(([dash, g, wl]) => {
        setData(dash);
        setGraph(g);
        setWishlisted(wl?.products || []);
      })
      .catch((e) => setErr(e.message));
  }, [token]);

  if (err) return <p className="text-red-600">{err}</p>;
  if (!data) return <p className="text-admin-muted">Loading analytics…</p>;

  const { summary, topPerfumes, monthlyChart } = data;
  /** Prefer dedicated graph API; shape matches getGraphData */
  const graphPayload =
    graph && graph.labels?.length
      ? graph
      : monthlyChart?.labels?.length
        ? { granularity: 'month', labels: monthlyChart.labels, sales: monthlyChart.sales, orders: monthlyChart.orders }
        : null;

  return (
    <div className="w-full max-w-none space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-admin-text">Dashboard</h1>
        <p className="mt-1 text-sm text-admin-muted">Overview of sales, catalog, and engagement.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[
          ['Total revenue', formatINR(summary.totalRevenue)],
          ['Orders', summary.totalOrders],
          ['Pending', summary.pendingOrders],
          ['This month', formatINR(summary.monthlySales)],
          ['Products', summary.activeProducts],
          ['Categories', summary.activeCategories],
        ].map(([k, v]) => (
          <div
            key={k}
            className="admin-card border-admin-border p-4 transition hover:shadow-admin-md"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-admin-muted">{k}</p>
            <p className="mt-1 text-xl font-semibold text-admin-text">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="admin-card min-w-0 p-6 shadow-admin lg:col-span-2">
          <AnalyticsGraphChart graph={graphPayload} title="Revenue over time" />
        </div>
        <div className="admin-card flex flex-col justify-center p-6 shadow-admin">
          <GenderRegistrationChart
            male={summary.registeredMale ?? 0}
            female={summary.registeredFemale ?? 0}
            withoutGender={summary.registeredWithoutGender ?? 0}
          />
        </div>
      </div>

      <div className="admin-card p-6 shadow-admin">
        <MostWishlistedChart products={wishlisted} title="Most wishlisted (saves)" />
      </div>

      <div className="admin-card max-w-3xl p-6 shadow-admin">
        <h3 className="mb-4 text-sm font-semibold text-admin-text">Most purchased perfumes</h3>
        <ul className="space-y-3">
          {(topPerfumes || []).map((row, i) => (
            <li
              key={row.productId || i}
              className="flex justify-between border-b border-admin-border pb-2 text-sm last:border-0"
            >
              <span className="truncate pr-2 font-medium text-admin-text">{row.name || '—'}</span>
              <span className="shrink-0 text-admin-muted">
                {row.totalQty} sold · {formatINR(row.revenue)}
              </span>
            </li>
          ))}
          {!topPerfumes?.length && <li className="text-admin-muted">No orders yet.</li>}
        </ul>
      </div>
    </div>
  );
}
