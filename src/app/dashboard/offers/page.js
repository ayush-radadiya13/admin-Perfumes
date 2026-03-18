"use client";

import { api } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { AdminModal } from "@/components/AdminModal";
import { useRegisterFab } from "@/components/AdminFabContext";
import {
  DashboardEditIconButton,
  DashboardDeleteIconButton,
} from "../../../../components/TableActionIcons";

const emptyForm = {
  title: "",
  description: "",
  discountPercent: "10",
  appliesTo: "all",
  category: "",
  products: [],
  collections: [],
  startDate: "",
  endDate: "",
  code: "",
  isActive: true,
};

export default function OffersAdmin() {
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [err, setErr] = useState("");

  function load() {
    Promise.all([
      api("/offers").catch(() => []),
      api("/categories").then((r) => (Array.isArray(r) ? r : r.data || [])),
      api("/products?limit=200").then((r) => r.items || r.data || []),
      api("/collections").then((r) => (Array.isArray(r) ? r : r.data || [])),
    ]).then(([offers, cats, prods, cols]) => {
      setList(Array.isArray(offers) ? offers : []);
      setCategories(cats);
      setProducts(prods);
      setCollections(cols);
    });
  }

  useEffect(() => {
    load();
  }, []);

  const openAddModal = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
    setErr("");
  }, []);
  useRegisterFab(openAddModal);

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setErr("");
  }

  async function save(e) {
    e.preventDefault();
    setErr("");
    const body = {
      title: form.title,
      description: form.description,
      discountPercent: Number(form.discountPercent),
      appliesTo: form.appliesTo,
      category: form.appliesTo === "category" ? form.category : null,
      products: form.appliesTo === "product" ? form.products : [],
      collections: form.appliesTo === "collection" ? form.collections : [],
      startDate: form.startDate,
      endDate: form.endDate,
      code: form.code,
      isActive: form.isActive,
    };
    try {
      if (editing) {
        await api(`/offers/${editing._id}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await api("/offers", { method: "POST", body: JSON.stringify(body) });
      }
      closeModal();
      load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function del(id) {
    if (!confirm("Delete offer?")) return;
    await api(`/offers/${id}`, { method: "DELETE" });
    load();
  }

  const toLocal = (d) => (d ? new Date(d).toISOString().slice(0, 16) : "");

  return (
    <div className="w-full">
      <h1 className="font-serif text-2xl text-zinc-100">Offers</h1>
      <p className="mt-1 text-sm text-zinc-500">Promotions and discount rules</p>

      <AdminModal open={modalOpen} onClose={closeModal} title={editing ? "Edit offer" : "New offer"} wide>
        <form onSubmit={save} className="flex flex-col gap-3">
          {err && <p className="text-sm text-red-400">{err}</p>}
          <input
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
            rows={2}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="number"
              placeholder="Discount % *"
              value={form.discountPercent}
              onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
              required
            />
            <input
              placeholder="Promo code (optional)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
            />
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
              required
            />
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
              required
            />
          </div>
          <select
            value={form.appliesTo}
            onChange={(e) => setForm({ ...form, appliesTo: e.target.value })}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
          >
            <option value="all">All products</option>
            <option value="category">Category</option>
            <option value="product">Specific products</option>
            <option value="collection">Collection</option>
          </select>
          {form.appliesTo === "category" && (
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
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
          {form.appliesTo === "product" && (
            <select
              multiple
              value={form.products}
              onChange={(e) =>
                setForm({
                  ...form,
                  products: Array.from(e.target.selectedOptions, (o) => o.value),
                })
              }
              className="h-32 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
            >
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          {form.appliesTo === "collection" && (
            <select
              multiple
              value={form.collections}
              onChange={(e) =>
                setForm({
                  ...form,
                  collections: Array.from(e.target.selectedOptions, (o) => o.value),
                })
              }
              className="h-24 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
            >
              {collections.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-black">
              {editing ? "Update" : "Create"}
            </button>
            <button type="button" onClick={closeModal} className="rounded-lg border border-zinc-600 px-4 py-2 text-zinc-400">
              Cancel
            </button>
          </div>
        </form>
      </AdminModal>

      <div className="mt-8 w-full overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
        <table className="w-full min-w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">%</th>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Ends</th>
              <th className="w-36 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o._id} className="border-b border-zinc-800/50">
                <td className="px-4 py-3 text-zinc-200">{o.title}</td>
                <td className="px-4 py-3 text-zinc-300">{o.discountPercent}%</td>
                <td className="px-4 py-3 text-zinc-400">{o.code || "—"}</td>
                <td className="px-4 py-3 text-zinc-400">{o.endDate ? new Date(o.endDate).toLocaleDateString() : "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-0.5 justify-end">
                    <DashboardEditIconButton
                      onClick={() => {
                        setEditing(o);
                        setForm({
                          title: o.title,
                          description: o.description || "",
                          discountPercent: String(o.discountPercent),
                          appliesTo: o.appliesTo || "all",
                          category: o.category?._id || o.category || "",
                          products: (o.products || []).map((p) => p._id || p),
                          collections: (o.collections || []).map((c) => c._id || c),
                          startDate: toLocal(o.startDate),
                          endDate: toLocal(o.endDate),
                          code: o.code || "",
                          isActive: o.isActive !== false,
                        });
                        setModalOpen(true);
                        setErr("");
                      }}
                    />
                    <DashboardDeleteIconButton onClick={() => del(o._id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!list.length && <p className="mt-4 text-zinc-500">No offers yet (or list requires admin API).</p>}
    </div>
  );
}
