"use client";

import { api, API_URL } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { AdminModal } from "@/components/AdminModal";
import {
  DashboardEditIconButton,
  DashboardDeleteIconButton,
} from "../../../../components/TableActionIcons";
import { useRegisterFab } from "@/components/AdminFabContext";

export default function CategoriesAdmin() {
  const [list, setList] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [editing, setEditing] = useState(null);

  function load() {
    api("/categories").then((r) => setList(Array.isArray(r) ? r : r.data || []));
  }

  useEffect(() => {
    load();
  }, []);

  const openCreate = useCallback(() => {
    setName("");
    setDescription("");
    setFile(null);
    setCreateOpen(true);
  }, []);
  useRegisterFab(openCreate);

  function openEdit(c) {
    setEditing({ ...c });
    setFile(null);
    setEditOpen(true);
  }

  function closeCreate() {
    setCreateOpen(false);
  }

  function closeEdit() {
    setEditOpen(false);
    setEditing(null);
    setFile(null);
  }

  async function create(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description);
    if (file) fd.append("image", file);
    await api("/categories", { method: "POST", body: fd });
    setName("");
    setDescription("");
    setFile(null);
    closeCreate();
    load();
  }

  async function update(e) {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData();
    fd.append("name", editing.name);
    fd.append("description", editing.description || "");
    if (file) fd.append("image", file);
    await api(`/categories/${editing._id}`, { method: "PATCH", body: fd });
    closeEdit();
    load();
  }

  async function remove(id) {
    if (!confirm("Delete category?")) return;
    await api(`/categories/${id}`, { method: "DELETE" });
    load();
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder:text-zinc-600";

  return (
    <div className="w-full">
      <h1 className="font-serif text-2xl text-zinc-100">Categories</h1>

      <AdminModal open={createOpen} onClose={closeCreate} title="Add category">
        <form onSubmit={create} className="flex flex-col gap-3">
          <input
            placeholder="Name"
            required
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Description"
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button type="submit" className="rounded-lg bg-amber-600 py-2 font-medium text-black">
            Add category
          </button>
        </form>
      </AdminModal>

      <AdminModal open={editOpen && !!editing} onClose={closeEdit} title="Edit category">
        {editing && (
          <form onSubmit={update} className="flex flex-col gap-3">
            <input
              className={inputClass}
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
            <input
              className={inputClass}
              value={editing.description || ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <div className="flex gap-2">
              <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-black">
                Save
              </button>
              <button type="button" onClick={closeEdit} className="rounded-lg border border-zinc-600 px-4 py-2 text-zinc-400">
                Cancel
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      <div className="mt-8 w-full overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id} className="border-b border-zinc-800/50">
                <td className="px-4 py-3">
                  {c.image ? (
                    <img
                      src={c.image.startsWith("http") ? c.image : `${API_URL}${c.image}`}
                      alt=""
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-zinc-200">{c.name}</td>
                <td className="px-4 py-3 text-zinc-500">{c.slug}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-0.5 justify-end">
                    <DashboardEditIconButton onClick={() => openEdit(c)} />
                    <DashboardDeleteIconButton onClick={() => remove(c._id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
