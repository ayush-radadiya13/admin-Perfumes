'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { adminFetch } from '../../lib/api';
import TablePagination from '../../components/TablePagination';
import { usePagedTableState } from '../../hooks/usePagedTableState';

export default function UsersPage() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const { page, setPage, pageSize, handlePageSizeChange } = usePagedTableState();
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [listLoading, setListLoading] = useState(false);

  async function loadList(p = page, lim = pageSize) {
    if (!token) return;
    setListLoading(true);
    try {
      const d = await adminFetch(`/users?page=${p}&limit=${lim}`, { token });
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

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-2">Users</h1>
      <p className="text-sm text-slate-600 mb-6">
        Customer accounts registered through the storefront (same records as login/register).
      </p>

      <div className="w-full bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 w-14 text-center text-slate-500 font-medium">#</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Registered</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u, i) => (
                <tr key={u._id} className="border-t align-top">
                  <td className="p-3 text-center tabular-nums text-slate-500">
                    {(page - 1) * pageSize + i + 1}
                  </td>
                  <td className="p-3 font-medium text-slate-900">{u.name}</td>
                  <td className="p-3 text-slate-700">{u.email}</td>
                  <td className="p-3 capitalize text-slate-700">{u.role || 'user'}</td>
                  <td className="p-3 text-slate-500 whitespace-nowrap">
                    {u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'}
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
        <p className="text-slate-500 mt-4">No registered users yet.</p>
      )}
    </div>
  );
}
