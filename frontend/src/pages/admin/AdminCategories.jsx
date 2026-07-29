import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'


import { demoCategories } from '../../lib/demoData'
import { toast } from 'react-toastify'
import { isDemoMode } from '../../lib/withDemoFallback'
import { getItems, addItem, updateItem, deleteItem as demoDelete, toggleItem } from '../../lib/demoStore'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', order: 0, isActive: true })
  const [editingNameId, setEditingNameId] = useState(null)
  const [editNameValue, setEditNameValue] = useState('')
  const [nameError, setNameError] = useState('')
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)
  const dragItem = useRef(null)

  const mapDemoCat = (c) => ({ ...c, _id: c._id || c.id, image: c.image || c.image_url })

  const load = async () => {
    setLoading(true)
    if (isDemoMode()) {
      const saved = getItems('categories')
      const demos = demoCategories.map(mapDemoCat)
      const all = [...saved, ...demos.filter(d => !saved.some(s => s.name === d.name))]
      setCategories(all)
      setLoading(false)
      return
    }
    try {
      const data = await api.getAllCategories()
      setCategories(data || [])
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setEditing(null)
    setForm({ name: '', description: '', order: 0, isActive: true })
  }

  const handleEdit = (cat) => {
    setEditing(cat._id)
    setForm({ name: cat.name, description: cat.description || '', order: cat.order || 0, isActive: cat.isActive })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    if (isDemoMode()) {
      const payload = { ...form }
      if (editing) { updateItem('categories', editing, payload); toast.success('Category updated') }
      else { addItem('categories', payload); toast.success('Category created') }
      resetForm(); load(); return
    }
    try {
      if (editing) {
        await api.updateCategory(editing, form)
        toast.success('Category updated')
      } else {
        await api.createCategory(form)
        toast.success('Category created')
      }
      resetForm()
      load()
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hide this category?')) return
    if (isDemoMode()) { demoDelete('categories', id); toast.success('Category hidden'); load(); return }
    try { await api.deleteCategory(id); toast.success('Category hidden'); load() }
    catch (err) { toast.error(err.message) }
  }

  const handleToggle = async (id) => {
    if (isDemoMode()) { toggleItem('categories', id); toast.success('Toggled'); load(); return }
    try { await api.toggleCategoryActive(id); load() }
    catch (err) { toast.error(err.message) }
  }

  const handleStartRename = (cat) => {
    setNameError('')
    setEditingNameId(cat._id)
    setEditNameValue(cat.name)
  }

  const handleCancelRename = () => {
    setNameError('')
    setEditingNameId(null)
    setEditNameValue('')
  }

  const handleSaveRename = async (id) => {
    const trimmed = editNameValue.trim()
    if (!trimmed) { setNameError('Name is required'); return }
    if (trimmed.length > 60) { setNameError('Max 60 characters'); return }
    const previous = [...categories]
    setCategories(prev => prev.map(c => c._id === id ? { ...c, name: trimmed } : c))
    setEditingNameId(null)
    setNameError('')
    if (isDemoMode()) { updateItem('categories', id, { name: trimmed }); toast.success('Category renamed'); return }
    try {
      await api.renameCategory(id, trimmed)
      toast.success('Category renamed')
    } catch (err) {
      setCategories(previous)
      setNameError(err.message)
    }
  }

  const handleMoveUp = (idx) => {
    if (idx === 0) return
    const reordered = [...categories]
    const [moved] = reordered.splice(idx, 1)
    reordered.splice(idx - 1, 0, moved)
    commitOrder(reordered)
  }

  const handleMoveDown = (idx) => {
    if (idx === categories.length - 1) return
    const reordered = [...categories]
    const [moved] = reordered.splice(idx, 1)
    reordered.splice(idx + 1, 0, moved)
    commitOrder(reordered)
  }

  const commitOrder = async (reordered) => {
    const previous = [...categories]
    setCategories(reordered)
    if (isDemoMode()) { toast.success('Categories reordered (demo)'); return }
    try {
      const orders = reordered.map((c, i) => ({ id: c._id, order: i }))
      await api.reorderCategories(orders)
      toast.success('Categories reordered')
    } catch (err) {
      setCategories(previous)
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
    const reordered = [...categories]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(dropIdx, 0, moved)
    handleDragEnd()
    commitOrder(reordered)
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Categories</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{editing ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Category Name *" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <input value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
               <input type="number" value={form.order} onChange={e => setForm(prev => ({ ...prev, order: Number(e.target.value) }))} placeholder="Order" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition">
                  {editing ? 'Update' : 'Create'}
                </button>
                {editing && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500 uppercase">
                <th className="w-10 p-3" />
                <th className="w-20 p-3 font-medium">Order</th><th className="p-3 font-medium">Name</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={cat._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`border-b border-slate-50 transition-all ${dragIdx === idx ? 'opacity-40' : ''} ${overIdx === idx && dragIdx !== idx ? 'border-t-2 border-t-brand-500' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-3 text-slate-300 cursor-grab active:cursor-grabbing text-base select-none" title="Drag to reorder">⠿</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleMoveUp(idx)} disabled={idx === 0}
                          className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors" title="Move up">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                        </button>
                        <span className="w-5 text-center text-xs text-slate-500">{cat.order ?? idx}</span>
                        <button onClick={() => handleMoveDown(idx)} disabled={idx === categories.length - 1}
                          className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors" title="Move down">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {cat.image && <img src={cat.image} alt="" className="h-8 w-8 rounded-lg object-cover shrink-0" onError={e => { e.target.style.display = 'none' }} />}
                        {editingNameId === cat._id ? (
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <input value={editNameValue} onChange={e => setEditNameValue(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleSaveRename(cat._id); if (e.key === 'Escape') handleCancelRename() }}
                              autoFocus
                              className="w-full min-w-0 rounded border border-brand-500 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-brand-500/20" />
                            <button onClick={() => handleSaveRename(cat._id)} className="shrink-0 rounded bg-brand-600 p-1 text-white hover:bg-brand-700 transition" title="Save">
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={handleCancelRename} className="shrink-0 rounded border border-slate-200 p-1 text-slate-500 hover:bg-slate-100 transition" title="Cancel">
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            {nameError && <span className="shrink-0 text-[10px] text-red-600">{nameError}</span>}
                          </div>
                        ) : (
                          <button onClick={() => handleStartRename(cat)} className="group flex items-center gap-1.5 text-left font-medium text-slate-900 hover:text-brand-600 transition-colors">
                            <span>{cat.name}</span>
                            <svg className="h-3.5 w-3.5 text-slate-300 group-hover:text-brand-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleToggle(cat._id)} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{cat.isActive ? 'Active' : 'Hidden'}</button>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(cat)} className="text-xs font-semibold text-brand-600 hover:text-brand-700">Edit</button>
                        <button onClick={() => handleDelete(cat._id)} className="text-xs font-semibold text-red-600 hover:text-red-700">Hide</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {categories.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-medium text-slate-400 mb-1">No categories yet</p>
                <p className="text-sm text-slate-400">Create your first category using the form</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
