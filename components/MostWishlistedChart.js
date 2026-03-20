'use client';

/**
 * Horizontal bar chart — same luxury admin feel as SalesChart.
 */
export default function MostWishlistedChart({ products = [], title = 'Most wishlisted perfumes' }) {
  if (!products.length) {
    return (
      <div>
        <h3 className="mb-4 text-sm font-semibold text-admin-text">{title}</h3>
        <p className="text-sm text-admin-muted">No wishlist data yet.</p>
      </div>
    );
  }
  const max = Math.max(...products.map((p) => p.wishlistCount || 0), 1);
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-admin-text">{title}</h3>
      <ul className="space-y-3">
        {products.map((p) => {
          const n = p.wishlistCount || 0;
          const pct = (n / max) * 100;
          return (
            <li key={p._id}>
              <div className="mb-1 flex justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium text-admin-text" title={p.name}>
                  {p.name}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-[#8a6914]">{n} ♡</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full min-w-[4px] rounded-full bg-gradient-to-r from-[#1a1a1a] via-[#d4a373] to-[#b8860b] transition-all duration-500"
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
