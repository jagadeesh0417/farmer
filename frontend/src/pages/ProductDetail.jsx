import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import SeoHead from '../components/SeoHead'
import { formatPrice, getImageUrl, getImageProps, getImageSizes } from '../lib/utils'
import { generatePlaceholder } from '../lib/placeholders'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { useCart } from '../contexts/CartContext'
import ProductCard from '../components/ProductCard'

const DEFAULT_BENEFITS = [
  { icon: '🛡️', label: 'Immunity Boost' },
  { icon: '🫐', label: 'Rich in Antioxidants' },
  { icon: '🧪', label: 'Chemical-Free' },
  { icon: '🌿', label: '100% Natural' },
]

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
  const packSizeRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      if (!slug) return
      try {
        const { getProductBySlug } = await import('../lib/productService')
        const data = await getProductBySlug(slug)
        setProduct(data)
        if (data?.product_variants?.length) setSelectedVariant(data.product_variants[0])
        const { getProducts } = await import('../lib/productService')
        const related = await getProducts(1, 4, data?.category || null, null, 'created_at', false)
        setRelatedProducts((related?.data || []).filter(p => p.id !== data?.id))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [slug])

  const scrollPackSizes = (dir) => {
    if (packSizeRef.current) {
      packSizeRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' })
    }
  }

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
  const categoryTag = product.category_tag || product.harvest_type || product.badge || product.category_name || product.category || ''
  const benefits = product.benefits?.length ? product.benefits : DEFAULT_BENEFITS
  const tabs = product.infoTabs?.length ? product.infoTabs : DEFAULT_TABS.map(t => ({
    ...t,
    content: t.key === 'description' && product.description ? product.description : t.content,
    content: t.key === 'howtouse' && product.howToUse ? product.howToUse : t.content,
    content: t.key === 'manufacturer' && product.manufacturerInfo ? product.manufacturerInfo : t.content,
  }))
  const variants = product.product_variants || product.variants || []
  const hasVariants = variants.length > 1

  const cartItem = cartItems?.find(item => item.product_id === product.id && item.variant_id === selectedVariant?.id)
  const inCartQty = cartItem?.quantity || 0

  const handleAddToCart = async () => {
    await addToCart({ product_id: product.id, variant_id: selectedVariant?.id, quantity, product, variant: selectedVariant })
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
            {product.category && <><span>/</span><Link to={`/products?category=${product.category_slug || ''}`} className="hover:text-green-600">{product.category}</Link></>}
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
            <h1 className="font-heading text-h1 font-bold text-ink tracking-tight">{product.name}</h1>
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading text-h4 font-bold text-ink">Select Pack Size</h3>
                  <div className="flex gap-1">
                    <button onClick={() => scrollPackSizes(-1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted hover:text-ink transition">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => scrollPackSizes(1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted hover:text-ink transition">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div ref={packSizeRef} className="flex gap-3 overflow-x-auto hide-scrollbar pb-2" role="radiogroup" aria-label="Pack size options">
                    {variants.map((v, i) => {
                      const vid = v.id || v._id
                      const isSelected = vid === selectedVariant?.id
                      const vPrice = v.price || price
                      const vMrp = v.original_price || v.originalPrice || v.mrp || mrp
                      const vSavings = vMrp - vPrice
                      const vLabel = v.weight_label || v.weightLabel || v.name || v.unit || 'Default'
                      const isBestSeller = v.isBestSeller || v.is_best_seller || false

                      return (
                        <button
                          key={vid}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={isSelected ? 0 : -1}
                          onClick={() => {
                            const found = variants.find(x => (x.id || x._id) === vid)
                            if (found) setSelectedVariant(found)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                              e.preventDefault()
                              const dir = e.key === 'ArrowRight' ? 1 : -1
                              const nextIdx = (i + dir + variants.length) % variants.length
                              const nextV = variants[nextIdx]
                              if (nextV) setSelectedVariant(nextV)
                            }
                          }}
                          className={`relative shrink-0 w-[160px] rounded-xl overflow-hidden border-2 transition-all ${
                            isSelected ? 'border-[#0E9F3E] shadow-md' : 'border-transparent'
                          }`}
                        >
                          {isBestSeller && (
                            <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 z-10 rounded-full bg-[#F5A623] px-2 py-0.5 text-micro font-bold text-[#1a1a1a] shadow-sm">
                              Best Seller
                            </span>
                          )}
                          <div className={`px-3 py-2 text-center ${isSelected ? 'bg-[#0E9F3E]' : 'bg-[#F0E6D3]'}`}>
                            <span className={`font-product text-body-sm font-bold ${isSelected ? 'text-white' : 'text-ink'}`}>{vLabel}</span>
                          </div>
                          <div className="bg-[#FAF3E8] px-3 py-3 text-center">
                            <span className="font-product text-body font-bold text-ink">{formatPrice(vPrice)}</span>
                            {vMrp > vPrice && (
                              <span className="ml-1.5 font-product text-caption text-gray-400 line-through">{formatPrice(vMrp)}</span>
                            )}
                            {vSavings > 0 && (
                              <div className="mt-2">
                                <span className="inline-block rounded-full bg-[#1a1a1a] px-3 py-1 text-micro font-semibold text-white">
                                  Save {formatPrice(vSavings)}/-
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
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
              <h3 className="font-heading text-h3 font-bold text-ink">Our Farmers Are the Heart of Our Purpose</h3>
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
            <h3 className="font-heading text-h3 font-bold text-ink mb-6">You may also like</h3>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} priority={i < 2} />)}
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
