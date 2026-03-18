'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { adminFetch } from '../../lib/api';
import TablePagination, { ADMIN_PAGE_SIZE } from '../../components/TablePagination';

export default function ReviewsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [listLoading, setListLoading] = useState(false);

  async function loadList(p = page) {
    if (!token) return;
    setListLoading(true);
    try {
      const d = await adminFetch(
        `/reviews?page=${p}&limit=${ADMIN_PAGE_SIZE}`,
        { token }
      );
      const rows = d.items ?? [];
      if (rows.length === 0 && p > 1) {
        setPage(p - 1);
        return;
      }
      setItems(rows);
      setTotal(d.total ?? 0);
      setPages(d.pages ?? 1);
      setPage(d.page ?? p);
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadList(page);
  }, [token, page]);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-2">Ratings & reviews</h1>
      <p className="text-slate-500 text-sm mb-6">Read-only view for moderation awareness.</p>
      <div className="w-full bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Rating</th>
              <th className="text-left p-3">Comment</th>
              <th className="text-left p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r._id} className="border-t align-top">
                <td className="p-3">{r.product?.name || '—'}</td>
                <td className="p-3">
                  {r.customerName}
                  <br />
                  <span className="text-slate-400 text-xs">{r.customerEmail}</span>
                </td>
                <td className="p-3 text-amber-600">{'★'.repeat(r.rating)}</td>
                <td className="p-3 max-w-xs">{r.comment || '—'}</td>
                <td className="p-3 text-slate-500 whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <TablePagination
          page={page}
          pages={pages}
          total={total}
          limit={ADMIN_PAGE_SIZE}
          onPageChange={setPage}
          loading={listLoading}
        />
      </div>
      {!items.length && !listLoading && (
        <p className="text-slate-500 mt-4">No reviews yet.</p>
      )}
    </div>
  );
}
