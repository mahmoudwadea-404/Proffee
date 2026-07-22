"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react"
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, type CouponInput } from "@/actions/admin"

type Coupon = {
  id: string
  code: string
  description: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  maximumDiscount: number | null
  minOrderAmount: number | null
  maxUses: number | null
  usedCount: number
  isActive: boolean
  startsAt: Date | null
  expiresAt: Date | null
  createdAt: Date
}

const emptyForm: CouponInput = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  maximumDiscount: null,
  minOrderAmount: null,
  maxUses: null,
  isActive: true,
  startsAt: null,
  expiresAt: null,
}

const INPUT_CLASS =
  "w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors duration-300"

const LABEL_CLASS = "text-xs font-medium text-text-secondary uppercase tracking-wider"

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CouponInput>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const result = await getCoupons()
      if (!mounted) return
      if (result.success && result.coupons) setCoupons(result.coupons as unknown as Coupon[])
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const refresh = async () => {
    const result = await getCoupons()
    if (result.success && result.coupons) setCoupons(result.coupons as unknown as Coupon[])
  }

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSaveError("")
    setShowModal(true)
  }

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon.id)
    setForm({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maximumDiscount: coupon.maximumDiscount,
      minOrderAmount: coupon.minOrderAmount,
      maxUses: coupon.maxUses,
      isActive: coupon.isActive,
      startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString().split("T")[0] : null,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : null,
    })
    setSaveError("")
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return
    await deleteCoupon(id)
    refresh()
  }

  const closeModal = () => {
    setShowModal(false)
    setForm(emptyForm)
    setEditingId(null)
    setSaveError("")
  }

  const handleSave = async () => {
    if (!form.code.trim()) {
      setSaveError("Coupon code is required.")
      return
    }
    if (form.discountValue <= 0) {
      setSaveError("Discount value must be greater than 0.")
      return
    }
    setSaving(true)
    setSaveError("")
    const result = editingId
      ? await updateCoupon(editingId, form)
      : await createCoupon(form)

    if (result.success) {
      setShowModal(false)
      refresh()
    } else {
      setSaveError(result.error ?? "Failed to save coupon.")
    }
    setSaving(false)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
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
            <h1 className="text-2xl md:text-3xl font-serif text-text-primary mb-1">Coupons</h1>
            <p className="text-text-secondary text-sm">{coupons.length} coupon{coupons.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Add Coupon
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupons..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors duration-300"
          />
        </div>

        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Code</th>
                  <th className="text-left px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Type</th>
                  <th className="text-right px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Value</th>
                  <th className="text-right px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Min Order</th>
                  <th className="text-right px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Max Discount</th>
                  <th className="text-right px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Usage</th>
                  <th className="text-center px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Expires</th>
                  <th className="text-right px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-text-muted">
                      {search ? "No coupons match your search." : "No coupons yet. Add your first coupon."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-border last:border-b-0 hover:bg-surface-2 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm font-semibold text-text-primary">{coupon.code}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                          coupon.discountType === "PERCENTAGE"
                            ? "bg-blue-500/20 text-blue-500"
                            : "bg-purple-500/20 text-purple-500"
                        }`}>
                          {coupon.discountType === "PERCENTAGE" ? "Percentage" : "Fixed"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-text-primary font-sans tabular-nums text-right">
                        {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `EGP ${coupon.discountValue}`}
                      </td>
                      <td className="px-5 py-4 text-text-secondary font-sans tabular-nums text-right">
                        {coupon.minOrderAmount !== null ? `EGP ${coupon.minOrderAmount}` : "—"}
                      </td>
                      <td className="px-5 py-4 text-text-secondary font-sans tabular-nums text-right">
                        {coupon.maximumDiscount !== null ? `EGP ${coupon.maximumDiscount}` : "—"}
                      </td>
                      <td className="px-5 py-4 text-text-primary font-sans tabular-nums text-right">
                        {coupon.usedCount}{coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ""}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${coupon.isActive ? "bg-green-500" : "bg-red-500"}`} />
                      </td>
                      <td className="px-5 py-4 text-text-muted text-xs">
                        {formatDate(coupon.expiresAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(coupon)}
                            className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-all duration-300"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
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
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif text-text-primary">{editingId ? "Edit Coupon" : "Add Coupon"}</h2>
              <button onClick={closeModal} className="text-text-secondary hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
              <div className="space-y-1.5">
                <label className={LABEL_CLASS}>Coupon Code *</label>
                <input
                  type="text" required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })}
                  className={INPUT_CLASS}
                  placeholder="e.g. SUMMER20"
                />
              </div>

              <div className="space-y-1.5">
                <label className={LABEL_CLASS}>Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={INPUT_CLASS}
                  placeholder="e.g. Summer sale discount"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={LABEL_CLASS}>Discount Type *</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as "PERCENTAGE" | "FIXED" })}
                    className={`${INPUT_CLASS} appearance-none`}
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={LABEL_CLASS}>
                    {form.discountType === "PERCENTAGE" ? "Percentage (%)" : "Amount (EGP)"} *
                  </label>
                  <input
                    type="number" required min={0} step={0.01}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) || 0 })}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={LABEL_CLASS}>Minimum Order (EGP)</label>
                  <input
                    type="number" min={0} step={0.01}
                    value={form.minOrderAmount ?? ""}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value ? parseFloat(e.target.value) : null })}
                    className={INPUT_CLASS}
                    placeholder="No minimum"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={LABEL_CLASS}>Max Discount (EGP)</label>
                  <input
                    type="number" min={0} step={0.01}
                    value={form.maximumDiscount ?? ""}
                    onChange={(e) => setForm({ ...form, maximumDiscount: e.target.value ? parseFloat(e.target.value) : null })}
                    className={INPUT_CLASS}
                    placeholder="No cap"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={LABEL_CLASS}>Usage Limit</label>
                <input
                  type="number" min={0}
                  value={form.maxUses ?? ""}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                  className={INPUT_CLASS}
                  placeholder="Unlimited"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={LABEL_CLASS}>Start Date</label>
                  <input
                    type="date"
                    value={form.startsAt ?? ""}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value || null })}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={LABEL_CLASS}>Expiration Date</label>
                  <input
                    type="date"
                    value={form.expiresAt ?? ""}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value || null })}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm text-text-secondary">Active</span>
              </label>

              {saveError && (
                <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-2 text-center">{saveError}</p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Update Coupon" : "Create Coupon"}
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
