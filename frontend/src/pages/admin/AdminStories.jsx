import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'
import { isDemoMode } from '../../lib/withDemoFallback'

const emptyForm = { title: '', description: '', thumbnail: '', thumbnailPublicId: '', videoUrl: '', videoPublicId: '', duration: '', order: 0, isActive: true }

export default function AdminStories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const thumbRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try { setStories(await api.getAllStories()) }
    catch { setStories([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleChange = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const result = await api.uploadImage(file, 'haifarmer/stories')
      handleChange('thumbnail', result.url)
      handleChange('thumbnailPublicId', result.publicId)
      toast.success('Thumbnail uploaded')
    } catch (err) { toast.error(err.message) }
    if (e.target) e.target.value = ''
  }

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title is required')
    setSaving(true)
    try {
      if (editing) { await api.updateStory(editing, form); toast.success('Story updated') }
      else { await api.createStory(form); toast.success('Story created') }
      setEditing(null); setForm(emptyForm); load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleEdit = (s) => { setEditing(s._id); setForm(s) }
  const handleDelete = async (id) => {
    if (!confirm('Delete this story?')) return
    try { await api.deleteStory(id); toast.success('Deleted'); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Stories From the Soil</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">{editing ? 'Edit Story' : 'Add Story'}</h2>
          <div className="space-y-3">
            <input value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="Story Title *" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <input value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Short description" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <input value={form.videoUrl} onChange={e => handleChange('videoUrl', e.target.value)} placeholder="Video URL (YouTube or direct)" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <input value={form.duration} onChange={e => handleChange('duration', e.target.value)} placeholder="Duration (e.g. 2:34)" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <input type="number" value={form.order} onChange={e => handleChange('order', Number(e.target.value))} placeholder="Display order" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={e => handleChange('isActive', e.target.checked)} className="rounded border-slate-300 text-brand-600" />
              <span className="text-sm text-slate-700">Active</span>
            </div>
            {form.thumbnail && <img src={form.thumbnail} alt="" className="h-24 w-full object-cover rounded-lg" />}
            <button type="button" onClick={() => thumbRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-brand-400">{form.thumbnail ? 'Replace' : 'Upload'} Thumbnail</button>
            <input ref={thumbRef} type="file" accept="image/*" onChange={handleThumbnailUpload} hidden />
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
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
              {s.thumbnail && <img src={s.thumbnail} alt="" className="h-16 w-16 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{s.title}</p>
                <p className="text-xs text-slate-500">{s.duration} · {s.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <button onClick={() => handleEdit(s)} className="text-xs font-semibold text-brand-600">Edit</button>
              <button onClick={() => handleDelete(s._id)} className="text-xs font-semibold text-red-600">Del</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
