'use client';

/** Default page size for admin tables (must match API limit query). */
export const ADMIN_PAGE_SIZE = 10;

/**
 * @param {object} props
 * @param {number} props.page - Current page (1-based)
 * @param {number} props.pages - Total pages
 * @param {number} props.total - Total row count
 * @param {number} props.limit - Page size used for fetch
 * @param {(p: number) => void} props.onPageChange
 * @param {boolean} [props.loading]
 */
export default function TablePagination({
  page,
  pages,
  total,
  limit,
  onPageChange,
  loading = false,
  className = '',
}) {
  if (total < 1 && !loading) return null;

  const lim = limit || ADMIN_PAGE_SIZE;
  const from = total < 1 ? 0 : (page - 1) * lim + 1;
  const to = Math.min(page * lim, total);
  const multi = pages > 1;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 px-3 py-3 border-t bg-slate-50 text-sm ${className}`}
    >
      <span className="text-slate-600">
        {loading ? (
          'Loading…'
        ) : multi ? (
          <>
            Showing <span className="font-medium text-slate-800">{from}</span>–
            <span className="font-medium text-slate-800">{to}</span> of{' '}
            <span className="font-medium text-slate-800">{total}</span>
          </>
        ) : (
          <>
            <span className="font-medium text-slate-800">{total}</span>{' '}
            {total === 1 ? 'row' : 'rows'}
          </>
        )}
      </span>
      {multi && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
          >
            Previous
          </button>
          <span className="px-2 text-slate-500 tabular-nums">
            Page {page} / {pages}
          </span>
          <button
            type="button"
            disabled={loading || page >= pages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
