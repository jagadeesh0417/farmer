import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import SeoHead from '../components/SeoHead'
import { formatPrice, getImageUrl } from '../lib/utils'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

export default function ProductDetail() {
  const { slug } = useParams()
  const { settings } = useSiteSettings()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!slug) return
      try {
        const { getProductBySlug } = await import('../lib/productService')
        const data = await getProductBySlug(slug)
        setProduct(data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-forest-900/20 border-t-terracotta-500"></div>
        <p className="mt-4 font-heading text-lg text-forest-900/40 italic">HAiFarmer</p>
      </div>
    </div>
  )

  if (!product) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-cream-50">
      <div className="text-center">
        <p className="font-heading text-2xl text-forest-900/50 italic">Product not found</p>
        <Link to="/products" className="mt-4 btn-font inline-flex items-center gap-2 rounded-xl bg-terracotta-500 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-terracotta-600 transition-all">Back to Products</Link>
      </div>
    </div>
  )

  const imgSrc = getImageUrl(product.images?.[0] || product.image_url, settings?.placeholder_image)
  const price = product.base_price || product.price

  const productSchema = product ? {
    '@context': 'https://schema.org', '@type': 'Product',
    name: product.name, description: product.description || product.tagline || '',
    image: product.images?.[0] || product.image_url,
    offers: { '@type': 'Offer', price, priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
  } : null

  return (
    <div className="min-h-screen bg-cream-50">
      <SeoHead title={product?.name} description={product?.description || product?.tagline} ogImage={product?.images?.[0] || product?.image_url} schema={productSchema} canonical={`https://haifarmer.com/products/${slug}`} />

      {/* Breadcrumb */}
      <div className="bg-cream-100 border-b border-border-warm">
        <div className="mx-auto max-w-7xl px-5 py-3 sm:px-8 lg:px-10">
          <div className="flex items-center gap-2 text-xs text-forest-900/40">
            <Link to="/" className="hover:text-terracotta-500 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-terracotta-500 transition-colors">Products</Link>
            <span>/</span>
            <span className="text-forest-900/70 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-sage-300/20 via-cream-50 to-sage-300/10 border border-border-warm shadow-lg img-zoom">
              <img src={imgSrc} alt={product.name} className="w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover" />
            </div>
            {product.product_variants && product.product_variants.length > 1 && (
              <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                {product.product_variants.map((v, i) => (
                  <div key={v.id} className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden border border-border-warm bg-cream-50">
                    <img src={imgSrc} alt={v.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              {product.category && (
                <span className="inline-flex items-center gap-2 rounded-full bg-terracotta-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-terracotta-500 mb-3">{product.category}</span>
              )}
              <h1 className="font-heading text-4xl font-bold text-text-dark sm:text-5xl tracking-tight">{product.name}</h1>
              {product.tagline && (
                <p className="mt-3 font-heading text-lg italic text-forest-900/50">&ldquo;{product.tagline}&rdquo;</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="font-heading text-4xl font-bold text-text-dark">{formatPrice(price)}</span>
              <span className="text-sm text-forest-900/40 mb-1">+ shipping</span>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              <div className="rounded-xl bg-sage-300/20 px-4 py-2 text-xs font-semibold text-forest-900 flex items-center gap-1.5">
                <span className="text-terracotta-500">✦</span> 100% Natural
              </div>
              <div className="rounded-xl bg-sage-300/20 px-4 py-2 text-xs font-semibold text-forest-900 flex items-center gap-1.5">
                <span className="text-terracotta-500">✦</span> Unfiltered
              </div>
              <div className="rounded-xl bg-sage-300/20 px-4 py-2 text-xs font-semibold text-forest-900 flex items-center gap-1.5">
                <span className="text-terracotta-500">✦</span> Ethically Sourced
              </div>
              <div className="rounded-xl bg-sage-300/20 px-4 py-2 text-xs font-semibold text-forest-900 flex items-center gap-1.5">
                <span className="text-terracotta-500">✦</span> Lab Tested
              </div>
            </div>

            {/* Variants */}
            {product.product_variants && product.product_variants.length > 1 && (
              <div>
                <p className="text-sm font-semibold text-text-dark mb-3">Choose Size:</p>
                <div className="flex flex-wrap gap-3">
                  {product.product_variants.map(v => (
                    <button key={v.id}
                      className="rounded-xl border-2 px-6 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5
                        border-terracotta-500 bg-terracotta-500/10 text-terracotta-500 shadow-sm">
                      {v.weight_label || v.name} — {formatPrice(v.price)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <button className="btn-font w-full rounded-2xl bg-terracotta-500 py-4 text-base font-semibold tracking-[0.06em] uppercase text-cream-50 transition-all hover:bg-terracotta-600 hover:-translate-y-1 shadow-xl shadow-terracotta-500/25 btn-lift flex items-center justify-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2"/></svg>
              Add to Cart
            </button>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-heading text-xl font-semibold text-text-dark mb-3">About This Product</h3>
                <p className="text-sm leading-relaxed text-forest-900/60">{product.description}</p>
              </div>
            )}

            {product.nutrition && (
              <div>
                <h3 className="font-heading text-xl font-semibold text-text-dark mb-3">Nutrition</h3>
                <p className="text-sm leading-relaxed text-forest-900/60">{product.nutrition}</p>
              </div>
            )}
          </div>
        </div>

        {/* Farmer story */}
        <div className="mt-16 rounded-3xl bg-forest-900 p-8 sm:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.03]">
            <svg viewBox="0 0 200 200" className="w-full h-full" fill="currentColor" color="#C8A96A"><circle cx="100" cy="100" r="80"/></svg>
          </div>
          <div className="relative z-10 grid gap-8 md:grid-cols-[1fr,2fr] items-center">
            <div className="flex flex-col items-center text-center md:text-left md:items-start">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-sage-300/30 to-forest-950 border border-gold-500/20 flex items-center justify-center mb-4">
                <span className="text-4xl">👨‍🌾</span>
              </div>
              <p className="font-heading text-lg text-gold-500 italic">&ldquo;Growing pure food, sustaining traditions.&rdquo;</p>
              <p className="mt-2 text-sm text-cream-50/40">— Our Tribal Farmers</p>
            </div>
            <div>
              <p className="text-base leading-relaxed text-cream-50/70">
                This product is sourced directly from tribal farming communities who have cultivated the land for generations 
                using traditional, sustainable methods. Every purchase supports indigenous farmers, preserves ancient agricultural 
                wisdom, and brings the purest food to your table.
              </p>
              <div className="mt-6 flex flex-wrap gap-6">
                <div>
                  <p className="font-heading text-xl font-bold text-gold-500">100%</p>
                  <p className="text-[10px] text-cream-50/40 uppercase tracking-wider">Natural</p>
                </div>
                <div>
                  <p className="font-heading text-xl font-bold text-gold-500">0</p>
                  <p className="text-[10px] text-cream-50/40 uppercase tracking-wider">Chemicals</p>
                </div>
                <div>
                  <p className="font-heading text-xl font-bold text-gold-500">Direct</p>
                  <p className="text-[10px] text-cream-50/40 uppercase tracking-wider">From Farmers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How to use */}
        {product.product_variants && product.product_variants.length > 0 && (
          <div className="mt-12">
            <h3 className="font-heading text-2xl font-bold text-text-dark text-center mb-8">How to Use</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: '🧺', title: 'Store', desc: 'Keep in a cool, dry place away from direct sunlight.' },
                { icon: '💧', title: 'Prepare', desc: 'Rinse thoroughly before use. Traditional preparation methods recommended.' },
                { icon: '🍽️', title: 'Serve', desc: 'Enjoy as part of your daily meals. Perfect for traditional recipes.' },
              ].map(item => (
                <div key={item.title} className="rounded-2xl border border-border-warm bg-white p-6 text-center shadow-sm hover:shadow-md transition-all">
                  <span className="text-3xl">{item.icon}</span>
                  <h4 className="mt-3 font-heading text-lg font-semibold text-text-dark">{item.title}</h4>
                  <p className="mt-1 text-xs text-forest-900/50">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
