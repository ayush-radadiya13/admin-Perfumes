'use client';

import { useMemo } from 'react';
import { ADMIN_PAGE_SIZE, ADMIN_PAGE_SIZE_OPTIONS } from '../constants/pagination';

export { ADMIN_PAGE_SIZE, ADMIN_PAGE_SIZE_OPTIONS } from '../constants/pagination';

/**
 * Build 1-based page entries with ellipsis markers between gaps.
 * @param {number} current
 * @param {number} totalPages
 * @returns {(number | 'ellipsis')[]}
 */
export function getPageList(current, totalPages) {
  if (totalPages <= 0) return [];
  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const set = new Set(
    [1, totalPages, current - 1, current, current + 1].filter((p) => p >= 1 && p <= totalPages)
  );
  const sorted = [...set].sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push('ellipsis');
    out.push(p);
    prev = p;
  }
  return out;
}

/**
 * @param {object} props
 * @param {number} props.page - Current page (1-based)
 * @param {number} props.pages - Total pages from API (may be 0 when total is 0)
 * @param {number} props.total - Total row count
 * @param {number} props.limit - Page size used for fetch
 * @param {(p: number) => void} props.onPageChange
 * @param {(n: number) => void} [props.onLimitChange]
 * @param {boolean} [props.loading]
 */
export default function TablePagination({
  page,
  pages: pagesRaw,
  total,
  limit,
  onPageChange,
  onLimitChange,
  loading = false,
  className = '',
}) {
  const lim = limit || ADMIN_PAGE_SIZE;
  const pages = Math.max(0, pagesRaw ?? 0);
  const isLastPage = pages === 0 ? true : page >= pages;
  const isFirstPage = page <= 1;

  const pageItems = useMemo(() => (pages > 0 ? getPageList(page, pages) : []), [page, pages]);

  const showNumberButtons = pages > 0 && total > 0;

  return (
    <div
      className={`flex flex-col gap-3 border-t border-admin-border bg-admin-surface/80 px-3 py-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ${className}`}
    >
      {/* Left: total count */}
      <p className="shrink-0 text-admin-muted">
        {loading ? (
          <span className="tabular-nums">Loading…</span>
        ) : (
          <>
            Showing Total:{' '}
            <span className="font-semibold tabular-nums text-admin-text">{total}</span>
          </>
        )}
      </p>

      {/* Right: Previous / page numbers / Next + rows filter */}
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
        <div className="flex items-center gap-2 border-t border-admin-border pt-2 sm:border-t-0 sm:border-l sm:border-admin-border sm:pl-3 sm:pt-0">
          <select
              id="admin-page-size"
              value={lim}
              disabled={loading || !onLimitChange}
              onChange={(e) => onLimitChange?.(Number(e.target.value))}
              className="rounded-lg border border-admin-border bg-white px-2 py-1.5 text-sm font-medium text-admin-text shadow-sm transition hover:border-admin-primary/50 focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ADMIN_PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            disabled={loading || isFirstPage || total === 0}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
            title="Previous page"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-admin-border bg-white text-admin-text shadow-sm transition hover:border-admin-primary/50 hover:bg-admin-primary/5 hover:text-admin-secondary disabled:pointer-events-none disabled:opacity-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {showNumberButtons && (
            <nav className="flex flex-wrap items-center gap-0.5 px-1" aria-label="Pagination">
              {pageItems.map((item, i) =>
                item === 'ellipsis' ? (
                  <span
                    key={`e-${i}`}
                    className="px-1.5 py-1 text-admin-muted select-none"
                    aria-hidden
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    disabled={loading}
                    onClick={() => onPageChange(item)}
                    className={`min-w-[2.25rem] rounded-lg px-2 py-1.5 text-center text-sm font-medium tabular-nums transition ${
                      item === page
                        ? 'bg-admin-primary text-white shadow-sm ring-1 ring-admin-primary/20'
                        : 'text-admin-text hover:bg-white hover:text-admin-secondary hover:shadow-sm'
                    } disabled:opacity-50`}
                    aria-current={item === page ? 'page' : undefined}
                  >
                    {item}
                  </button>
                )
              )}
            </nav>
          )}

          <button
            type="button"
            disabled={loading || isLastPage || total === 0}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
            title="Next page"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-admin-border bg-white text-admin-text shadow-sm transition hover:border-admin-primary/50 hover:bg-admin-primary/5 hover:text-admin-secondary disabled:pointer-events-none disabled:opacity-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>


      </div>
    </div>
  );
}
