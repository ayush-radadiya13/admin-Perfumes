'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { adminFetch } from '../../lib/api';
import { useAdminFormOpener } from '../../components/Shell';
import { TableEditIconButton, TableDeleteIconButton } from '../../components/TableActionIcons';
import TablePagination, { ADMIN_PAGE_SIZE } from '../../components/TablePagination';

const emptyForm = {
  title: '',
  description: '',
  discountPercent: '10',
  appliesTo: 'all',
  category: '',
  products: [],
  collections: [],
  startDate: '',
  endDate: '',
  code: '',
  isActive: true,
};

export default function OffersPage() {
  const { token } = useAuth();
  const { registerOpenForm } = useAdminFormOpener();
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [listLoading, setListLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const openAddModal = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }, []);

  useEffect(() => {
    return registerOpenForm(openAddModal);
  }, [registerOpenForm, openAddModal]);

  async function loadOfferList(p = page) {
    if (!token) return;
    setListLoading(true);
    try {
      const d = await adminFetch(
        `/offers?page=${p}&limit=${ADMIN_PAGE_SIZE}`,
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
    if (!token) return;
    adminFetch('/categories', { token }).then(setCategories);
    adminFetch('/products?limit=200', { token }).then((d) => setProducts(d.items || []));
    adminFetch('/collections', { token }).then(setCollections);
  }, [token]);

  useEffect(() => {
    if (token) loadOfferList(page);
  }, [token, page]);

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  async function save(e) {
    e.preventDefault();
    const body = {
      ...form,
      discountPercent: Number(form.discountPercent),
      category: form.appliesTo === 'category' ? form.category : null,
      products: form.appliesTo === 'product' ? form.products : [],
      collections: form.appliesTo === 'collection' ? form.collections : [],
    };
    if (editing) {
      await adminFetch(`/offers/${editing._id}`, { token, method: 'PUT', body });
    } else {
      await adminFetch('/offers', { token, method: 'POST', body });
    }
    closeModal();
    loadOfferList(page);
  }

  async function del(id) {
    if (!confirm('Delete offer?')) return;
    await adminFetch(`/offers/${id}`, { token, method: 'DELETE' });
    loadOfferList(page);
  }

  const toLocal = (d) => (d ? new Date(d).toISOString().slice(0, 16) : '');

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Offers</h1>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 overflow-y-auto"
          onClick={() => !editing && closeModal()}
          role="presentation"
        >
          <div
            className="bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-3xl p-6 border my-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{editing ? 'Edit offer' : 'New offer'}</h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-800 text-xl leading-none px-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={save} className="space-y-3">
              <input
                placeholder="Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={2}
              />
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Discount % *"
                  value={form.discountPercent}
                  onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
                <input
                  placeholder="Promo code (optional)"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                />
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
              <select
                value={form.appliesTo}
                onChange={(e) => setForm({ ...form, appliesTo: e.target.value })}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="all">All products</option>
                <option value="category">Category</option>
                <option value="product">Specific products</option>
                <option value="collection">Collection</option>
              </select>
              {form.appliesTo === 'category' && (
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
              {form.appliesTo === 'product' && (
                <select
                  multiple
                  value={form.products}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      products: Array.from(e.target.selectedOptions, (o) => o.value),
                    })
                  }
                  className="border rounded px-3 py-2 w-full h-32"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
              {form.appliesTo === 'collection' && (
                <select
                  multiple
                  value={form.collections}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      collections: Array.from(e.target.selectedOptions, (o) => o.value),
                    })
                  }
                  className="border rounded px-3 py-2 w-full h-24"
                >
                  {collections.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active
              </label>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
                  {editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="w-full rounded-lg border bg-white overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3 w-16">%</th>
              <th className="text-left p-3">Code</th>
              <th className="text-left p-3">Ends</th>
              <th className="p-3 w-36" />
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o._id} className="border-t">
                <td className="p-3">{o.title}</td>
                <td className="p-3">{o.discountPercent}%</td>
                <td className="p-3">{o.code || '—'}</td>
                <td className="p-3">{new Date(o.endDate).toLocaleDateString()}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-0.5 justify-end">
                    <TableEditIconButton
                      onClick={() => {
                        setEditing(o);
                        setForm({
                          title: o.title,
                          description: o.description || '',
                          discountPercent: String(o.discountPercent),
                          appliesTo: o.appliesTo,
                          category: o.category?._id || o.category || '',
                          products: (o.products || []).map((p) => p._id || p),
                          collections: (o.collections || []).map((c) => c._id || c),
                          startDate: toLocal(o.startDate),
                          endDate: toLocal(o.endDate),
                          code: o.code || '',
                          isActive: o.isActive,
                        });
                        setModalOpen(true);
                      }}
                    />
                    <TableDeleteIconButton onClick={() => del(o._id)} />
                  </div>
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
    </div>
  );
}
