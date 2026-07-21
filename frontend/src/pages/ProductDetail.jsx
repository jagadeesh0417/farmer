import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import SeoHead from '../components/SeoHead'
import { formatPrice, getImageUrl } from '../lib/utils'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

const WILD_HONEY_SEED = {
  rating: 4.9,
  reviewCount: 320,
  kicker: 'RAW • UNFILTERED • SINGLE-ORIGIN',
  badges: ['100% RAW & UNFILTERED'],
  origin: 'Kandhamal, Odisha',
  harvestSeason: 'March – May',
  farmerNote: {
    quote: '"We don\'t follow machines. We follow the forest."',
    body: 'This honey is collected with respect—for the bees, the trees, and the land. Every drop is a gift from our ancestors.',
    name: 'Lacha Majhi',
    role: 'Tribal Farmer & Honey Harvester',
    photo: '',
  },
  howToUse: [
    { icon: '🌅', title: 'Daily Wellness', tip: 'Take a spoonful every morning on an empty stomach.' },
    { icon: '☕', title: 'With Warm Water', tip: 'Mix in lukewarm water or herbal tea for a soothing detox.' },
    { icon: '🍯', title: 'Natural Sweetener', tip: 'Use in recipes, desserts, or smoothies.' },
    { icon: '✨', title: 'Skin & Hair Care', tip: 'Apply directly for glowing skin and strong hair.' },
  ],
  impactMetrics: [
    { icon: '👥', label: 'Tribal Families Supported', value: '12,500+', percent: 85 },
    { icon: '🌳', label: 'Forest Area Preserved', value: '18,750+ sq. m', percent: 72 },
    { icon: '🐝', label: 'Chemical-Free Beekeeping', value: '100%', percent: 100 },
    { icon: '💰', label: 'Fair Income to Farmers', value: '2.4x higher', percent: 90 },
  ],
}

const DEFAULT_HOW_TO_USE = [
  { icon: '🌿', title: 'Store', tip: 'Keep in a cool, dry place away from direct sunlight.' },
  { icon: '💧', title: 'Prepare', tip: 'Rinse thoroughly before use. Traditional preparation methods recommended.' },
  { icon: '🍽️', title: 'Serve', tip: 'Enjoy as part of your daily meals. Perfect for traditional recipes.' },
  { icon: '💚', title: 'Benefits', tip: 'Rich in natural nutrients. Ideal for a healthy lifestyle.' },
]

const DEFAULT_METRICS = [
  { icon: '👥', label: 'Tribal Families Supported', value: '12,500+', percent: 85 },
  { icon: '🌳', label: 'Forest Area Preserved', value: '18,750+ sq. m', percent: 72 },
  { icon: '🐝', label: 'Chemical-Free Beekeeping', value: '100%', percent: 100 },
  { icon: '💰', label: 'Fair Income to Farmers', value: '2.4x higher', percent: 90 },
]

