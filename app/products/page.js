'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { adminFetch, uploadImage } from '../../lib/api';
import { useAdminFormOpener } from '../../components/Shell';
import { TableEditIconButton, TableDeleteIconButton } from '../../components/TableActionIcons';
import TablePagination from '../../components/TablePagination';
import { usePagedTableState } from '../../hooks/usePagedTableState';
import { formatINR } from '../../lib/currency';

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

function ProductsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openedFromQuery = useRef(false);
  const { token } = useAuth();
  const { registerOpenForm } = useAdminFormOpener();
  const [list, setList] = useState([]);
  const { page, setPage, pageSize, handlePageSizeChange } = usePagedTableState();
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

  async function loadProductList(p = page, lim = pageSize) {
    if (!token) return;
    setListLoading(true);
    try {
      const d = await adminFetch(
        `/products?page=${p}&limit=${lim}`,
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
    if (openedFromQuery.current) return;
    if (searchParams.get('new') !== '1') return;
    if (!categories.length) return;
    openedFromQuery.current = true;
    openAddModal();
    router.replace('/products', { scroll: false });
  }, [searchParams, categories.length, openAddModal, router]);

  useEffect(() => {
    if (token) loadProductList(page, pageSize);
  }, [token, page, pageSize]);

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
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-admin-text">Products</h1>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-admin-text/40 p-4 backdrop-blur-[2px]"
          onClick={() => !editing && closeModal()}
          role="presentation"
        >
          <div
            className="admin-card my-8 max-h-[90vh] w-full max-w-4xl overflow-y-auto p-6 shadow-admin-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-admin-text">{editing ? 'Edit product' : 'New product'}</h2>
              <button
                type="button"
                onClick={closeModal}
                className="px-2 text-xl leading-none text-admin-muted transition hover:text-admin-primary"
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
                  className="admin-input"
                  required
                />
                <input
                  placeholder="Slug (optional)"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="admin-input"
                />
                <input
                  placeholder="Price *"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="admin-input"
                  required
                />
                <input
                  placeholder="Compare at price"
                  type="number"
                  step="0.01"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                  className="admin-input"
                />
                <input
                  placeholder="Stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="admin-input"
                />
                <input
                  placeholder="Volume ml"
                  type="number"
                  value={form.volumeMl}
                  onChange={(e) => setForm({ ...form, volumeMl: e.target.value })}
                  className="admin-input"
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="admin-input md:col-span-2"
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
                className="admin-input"
                rows={3}
              />
              <input
                placeholder="Fragrance notes"
                value={form.fragranceNotes}
                onChange={(e) => setForm({ ...form, fragranceNotes: e.target.value })}
                className="admin-input"
              />
              <div>
                <p className="mb-1 text-sm text-admin-muted">Collections</p>
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
                <p className="mb-1 text-sm text-admin-muted">Images (upload or paste URLs)</p>
                <input type="file" accept="image/*" onChange={onFile} disabled={uploading} className="text-sm" />
                {uploading && <span className="text-sm ml-2">Uploading…</span>}
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.images.map((url, i) => (
                    <span key={i} className="flex items-center gap-1 rounded-lg bg-admin-surface px-2 py-1 text-xs text-admin-text">
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
                  className="admin-input mt-2 text-sm"
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
              <label className="flex items-center gap-2 text-sm text-admin-text">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-admin-border text-admin-primary focus:ring-admin-primary/30"
                />
                Active
              </label>
              <div className="flex gap-2">
                <button type="submit" className="admin-btn-primary">
                  {editing ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-admin-border bg-admin-bg px-4 py-2.5 text-sm font-medium text-admin-text transition hover:border-admin-primary/40 hover:text-admin-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-card w-full overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-full text-sm">
          <thead className="bg-admin-surface">
            <tr>
              <th className="w-14 p-3 text-center font-medium text-admin-muted">ID</th>
              <th className="w-16 p-3 text-left font-medium text-admin-muted">Image</th>
              <th className="min-w-[10rem] p-3 text-left font-medium text-admin-muted">Name</th>
              <th className="min-w-[8rem] p-3 text-left font-medium text-admin-muted">Category</th>
              <th className="w-28 p-3 text-left font-medium text-admin-muted">Price</th>
              <th className="w-24 p-3 text-left font-medium text-admin-muted">Stock</th>
              <th className="w-36 p-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((p, i) => {
              const thumb = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;
              const rowNum = (page - 1) * pageSize + i + 1;

              return (
              <tr key={p._id} className="border-t border-admin-border transition hover:bg-admin-surface/80">
                <td className="p-3 text-center align-middle tabular-nums text-admin-muted">{rowNum}</td>
                <td className="p-2 align-middle">
                  <div className="inline-flex h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-admin-border bg-admin-surface shadow-sm">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[10px] font-medium uppercase tracking-wide text-admin-muted">
                        No img
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 align-middle">
                  <a
                    href={`${process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000'}/products/${p.slug}`}
                    className="font-medium text-admin-primary transition hover:text-admin-secondary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {p.name}
                  </a>
                </td>
                <td className="p-3 align-middle">
                  <span className="inline-flex max-w-[14rem] items-center rounded-lg bg-admin-surface px-2.5 py-1 text-admin-text ring-1 ring-admin-border/80">
                    {p.category?.name ?? '—'}
                  </span>
                </td>
                <td className="p-3 align-middle text-admin-text">{formatINR(p.price)}</td>
                <td className="p-3 align-middle text-admin-text">{p.stock}</td>
                <td className="p-3 text-right align-middle whitespace-nowrap">
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
              );
            })}
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="text-admin-muted">Loading products…</p>}>
      <ProductsPageInner />
    </Suspense>
  );
}
