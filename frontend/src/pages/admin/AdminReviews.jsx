import { useState, useEffect, useRef, useMemo } from 'react'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'
import { isDemoMode } from '../../lib/withDemoFallback'
import { getItems, addItem, updateItem, deleteItem as demoDelete } from '../../lib/demoStore'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 8 * 1024 * 1024

const emptyForm = {
  name: '',
  designation: '',
  image: '',
  imagePublicId: '',
  text: '',
  rating: 5,
  product: '',
  reviewDate: new Date().toISOString().slice(0, 10),
  status: 'published',
  displayOrder: 0,
  featured: false,
}

function StarIcon({ filled }) {
  return (
    <svg className={`h-3.5 w-3.5 ${filled ? 'text-amber-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')) }
    img.src = url
  })
}

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date)) return '—'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterFeatured, setFilterFeatured] = useState('all')
  const [filterRating, setFilterRating] = useState('all')
  const [sortBy, setSortBy] = useState('manual')
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)
  const dragItem = useRef(null)
  const fileRef = useRef(null)

  const load = async () => {
    setLoading(true)
    if (isDemoMode()) {
      setReviews(getItems('reviews'))
      setLoading(false)
      return
    }
    try {
      const data = await api.getAllReviews()
      setReviews(Array.isArray(data) ? data : [])
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setEditing(null)
    setForm(emptyForm)
    setImagePreview('')
  }

  const handleEdit = (r) => {
    setEditing(r._id)
    setForm({
      ...emptyForm,
      name: r.name || '',
      designation: r.designation || '',
      image: r.image || '',
      imagePublicId: r.imagePublicId || '',
      text: r.text || '',
      rating: r.rating || 5,
      product: r.product || '',
      reviewDate: r.reviewDate ? new Date(r.reviewDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: r.status || 'draft',
      displayOrder: r.displayOrder ?? 0,
      featured: !!r.featured,
    })
    setImagePreview(r.image || '')
  }

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (e.target) e.target.value = ''
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG or WEBP images are allowed')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.warn('Large file — it will be compressed automatically')
    }
    setImagePreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      if (isDemoMode()) {
        const dataUrl = await new Promise(resolve => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })
        handleChange('image', dataUrl)
        handleChange('imagePublicId', '')
        toast.success('Image added (demo)')
        return
      }
      const img = await loadImage(file)
      const side = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = 400
      canvas.height = 400
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 400, 400)
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85))
      const processed = new File([blob], 'review-square.jpg', { type: 'image/jpeg' })
      const result = await api.uploadImage(processed, 'haifarmer/reviews')
      handleChange('image', result.url)
      handleChange('imagePublicId', result.publicId)
      toast.success('Photo uploaded & optimized')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
      setImagePreview(form.image || '')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Customer name is required')
    if (!form.text.trim()) return toast.error('Review text is required')
    if (!form.rating || form.rating < 1 || form.rating > 5) return toast.error('Please select a star rating')
    setSaving(true)
    const payload = { ...form }
    if (isDemoMode()) {
      if (editing) { updateItem('reviews', editing, payload); toast.success('Review updated') }
      else { addItem('reviews', payload); toast.success('Review created') }
      resetForm(); load(); setSaving(false); return
    }
    try {
      if (editing) {
        await api.updateReview(editing, payload)
        toast.success('Review updated')
      } else {
        await api.createReview(payload)
        toast.success('Review created' + (payload.status === 'published' ? ' — now live on the homepage' : ''))
      }
      resetForm()
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleToggleStatus = async (r) => {
    const next = r.status === 'published' ? 'draft' : 'published'
    if (isDemoMode()) {
      updateItem('reviews', r._id, { status: next })
      toast.success(next === 'published' ? 'Review published' : 'Review hidden')
      load()
      return
    }
    try {
      await api.updateReview(r._id, { status: next })
      toast.success(next === 'published' ? 'Review published' : 'Review hidden')
      load()
    } catch (err) { toast.error(err.message) }
  }

  const handleToggleFeatured = async (r) => {
    const next = !r.featured
    if (isDemoMode()) {
      updateItem('reviews', r._id, { featured: next })
      load()
      return
    }
    try {
      await api.updateReview(r._id, { featured: next })
      load()
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    if (isDemoMode()) {
      demoDelete('reviews', deleteTarget._id)
      toast.success('Review deleted')
      setDeleteTarget(null)
      load()
      return
    }
    try {
      await api.deleteReview(deleteTarget._id)
      toast.success('Review deleted')
      setDeleteTarget(null)
      load()
    } catch (err) { toast.error(err.message) }
  }

  const commitOrder = async (reordered) => {
    const previous = [...reviews]
    setReviews(reordered)
    if (isDemoMode()) {
      reordered.forEach((r, i) => updateItem('reviews', r._id, { displayOrder: i }))
      toast.success('Reviews reordered (demo)')
      return
    }
    try {
      const orders = reordered.map((r, i) => ({ id: r._id, displayOrder: i }))
      await api.reorderReviews(orders)
      toast.success('Reviews reordered')
    } catch (err) {
      setReviews(previous)
      toast.error(err.message)
    }
  }

  const handleDragStart = (e, idx) => {
    dragItem.current = idx
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, idx) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverIdx(idx)
  }

  const handleDragEnd = () => {
    setDragIdx(null)
    setOverIdx(null)
  }

  const handleDrop = (e, dropIdx) => {
    e.preventDefault()
    const fromIdx = dragItem.current
    if (fromIdx === null || fromIdx === dropIdx) { handleDragEnd(); return }
    const reordered = [...filtered]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(dropIdx, 0, moved)
    handleDragEnd()
    commitOrder(reordered)
  }

  const filtered = useMemo(() => {
    let list = [...reviews]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.text || '').toLowerCase().includes(q) ||
        (r.product || '').toLowerCase().includes(q)
      )
    }
    if (filterStatus !== 'all') list = list.filter(r => r.status === filterStatus)
    if (filterFeatured !== 'all') list = list.filter(r => r.featured === (filterFeatured === 'yes'))
    if (filterRating !== 'all') list = list.filter(r => Number(r.rating) === Number(filterRating))
    switch (sortBy) {
      case 'latest':
        list.sort((a, b) => new Date(b.reviewDate || b.createdAt) - new Date(a.reviewDate || a.createdAt))
        break
      case 'oldest':
        list.sort((a, b) => new Date(a.reviewDate || a.createdAt) - new Date(b.reviewDate || b.createdAt))
        break
      case 'highest':
        list.sort((a, b) => Number(b.rating) - Number(a.rating))
        break
      case 'lowest':
        list.sort((a, b) => Number(a.rating) - Number(b.rating))
        break
      default:
        list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    }
    return list
  }, [reviews, search, filterStatus, filterFeatured, filterRating, sortBy])

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  const inputCls = 'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500'
  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Reviews</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{editing ? 'Edit Review' : 'Add Review'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Customer Name *</label>
                <input value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. Priya Sharma" required className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Customer Photo</label>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    )}
                  </div>
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex-1 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-xs font-semibold text-slate-500 hover:border-brand-400 hover:text-brand-600 transition disabled:opacity-50">
                    {uploading ? 'Optimizing...' : imagePreview ? 'Change photo' : 'Upload photo'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
                </div>
                {imagePreview && form.image !== imagePreview && (
                  <p className="mt-1.5 text-[10px] text-slate-400">Preview — automatically cropped to square, resized & compressed on save</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Designation</label>
                <input value={form.designation} onChange={e => handleChange('designation', e.target.value)} placeholder="Customer, Nutrition Client, Fitness Enthusiast..." className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Rating *</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => handleChange('rating', n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}
                      className={`text-2xl leading-none transition-transform hover:scale-110 ${n <= form.rating ? 'text-amber-400' : 'text-slate-300'}`}>
                      ★
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-semibold text-slate-500">{form.rating}/5</span>
                </div>
              </div>

              <div>
                <label className={labelCls}>Review Text *</label>
                <textarea value={form.text} onChange={e => handleChange('text', e.target.value)} rows={3} placeholder="What did the customer say?" required className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Product Purchased</label>
                <input value={form.product} onChange={e => handleChange('product', e.target.value)} placeholder="e.g. Wild Forest Honey 500g" className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Review Date</label>
                  <input type="date" value={form.reviewDate} onChange={e => handleChange('reviewDate', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Display Order</label>
                  <input type="number" value={form.displayOrder} onChange={e => handleChange('displayOrder', Number(e.target.value) || 0)} className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={e => handleChange('status', e.target.value)} className={inputCls}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => handleChange('featured', e.target.checked)} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                Featured Review
              </label>

              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving || uploading}
                  className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Update Review' : 'Save Review'}
                </button>
                {editing && (
                  <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, review or product..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <div className="flex flex-wrap gap-2">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium outline-none focus:border-brand-500">
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <select value={filterFeatured} onChange={e => setFilterFeatured(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium outline-none focus:border-brand-500">
                  <option value="all">All</option>
                  <option value="yes">Featured</option>
                  <option value="no">Not Featured</option>
                </select>
                <select value={filterRating} onChange={e => setFilterRating(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium outline-none focus:border-brand-500">
                  <option value="all">Any Rating</option>
                  <option value="5">5 ★</option>
                  <option value="4">4 ★</option>
                  <option value="3">3 ★</option>
                  <option value="2">2 ★</option>
                  <option value="1">1 ★</option>
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium outline-none focus:border-brand-500">
                  <option value="manual">Manual Order</option>
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500 uppercase">
                    <th className="w-10 p-3" />
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Rating</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Order</th>
                    <th className="p-3 font-medium">Featured</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => (
                    <tr key={r._id}
                      draggable={sortBy === 'manual' && !search && filterStatus === 'all' && filterFeatured === 'all' && filterRating === 'all'}
                      onDragStart={e => handleDragStart(e, idx)}
                      onDragOver={e => handleDragOver(e, idx)}
                      onDrop={e => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`border-b border-slate-50 transition-all ${dragIdx === idx ? 'opacity-40' : ''} ${overIdx === idx && dragIdx !== idx ? 'border-t-2 border-t-brand-500' : 'hover:bg-slate-50/50'}`}>
                      <td className="p-3 text-slate-300 cursor-grab active:cursor-grabbing text-base select-none" title="Drag to reorder">⠿</td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full overflow-hidden bg-green-100 shrink-0 flex items-center justify-center">
                            {r.image ? (
                              <img src={r.image} alt={r.name} loading="lazy" className="h-full w-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                            ) : (
                              <span className="text-[10px] font-bold text-green-700">{r.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{r.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{r.designation || r.product || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(n => <StarIcon key={n} filled={n <= (r.rating || 0)} />)}
                        </div>
                      </td>
                      <td className="p-3">
                        <button onClick={() => handleToggleStatus(r)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${r.status === 'published' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                          title={r.status === 'published' ? 'Click to hide' : 'Click to publish'}>
                          {r.status === 'published' ? '✓ Published' : '✕ Hidden'}
                        </button>
                      </td>
                      <td className="p-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(r.reviewDate || r.createdAt)}</td>
                      <td className="p-3 text-xs text-slate-500">{r.displayOrder ?? idx}</td>
                      <td className="p-3">
                        <button onClick={() => handleToggleFeatured(r)}
                          className={`text-lg leading-none transition-colors ${r.featured ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
                          title={r.featured ? 'Unmark featured' : 'Mark featured'}>★</button>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(r)} className="text-xs font-semibold text-brand-600 hover:text-brand-700">Edit</button>
                          <button onClick={() => setDeleteTarget(r)} className="text-xs font-semibold text-red-600 hover:text-red-700">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-medium text-slate-400 mb-1">{reviews.length === 0 ? 'No reviews yet' : 'No reviews match your filters'}</p>
                <p className="text-sm text-slate-400">{reviews.length === 0 ? 'Add your first review using the form' : 'Try clearing search or filters'}</p>
              </div>
            )}

            {sortBy === 'manual' && reviews.length > 1 && (
              <p className="px-4 py-3 text-[11px] text-slate-400 border-t border-slate-100">Drag the ⠿ handle to reorder. The homepage follows this order exactly.</p>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
            <p className="text-center font-semibold text-slate-900 mb-1">Delete this review?</p>
            <p className="text-center text-sm text-slate-500 mb-5">"{deleteTarget.name}" — this will remove it from the homepage permanently.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
