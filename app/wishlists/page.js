'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { adminFetch, API } from '../../lib/api';
import TablePagination from '../../components/TablePagination';
import { usePagedTableState } from '../../hooks/usePagedTableState';
import Image from 'next/image';
import { formatINR } from '../../lib/currency';

function imgUrl(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${API.replace(/\/$/, '')}${src.startsWith('/') ? '' : '/'}${src}`;
}

export default function WishlistsAdminPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const { page, setPage, pageSize, handlePageSizeChange } = usePagedTableState();
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [topProducts, setTopProducts] = useState([]);
  const [err, setErr] = useState('');

  async function loadList(p = page, lim = pageSize) {
    if (!token) return;
    setLoading(true);
    setErr('');
    try {
      const data = await adminFetch(`/wishlists?page=${p}&limit=${lim}`, { token });
      const list = data.wishlists || [];
      if (list.length === 0 && p > 1) {
        setPage(p - 1);
        return;
      }
      setRows(list);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setPage(data.page ?? p);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const loadTop = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminFetch('/wishlists/analytics/most-wishlisted?limit=8', { token });
      setTopProducts(data.products || []);
    } catch {
      setTopProducts([]);
    }
  }, [token]);

  useEffect(() => {
    loadTop();
  }, [loadTop]);

  useEffect(() => {
    if (token) loadList(page, pageSize);
  }, [token, page, pageSize]);

  async function openUser(userId) {
    setSelectedId(userId);
    setDetailLoading(true);
    setDetail(null);
    try {
      const data = await adminFetch(`/wishlists/${userId}`, { token });
      setDetail(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function removeProduct(userId, productId) {
    try {
      await adminFetch(`/wishlists/${userId}/products/${productId}`, { method: 'DELETE', token });
      await openUser(userId);
      loadList();
      loadTop();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function clearWishlist(userId) {
    if (!confirm('Clear this user’s entire wishlist?')) return;
    try {
      await adminFetch(`/wishlists/${userId}`, { method: 'DELETE', token });
      await openUser(userId);
      loadList();
      loadTop();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Wishlists</h1>
        <p className="text-slate-500 text-sm mt-1">Customer saved items — manage per user.</p>
      </div>
      {err && (
        <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">{err}</p>
      )}

      <div className="grid  gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-slate-700">Users</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 w-14 text-center font-medium text-slate-500">ID</th>
                  <th className="text-left p-3 font-medium text-slate-600">User</th>
                  <th className="text-left p-3 font-medium text-slate-600">Email</th>
                  <th className="text-right p-3 font-medium text-slate-600">Items</th>
                </tr>
              </thead>
              <tbody>
                {loading && !rows.length ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      Loading…
                    </td>
                  </tr>
                ) : (
                  rows.map((w, i) => (
                    <tr
                      key={w.userId}
                      className={`border-t border-slate-100 cursor-pointer hover:bg-amber-50/50 ${
                        selectedId === w.userId ? 'bg-amber-50' : ''
                      } ${loading ? 'opacity-60 pointer-events-none' : ''}`}
                      onClick={() => openUser(w.userId)}
                    >
                      <td className="p-3 text-center tabular-nums text-slate-500">
                        {(page - 1) * pageSize + i + 1}
                      </td>
                      <td className="p-3 font-medium text-slate-800">{w.name || '—'}</td>
                      <td className="p-3 text-slate-600 truncate max-w-[200px]">{w.email}</td>
                      <td className="p-3 text-right text-slate-800">{w.itemCount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <TablePagination
              page={page}
              pages={pages}
              total={total}
              limit={pageSize}
              onPageChange={setPage}
              onLimitChange={handlePageSizeChange}
              loading={loading}
            />
            {!rows.length && !loading && (
              <p className="p-8 text-center text-slate-500 border-t border-slate-100">No users yet.</p>
            )}
          </div>
        </div>

      </div>

      {selectedId && (
        <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {detail?.user?.name || 'User'} wishlist
              </h2>
              <p className="text-sm text-slate-500">{detail?.user?.email}</p>
            </div>
            {detail?.products?.length > 0 && (
              <button
                type="button"
                onClick={() => clearWishlist(selectedId)}
                className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
              >
                Clear entire wishlist
              </button>
            )}
          </div>
          {detailLoading ? (
            <p className="text-slate-500">Loading products…</p>
          ) : !detail?.products?.length ? (
            <p className="text-slate-500">No products in this wishlist.</p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-4">
              {detail.products.map((p) => (
                <li
                  key={p._id}
                  className="flex gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/80"
                >
                  <div className="relative w-16 h-20 shrink-0 rounded overflow-hidden bg-slate-200">
                    {p.images?.[0] ? (
                      <Image src={imgUrl(p.images[0])} alt="" fill className="object-cover" unoptimized />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-amber-800 text-sm">{formatINR(p.price)}</p>
                    <button
                      type="button"
                      onClick={() => removeProduct(selectedId, p._id)}
                      className="mt-2 text-xs text-red-600 hover:underline"
                    >
                      Remove from wishlist
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
