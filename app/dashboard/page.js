'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { adminFetch } from '../../lib/api';
import AnalyticsGraphChart from '../../components/AnalyticsGraphChart';
import MostWishlistedChart from '../../components/MostWishlistedChart';

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
  if (!data) return <p className="text-slate-600">Loading analytics…</p>;

  const { summary, topPerfumes, monthlyChart } = data;
  /** Prefer dedicated graph API; shape matches getGraphData */
  const graphPayload =
    graph && graph.labels?.length
      ? graph
      : monthlyChart?.labels?.length
        ? { granularity: 'month', labels: monthlyChart.labels, sales: monthlyChart.sales, orders: monthlyChart.orders }
        : null;

  return (
    <div className="space-y-10 w-full max-w-none">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          ['Total revenue', `$${summary.totalRevenue}`],
          ['Orders', summary.totalOrders],
          ['Pending', summary.pendingOrders],
          ['This month', `$${summary.monthlySales}`],
          ['Products', summary.activeProducts],
          ['Categories', summary.activeCategories],
        ].map(([k, v]) => (
          <div key={k} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase">{k}</p>
            <p className="text-xl font-semibold text-slate-800 mt-1">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm min-w-0">
          <AnalyticsGraphChart graph={graphPayload} title="Revenue over time" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <MostWishlistedChart products={wishlisted} title="Most wishlisted (saves)" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-3xl">
        <h3 className="text-sm font-medium text-slate-600 mb-4">Most purchased perfumes</h3>
        <ul className="space-y-3">
          {(topPerfumes || []).map((row, i) => (
            <li key={row.productId || i} className="flex justify-between text-sm border-b border-slate-100 pb-2">
              <span className="font-medium truncate pr-2">{row.name || '—'}</span>
              <span className="text-slate-500 shrink-0">
                {row.totalQty} sold · ${row.revenue?.toFixed?.(2) ?? row.revenue}
              </span>
            </li>
          ))}
          {!topPerfumes?.length && <li className="text-slate-500">No orders yet.</li>}
        </ul>
      </div>
    </div>
  );
}
