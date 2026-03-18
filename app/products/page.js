'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { adminFetch, uploadImage } from '../../lib/api';
import { useAdminFormOpener } from '../../components/Shell';
import { TableEditIconButton, TableDeleteIconButton } from '../../components/TableActionIcons';
import TablePagination, { ADMIN_PAGE_SIZE } from '../../components/TablePagination';

function emptyForm(categoryId) {
  return {
    name: '',
    slug: '',
    description: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    stock: '10',
    volumeMl: '50',
    fragranceNotes: '',
    category: categoryId || '',
    collections: [],
    images: [],
    isActive: true,
  };
}

export default function ProductsPage() {
  const { token } = useAuth();
  const { registerOpenForm } = useAdminFormOpener();
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [listLoading, setListLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(() => emptyForm(''));
  const [uploading, setUploading] = useState(false);
  const categoriesRef = useRef([]);

  categoriesRef.current = categories;

  const openAddModal = useCallback(() => {
    setEditing(null);
    setForm(emptyForm(categoriesRef.current[0]?._id || ''));
    setModalOpen(true);
  }, []);

  useEffect(() => {
    return registerOpenForm(openAddModal);
  }, [registerOpenForm, openAddModal]);

  async function loadProductList(p = page) {
    if (!token) return;
    setListLoading(true);
    try {
      const d = await adminFetch(
        `/products?page=${p}&limit=${ADMIN_PAGE_SIZE}`,
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
    adminFetch('/collections', { token }).then(setCollections);
  }, [token]);

  useEffect(() => {
    if (token) loadProductList(page);
  }, [token, page]);

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm(categoriesRef.current[0]?._id || ''));
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f || !token) return;
    setUploading(true);
    try {
      const url = await uploadImage(token, f);
      setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
    } catch (er) {
      alert(er.message);
    } finally {
      setUploading(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    const body = {
      ...form,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      stock: Number(form.stock),
      volumeMl: Number(form.volumeMl),
      category: form.category,
      collections: form.collections,
    };
    if (editing) {
      await adminFetch(`/products/${editing._id}`, { token, method: 'PUT', body });
    } else {
      await adminFetch('/products', { token, method: 'POST', body });
    }
    closeModal();
    loadProductList(page);
  }

  async function del(id) {
    if (!confirm('Delete product?')) return;
    await adminFetch(`/products/${id}`, { token, method: 'DELETE' });
    loadProductList(page);
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 overflow-y-auto"
          onClick={() => !editing && closeModal()}
          role="presentation"
        >
          <div
            className="bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-4xl p-6 border my-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{editing ? 'Edit product' : 'New product'}</h2>
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
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  placeholder="Name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
                <input
                  placeholder="Slug (optional)"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                />
                <input
                  placeholder="Price *"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
                <input
                  placeholder="Compare at price"
                  type="number"
                  step="0.01"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                />
                <input
                  placeholder="Stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                />
                <input
                  placeholder="Volume ml"
                  type="number"
                  value={form.volumeMl}
                  onChange={(e) => setForm({ ...form, volumeMl: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="border rounded px-3 py-2 md:col-span-2 w-full"
                  required
                >
                  <option value="">Category *</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
              <input
                placeholder="Fragrance notes"
                value={form.fragranceNotes}
                onChange={(e) => setForm({ ...form, fragranceNotes: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <div>
                <p className="text-sm text-slate-600 mb-1">Collections</p>
                <div className="flex flex-wrap gap-2">
                  {collections.map((c) => (
                    <label key={c._id} className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={form.collections.includes(c._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({ ...form, collections: [...form.collections, c._id] });
                          } else {
                            setForm({
                              ...form,
                              collections: form.collections.filter((id) => id !== c._id),
                            });
                          }
                        }}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm mb-1">Images (upload or paste URLs)</p>
                <input type="file" accept="image/*" onChange={onFile} disabled={uploading} className="text-sm" />
                {uploading && <span className="text-sm ml-2">Uploading…</span>}
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.images.map((url, i) => (
                    <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
                      {url.slice(0, 40)}…
                      <button
                        type="button"
                        onClick={() =>
                          setForm({ ...form, images: form.images.filter((_, j) => j !== i) })
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  placeholder="Add image URL"
                  className="border rounded px-3 py-2 mt-2 w-full text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const v = e.target.value.trim();
                      if (v) {
                        setForm({ ...form, images: [...form.images, v] });
                        e.target.value = '';
                      }
                    }
                  }}
                />
              </div>
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
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3 w-28">Price</th>
              <th className="text-left p-3 w-24">Stock</th>
              <th className="p-3 w-36" />
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-3">
                  <a
                    href={`${process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000'}/products/${p.slug}`}
                    className="text-indigo-600"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {p.name}
                  </a>
                </td>
                <td className="p-3">${p.price}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-0.5 justify-end">
                    <TableEditIconButton
                      onClick={() => {
                        setEditing(p);
                        setForm({
                          name: p.name,
                          slug: p.slug,
                          description: p.description || '',
                          price: String(p.price),
                          compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : '',
                          sku: p.sku || '',
                          stock: String(p.stock),
                          volumeMl: String(p.volumeMl || 50),
                          fragranceNotes: p.fragranceNotes || '',
                          category: p.category?._id || p.category,
                          collections: (p.collections || []).map((c) => c._id || c),
                          images: p.images || [],
                          isActive: p.isActive,
                        });
                        setModalOpen(true);
                      }}
                    />
                    <TableDeleteIconButton onClick={() => del(p._id)} />
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
