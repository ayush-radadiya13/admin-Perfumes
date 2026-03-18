"use client";

import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewProduct() {
  const router = useRouter();
  const [cats, setCats] = useState([]);
  const [cols, setCols] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [collection, setCollection] = useState("");
  const [stock, setStock] = useState("100");
  const [featured, setFeatured] = useState(false);
  const [files, setFiles] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/categories").then((r) => {
      const d = Array.isArray(r) ? r : r.data || [];
      setCats(d);
      if (d[0]) setCategory(d[0]._id);
    });
    api("/collections").then((r) => {
      const d = Array.isArray(r) ? r : r.data || [];
      setCols(d);
    });
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", price);
    fd.append("description", description);
    fd.append("category", category);
    if (collection) fd.append("collection", collection);
    fd.append("stock", stock);
    fd.append("featured", String(featured));
    if (files) Array.from(files).forEach((f) => fd.append("images", f));
    try {
      await api("/products", { method: "POST", body: fd });
      router.push("/dashboard/products");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="max-w-xl">
      <Link href="/dashboard/products" className="text-sm text-amber-500">
        ← Products
      </Link>
      <h1 className="mt-4 font-serif text-2xl text-zinc-100">New product</h1>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <input
          required
          placeholder="Name"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          required
          type="number"
          step="0.01"
          placeholder="Price"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {cats.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
        >
          <option value="">No collection</option>
          {cols.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Stock"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured
        </label>
        <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button type="submit" className="w-full rounded-lg bg-amber-600 py-2 font-medium text-black">
          Create
        </button>
      </form>
    </div>
  );
}
