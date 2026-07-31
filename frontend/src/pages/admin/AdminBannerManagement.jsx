import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const BANNER_SECTIONS = [
  { key: 'hero1', sectionName: 'Hero Banner 1', group: 'Hero' },
  { key: 'hero2', sectionName: 'Hero Banner 2', group: 'Hero' },
  { key: 'hero3', sectionName: 'Hero Banner 3', group: 'Hero' },
  { key: 'promotional', sectionName: 'Promotional Banner', group: 'Homepage' },
  { key: 'shopByCategory', sectionName: 'Shop by Category Banner', group: 'Homepage' },
]

const SECTION_DIMS = {
  hero1: { desktop: { width: 1920, height: 700, label: '1920 × 700 px' }, tablet: { width: 1600, height: 700, label: '1600 × 700 px' }, mobile: { width: 1080, height: 1350, label: '1080 × 1350 px (4:5)' } },
  hero2: { desktop: { width: 1920, height: 700, label: '1920 × 700 px' }, tablet: { width: 1600, height: 700, label: '1600 × 700 px' }, mobile: { width: 1080, height: 1350, label: '1080 × 1350 px (4:5)' } },
  hero3: { desktop: { width: 1920, height: 700, label: '1920 × 700 px' }, tablet: { width: 1600, height: 700, label: '1600 × 700 px' }, mobile: { width: 1080, height: 1350, label: '1080 × 1350 px (4:5)' } },
  promotional: { desktop: { width: 1600, height: 500, label: '1600 × 500 px' }, tablet: { width: 1600, height: 500, label: '1600 × 500 px' }, mobile: { width: 1080, height: 1080, label: '1080 × 1080 px (1:1)' } },
  shopByCategory: { desktop: { width: 1920, height: 700, label: '1920 × 700 px' }, tablet: { width: 1600, height: 700, label: '1600 × 700 px' }, mobile: { width: 1080, height: 1350, label: '1080 × 1350 px (4:5)' } },
}

function ratioOf(d) { return d ? d.width / d.height : 0 }

function loadImageMeta(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve({ width: img.naturalWidth, height: img.naturalHeight }) }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function BannerImageField({ label, dims, src, onUpload, onRemove }) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [meta, setMeta] = useState(null)
  const [ratioWarn, setRatioWarn] = useState(null)
  const inputRef = useRef(null)
  const recommendedRatio = ratioOf(dims)

  const validateAndUpload = useCallback(async (file) => {
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`Unsupported format: ${file.type || 'unknown'}. Use JPG, PNG, WebP or SVG.`)
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.warn(`Large file (${formatBytes(file.size)}). Recommended max ${MAX_SIZE_MB}MB — consider compressing for faster page loads.`)
    }
    setUploading(true)
    setMeta(null)
    setRatioWarn(null)
    try {
      const result = await onUpload(file)
      const img = await loadImageMeta(file)
      if (img) {
        setMeta({ width: img.width, height: img.height, size: file.size })
        const r = img.width / img.height
        const deviation = Math.abs(r - recommendedRatio) / recommendedRatio
        if (deviation > 0.15) {
          setRatioWarn(`Aspect ratio is ${(r).toFixed(2)}:1 — recommended ${dims.label} (${(recommendedRatio).toFixed(2)}:1). It may look stretched or cropped.`)
        }
      }
      return result
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [onUpload, dims, recommendedRatio])

  const handleFiles = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    validateAndUpload(file)
    if (e.target) e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    validateAndUpload(e.dataTransfer?.files?.[0])
  }

  const aspect = recommendedRatio > 0 ? `${(1 / recommendedRatio) * 100}%` : '60%'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <span className="text-[10px] font-medium text-slate-400">{dims.label} · {dims.width / dims.height >= 1 ? 'landscape' : 'portrait'} · max {MAX_SIZE_MB}MB · JPG/PNG/WebP</span>
      </div>

      {src ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <div className="w-full relative bg-slate-100" style={{ paddingTop: aspect }}>
            <img src={src} alt={`${label} preview`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="flex items-center justify-between gap-2 bg-slate-50 px-2 py-1.5 border-t border-slate-100">
            {meta ? (
              <span className="text-[10px] text-slate-400">{meta.width} × {meta.height}px · {formatBytes(meta.size)}</span>
            ) : (
              <span className="text-[10px] text-slate-400">Crop preview at {dims.label}</span>
            )}
            <div className="flex gap-1.5">
              <button type="button" onClick={() => inputRef.current?.click()}
                className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-300 transition">Replace</button>
              <button type="button" onClick={onRemove}
                className="rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-red-700 transition">Remove</button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label={`Upload ${label}`}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
          className={`w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-slate-400 cursor-pointer transition ${dragOver ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-300 hover:border-brand-400 hover:text-brand-600'}`}
          style={{ paddingTop: aspect }}>
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              <span className="text-xs">Uploading…</span>
            </div>
          ) : (
            <>
              <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
              <span className="text-xs">Drag & drop or click to upload</span>
            </>
          )}
        </div>
      )}

      {ratioWarn && (
        <p className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-[11px] font-medium text-amber-700" role="alert">
          ⚠ {ratioWarn}
        </p>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleFiles} hidden />
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

  const handleUpload = async (file, key, kind) => {
    const result = await api.uploadImage(file, 'haifarmer/banners')
    handleChange(key, `${kind}Image`, result.url)
    handleChange(key, `${kind}PublicId`, result.publicId)
    toast.success(`${kind === 'desktop' ? 'Desktop' : 'Mobile'} image uploaded`)
    return result
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
        buttonLink: b.buttonLink || '/products',
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
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Banner Management</h1>
      <p className="text-sm text-slate-500 mb-6">Upload banners with the recommended dimensions. Unsupported formats are rejected; oversized or wrong-aspect images show warnings.</p>

      {Object.entries(groups).map(([group, sections]) => (
        <div key={group} className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">{group}</h2>
          <div className="grid gap-4">
            {sections.map(s => {
              const b = banners[s.key] || {}
              const dims = SECTION_DIMS[s.key] || SECTION_DIMS.hero1
              return (
                <div key={s.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{s.sectionName}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Desktop: {dims.desktop.label} · Tablet: {dims.tablet.label} · Mobile: {dims.mobile.label}
                      </p>
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={b.enabled !== false} onChange={e => handleChange(s.key, 'enabled', e.target.checked)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                      Enabled
                    </label>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <BannerImageField
                      label="Desktop Image"
                      dims={dims.desktop}
                      src={b.desktopImage}
                      onUpload={(file) => handleUpload(file, s.key, 'desktop')}
                      onRemove={() => { handleChange(s.key, 'desktopImage', ''); handleChange(s.key, 'desktopPublicId', '') }} />

                    <BannerImageField
                      label="Mobile Image"
                      dims={dims.mobile}
                      src={b.mobileImage}
                      onUpload={(file) => handleUpload(file, s.key, 'mobile')}
                      onRemove={() => { handleChange(s.key, 'mobileImage', ''); handleChange(s.key, 'mobilePublicId', '') }} />
                  </div>

                  {/* Banner link */}
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Banner link URL</label>
                    <input value={b.buttonLink || ''} onChange={e => handleChange(s.key, 'buttonLink', e.target.value)} placeholder="e.g. /products or /combos" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
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
