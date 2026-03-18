"use client";

import { api } from "@/lib/api";
import {
  DashboardEditIconButton,
  DashboardDeleteIconButton,
} from "../../../../components/TableActionIcons";
import { useEffect, useState } from "react";

export default function CollectionsAdmin() {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [editing, setEditing] = useState(null);

  function load() {
    api("/collections").then((r) => setList(Array.isArray(r) ? r : r.data || []));
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description);
    if (file) fd.append("image", file);
    await api("/collections", { method: "POST", body: fd });
    setName("");
    setDescription("");
    setFile(null);
    load();
  }

  async function update(e) {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData();
    fd.append("name", editing.name);
    fd.append("description", editing.description || "");
    if (file) fd.append("image", file);
    await api(`/collections/${editing._id}`, { method: "PATCH", body: fd });
    setEditing(null);
    setFile(null);
    load();
  }

  async function remove(id) {
    if (!confirm("Delete collection?")) return;
    await api(`/collections/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-zinc-100">Collections</h1>
      <form onSubmit={create} className="mt-6 flex max-w-xl flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <input
          placeholder="Name"
          required
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Description"
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="submit" className="rounded-lg bg-amber-600 py-2 font-medium text-black">
          Add collection
        </button>
      </form>

      {editing && (
        <form onSubmit={update} className="mt-6 max-w-xl rounded-xl border border-amber-900/30 bg-zinc-900/60 p-6">
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          />
          <input
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
            value={editing.description || ""}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
          />
          <input type="file" accept="image/*" className="mt-2" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div className="mt-2 flex gap-2">
            <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-black">
              Save
            </button>
            <button type="button" onClick={() => setEditing(null)} className="text-zinc-400">
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="mt-8 space-y-2">
        {list.map((c) => (
          <li
            key={c._id}
            className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3"
          >
            <span className="font-medium text-zinc-200">{c.name}</span>
            <div className="flex items-center gap-0.5">
              <DashboardEditIconButton onClick={() => setEditing(c)} />
              <DashboardDeleteIconButton onClick={() => remove(c._id)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
