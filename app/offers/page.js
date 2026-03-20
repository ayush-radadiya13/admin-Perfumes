'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { adminFetch, uploadImage, API } from '../../lib/api';
import { useAdminFormOpener } from '../../components/Shell';
import { TableEditIconButton, TableDeleteIconButton } from '../../components/TableActionIcons';
import TablePagination from '../../components/TablePagination';
import { usePagedTableState } from '../../hooks/usePagedTableState';
import { formatINR } from '../../lib/currency';

const emptyForm = {
  title: '',
  description: '',
  image: '',
  originalPrice: '',
  discountKind: 'percent',
  discountPercent: '10',
  salePrice: '',
  isFeatured: false,
  showOnStorefront: true,
  appliesTo: 'all',
  category: '',
  products: [],
  collections: [],
  startDate: '',
  endDate: '',
  code: '',
  isActive: true,
};

function offerThumbUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = API.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default function OffersPage() {
  const { token } = useAuth();
  const { registerOpenForm } = useAdminFormOpener();
  const [list, setList] = useState([]);
  const { page, setPage, pageSize, handlePageSizeChange } = usePagedTableState();
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [listLoading, setListLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const openAddModal = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setModalOpen(true);
  }, []);

  useEffect(() => {
    return registerOpenForm(openAddModal);
  }, [registerOpenForm, openAddModal]);

  async function loadOfferList(p = page, lim = pageSize) {
    if (!token) return;
    setListLoading(true);
    try {
      const d = await adminFetch(`/offers?page=${p}&limit=${lim}`, { token });
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
    if (token) loadOfferList(page, pageSize);
  }, [token, page, pageSize]);

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
  }

  async function save(e) {
    e.preventDefault();
    if (form.discountKind === 'fixed') {
      if (form.originalPrice === '' || form.salePrice === '') {
        alert('Original price and sale price are required for fixed-price offers.');
        return;
      }
    } else if (form.discountPercent === '' || Number.isNaN(Number(form.discountPercent))) {
      alert('Discount % is required for percentage offers.');
      return;
    }

    setSaving(true);
    try {
      let image = form.image || '';
      if (imageFile) {
        image = await uploadImage(token, imageFile);
      }
      const body = {
        title: form.title,
        description: form.description,
        image,
        originalPrice: form.originalPrice === '' ? null : Number(form.originalPrice),
        discountKind: form.discountKind,
        salePrice:
          form.discountKind === 'fixed' && form.salePrice !== '' ? Number(form.salePrice) : null,
        discountPercent:
          form.discountKind === 'fixed'
            ? 0
            : Math.min(100, Math.max(0, Number(form.discountPercent))),
        isFeatured: form.isFeatured,
        showOnStorefront: form.showOnStorefront,
        appliesTo: form.appliesTo,
        category: form.appliesTo === 'category' ? form.category : null,
        products: form.appliesTo === 'product' ? form.products : [],
        collections: form.appliesTo === 'collection' ? form.collections : [],
        startDate: form.startDate,
        endDate: form.endDate,
        code: form.code,
        isActive: form.isActive,
      };
      if (editing) {
        await adminFetch(`/offers/${editing._id}`, { token, method: 'PUT', body });
      } else {
        await adminFetch('/offers', { token, method: 'POST', body });
      }
      closeModal();
      loadOfferList(page);
    } catch (err) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
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
      <p className="text-sm text-slate-600 mb-6 max-w-3xl">
        Storefront cards use title, image, original price, and either a discount % or a fixed sale price.
        Promo rules (scope + code) still control checkout discounts; fixed price here is for display only.
      </p>

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
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Offer image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
                {(imageFile || form.image) && (
                  <div className="mt-2 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : offerThumbUrl(form.image)}
                      alt=""
                      className="h-16 w-16 object-cover rounded border"
                    />
                    <span className="text-xs text-slate-500">
                      {imageFile ? 'New image (uploads on save)' : 'Current image'}
                    </span>
                  </div>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Discount type</label>
                  <select
                    value={form.discountKind}
                    onChange={(e) => setForm({ ...form, discountKind: e.target.value })}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="percent">Percentage off original</option>
                    <option value="fixed">Fixed sale price</option>
                  </select>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Original price (storefront)"
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                />
                {form.discountKind === 'percent' ? (
                  <input
                    type="number"
                    placeholder="Discount % *"
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                    className="border rounded px-3 py-2 w-full"
                    min="0"
                    max="100"
                    required={form.discountKind === 'percent'}
                  />
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Sale price *"
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                    className="border rounded px-3 py-2 w-full"
                    required={form.discountKind === 'fixed'}
                  />
                )}
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
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                />
                Featured on storefront
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.showOnStorefront}
                  onChange={(e) => setForm({ ...form, showOnStorefront: e.target.checked })}
                />
                Show on website
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active (promo rules)
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-60"
                >
                  {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
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
                <th className="p-3 w-14 text-center text-slate-500 font-medium">ID</th>
                <th className="p-3 w-14" />
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Deal</th>
                <th className="text-left p-3">★</th>
                <th className="text-left p-3">Code</th>
                <th className="text-left p-3">Ends</th>
                <th className="p-3 w-36" />
              </tr>
            </thead>
            <tbody>
              {list.map((o, i) => (
                <tr key={o._id} className="border-t">
                  <td className="p-3 text-center tabular-nums text-slate-500">
                    {(page - 1) * pageSize + i + 1}
                  </td>
                  <td className="p-2">
                    {o.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={offerThumbUrl(o.image)}
                        alt=""
                        className="h-10 w-10 object-cover rounded border border-slate-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-slate-100 border border-slate-200" />
                    )}
                  </td>
                  <td className="p-3 max-w-[200px] truncate" title={o.title}>
                    {o.title}
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-600">
                    {o.discountKind === 'fixed' && o.salePrice != null && o.originalPrice != null
                      ? `${formatINR(o.salePrice)} / ${formatINR(o.originalPrice)}`
                      : `${o.discountPercent}%`}
                  </td>
                  <td className="p-3">{o.isFeatured ? '★' : '—'}</td>
                  <td className="p-3">{o.code || '—'}</td>
                  <td className="p-3">{new Date(o.endDate).toLocaleDateString()}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-0.5 justify-end">
                      <TableEditIconButton
                        onClick={() => {
                          setEditing(o);
                          setImageFile(null);
                          setForm({
                            title: o.title,
                            description: o.description || '',
                            image: o.image || '',
                            originalPrice: o.originalPrice != null ? String(o.originalPrice) : '',
                            discountKind: o.discountKind === 'fixed' ? 'fixed' : 'percent',
                            discountPercent: String(o.discountPercent ?? 0),
                            salePrice: o.salePrice != null ? String(o.salePrice) : '',
                            isFeatured: !!o.isFeatured,
                            showOnStorefront: o.showOnStorefront !== false,
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
          limit={pageSize}
          onPageChange={setPage}
          onLimitChange={handlePageSizeChange}
          loading={listLoading}
        />
      </div>
    </div>
  );
}
