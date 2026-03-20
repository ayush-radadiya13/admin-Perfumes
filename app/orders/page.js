'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../components/AuthProvider';
import { adminFetch } from '../../lib/api';
import { API } from '../../lib/api';
import { TableStatusIconButton } from '../../components/TableActionIcons';
import TablePagination from '../../components/TablePagination';
import { usePagedTableState } from '../../hooks/usePagedTableState';
import { formatINR } from '../../lib/currency';

const statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

function imgUrl(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${API}${src.startsWith('/') ? '' : '/'}${src}`;
}

export default function OrdersPage() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const { page, setPage, pageSize, handlePageSizeChange } = usePagedTableState();
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [listLoading, setListLoading] = useState(false);
  const [statusModal, setStatusModal] = useState(null);
  const [pendingStatus, setPendingStatus] = useState('');

  async function loadList(p = page, lim = pageSize) {
    if (!token) return;
    setListLoading(true);
    try {
      const d = await adminFetch(
        `/orders?page=${p}&limit=${lim}`,
        { token }
      );
      const items = d.items ?? [];
      if (items.length === 0 && p > 1) {
        setPage(p - 1);
        return;
      }
      setList(items);
      setTotal(d.total ?? 0);
      setPages(d.pages ?? 1);
      setPage(d.page ?? p);
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadList(page, pageSize);
  }, [token, page, pageSize]);

  function openStatusModal(o) {
    setStatusModal(o);
    setPendingStatus(o.status);
  }

  function closeStatusModal() {
    setStatusModal(null);
    setPendingStatus('');
  }

  async function applyStatus() {
    if (!statusModal) return;
    await adminFetch(`/orders/${statusModal._id}/status`, {
      token,
      method: 'PATCH',
      body: { status: pendingStatus },
    });
    closeStatusModal();
    loadList(page);
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {statusModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50"
          onClick={closeStatusModal}
          role="presentation"
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Update order status</h2>
              <button
                type="button"
                onClick={closeStatusModal}
                className="text-slate-500 hover:text-slate-800 text-xl leading-none px-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-3 font-mono">{statusModal.orderNumber}</p>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={pendingStatus}
              onChange={(e) => setPendingStatus(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={applyStatus}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Save
              </button>
              <button type="button" onClick={closeStatusModal} className="px-4 py-2 border rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 w-14 text-center text-slate-500 font-medium">ID</th>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Account</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Total</th>
              <th className="text-left p-3">Payment</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Date</th>
              <th className="p-3 w-32" />
            </tr>
          </thead>
          <tbody>
            {list.map((o, i) => (
              <tr key={o._id} className="border-t align-top">
                <td className="p-3 text-center tabular-nums text-slate-500">
                  {(page - 1) * pageSize + i + 1}
                </td>
                <td className="p-3">
                  <div className="flex items-start gap-3 min-w-[220px]">
                    <div className="w-12 h-14 relative rounded-md overflow-hidden bg-slate-100 border shrink-0">
                      {o.items?.[0]?.image ? (
                        <Image
                          src={imgUrl(o.items[0].image)}
                          alt={o.items[0].name || 'Order item'}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-xs">{o.orderNumber}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {o.items?.[0]?.name || 'No item name'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-xs text-slate-600">
                  {o.user?.email ? (
                    <>
                      {o.user.name}
                      <br />
                      <span className="text-slate-500">{o.user.email}</span>
                    </>
                  ) : (
                    <span className="text-slate-400">Guest</span>
                  )}
                </td>
                <td className="p-3">
                  {o.customerName}
                  <br />
                  <span className="text-slate-500">{o.customerEmail}</span>
                </td>
                <td className="p-3">{formatINR(o.total)}</td>
                <td className="p-3 text-xs">
                  <span className="capitalize text-slate-700">{o.paymentStatus || '—'}</span>
                  {o.transactionId ? (
                    <span className="block font-mono text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]" title={o.transactionId}>
                      {o.transactionId}
                    </span>
                  ) : null}
                </td>
                <td className="p-3 capitalize">{o.status}</td>
                <td className="p-3 text-slate-500 whitespace-nowrap">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td className="p-3">
                  <TableStatusIconButton onClick={() => openStatusModal(o)} />
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
          limit={pageSize}
          onPageChange={setPage}
          onLimitChange={handlePageSizeChange}
          loading={listLoading}
        />
      </div>
      {!list.length && !listLoading && (
        <p className="text-slate-500 mt-4">No orders yet.</p>
      )}
    </div>
  );
}
