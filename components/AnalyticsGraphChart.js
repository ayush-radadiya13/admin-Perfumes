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
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-slate-800">{d.fullLabel}</p>
      <p className="text-indigo-600 mt-1">Revenue: ${Number(d.sales).toFixed(2)}</p>
      <p className="text-slate-500 text-xs">{d.orders} orders</p>
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
        <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
        <p className="text-xs text-slate-400 mb-4">{subtitle}</p>
        <p className="text-slate-500 text-sm">No sales in this range yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 mb-4">{subtitle}</p>
      <div className="h-64 w-full min-h-[16rem]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`)}
            />
            <Tooltip content={<GraphTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }} />
            <Bar
              dataKey="sales"
              name="sales"
              fill={`url(#${gradId})`}
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.85} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
