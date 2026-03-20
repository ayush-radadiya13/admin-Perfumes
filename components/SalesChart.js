'use client';

import { formatINR } from '../lib/currency';

export default function SalesChart({ labels, sales, title = 'Sales by period' }) {
  if (!labels?.length) {
    return <p className="text-slate-500 text-sm">No sales data yet.</p>;
  }
  const max = Math.max(...sales, 1);
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-600 mb-4">{title}</h3>
      <div className="flex items-end gap-2 h-48 border-b border-slate-200 pb-1">
        {labels.map((label, i) => {
          const h = (sales[i] / max) * 100;
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <div
                className="w-full bg-indigo-500 rounded-t transition-all min-h-[4px]"
                style={{ height: `${h}%` }}
                title={`${label}: ${formatINR(sales[i])}`}
              />
              <span className="text-[10px] text-slate-500 truncate w-full text-center">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
