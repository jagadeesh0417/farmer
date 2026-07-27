import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'

const BANNER_SECTIONS = [
  { key: 'hero1', sectionName: 'Hero Banner 1', group: 'Hero' },
  { key: 'hero2', sectionName: 'Hero Banner 2', group: 'Hero' },
  { key: 'hero3', sectionName: 'Hero Banner 3', group: 'Hero' },
  { key: 'promotional', sectionName: 'Promotional Banner', group: 'Homepage' },
]

export default function AdminBannerManagement() {
  const [banners, setBanners] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const fileRefs = useRef({})

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.getAllBannerSettings()
      const map = {}
      ;(Array.isArray(data) ? data : []).forEach(b => { map[b.bannerKey] = b })
      setBanners(map)
    } catch { setBanners({}) }
    finally { setLoading(false) }
  }

  const handleChange = (key, field, value) => {
    setBanners(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  const handleImageUpload = async (e, key) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const result = await api.uploadImage(file, 'haifarmer/banners')
      handleChange(key, 'image', result.url)
      handleChange(key, 'cloudinaryPublicId', result.publicId)
      toast.success('Image uploaded')
    } catch (err) { toast.error(err.message) }
    if (e.target) e.target.value = ''
  }

  const handleSave = async (key) => {
    setSaving(key)
    try {
      const b = banners[key] || {}
      await api.updateBannerSetting(key, {
        sectionName: BANNER_SECTIONS.find(s => s.key === key)?.sectionName || key,
        image: b.image || '',
        cloudinaryPublicId: b.cloudinaryPublicId || '',
        title: b.title || '',
        subtitle: b.subtitle || '',
        enabled: b.enabled !== false,
      })
      toast.success(`${BANNER_SECTIONS.find(s => s.key === key)?.sectionName || key} saved`)
    } catch (err) { toast.error(err.message) }
    finally { setSaving(null) }
  }

  const groups = {}
  BANNER_SECTIONS.forEach(s => {
    if (!groups[s.group]) groups[s.group] = []
    groups[s.group].push(s)
  })

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Banner Management</h1>

      {Object.entries(groups).map(([group, sections]) => (
        <div key={group} className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">{group}</h2>
          <div className="grid gap-4">
            {sections.map(s => {
              const b = banners[s.key] || {}
              return (
                <div key={s.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">{s.sectionName}</h3>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={b.enabled !== false} onChange={e => handleChange(s.key, 'enabled', e.target.checked)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                      Enabled
                    </label>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        {b.image ? (
                          <div className="relative rounded-lg overflow-hidden border border-slate-200 mb-2">
                            <img src={b.image} alt="" className="w-full h-32 object-cover" onError={e => { e.target.style.display = 'none' }} />
                          </div>
                        ) : (
                          <div className="w-full h-32 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm mb-2">No image</div>
                        )}
                        <div className="flex gap-2">
                          <button type="button" onClick={() => fileRefs.current[s.key]?.click()} className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-600 transition text-center">
                            {b.image ? 'Replace Image' : 'Upload Image'}
                          </button>
                          {b.image && (
                            <button type="button" onClick={() => { handleChange(s.key, 'image', ''); handleChange(s.key, 'cloudinaryPublicId', '') }} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">
                              Remove
                            </button>
                          )}
                        </div>
                        <input ref={el => fileRefs.current[s.key] = el} type="file" accept="image/*" onChange={e => handleImageUpload(e, s.key)} hidden />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <input value={b.title || ''} onChange={e => handleChange(s.key, 'title', e.target.value)} placeholder="Title" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                      <input value={b.subtitle || ''} onChange={e => handleChange(s.key, 'subtitle', e.target.value)} placeholder="Subtitle" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button onClick={() => handleSave(s.key)} disabled={saving === s.key}
                      className="rounded-lg bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50 transition">
                      {saving === s.key ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
