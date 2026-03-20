'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
  featured: false,
  isActive: true,
};

export default function CollectionsPage() {
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
  const [dragOver, setDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const fileInputRef = useRef(null);

  const openAddModal = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
    setPendingFile(null);
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
        `/collections?page=${p}&limit=${lim}`,
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
    setPendingFile(null);
    setDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function uploadFileToForm(file) {
    if (!file || !token) return;
    setUploading(true);
    try {
      const url = await uploadImage(token, file);
      setForm((prev) => {
        if (prev.image?.startsWith('blob:')) URL.revokeObjectURL(prev.image);
        return { ...prev, image: url };
      });
      setPendingFile(null);
    } catch (er) {
      alert(er.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function save(e) {
    e.preventDefault();
    if (!form.name?.trim()) return;

    setUploading(true);
    try {
      if (pendingFile && token) {
        const fd = new FormData();
        fd.append('name', form.name.trim());
        fd.append('description', form.description || '');
        fd.append('slug', form.slug || '');
        fd.append('featured', form.featured ? 'true' : 'false');
        fd.append('isActive', form.isActive ? 'true' : 'false');
        fd.append('image', pendingFile);
        if (editing) {
          await adminFetch(`/collections/${editing._id}`, { token, method: 'PUT', body: fd, isForm: true });
        } else {
          await adminFetch('/collections', { token, method: 'POST', body: fd, isForm: true });
        }
      } else if (editing) {
        await adminFetch(`/collections/${editing._id}`, { token, method: 'PUT', body: form });
      } else {
        await adminFetch('/collections', { token, method: 'POST', body: form });
      }
      closeModal();
      loadList(page);
    } catch (er) {
      alert(er.message);
    } finally {
      setUploading(false);
    }
  }

  function onImageFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setForm((prev) => {
      if (prev.image?.startsWith('blob:')) URL.revokeObjectURL(prev.image);
      return { ...prev, image: URL.createObjectURL(f) };
    });
    setPendingFile(f);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && /^image\//.test(f.type)) {
      setForm((prev) => {
        if (prev.image?.startsWith('blob:')) URL.revokeObjectURL(prev.image);
        return { ...prev, image: URL.createObjectURL(f) };
      });
      setPendingFile(f);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function clearImage() {
    setForm((prev) => {
      if (prev.image?.startsWith('blob:')) URL.revokeObjectURL(prev.image);
      return { ...prev, image: '' };
    });
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function useUploadInstead() {
    if (pendingFile) {
      uploadFileToForm(pendingFile);
    }
  }

  async function del(id) {
    if (!confirm('Delete?')) return;
    await adminFetch(`/collections/${id}`, { token, method: 'DELETE' });
    loadList(page);
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Collections</h1>

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
              <h2 className="text-lg font-semibold">{editing ? 'Edit collection' : 'New collection'}</h2>
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
                placeholder="Slug"
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
                <p className="text-sm font-medium text-slate-800">Collection image</p>
                <p className="text-xs text-slate-500">
                  Shown on the storefront collections page. Drag & drop, choose a file, paste a URL, or upload on save.
                </p>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className={`rounded-xl border-2 border-dashed p-6 transition-colors ${
                    dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50/80'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={onImageFile}
                      disabled={uploading}
                      className="text-sm max-w-full"
                    />
                    <span className="text-slate-400 text-sm">or drop image here</span>
                  </div>
                  <input
                    placeholder="Image URL (optional)"
                    value={pendingFile ? '' : form.image}
                    onChange={(e) => {
                      setPendingFile(null);
                      setForm({ ...form, image: e.target.value });
                    }}
                    disabled={!!pendingFile}
                    className="border rounded px-3 py-2 w-full mt-3 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  {pendingFile && (
                    <p className="text-xs text-amber-700 mt-2">
                      New file selected — it will be uploaded when you click {editing ? 'Update' : 'Create'}.
                      <button
                        type="button"
                        className="ml-2 text-indigo-600 underline"
                        onClick={useUploadInstead}
                        disabled={uploading}
                      >
                        Upload now instead
                      </button>
                    </p>
                  )}
                </div>
                {(form.image || pendingFile) && (
                  <div className="relative inline-block mt-2">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="h-36 w-52 object-cover rounded-lg border border-slate-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-600 text-white text-sm font-bold shadow hover:bg-red-700"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active
              </label>
              <div className="flex gap-2 md:col-span-2 flex-wrap">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
                >
                  {uploading ? 'Saving…' : editing ? 'Update' : 'Create'}
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
              <th className="text-left p-3 w-28">Image</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3 w-32">Featured</th>
              <th className="p-3 w-40" />
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
                    <img src={c.image} alt="" className="h-14 w-20 object-cover rounded-md border" />
                  ) : (
                    <span className="text-slate-300 text-xs">No image</span>
                  )}
                </td>
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.featured ? 'Yes' : 'No'}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-0.5 justify-end">
                    <TableEditIconButton
                      onClick={() => {
                        setEditing(c);
                        setPendingFile(null);
                        setForm({
                          name: c.name,
                          slug: c.slug,
                          description: c.description || '',
                          image: c.image || '',
                          featured: c.featured,
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
    </div>
  );
}
