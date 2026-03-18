'use client';

/**
 * Horizontal bar chart — same luxury admin feel as SalesChart.
 */
export default function MostWishlistedChart({ products = [], title = 'Most wishlisted perfumes' }) {
  if (!products.length) {
    return (
      <div>
        <h3 className="text-sm font-medium text-slate-600 mb-4">{title}</h3>
        <p className="text-slate-500 text-sm">No wishlist data yet.</p>
      </div>
    );
  }
  const max = Math.max(...products.map((p) => p.wishlistCount || 0), 1);
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-600 mb-4">{title}</h3>
      <ul className="space-y-3">
        {products.map((p) => {
          const n = p.wishlistCount || 0;
          const pct = (n / max) * 100;
          return (
            <li key={p._id}>
              <div className="flex justify-between gap-3 text-sm mb-1">
                <span className="font-medium text-slate-800 truncate min-w-0" title={p.name}>
                  {p.name}
                </span>
                <span className="shrink-0 text-amber-700 font-semibold tabular-nums">{n} ♡</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500 min-w-[4px]"
                  style={{ width: `${pct}%` }}
                  title={`${p.name}: ${n} saves`}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
