import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'
import { isDemoMode } from '../../lib/withDemoFallback'

const emptyForm = { title: '', description: '', videoUrl: '', videoPublicId: '', thumbnail: '', thumbnailPublicId: '', productId: '', productName: '', isActive: true }

export default function AdminStories() {
  const [stories, setStories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [form, setForm] = useState(emptyForm)
  const videoRef = useRef(null)
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [productSearch, setProductSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [storiesData, productsData] = await Promise.all([
        api.getAllStories(),
        api.getProducts({ limit: 200 }).then(r => r.data || []).catch(() => []),
      ])
      setStories(storiesData || [])
      setProducts(productsData || [])
    } catch { setStories([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleChange = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type)) {
      return toast.error('Only .mp4, .mov, .webm files allowed')
    }
    if (file.size > 100 * 1024 * 1024) return toast.error('Max file size is 100MB')
    setUploading(true)
    setUploadProgress(0)
    try {
      const result = await api.uploadImage(file, 'haifarmer/stories')
      handleChange('videoUrl', result.url)
      handleChange('videoPublicId', result.publicId)
      handleChange('thumbnail', result.url.replace('/upload/', '/upload/w_400,h_600/'))
      toast.success('Video uploaded')
    } catch (err) { toast.error(err.message) }
    finally { setUploading(false); setUploadProgress(0) }
    if (e.target) e.target.value = ''
  }

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.videoUrl) return toast.error('Video is required')
    if (!form.productId) return toast.error('Please tag a product')
    setSaving(true)
    try {
      const payload = { ...form, productName: products.find(p => (p._id || p.id) === form.productId)?.name || '' }
      if (editing) { await api.updateStory(editing, payload); toast.success('Story updated') }
      else { await api.createStory(payload); toast.success('Story created') }
      setEditing(null); setForm(emptyForm); load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleEdit = (s) => { setEditing(s._id); setForm({ ...emptyForm, ...s }) }
  const handleDelete = async (id) => {
    if (!confirm('Delete this story?')) return
    try { await api.deleteStory(id); toast.success('Deleted'); load() }
    catch (err) { toast.error(err.message) }
  }

  const filteredProducts = products.filter(p =>
    (p.name || '').toLowerCase().includes(productSearch.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Stories From the Soil</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">{editing ? 'Edit Story' : 'Add Story'}</h2>
          <div className="space-y-3">
            <input value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="Story Title *" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <input value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Short description" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />

            {/* Tagged product dropdown */}
            <div className="relative">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Tagged Product *</label>
              <input value={form.productName || ''} onFocus={() => setShowProductDropdown(true)} placeholder="Search product..." readOnly
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 cursor-pointer" />
              {form.productName && (
                <button type="button" onClick={() => { handleChange('productId', ''); handleChange('productName', '') }} className="absolute right-2 top-7 text-red-500 text-xs">×</button>
              )}
              {showProductDropdown && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search..." autoFocus
                    className="w-full border-b border-slate-100 px-3 py-2 text-sm outline-none sticky top-0 bg-white" />
                  {filteredProducts.slice(0, 20).map(p => (
                    <button key={p._id || p.id} type="button" onClick={() => { handleChange('productId', p._id || p.id); handleChange('productName', p.name); setShowProductDropdown(false); setProductSearch('') }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50">{p.name}</button>
                  ))}
                  {filteredProducts.length === 0 && <p className="px-3 py-2 text-sm text-slate-400">No products found</p>}
                </div>
              )}
              {showProductDropdown && <div className="fixed inset-0 z-10" onClick={() => setShowProductDropdown(false)} />}
            </div>

            {/* Video upload */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Video Upload * (.mp4, .mov, .webm — max 100MB)</label>
              {form.videoUrl ? (
                <div className="space-y-2">
                  <video src={form.videoUrl} controls className="w-full rounded-lg max-h-40" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => videoRef.current?.click()} className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-400 transition">Replace Video</button>
                    <button type="button" onClick={() => { handleChange('videoUrl', ''); handleChange('videoPublicId', '') }} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">Remove</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => videoRef.current?.click()} disabled={uploading} className="w-full rounded-xl border-2 border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 transition text-center">
                  {uploading ? `Uploading... ${uploadProgress}%` : 'Click to Upload Video'}
                </button>
              )}
              <input ref={videoRef} type="file" accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm" onChange={handleVideoUpload} hidden />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={e => handleChange('isActive', e.target.checked)} className="rounded border-slate-300 text-brand-600" />
              <span className="text-sm text-slate-700">Active</span>
            </div>

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving || uploading} className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              {editing && <button onClick={() => { setEditing(null); setForm(emptyForm) }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
          ) : stories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <p className="text-lg font-medium text-slate-400">No stories yet</p>
              <p className="text-sm text-slate-400">Create your first story</p>
            </div>
          ) : stories.map(s => (
            <div key={s._id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              {s.thumbnail && <img src={s.thumbnail} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{s.title}</p>
                <p className="text-xs text-slate-500 truncate">{s.productName || 'No product'} · {s.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <button onClick={() => handleEdit(s)} className="text-xs font-semibold text-brand-600 shrink-0">Edit</button>
              <button onClick={() => handleDelete(s._id)} className="text-xs font-semibold text-red-600 shrink-0">Del</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
