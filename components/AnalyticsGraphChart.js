'use client';

import { useId } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatINR } from '../lib/currency';

function formatPeriod(label, granularity) {
  if (!label || typeof label !== 'string') return label;
  if (granularity === 'week') {
    const m = label.match(/^(\d{4})-W(\d+)/);
    if (m) return `W${m[2]} ${m[1]}`;
    return label;
  }
  const m = label.match(/^(\d{4})-(\d{2})$/);
  if (m) {
    const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idx = parseInt(m[2], 10) - 1;
    return `${mo[idx] || m[2]} ${m[1]}`;
  }
  return label;
}

function buildChartData(graph) {
  if (!graph?.labels?.length) return [];
  return graph.labels.map((label, i) => ({
    period: formatPeriod(label, graph.granularity),
    fullLabel: label,
    sales: Number(graph.sales?.[i]) || 0,
    orders: Number(graph.orders?.[i]) || 0,
  }));
}

function GraphTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-admin-border bg-admin-bg px-3 py-2 text-sm shadow-admin-md">
      <p className="font-medium text-admin-text">{d.fullLabel}</p>
      <p className="mt-1 font-medium text-[#8a6914]">Revenue: {formatINR(d.sales)}</p>
      <p className="text-xs text-admin-muted">{d.orders} orders</p>
    </div>
  );
}

export default function AnalyticsGraphChart({ graph, title = 'Sales by period' }) {
  const gradId = useId().replace(/:/g, '');
  const chartData = buildChartData(graph);
  const subtitle =
    graph?.granularity === 'week'
      ? 'Source: GET /api/admin/analytics/graph?granularity=week'
      : 'Source: GET /api/admin/analytics/graph';

  if (!chartData.length) {
    return (
      <div>
        <h3 className="mb-1 text-sm font-semibold text-admin-text">{title}</h3>
        <p className="mb-4 text-xs text-admin-muted">{subtitle}</p>
        <p className="text-sm text-admin-muted">No sales in this range yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="mb-1 text-sm font-semibold text-admin-text">{title}</h3>
      <p className="mb-4 text-xs text-admin-muted">{subtitle}</p>
      <div className="h-64 w-full min-h-[16rem]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" strokeOpacity={0.12} vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 11, fill: '#1a1a1a' }}
              tickLine={false}
              axisLine={{ stroke: '#1a1a1a', strokeOpacity: 0.25 }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#1a1a1a' }}
              tickLine={false}
              axisLine={{ stroke: '#1a1a1a', strokeOpacity: 0.25 }}
              tickFormatter={(v) =>
                v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : formatINR(v)
              }
            />
            <Tooltip content={<GraphTooltip />} cursor={{ fill: 'rgba(26, 26, 26, 0.06)' }} />
            <Bar
              dataKey="sales"
              name="sales"
              fill={`url(#${gradId})`}
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f5e6c8" stopOpacity={1} />
                <stop offset="35%" stopColor="#d4a373" stopOpacity={1} />
                <stop offset="100%" stopColor="#1a1a1a" stopOpacity={0.92} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
