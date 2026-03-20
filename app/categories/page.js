'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { adminFetch, uploadImage } from '../../lib/api';
import { useAdminFormOpener } from '../../components/Shell';
import { TableEditIconButton, TableDeleteIconButton } from '../../components/TableActionIcons';
import TablePagination from '../../components/TablePagination';
import { usePagedTableState } from '../../hooks/usePagedTableState';

const emptyForm = {
  name: '',
  description: '',
  slug: '',
  image: '',
  isActive: true,
};

export default function CategoriesPage() {
  const { token } = useAuth();
  const { registerOpenForm } = useAdminFormOpener();
  const [list, setList] = useState([]);
  const { page, setPage, pageSize, handlePageSizeChange } = usePagedTableState();
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [listLoading, setListLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const openAddModal = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }, []);

  useEffect(() => {
    return registerOpenForm(openAddModal);
  }, [registerOpenForm, openAddModal]);

  async function loadList(p = page, lim = pageSize) {
    if (!token) return;
    setListLoading(true);
    try {
      const d = await adminFetch(
        `/categories?page=${p}&limit=${lim}`,
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

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  async function save(e) {
    e.preventDefault();
    if (editing) {
      await adminFetch(`/categories/${editing._id}`, { token, method: 'PUT', body: form });
    } else {
      await adminFetch('/categories', { token, method: 'POST', body: form });
    }
    closeModal();
    loadList(page);
  }

  async function onImageFile(e) {
    const f = e.target.files?.[0];
    if (!f || !token) return;
    setUploading(true);
    try {
      const url = await uploadImage(token, f);
      setForm((prev) => ({ ...prev, image: url }));
    } catch (er) {
      alert(er.message);
    } finally {
      setUploading(false);
    }
  }

  async function del(id) {
    if (!confirm('Delete?')) return;
    await adminFetch(`/categories/${id}`, { token, method: 'DELETE' });
    loadList(page);
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Categories</h1>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50"
          onClick={() => !editing && closeModal()}
          role="presentation"
        >
          <div
            className="bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-3xl p-6 border"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{editing ? 'Edit category' : 'New category'}</h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-800 text-xl leading-none px-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={save} className="grid md:grid-cols-2 gap-3">
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
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border rounded px-3 py-2 md:col-span-2 w-full"
              />
              <div className="md:col-span-2 space-y-2">
                <p className="text-sm text-slate-600">Mood image (homepage “Browse by mood”)</p>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageFile}
                    disabled={uploading}
                    className="text-sm"
                  />
                  <input
                    placeholder="Or paste image URL"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="border rounded px-3 py-2 flex-1 min-w-[200px] w-full"
                  />
                </div>
                {form.image && (
                  <img src={form.image} alt="" className="h-24 w-32 object-cover rounded border mt-1" />
                )}
              </div>
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active
              </label>
              <div className="flex gap-2 md:col-span-2">
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
        <table className="w-full min-w-full text-sm table-fixed">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 w-14 text-center text-slate-500 font-medium">ID</th>
              <th className="text-left p-3 w-24">Image</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3 w-24">Active</th>
              <th className="p-3 w-36" />
            </tr>
          </thead>
          <tbody>
            {list.map((c, i) => (
              <tr key={c._id} className="border-t">
                <td className="p-3 text-center tabular-nums text-slate-500">
                  {(page - 1) * pageSize + i + 1}
                </td>
                <td className="p-3">
                  {c.image ? (
                    <img src={c.image} alt="" className="h-12 w-16 object-cover rounded" />
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="p-3 truncate">{c.name}</td>
                <td className="p-3 text-slate-500 truncate">{c.slug}</td>
                <td className="p-3">{c.isActive ? 'Yes' : 'No'}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-0.5 justify-end">
                    <TableEditIconButton
                      onClick={() => {
                        setEditing(c);
                        setForm({
                          name: c.name,
                          slug: c.slug,
                          description: c.description || '',
                          image: c.image || '',
                          isActive: c.isActive,
                        });
                        setModalOpen(true);
                      }}
                    />
                    <TableDeleteIconButton onClick={() => del(c._id)} />
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
      {!list.length && !listLoading && (
        <p className="text-slate-500 mt-4">No categories on this page.</p>
      )}
    </div>
  );
}
