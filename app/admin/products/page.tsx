"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react"
import { getProducts, createProduct, updateProduct, deleteProduct, type ProductInput } from "@/actions/admin"
import { createClient } from "@/lib/supabase/client"
import { roastLevels } from "@/lib/products"

type Product = {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  roastLevel: string
  featured: boolean
  description: string
  longDescription?: string | null
  origin?: string | null
  flavorNotes: string[]
  weightOptions: { label: string; grams: number; price: number }[]
  imageUrl: string
}

const emptyForm: ProductInput = {
  name: "",
  slug: "",
  description: "",
  longDescription: "",
  origin: "",
  price: 0,
  stock: 0,
  roastLevel: "Medium",
  flavorNotes: [],
  weightOptions: [{ label: "250g", grams: 250, price: 0 }],
  imageUrl: "",
  featured: false,
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductInput>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [noteInput, setNoteInput] = useState("")

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const result = await getProducts()
      if (!mounted) return
      if (result.success && result.products) setProducts(result.products as unknown as Product[])
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const refresh = async () => {
    const result = await getProducts()
    if (result.success && result.products) setProducts(result.products as unknown as Product[])
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setNoteInput("")
    setShowModal(true)
  }

  const openEdit = (product: Product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      longDescription: product.longDescription ?? "",
      origin: product.origin ?? "",
      price: product.price,
      stock: product.stock,
      roastLevel: product.roastLevel,
      flavorNotes: product.flavorNotes,
      weightOptions: product.weightOptions,
      imageUrl: product.imageUrl,
      featured: product.featured,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    await deleteProduct(id)
    refresh()
  }

  const closeModal = () => {
    setShowModal(false)
    setForm(emptyForm)
    setEditingId(null)
    setNoteInput("")
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError("")

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Accepted: JPG, PNG, WebP")
      e.target.value = ""
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError("File too large. Maximum size: 5MB")
      e.target.value = ""
      return
    }

    setUploading(true)
    const ext = file.name.split(".").pop() ?? "jpg"
    const fileName = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const supabase = createClient()

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: "3600",
      })

    if (error) {
      setUploadError(`Upload failed: ${error.message}`)
      setUploading(false)
      e.target.value = ""
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path)

    setForm({ ...form, imageUrl: publicUrl })
    setUploading(false)
    e.target.value = ""
  }

  const handleSave = async () => {
    setSaving(true)
    const result = editingId
      ? await updateProduct(editingId, form)
      : await createProduct(form)

    if (result.success) {
      setShowModal(false)
      refresh()
    }
    setSaving(false)
  }

  const addFlavorNote = () => {
    if (noteInput.trim() && !form.flavorNotes.includes(noteInput.trim())) {
      setForm({ ...form, flavorNotes: [...form.flavorNotes, noteInput.trim()] })
      setNoteInput("")
    }
  }

  const removeFlavorNote = (note: string) => {
    setForm({ ...form, flavorNotes: form.flavorNotes.filter((n) => n !== note) })
  }

  const updateWeight = (index: number, field: string, value: string | number) => {
    setForm((prev) => {
      const updated = [...prev.weightOptions]
      const entry = updated[index] as Record<string, string | number>
      entry[field] = value
      return { ...prev, weightOptions: updated }
    })
  }

  const addWeightOption = () => {
    setForm({ ...form, weightOptions: [...form.weightOptions, { label: "", grams: 0, price: 0 }] })
  }

  const removeWeightOption = (index: number) => {
    setForm({ ...form, weightOptions: form.weightOptions.filter((_, i) => i !== index) })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-text-primary mb-1">Products</h1>
            <p className="text-text-secondary text-sm">{products.length} product{products.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors duration-300"
          />
        </div>

        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Slug</th>
                  <th className="text-right px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Price</th>
                  <th className="text-right px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Stock</th>
                  <th className="text-left px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Roast</th>
                  <th className="text-center px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Featured</th>
                  <th className="text-right px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-text-muted">
                      {search ? "No products match your search." : "No products yet. Add your first product."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr key={product.id} className="border-b border-border last:border-b-0 hover:bg-surface-2 transition-colors">
                      <td className="px-5 py-4 text-text-primary font-medium">{product.name}</td>
                      <td className="px-5 py-4 text-text-secondary">{product.slug}</td>
                      <td className="px-5 py-4 text-text-primary font-sans tabular-nums text-right">EGP {product.price}</td>
                      <td className="px-5 py-4 text-text-primary tabular-nums text-right">{product.stock}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                          {product.roastLevel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${product.featured ? "bg-green-500" : "bg-text-muted"}`} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-all duration-300"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 px-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif text-text-primary">{editingId ? "Edit Product" : "Add Product"}</h2>
              <button onClick={closeModal} className="text-text-secondary hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Name *</label>
                  <input
                    type="text" required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="Product name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Slug *</label>
                  <input
                    type="text" required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="product-slug"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Description *</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Product description"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Long Description (optional)</label>
                <textarea
                  value={form.longDescription ?? ""}
                  onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Expanded product description for the detail page — if empty, the short description will be used"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Price (EGP) *</label>
                  <input
                    type="number" required min={0} step={0.01}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Stock *</label>
                  <input
                    type="number" required min={0}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Roast Level</label>
                  <select
                    value={form.roastLevel}
                    onChange={(e) => setForm({ ...form, roastLevel: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
                  >
                    {roastLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Origin (optional)</label>
                <input
                  type="text"
                  value={form.origin ?? ""}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. Ethiopia, Colombia, Kenya — shown on product cards and detail page"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Flavor Notes</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFlavorNote())}
                    className="flex-1 px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="Add a flavor note and press Enter"
                  />
                  <button type="button" onClick={addFlavorNote} className="px-4 py-3 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.flavorNotes.map((note) => (
                    <span key={note} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs">
                      {note}
                      <button type="button" onClick={() => removeFlavorNote(note)} className="hover:text-red-500">&times;</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Weight Options</label>
                  <button type="button" onClick={addWeightOption} className="text-xs text-primary hover:underline">+ Add weight</button>
                </div>
                {form.weightOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <input
                      type="text" placeholder="Label (e.g. 250g)" required
                      value={opt.label}
                      onChange={(e) => updateWeight(i, "label", e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                    <input
                      type="number" placeholder="Grams" required min={0}
                      value={opt.grams}
                      onChange={(e) => updateWeight(i, "grams", parseInt(e.target.value) || 0)}
                      className="w-24 px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                    <input
                      type="number" placeholder="Price" required min={0} step={0.01}
                      value={opt.price}
                      onChange={(e) => updateWeight(i, "price", parseFloat(e.target.value) || 0)}
                      className="w-24 px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                    {form.weightOptions.length > 1 && (
                      <button type="button" onClick={() => removeWeightOption(i)} className="p-3 text-text-secondary hover:text-red-500 transition-colors">&times;</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Product Image</label>
                  <div className="flex items-start gap-4">
                    <label className="flex flex-col items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-border bg-surface cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="sr-only"
                      />
                      {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      ) : (
                        <>
                          <svg className="w-6 h-6 text-text-muted group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[10px] text-text-muted group-hover:text-primary transition-colors mt-1">Upload</span>
                        </>
                      )}
                    </label>

                    {form.imageUrl && (
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-border bg-surface">
                        <img
                          src={form.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                        />
                      </div>
                    )}
                  </div>
                  {uploadError && (
                    <p className="text-xs text-red-500 mt-1">{uploadError}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Or paste image URL</label>
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="🌸 or https://..."
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm text-text-secondary">Featured product</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Update Product" : "Create Product"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-8 py-4 rounded-xl border border-border text-text-secondary font-semibold text-sm hover:text-text-primary hover:border-primary/40 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
