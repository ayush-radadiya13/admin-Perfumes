"use client";

import { api } from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProduct() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [cats, setCats] = useState([]);
  const [cols, setCols] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [collection, setCollection] = useState("");
  const [stock, setStock] = useState("");
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/categories").then((r) => setCats(Array.isArray(r) ? r : r.data || []));
    api("/collections").then((r) => setCols(Array.isArray(r) ? r : r.data || []));
    if (!id) return;
    api(`/products/${id}`).then((p) => {
      setName(String(p.name));
      setPrice(String(p.price));
      setDescription(String(p.description || ""));
      const cat = p.category;
      setCategory(typeof cat === "object" && cat?._id ? String(cat._id) : String(cat || ""));
      const col = p.collection;
      setCollection(col && typeof col === "object" && col._id ? String(col._id) : "");
      setStock(String(p.stock));
      setFeatured(!!p.featured);
      setImages(Array.isArray(p.images) ? p.images : []);
    });
  }, [id]);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", price);
    fd.append("description", description);
    fd.append("category", category);
    fd.append("collection", collection || "");
    fd.append("stock", stock);
    fd.append("featured", String(featured));
    fd.append("images", JSON.stringify(images));
    if (files) Array.from(files).forEach((f) => fd.append("images", f));
    try {
      await api(`/products/${id}`, { method: "PATCH", body: fd });
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
      <h1 className="mt-4 font-serif text-2xl text-zinc-100">Edit product</h1>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <input
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          required
          type="number"
          step="0.01"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <textarea
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
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured
        </label>
        <p className="text-xs text-zinc-500">Add more images (appends)</p>
        <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button type="submit" className="w-full rounded-lg bg-amber-600 py-2 font-medium text-black">
          Save
        </button>
      </form>
    </div>
  );
}
