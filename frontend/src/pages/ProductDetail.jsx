import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import SeoHead from '../components/SeoHead'
import { formatPrice, getImageUrl, getImageProps, getImageSizes } from '../lib/utils'
import { generatePlaceholder } from '../lib/placeholders'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { useCart } from '../contexts/CartContext'
import ProductCard from '../components/ProductCard'
import HorizontalScroll from '../components/HorizontalScroll'
import { isDemoMode } from '../lib/withDemoFallback'
import { getItems } from '../lib/demoStore'
import { api } from '../lib/api'
import { toast } from 'react-toastify'
import { demoProducts } from '../lib/demoData'

const DEFAULT_BENEFITS = [
  { icon: '🛡️', label: 'Immunity Boost' },
  { icon: '🫐', label: 'Rich in Antioxidants' },
  { icon: '🧪', label: 'Chemical-Free' },
  { icon: '🌿', label: '100% Natural' },
]

function slugify(name) {
  return (name || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

const DEFAULT_TABS = [
  { key: 'howtouse', label: 'How to Use', content: 'Take 1-2 tablespoons daily. Can be taken directly, mixed with warm water or herbal tea, used as a natural sweetener in recipes, or applied topically for skin and hair care.' },
  { key: 'description', label: 'Description', content: 'Wild forest honey is packed with natural antioxidants, antibacterial properties, and essential vitamins. It supports immunity, aids digestion, and provides sustained energy. Sourced from pristine forests, it retains all its natural goodness without any processing.' },
  { key: 'manufacturer', label: 'Manufacturer Information', content: (
    <div className="space-y-1">
      <p><span className="font-semibold text-ink">Shelf Life:</span> 24 months from date of manufacture</p>
      <p><span className="font-semibold text-ink">Product Dimensions:</span> As per pack size selected</p>
      <p><span className="font-semibold text-ink">Manufacturer:</span> HaiFarmer Foods Pvt. Ltd.</p>
      <p><span className="font-semibold text-ink">Manufacturer Address:</span> Kandhamal, Odisha, India</p>
      <p><span className="font-semibold text-ink">Country of Origin:</span> India</p>
    </div>
  )},
]

export default function ProductDetail() {
  const { slug } = useParams()
  const { settings } = useSiteSettings()
  const { cartItems, addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('howtouse')
  const [relatedProducts, setRelatedProducts] = useState([])
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!slug) return
      try {
        if (isDemoMode()) {
          const saved = getItems('products')
          const all = [...saved, ...demoProducts]
          const found = all.find(p => slugify(p.name) === slug)
          if (found) {
            setProduct(found)
            const variants = found.variants || found.product_variants || []
            if (variants.length) setSelectedVariant(variants[0])
          }
          setLoading(false)
          return
        }
        const data = await api.getProduct(slug)
        console.log('ProductDetail: slug=', slug, 'data=', data ? 'found' : 'null')
        if (!data) { console.warn('ProductDetail: API returned null for slug:', slug); toast.error('Product not found in database'); setLoading(false); return }
        setProduct(data)
        if (data?.variants?.length) {
          const firstInStock = data.variants.find(v => v.stock === undefined || Number(v.stock) > 0) || data.variants[0]
          setSelectedVariant(firstInStock)
        }
        const related = await api.getProducts({ limit: 8, category: data?.category, sort: 'created_at' })
        setRelatedProducts((related?.data || []).filter(p => p._id !== data?._id))
      } catch (e) {
        console.error('ProductDetail error:', e)
        toast.error(e.message || 'Failed to load product')
        if (!isDemoMode()) {
          try {
            const all = await api.getProducts({ limit: 100, active: 'all' })
            const found = (all?.data || []).find(p => slugify(p.name) === slug || p.slug === slug)
            if (found) { setProduct(found); setSelectedVariant(found.variants?.[0]); toast.success('Product loaded via fallback') }
          } catch (e2) { console.error('Fallback error:', e2) }
        }
      }
      finally { setLoading(false) }
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-green-600" />
    </div>
  )

  if (!product) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-body-lg font-semibold text-ink">Product not found</p>
        <Link to="/products" className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-full text-body-sm font-semibold hover:bg-green-700 transition-colors">Back to Products</Link>
      </div>
    </div>
  )

  const images = product.galleryImages?.length ? product.galleryImages : (product.images?.length ? product.images : [product.image_url])
  const mainImgProps = getImageProps(images[selectedImg], { width: 900, sizes: getImageSizes([1024, 768]), priority: true })
  const price = selectedVariant?.price ?? product.base_price ?? product.price
  const mrp = selectedVariant?.original_price ?? selectedVariant?.originalPrice ?? selectedVariant?.mrp ?? product.mrp ?? price
  const savings = mrp - price
  const categoryTag = product.category_tag || product.harvest_type || product.badge || product.category_name || (typeof product.category === 'string' ? product.category : product.category?.name) || ''
  const benefits = product.benefits?.length ? product.benefits : DEFAULT_BENEFITS
  const tabs = product.infoTabs?.length ? product.infoTabs : DEFAULT_TABS.map(t => ({
    ...t,
    content: t.key === 'description' && product.description ? product.description : t.content,
    content: t.key === 'howtouse' && product.howToUse ? product.howToUse : t.content,
    content: t.key === 'manufacturer' && product.manufacturerInfo ? product.manufacturerInfo : t.content,
  }))
  const variants = product.product_variants || product.variants || []
  const hasVariants = variants.length > 1

  const pid = product.id || product._id
  const cartItem = cartItems?.find(item => {
    const itemPid = item.product_id ?? item.product?._id ?? item.product?.id ?? null
    if (String(itemPid) !== String(pid)) return false
    const itemVid = item.variant_id ?? item.variant?._id ?? null
    return String(itemVid) === String(selectedVariant?._id || selectedVariant?.id)
  })
  const inCartQty = cartItem?.quantity || 0

  const handleAddToCart = async () => {
    await addToCart({ product_id: pid, variant_id: selectedVariant?._id || selectedVariant?.id, quantity, product, variant: selectedVariant })
  }

  const getVariantSavings = (v) => {
    const vPrice = v.price || price
    const vMrp = v.original_price || v.originalPrice || v.mrp || mrp
    return vMrp - vPrice
  }

  return (
    <div className="bg-[#FFFDF9] min-h-screen">
      <SeoHead title={product.name} description={product.description || product.tagline} ogImage={images[0]} />

      <div className="border-b border-border">
        <div className="section-container py-3">
          <div className="flex items-center gap-2 text-caption text-muted">
            <Link to="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-green-600">All Products</Link>
            {product.category && <><span>/</span><Link to={`/products?category=${typeof product.category === 'string' ? product.category : product.category?.slug || ''}`} className="hover:text-green-600">{typeof product.category === 'string' ? product.category : product.category?.name}</Link></>}
            <span>/</span>
            <span className="text-ink font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="section-container py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Gallery */}
          <div>
            <button onClick={() => setLightboxOpen(true)} className="bg-[#F0E6D3] rounded-2xl overflow-hidden relative w-full block cursor-zoom-in">
              <img src={mainImgProps.src} alt={product.name} loading="eager" fetchpriority="high"
                srcSet={mainImgProps.srcSet} sizes={mainImgProps.sizes}
                className="w-full aspect-square object-contain object-center p-8" />
              <span className="absolute top-3 left-3 text-caption text-muted bg-white/80 rounded-full px-3 py-1">{selectedImg + 1} / {images.length}</span>
              <span className="absolute top-3 right-3 text-muted bg-white/80 rounded-full p-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
              </span>
            </button>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
                {images.map((img, i) => {
                  const thumbProps = getImageProps(img, { width: 120, sizes: '64px' })
                  return (
                    <button key={i} onClick={() => setSelectedImg(i)}
                      className={`shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden bg-[#F0E6D3] transition-all ${selectedImg === i ? 'border-[#0E9F3E]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={thumbProps.src} alt="" loading="lazy" className="w-full h-full object-contain object-center p-1" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            {categoryTag && <span className="text-micro font-semibold tracking-[0.1em] uppercase text-[#0E9F3E]">{categoryTag}</span>}
            <h1 className="font-heading text-h1 font-bold text-ink tracking-tight text-center">{product.name}</h1>
            {product.tagline && <p className="text-body-sm text-muted leading-relaxed">{product.tagline}</p>}

            {/* Key Benefits */}
            {benefits.length > 0 && (
              <div>
                <h3 className="font-heading text-h4 font-bold text-ink mb-3">Key Benefits</h3>
                <div className="grid grid-cols-2 gap-3">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-[#F0E6D3] p-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-xl">
                        {b.icon}
                      </div>
                      <span className="font-product text-caption font-semibold leading-snug text-ink">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-border" />

            {/* Select Pack Size */}
            {hasVariants && (
              <div>
                <h3 className="font-heading text-h4 font-bold text-ink mb-3">Select Pack Size</h3>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const vid = v.id || v._id
                    const isSelected = (selectedVariant?.id || selectedVariant?._id) === vid
                    const outOfStock = v.stock !== undefined && Number(v.stock) <= 0
                    const vPrice = v.price || price
                    const vMrp = v.original_price || v.originalPrice || v.mrp || mrp
                    const vLabel = v.weight_label || v.weightLabel || v.name || v.unit || 'Default'
                    return (
                      <button key={vid} onClick={() => !outOfStock && setSelectedVariant(v)} disabled={outOfStock}
                        className={`relative rounded-xl border-2 px-4 py-3 text-left transition-all font-product flex-1 min-w-[120px] ${
                          isSelected
                            ? 'border-[#0E9F3E] bg-[#0E9F3E]/5 text-[#0E9F3E]'
                            : outOfStock
                              ? 'border-border text-gray-300 cursor-not-allowed'
                              : 'border-[#222] text-ink hover:border-[#0E9F3E]'
                        }`}>
                        <span className="block text-body-sm font-semibold">{vLabel}</span>
                        <span className={`block mt-0.5 text-caption ${isSelected ? 'text-[#0E9F3E]' : outOfStock ? 'text-gray-300' : 'text-muted'}`}>
                          {formatPrice(vPrice)}{vMrp > vPrice ? `  MRP ${formatPrice(vMrp)}` : ''}
                        </span>
                        {outOfStock && <span className="block text-caption text-gray-300 mt-0.5">Out of stock</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Price summary for selected variant */}
            <div className="flex items-baseline gap-3">
              <span className="font-product text-price-lg font-bold text-ink">{formatPrice(price)}</span>
              {mrp > price && <span className="font-product text-price text-gray-400 line-through">{formatPrice(mrp)}</span>}
              {savings > 0 && <span className="font-product text-caption font-semibold text-[#0E9F3E]">You save {formatPrice(savings)}</span>}
            </div>

            {/* Buy row */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 items-center rounded-full border-2 border-[#222] bg-white">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="flex h-full w-12 items-center justify-center text-body-lg font-bold text-ink hover:text-[#0E9F3E] transition font-product">−</button>
                <span className="min-w-[2.5rem] text-center font-product text-body font-semibold text-ink">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="flex h-full w-12 items-center justify-center text-body-lg font-bold text-ink hover:text-[#0E9F3E] transition font-product">+</button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 h-12 rounded-full bg-[#F5A623] font-product text-btn font-bold text-[#1a1a1a] hover:bg-[#E89B1C] transition-colors active:scale-[0.98]">
                Add to Cart{inCartQty > 0 ? ` (${inCartQty} in cart)` : ''}
              </button>
            </div>
            {inCartQty > 0 && (
              <Link to="/cart" className="proceed-in mt-3 flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#0E9F3E]/10 font-product text-caption font-bold text-[#0E9F3E] transition-colors hover:bg-[#0E9F3E] hover:text-white">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                Proceed to Cart ({inCartQty} item{inCartQty > 1 ? 's' : ''} in cart)
              </Link>
            )}
          </div>
        </div>

        {/* Info tabs */}
        <div className="mt-12 border-t border-border pt-8">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 rounded-full px-5 py-2.5 font-product text-caption font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#0E9F3E] text-white'
                    : 'border-2 border-border text-ink hover:border-[#0E9F3E] hover:text-[#0E9F3E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-[#FAF3E8] p-6 text-body-sm text-muted leading-relaxed">
            {tabs.find(t => t.key === activeTab)?.content || ''}
          </div>
        </div>

        {/* Banner */}
        <div className="mt-8 rounded-2xl overflow-hidden bg-[#F0E6D3]">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 lg:p-10 flex flex-col justify-center">
              <h3 className="font-heading text-h3 font-bold text-ink text-center">Our Farmers Are the Heart of Our Purpose</h3>
              <p className="text-body-sm text-muted mt-3 leading-relaxed">This product is sourced directly from tribal farming communities who have cultivated the land for generations using traditional, sustainable methods. Every purchase supports their livelihoods and preserves ancient knowledge.</p>
              <Link to="/farmers" className="mt-4 text-body-sm font-semibold text-[#0E9F3E] hover:text-[#0B8A34] transition-colors">Meet the Farmers →</Link>
            </div>
            <div className="bg-[#F8F4EE] min-h-[200px] flex items-center justify-center">
              <img src={generatePlaceholder('farmer-card')} alt="Farmer" className="w-24 h-24 rounded-full object-cover" />
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h3 className="font-heading text-h3 font-bold text-ink mb-6 text-center">You may also like</h3>
            <HorizontalScroll>
              {relatedProducts.slice(0, 8).map((p, i) => (
                <div key={p.id || p._id} className="min-w-[200px] sm:min-w-[220px] lg:min-w-[240px] w-[200px] sm:w-[220px] lg:w-[240px] shrink-0">
                  <ProductCard product={p} priority={i < 2} />
                </div>
              ))}
            </HorizontalScroll>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 text-white/80 hover:text-white z-10" aria-label="Close">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); setSelectedImg(prev => (prev - 1 + images.length) % images.length) }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 disabled:opacity-30" disabled={images.length <= 1} aria-label="Previous">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); setSelectedImg(prev => (prev + 1) % images.length) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 disabled:opacity-30" disabled={images.length <= 1} aria-label="Next">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <img src={getImageUrl(images[selectedImg])} alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-body-sm">{selectedImg + 1} / {images.length}</div>
        </div>
      )}
    </div>
  )
}
