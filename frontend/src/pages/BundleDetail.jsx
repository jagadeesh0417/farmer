import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import SeoHead from '../components/SeoHead'
import { formatPrice, getImageUrl } from '../lib/utils'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { useCart } from '../contexts/CartContext'

function calculateBundlePrice(bundle) {
  const total = (Array.isArray(bundle?.items) ? bundle.items : []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0)
  if (total > 0) {
    const discountPct = Number(bundle?.discountPercent || 0)
    return Number((total - total * discountPct / 100).toFixed(2))
  }
  return Number(bundle?.price || 0)
}

export default function BundleDetail() {
  const { slug } = useParams()
  const { settings } = useSiteSettings()
  const { addToCart, removeFromCart, cartItems } = useCart()
  const [bundle, setBundle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!slug) return
      try {
        const data = await api.getBundle(slug)
        setBundle(data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-green-800/20 border-t-green-600" />
        <p className="mt-4 font-heading text-lg text-green-800/40 italic">HAiFarmer</p>
      </div>
    </div>
  )

  if (!bundle) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-white">
      <div className="text-center">
        <p className="font-heading text-2xl text-green-800/50 italic">Bundle not found</p>
        <Link to="/combos" className="mt-4 btn-font inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-all">Back to Combos</Link>
      </div>
    </div>
  )

  const imgSrc = getImageUrl(bundle.image, settings?.placeholder_image)
  const bundlePrice = calculateBundlePrice(bundle)
  const originalTotal = (bundle.items?.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)) || 0
  const cartItem = cartItems?.find(item => item.bundle_id === bundle._id || item.product?._id === bundle._id)
  const isInCart = Boolean(cartItem)

  const bundleSchema = bundle ? {
    '@context': 'https://schema.org', '@type': 'Product',
    name: bundle.name, description: bundle.description || 'Combo bundle',
    image: bundle.image,
    offers: { '@type': 'Offer', price: bundlePrice, priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
  } : null

  return (
    <div className="min-h-screen bg-white">
      <SeoHead title={bundle?.name} description={bundle?.description} ogImage={bundle?.image} schema={bundleSchema} canonical={`https://haifarmer.com/combos/${slug}`} />

      {/* Breadcrumb */}
      <div className="bg-green-50 border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-3 sm:px-8 lg:px-10">
          <div className="flex items-center gap-2 text-xs text-green-800/40">
            <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/combos" className="hover:text-green-600 transition-colors">Combos</Link>
            <span>/</span>
            <span className="text-green-800/70 font-medium">{bundle.name}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-green-100/20 via-green-50 to-green-100/10 border border-border shadow-lg img-zoom">
              <img src={imgSrc} alt={bundle.name} className="w-full h-[280px] sm:h-[400px] lg:h-[600px] object-cover" />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-green-600/10 px-4 py-1.5 text-xs font-semibold tracking-[0.08em] uppercase text-green-600 mb-3">Best Value Bundle</span>
              <h1 className="font-heading text-4xl font-bold text-ink sm:text-5xl tracking-tight">{bundle.name}</h1>
            </div>

            <div className="flex items-end gap-3">
              {originalTotal > bundlePrice && <span className="font-heading text-xl text-green-800/30 line-through">{formatPrice(originalTotal)}</span>}
              <span className="font-heading text-4xl font-bold text-ink">{formatPrice(bundlePrice)}</span>
              <span className="text-sm text-green-800/40 mb-1">+ shipping</span>
            </div>

            {bundle.description && (
              <p className="text-sm leading-relaxed text-green-800/60">{bundle.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <div className="rounded-xl bg-sage-300/20 px-4 py-2 text-xs font-semibold text-green-800 flex items-center gap-1.5">
                <span className="text-green-600">✦</span> 100% Natural
              </div>
              <div className="rounded-xl bg-sage-300/20 px-4 py-2 text-xs font-semibold text-green-800 flex items-center gap-1.5">
                <span className="text-green-600">✦</span> Chemical Free
              </div>
              <div className="rounded-xl bg-sage-300/20 px-4 py-2 text-xs font-semibold text-green-800 flex items-center gap-1.5">
                <span className="text-green-600">✦</span> Direct from Farmers
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink mb-3">Includes:</h3>
              <ul className="space-y-2">
                {bundle.items?.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-green-800/60">
                    <span className="text-green-600 font-bold">✓</span>
                    {item.variantName || item.product?.name || 'Product'} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={async () => { if (isInCart) await removeFromCart(cartItem.id); else await addToCart({ bundle_id: bundle._id, quantity: 1, bundle }) }}
              className={`btn-font w-full rounded-2xl py-4 text-base font-semibold tracking-[0.06em] uppercase text-white transition-all hover:-translate-y-1 shadow-xl btn-lift flex items-center justify-center gap-3 ${isInCart ? 'bg-green-800/80 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700 shadow-green-600/25'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2"/></svg>
              {isInCart ? 'Remove from cart' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
