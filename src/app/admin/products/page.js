"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiUpload, FiLink } from "react-icons/fi";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  compareAt: "",
  category: "T-Shirts",
  stock: "0",
  featured: false,
  images: [],
  sizes: "S,M,L,XL,XXL",
};

const categories = ["T-Shirts", "Shirts", "Polos", "Casual Wear", "Hoodies", "Jeans", "Shorts", "Ethnic", "Accessories"];

function parseStoredImages(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      setProducts(await res.json());
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      compareAt: product.compareAt ? String(product.compareAt) : "",
      category: product.category || "T-Shirts",
      stock: String(product.stock ?? "0"),
      featured: !!product.featured,
      images: parseStoredImages(product.images),
      sizes: parseStoredImages(product.sizes).join(", "),
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingImg(false);
    }
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleUrlAdd = () => {
    const url = prompt("Enter image URL:");
    if (url && url.trim()) {
      setForm((prev) => ({ ...prev, images: [...prev.images, url.trim()] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        compareAt: form.compareAt ? parseFloat(form.compareAt) : null,
        category: form.category,
        stock: parseInt(form.stock) || 0,
        featured: form.featured,
        images: form.images,
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        slug: editing?.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      };

      const url = editing ? `/api/products/${editing.id}` : "/api/products";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (!res.ok) throw new Error("Failed to save product");

      toast.success(editing ? "Product updated" : "Product created");
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display">Products</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-light">
            <tr>
              <th className="text-left p-4 text-text-muted font-medium w-16">Image</th>
              <th className="text-left p-4 text-text-muted font-medium">Name</th>
              <th className="text-left p-4 text-text-muted font-medium">Category</th>
              <th className="text-left p-4 text-text-muted font-medium">Price</th>
              <th className="text-left p-4 text-text-muted font-medium">Stock</th>
              <th className="text-right p-4 text-text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-text-muted">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-text-muted">No products yet</td></tr>
            ) : products.map((product) => {
              const images = parseStoredImages(product.images);
              return (
                <tr key={product.id} className="border-t border-border hover:bg-surface-light/50 transition-colors">
                  <td className="p-4">
                    {images[0] ? (
                      <img src={images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-surface-lighter flex items-center justify-center">
                        <FiImage className="text-text-muted" size={16} />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4 text-text-muted">{product.category}</td>
                  <td className="p-4">₹{product.price.toLocaleString("en-IN")}</td>
                  <td className="p-4">
                    <span className={product.stock > 0 ? "text-green-400" : "text-red-400"}>{product.stock}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(product)} className="p-2 hover:bg-surface-lighter rounded-lg transition-colors text-text-muted hover:text-primary">
                        <FiEdit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(product)} className="p-2 hover:bg-surface-lighter rounded-lg transition-colors text-text-muted hover:text-red-400">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-12 overflow-y-auto">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface rounded-t-2xl z-10">
              <h2 className="text-lg font-medium">{editing ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-lighter rounded-lg transition-colors text-text-muted hover:text-foreground">
                <FiX size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Product Name <span className="text-red-400">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} required
                  className="w-full bg-surface-light border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:border-primary transition-colors" />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">Description <span className="text-red-400">*</span></label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} required
                  className="w-full bg-surface-light border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:border-primary transition-colors resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Price (₹) <span className="text-red-400">*</span></label>
                  <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required
                    className="w-full bg-surface-light border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Compare At (₹)</label>
                  <input name="compareAt" type="number" step="0.01" min="0" value={form.compareAt} onChange={handleChange}
                    className="w-full bg-surface-light border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:border-primary transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Category</label>
                  <select name="category" value={form.category} onChange={handleChange}
                    className="w-full bg-surface-light border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:border-primary transition-colors">
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Stock</label>
                  <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange}
                    className="w-full bg-surface-light border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:border-primary transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-2">Product Images</label>
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                        <button type="button" onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiX size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border cursor-pointer hover:bg-surface-light transition-colors text-sm ${uploadingImg ? "opacity-50 pointer-events-none" : ""}`}>
                    <FiUpload size={16} className="text-primary" />
                    {uploadingImg ? "Uploading..." : "Upload Image"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImg} />
                  </label>
                  <button type="button" onClick={handleUrlAdd}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:bg-surface-light transition-colors text-sm text-text-muted">
                    <FiLink size={16} /> Add URL
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">Sizes (comma separated)</label>
                <input name="sizes" value={form.sizes} onChange={handleChange} placeholder="S, M, L, XL, XXL"
                  className="w-full bg-surface-light border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:border-primary transition-colors" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input name="featured" type="checkbox" checked={form.featured} onChange={handleChange}
                  className="w-4 h-4 rounded border-border bg-surface-light accent-primary" />
                <span className="text-sm">Featured product</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border text-text-muted hover:text-foreground transition-colors text-sm">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
