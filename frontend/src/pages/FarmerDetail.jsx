import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { cld } from '../lib/cloudinary'
import { generatePlaceholder } from '../lib/placeholders'
import SeoHead from '../components/SeoHead'

export default function FarmerDetail() {
  const { slug, code } = useParams()
  const identifier = slug || code
  const [farmer, setFarmer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!identifier) { setError('No identifier provided'); setLoading(false); return }
    const load = async () => {
      try {
        const result = slug ? await api.getFarmerBySlug(slug) : await api.getFarmerByQRCode(code)
        setFarmer(result?.farmer || result)
      } catch (err) {
        setError(err.message || 'Farmer not found')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [identifier, slug, code])

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-green-600" />
          <p className="text-body-sm text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !farmer) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 py-12 text-center bg-white">
        <div className="max-w-sm">
          <div className="mx-auto mb-5 h-20 w-20 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
          </div>
          <h1 className="font-heading text-h2 font-bold text-ink">Profile Unavailable</h1>
          <p className="mt-2 text-body-sm text-muted">{error || 'This link is invalid or the farmer profile is no longer available.'}</p>
          <Link to="/" className="mt-6 inline-flex rounded-xl bg-green-600 px-6 py-3 text-body-sm font-semibold text-white hover:bg-green-700 transition">Go to Homepage</Link>
        </div>
      </div>
    )
  }

  const photo = farmer.images?.[0] || ''
  const location = [farmer.village, farmer.district, farmer.state].filter(Boolean).join(', ')
  const crops = Array.isArray(farmer.products) ? farmer.products : (farmer.products ? farmer.products.split(',').map(s => s.trim()) : [])
  const certifications = Array.isArray(farmer.certifications) ? farmer.certifications : (farmer.certifications ? farmer.certifications.split(',').map(s => s.trim()) : [])

  return (
    <div className="min-h-screen bg-white">
      <SeoHead title={farmer.name} description={`Meet ${farmer.name} — a farmer partnered with HaiFarmer.`} noindex />

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-green-800/60 to-green-800/90" />
        <div className="relative h-56 sm:h-72 overflow-hidden bg-green-700">
          {photo ? (
            <img src={cld(photo, 'f_auto,q_auto,w_800,h_500,c_fill,g_face')} alt={farmer.name}
              className="h-full w-full object-cover opacity-70"
              onError={(e) => { if (!e.currentTarget.dataset.fallback) { e.currentTarget.dataset.fallback = 'true'; e.currentTarget.style.display = 'none' } }} />
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-6 pt-16 bg-gradient-to-t from-green-900/90 to-transparent">
          <div className="mx-auto max-w-lg">
            <h1 className="font-heading text-[28px] font-bold text-white leading-tight">{farmer.name}</h1>
            {location && <p className="mt-1 text-body-sm text-white/70">{location}</p>}
          </div>
        </div>

        {photo && (
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 z-10">
            <img src={cld(photo, 'f_auto,q_auto,w_160,h_160,c_fill,g_face')} alt={farmer.name}
              className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-lg" />
          </div>
        )}
      </div>

      <div className="mx-auto max-w-lg px-5 pt-14 pb-10 space-y-6">
        {farmer.bio && (
          <div>
            <h2 className="text-caption font-semibold uppercase tracking-[0.1em] text-muted mb-2">About</h2>
            <p className="text-body-sm text-ink leading-relaxed whitespace-pre-line">{farmer.bio}</p>
          </div>
        )}

        {crops.length > 0 && (
          <div>
            <h2 className="text-caption font-semibold uppercase tracking-[0.1em] text-muted mb-2">Crops Grown</h2>
            <div className="flex flex-wrap gap-2">
              {crops.map((crop, i) => (
                <span key={i} className="rounded-full bg-green-50 px-3.5 py-1.5 text-caption font-medium text-green-700">{crop}</span>
              ))}
            </div>
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <h2 className="text-caption font-semibold uppercase tracking-[0.1em] text-muted mb-2">Certifications</h2>
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3.5 py-1.5 text-caption font-medium text-amber-700">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {farmer.phone && (
          <div className="border-t border-border pt-5">
            <p className="text-body-sm text-muted text-center">
              This product was grown and harvested by{' '}
              <span className="font-semibold text-ink">{farmer.name}</span>
              {location && <> from <span className="font-semibold text-ink">{location}</span></>}.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link to="/products" className="rounded-xl bg-green-600 px-5 py-2.5 text-body-sm font-semibold text-white hover:bg-green-700 transition flex items-center gap-2">
                Browse Products
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
