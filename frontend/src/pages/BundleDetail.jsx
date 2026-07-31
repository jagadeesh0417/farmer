import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { isDemoMode } from '../lib/withDemoFallback'
import { demoCombos } from '../lib/demoData'
import { api } from '../lib/api'
import SeoHead from '../components/SeoHead'
import { formatPrice, getImageUrl } from '../lib/utils'
import { generatePlaceholder } from '../lib/placeholders'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { useCart } from '../contexts/CartContext'
import BundleCard from '../components/BundleCard'

const toSlug = (str) => (str || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

export default function BundleDetail() {
  const { slug } = useParams()
  const { settings } = useSiteSettings()
  const { addToCart, removeFromCart, cartItems } = useCart()
  const [bundle, setBundle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [relatedBundles, setRelatedBundles] = useState([])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedImg, setSelectedImg] = useState(0)

  useEffect(() => {
    const load = async () => {
      if (!slug) return
      if (isDemoMode()) {
        const found = demoCombos.find(b => {
          const id = b._id || b.id
          return id === slug || toSlug(b.bundle_name || b.name) === slug
        })
        setBundle(found || null)
        setRelatedBundles(demoCombos.filter(b => (b._id || b.id) !== (found?._id || found?.id)).slice(0, 4))
        setLoading(false)
        return
      }
      try {
        const data = await api.getBundle(slug)
        setBundle(data || null)
        const all = await api.getBundles({ combo: 'true', limit: 50 })
        const list = Array.isArray(all) ? all : all?.data || []
        setRelatedBundles(list.filter(b => (b._id || b.id) !== (data?._id || data?.id)).slice(0, 4))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-green-600" />
    </div>
  )

  if (!bundle) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#FFFDF9]">
      <div className="text-center">
        <p className="text-body-lg font-semibold text-ink">Bundle not found</p>
        <Link to="/combos" className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-full text-body-sm font-semibold hover:bg-green-700 transition-colors">Back to Combos</Link>
      </div>
    </div>
  )

  const name = bundle.bundle_name || bundle.name
  const image = bundle.bundle_image_url || bundle.image || bundle.image_url
  const description = bundle.bundle_description || bundle.description
  const price = bundle.bundle_price || bundle.price
  const discountPct = bundle.bundle_discount_percent || bundle.discountPercent || 0
  const items = bundle.bundle_items || bundle.items || []
  const id = bundle._id || bundle.id

  const imgSrc = getImageUrl(image, settings?.placeholder_image)
  const originalTotal = items.reduce((sum, item) => sum + (item.price || item.variant?.price || 0) * (item.quantity || 1), 0)
  const bundlePrice = discountPct > 0 && originalTotal > 0
    ? Number((originalTotal - originalTotal * discountPct / 100).toFixed(2))
    : Number(price || originalTotal)
  const savings = originalTotal - bundlePrice
  const cartItem = cartItems?.find(item => item.bundle_id === id || item.bundle?._id === id)
  const isInCart = Boolean(cartItem)
  const inCartQty = cartItem?.quantity || 0

  const images = [imgSrc].filter(Boolean)

  const getContainsList = () => {
    if (!description) return []
    const idx = description.indexOf('[CONTAINS]')
    if (idx === -1) return []
    return description.substring(idx + 10).split(',').map(s => s.trim()).filter(Boolean)
  }
  const containsList = getContainsList()
  const displayDesc = description ? description.split('[CONTAINS]')[0].trim() : ''

  const tabs = [
    { key: 'description', label: 'Description', content: displayDesc || 'Curated bundle of natural products.' },
    { key: 'contains', label: 'Contains', content: containsList.length > 0
      ? containsList.map((item, i) => <div key={i} className="flex items-center gap-2 text-body-sm text-muted"><span className="text-green-600 font-bold">✓</span>{item}</div>)
      : 'Product listing available on the product page.' },
    { key: 'tags', label: 'Tags', content: (
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-green-50 px-3 py-1.5 text-caption font-medium text-green-700">100% Natural</span>
        <span className="rounded-full bg-green-50 px-3 py-1.5 text-caption font-medium text-green-700">Chemical Free</span>
        <span className="rounded-full bg-green-50 px-3 py-1.5 text-caption font-medium text-green-700">Direct from Farmers</span>
      </div>
    )},
  ]

  const handleAddToCart = async () => {
    if (isInCart) {
      await removeFromCart(cartItem.id)
    } else {
      await addToCart({ bundle_id: id, quantity, bundle: { ...bundle, _id: id, name, price: bundlePrice, bundle_price: bundlePrice, image, discountPercent: discountPct, items } })
    }
  }

  return (
    <div className="bg-[#FFFDF9] min-h-screen">
      <SeoHead title={name} description={displayDesc || description} ogImage={image} />

      <div className="border-b border-border">
        <div className="section-container py-3">
          <div className="flex items-center gap-2 text-caption text-muted">
            <Link to="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link to="/combos" className="hover:text-green-600">Combos</Link>
            <span>/</span>
            <span className="text-ink font-medium truncate">{name}</span>
          </div>
        </div>
      </div>

      <div className="section-container py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Gallery */}
          <div>
            <button onClick={() => setLightboxOpen(true)} className="bg-[#F0E6D3] rounded-2xl overflow-hidden relative w-full block cursor-zoom-in">
              <img src={imgSrc} alt={name} loading="eager" fetchpriority="high"
                className="w-full aspect-square object-contain object-center p-8" />
            </button>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <span className="text-micro font-semibold tracking-[0.1em] uppercase text-[#0E9F3E]">Best Value Bundle</span>
            <h1 className="font-heading text-h1 font-bold text-ink tracking-tight text-center">{name}</h1>
            {displayDesc && <p className="text-body-sm text-muted leading-relaxed">{displayDesc}</p>}

            <div className="border-t border-border" />

            {/* Item count + product list */}
            <div>
              <h3 className="font-heading text-h4 font-bold text-ink mb-3">Contains ({items.length} items)</h3>
              <div className="space-y-2">
                {items.slice(0, 6).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-[#F0E6D3] p-3">
                    {item.image ? (
                      <img src={getImageUrl(item.image)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-muted text-xs">img</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-product text-caption font-semibold text-ink truncate">{item.name || item.variantName || `Product ${i + 1}`}</p>
                      <p className="text-caption text-muted">Qty: {item.quantity || 1}</p>
                    </div>
                  </div>
                ))}
                {items.length > 6 && (
                  <p className="text-caption font-medium text-green-600">+{items.length - 6} more items</p>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-product text-price-lg font-bold text-ink">{formatPrice(bundlePrice)}</span>
              {originalTotal > bundlePrice && <span className="font-product text-price text-gray-400 line-through">{formatPrice(originalTotal)}</span>}
              {savings > 0 && <span className="font-product text-caption font-semibold text-[#0E9F3E]">Save {formatPrice(savings)}</span>}
            </div>

            {/* Buy row */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 items-center rounded-full border-2 border-[#222] bg-white">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="flex h-full w-12 items-center justify-center text-body-lg font-bold text-ink hover:text-[#0E9F3E] transition font-product">−</button>
                <span className="min-w-[2.5rem] text-center font-product text-body font-semibold text-ink">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="flex h-full w-12 items-center justify-center text-body-lg font-bold text-ink hover:text-[#0E9F3E] transition font-product">+</button>
              </div>
              <button onClick={handleAddToCart}
                className={`flex-1 h-12 rounded-full font-product text-btn font-bold text-white transition-colors active:scale-[0.98] ${isInCart ? 'bg-green-700 hover:bg-green-800' : 'bg-[#0E9F3E] hover:bg-[#0B8A34]'}`}>
                {isInCart ? `Remove from Cart (${inCartQty})` : 'Add to Cart'}
              </button>
            </div>
            {isInCart && (
              <Link to="/cart" className="proceed-in flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#0E9F3E]/10 font-product text-caption font-bold text-[#0E9F3E] transition-colors hover:bg-[#0E9F3E] hover:text-white">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                Proceed to Cart
              </Link>
            )}
          </div>
        </div>

        {/* Info tabs */}
        <div className="mt-12 border-t border-border pt-8">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 rounded-full px-5 py-2.5 font-product text-caption font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#0E9F3E] text-white'
                    : 'border-2 border-border text-ink hover:border-[#0E9F3E] hover:text-[#0E9F3E]'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-[#FAF3E8] p-6 text-body-sm text-muted leading-relaxed">
            {tabs.find(t => t.key === activeTab)?.content || ''}
          </div>
        </div>

        {/* Related combos */}
        {relatedBundles.length > 0 && (
          <div className="mt-12">
            <h3 className="font-heading text-h3 font-bold text-ink mb-6 text-center">You may also like</h3>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedBundles.slice(0, 4).map((b, i) => <BundleCard key={b._id || b.id} bundle={b} />)}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 text-white/80 hover:text-white z-10" aria-label="Close">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={getImageUrl(images[selectedImg])} alt={name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