export default function ProductDetail() {
  const { slug } = useParams()
  const { settings } = useSiteSettings()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [wishlisted, setWishlisted] = useState(false)

  const isWildHoney = slug?.toLowerCase().includes('wild') && slug?.toLowerCase().includes('honey')

  useEffect(() => {
    const load = async () => {
      if (!slug) return
      try {
        const { getProductBySlug } = await import('../lib/productService')
        const data = await getProductBySlug(slug)
        setProduct(data)
        if (data?.product_variants?.length) setSelectedVariant(data.product_variants[0])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-ink/20 border-t-terracotta-500" />
        <p className="mt-4 font-heading text-lg text-muted italic">HaiFarmer</p>
      </div>
    </div>
  )

  if (!product) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-cream-50">
      <div className="text-center">
        <p className="font-heading text-2xl text-muted italic">Product not found</p>
        <Link to="/products" className="mt-4 btn-font inline-flex items-center gap-2 bg-terracotta-500 px-6 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-cream-50 hover:bg-terracotta-600 transition-all" style={{ borderRadius: '4px' }}>Back to Products</Link>
      </div>
    </div>
  )

  const seed = isWildHoney ? WILD_HONEY_SEED : {}
  const images = product.galleryImages?.length ? product.galleryImages : (product.images?.length ? product.images : [product.image_url])
  const mainImgSrc = getImageUrl(images[selectedImg], settings?.placeholder_image)
  const currentPrice = selectedVariant?.price ?? product.base_price ?? product.price
  const rating = product.rating ?? seed.rating ?? 4.9
  const reviewCount = product.reviewCount ?? seed.reviewCount ?? 320
  const badges = product.badges?.length ? product.badges : (seed.badges || ['100% RAW & UNFILTERED'])
  const kicker = product.kicker || seed.kicker || product.badges?.join(' • ') || 'RAW • UNFILTERED • SINGLE-ORIGIN'
  const farmerNote = product.farmerNote || seed.farmerNote || { quote: '"Growing pure food, sustaining traditions."', body: 'This product is sourced directly from tribal farming communities.', name: 'Tribal Farmer', role: '', photo: '' }
  const howToUse = product.howToUse?.length ? product.howToUse : seed.howToUse || DEFAULT_HOW_TO_USE
  const impactMetrics = product.impactMetrics?.length ? product.impactMetrics : seed.impactMetrics || DEFAULT_METRICS
  const origin = product.origin || seed.origin || ''
  const harvestSeason = product.harvestSeason || seed.harvestSeason || ''

  const productSchema = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: product.name, description: product.description || product.tagline || '',
    image: images[0],
    offers: { '@type': 'Offer', price: currentPrice, priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <SeoHead title={product.name} description={product.description || product.tagline} ogImage={images[0]} schema={productSchema} canonical={`https://haifarmer.com/products/${slug}`} />

      {/* Breadcrumb */}
      <div className="bg-cream-100 border-b border-ink/5">
        <div className="mx-auto max-w-7xl px-5 py-3 sm:px-8 lg:px-10">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Link to="/" className="hover:text-terracotta-500 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-terracotta-500 transition-colors">Shop</Link>
            <span>/</span>
            {product.category && <><Link to={`/products?category=${product.category_slug || ''}`} className="hover:text-terracotta-500 transition-colors">{product.category}</Link><span>/</span></>}
            <span className="text-terracotta-500 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        {/* Two-column: Gallery + Info */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="group relative overflow-hidden rounded-2xl bg-card-cream border border-ink/10 shadow-sm">
              <img src={mainImgSrc} alt={product.name} className="h-[360px] w-full object-cover transition-transform duration-700 sm:h-[460px] lg:h-[520px] group-hover:scale-105" />
              <span className="absolute left-4 top-4 z-10 rounded-full bg-forest-900/80 backdrop-blur-sm px-3.5 py-1 text-[9px] font-semibold tracking-[0.12em] uppercase text-cream-50 shadow-sm">{badges[0]}</span>
            </div>

            {/* Thumbnail carousel */}
            {images.length > 1 && (
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedImg(prev => Math.max(0, prev - 1))} disabled={selectedImg === 0}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-ink/10 bg-card-cream text-muted transition-all hover:bg-ink/5 disabled:opacity-30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImg(i)}
                      className={`shrink-0 h-16 w-16 overflow-hidden rounded-xl border-2 transition-all ${selectedImg === i ? 'border-terracotta-500 ring-2 ring-terracotta-500/20' : 'border-ink/10 opacity-60 hover:opacity-100'}`}>
                      <img src={getImageUrl(img, settings?.placeholder_image)} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
                <button onClick={() => setSelectedImg(prev => Math.min(images.length - 1, prev + 1))} disabled={selectedImg >= images.length - 1}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-ink/10 bg-card-cream text-muted transition-all hover:bg-ink/5 disabled:opacity-30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}

            {/* Trust strip */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-card-cream p-4 border border-ink/5 sm:grid-cols-4">
              {[
                { icon: '🌱', label: '100% Natural', sub: 'No additives' },
                { icon: '🍯', label: 'Unfiltered &', sub: 'Unprocessed' },
                { icon: '🤝', label: 'Ethically', sub: 'Sourced' },
                { icon: '🧪', label: 'Lab Tested', sub: 'for Purity' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-[10px] font-semibold text-ink leading-tight">{item.label}</p>
                    <p className="text-[9px] text-muted">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            {/* Kicker */}
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-terracotta-500">{kicker}</p>

            {/* Name */}
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-ink tracking-tight leading-[1.08]">{product.name}</h1>

            {/* Price + Rating */}
            <div className="flex items-center gap-5">
              <span className="font-heading text-3xl font-bold text-ink">{formatPrice(currentPrice)}</span>
              <div className="flex items-center gap-1.5">
                <div className="flex text-gold-500">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className={`text-sm ${s <= Math.round(rating) ? 'text-gold-500' : 'text-ink/10'}`}>★</span>
                  ))}
                </div>
                <span className="text-xs text-muted">{rating} ({reviewCount.toLocaleString()} reviews)</span>
              </div>
            </div>

            {/* Description */}
            {(product.description || product.tagline) && (
              <p className="text-sm leading-relaxed text-muted">{product.tagline ? `"${product.tagline}"` : ''}{product.tagline && product.description ? ' — ' : ''}{product.description || ''}</p>
            )}

            {/* Meta rows */}
            <div className="flex flex-wrap gap-5">
              {origin && (
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="text-base">📍</span>
                  <span><span className="font-semibold text-ink">Origin:</span> {origin}</span>
                </div>
              )}
              {harvestSeason && (
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="text-base">📅</span>
                  <span><span className="font-semibold text-ink">Harvest Season:</span> {harvestSeason}</span>
                </div>
              )}
            </div>

            {/* Dashed divider */}
            <div className="border-t border-dashed border-ink/10" />

            {/* Size selector */}
            {product.product_variants?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-ink mb-3">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.product_variants.map(v => {
                    const active = selectedVariant?.id === v.id
                    return (
                      <button key={v.id} onClick={() => setSelectedVariant(v)}
                        className={`rounded-lg border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                          active
                            ? 'border-terracotta-500 bg-terracotta-500 text-cream-50 shadow-sm'
                            : 'border-ink/10 bg-card-cream text-muted hover:border-ink/30'
                        }`}>
                        {v.weight_label || v.name}
                        <span className={`ml-2 ${active ? 'text-cream-50/80' : 'text-muted'}`}>{formatPrice(v.price)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Add to cart + Wishlist */}
            <div className="flex gap-3">
              <button className="btn-font flex-1 bg-terracotta-500 py-4 text-sm font-semibold tracking-[0.16em] uppercase text-cream-50 transition-all hover:bg-terracotta-600 hover:-translate-y-0.5 shadow-xl shadow-terracotta-500/25 btn-lift flex items-center justify-center gap-3" style={{ borderRadius: '4px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2"/></svg>
                Add to Cart
              </button>
              <button onClick={() => setWishlisted(!wishlisted)}
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 transition-all btn-lift ${
                  wishlisted ? 'border-terracotta-500 bg-terracotta-500/10 text-terracotta-500' : 'border-ink/10 bg-card-cream text-muted hover:border-terracotta-500/30 hover:text-terracotta-500'
                }`}>
                <svg className="h-6 w-6" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>

            {/* Guarantee */}
            <div className="flex items-center gap-2.5 rounded-lg bg-card-cream px-4 py-3 border border-ink/5">
              <span className="text-lg">🛡️</span>
              <p className="text-xs text-muted">100% Satisfaction Guaranteed — Not happy? Return within 7 days for a full refund.</p>
            </div>
          </div>
        </div>

        {/* 3-column section */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {/* Farmer's Note */}
          <div className="rounded-2xl bg-card-cream p-6 border border-ink/5 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-terracotta-500">Farmer's Note</p>
              <div className="zigzag inline-block" />
            </div>
            <div className="flex items-center gap-3 mt-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink/5 overflow-hidden">
                {farmerNote.photo ? (
                  <img src={getImageUrl(farmerNote.photo)} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span className="text-lg">👨‍🌾</span>
                )}
              </div>
              <div>
                <p className="font-heading text-sm italic text-ink leading-tight">{farmerNote.quote}</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted flex-1">{farmerNote.body}</p>
            <p className="mt-4 text-xs font-semibold text-terracotta-500">— {farmerNote.name}{farmerNote.role ? `, ${farmerNote.role}` : ''}</p>
          </div>

          {/* Impact Meter */}
          <div className="rounded-2xl bg-forest-900 p-6 border border-gold-500/10">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-gold-500">Impact Meter</p>
              <div className="zigzag inline-block" style={{ '--zig-color': '#C9A24C' }} />
            </div>
            <p className="mt-3 font-heading text-lg font-semibold text-cream-50">Your purchase makes a real difference.</p>
            <div className="mt-5 space-y-4">
              {impactMetrics.map(m => (
                <div key={m.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0">{m.icon}</span>
                      <span className="text-cream-50/70 leading-tight">{m.label}</span>
                    </div>
                    <span className="font-semibold text-gold-500 shrink-0 ml-2">{m.value}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-forest-950">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold-500 to-terracotta-500 transition-all" style={{ width: `${Math.min(100, m.percent)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10px] leading-relaxed text-cream-50/40 italic">Together, we're building a wilder, kinder, and more equitable world.</p>
          </div>

          {/* How to Use */}
          <div className="rounded-2xl bg-card-cream p-6 border border-ink/5">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-terracotta-500">How to Use</p>
              <div className="zigzag inline-block" />
            </div>
            <div className="mt-5 space-y-4">
              {howToUse.map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-terracotta-500/10 text-base">{item.icon}</span>
                  <div>
                    <p className="font-heading text-sm font-semibold text-ink">{item.title}</p>
                    <p className="text-xs text-muted leading-relaxed mt-0.5">{item.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer trust bar */}
      <div className="bg-forest-900 border-t border-gold-500/10">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹999' },
              { icon: '🔒', title: 'Secure Payment', desc: '100% protected checkout' },
              { icon: '🔄', title: '7-Day Returns', desc: 'No questions asked' },
              { icon: '🌱', title: 'Support Farmers', desc: 'Every purchase creates impact' },
            ].map(item => (
              <div key={item.title}>
                <span className="text-2xl">{item.icon}</span>
                <p className="mt-1 font-heading text-sm font-semibold text-cream-50">{item.title}</p>
                <p className="text-[10px] text-cream-50/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}