import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'

const BANNER_SECTIONS = [
  { key: 'hero1', sectionName: 'Hero Banner 1', group: 'Hero' },
  { key: 'hero2', sectionName: 'Hero Banner 2', group: 'Hero' },
  { key: 'hero3', sectionName: 'Hero Banner 3', group: 'Hero' },
  { key: 'promotional', sectionName: 'Promotional Banner', group: 'Homepage' },
]

const DESKTOP_DIMENSIONS = { width: 2200, height: 700, label: '≈3:1 (2200×700)' }
const MOBILE_DIMENSIONS = { width: 1080, height: 1920, label: '9:16 (1080×1920)' }

function ImagePreview({ src, onUpload, onRemove, label, dimensions }) {
  const inputRef = useRef(null)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <span className="text-[10px] text-slate-400">Recommended: {dimensions.label}</span>
      </div>
      {src ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <img src={src} alt={label} className="w-full object-cover" style={{ maxHeight: label.startsWith('Desktop') ? 180 : 240 }} />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition flex items-end justify-end p-1">
            <button type="button" onClick={onRemove}
              className="rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-red-700 transition">Remove</button>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-brand-400 hover:text-brand-600 transition"
          style={{ height: label.startsWith('Desktop') ? 140 : 200 }} onClick={() => inputRef.current?.click()}>
          <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
          <span className="text-xs">Upload {label}</span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={onUpload} hidden />
    </div>
  )
}

export default function AdminBannerManagement() {
  const [banners, setBanners] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

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

  const handleDesktopUpload = async (e, key) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const result = await api.uploadImage(file, 'haifarmer/banners')
      handleChange(key, 'desktopImage', result.url)
      handleChange(key, 'desktopPublicId', result.publicId)
      toast.success('Desktop image uploaded')
    } catch (err) { toast.error(err.message) }
    if (e.target) e.target.value = ''
  }

  const handleMobileUpload = async (e, key) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const result = await api.uploadImage(file, 'haifarmer/banners')
      handleChange(key, 'mobileImage', result.url)
      handleChange(key, 'mobilePublicId', result.publicId)
      toast.success('Mobile image uploaded')
    } catch (err) { toast.error(err.message) }
    if (e.target) e.target.value = ''
  }

  const handleSave = async (key) => {
    setSaving(key)
    try {
      const b = banners[key] || {}
      const payload = {
        sectionName: BANNER_SECTIONS.find(s => s.key === key)?.sectionName || key,
        desktopImage: b.desktopImage || '',
        desktopPublicId: b.desktopPublicId || '',
        mobileImage: b.mobileImage || '',
        mobilePublicId: b.mobilePublicId || '',
        title: b.title || '',
        subtitle: b.subtitle || '',
        buttonText: b.buttonText || '',
        buttonLink: b.buttonLink || '',
        enabled: b.enabled !== false,
        order: b.order || 0,
      }
      await api.updateBannerSetting(key, payload)
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

                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Desktop image */}
                    <ImagePreview
                      src={b.desktopImage}
                      label="Desktop Image"
                      dimensions={DESKTOP_DIMENSIONS}
                      onUpload={(e) => handleDesktopUpload(e, s.key)}
                      onRemove={() => { handleChange(s.key, 'desktopImage', ''); handleChange(s.key, 'desktopPublicId', '') }} />

                    {/* Mobile image */}
                    <ImagePreview
                      src={b.mobileImage}
                      label="Mobile Image"
                      dimensions={MOBILE_DIMENSIONS}
                      onUpload={(e) => handleMobileUpload(e, s.key)}
                      onRemove={() => { handleChange(s.key, 'mobileImage', ''); handleChange(s.key, 'mobilePublicId', '') }} />
                  </div>

                  {/* Fields */}
                  <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    <input value={b.title || ''} onChange={e => handleChange(s.key, 'title', e.target.value)} placeholder="Banner Title" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                    <input value={b.subtitle || ''} onChange={e => handleChange(s.key, 'subtitle', e.target.value)} placeholder="Subtitle (optional)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                    <input value={b.buttonText || ''} onChange={e => handleChange(s.key, 'buttonText', e.target.value)} placeholder="Button text (e.g. Shop Now)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                    <input value={b.buttonLink || ''} onChange={e => handleChange(s.key, 'buttonLink', e.target.value)} placeholder="Button link (e.g. /products)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Order:</span>
                      <input type="number" value={b.order ?? 0} onChange={e => handleChange(s.key, 'order', parseInt(e.target.value) || 0)}
                        className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-brand-500" min="0" />
                    </div>
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
