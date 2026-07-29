import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import BundleCard from '../components/BundleCard'
import KenBurnsHero from '../components/KenBurnsHero'
import { useCart } from '../contexts/CartContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import SeoHead from '../components/SeoHead'
import { api } from '../lib/api'
import { formatPrice, getImageUrl } from '../lib/utils'
import { cld } from '../lib/cloudinary'
import { generatePlaceholder } from '../lib/placeholders'
import { isDemoMode } from '../lib/withDemoFallback'
import { getItems } from '../lib/demoStore'
import { demoProducts, demoCombos, demoStories, demoCategories, demoProductsByCategory } from '../lib/demoData'
import { CartIcon } from '../components/Icons'
import { HOME_ASSETS } from '../lib/homeAssets'

function getSectionCombos(bundles, settings) {
  const ids = settings?.homeSections?.superSaverCombos
  if (!ids || ids.length === 0) return bundles.filter(b => b.showOnHome !== false)
  return bundles.filter(b => ids.includes(b.id || b._id) && b.showOnHome !== false)
}

function getSectionProducts(products, settings, sectionKey) {
  if (sectionKey === 'bestSellers') {
    const ids = settings?.homeSections?.bestSellers
    if (ids && ids.length > 0) return products.filter(p => ids.includes(p.id || p._id) && p.showOnHome !== false)
    return products.filter(p => p.isFeatured && p.showOnHome !== false)
  }
  return products.filter(p => p.showOnHome !== false)
}

const TESTIMONIALS = [
  { name: 'Priya Sharma', location: 'Mumbai', text: 'The forest honey is pure magic. You can taste the difference — it\'s nothing like the processed stuff from supermarkets. My whole family loves it!', rating: 5 },
  { name: 'Rajesh Kumar', location: 'Bangalore', text: 'I\'ve been buying millets and lentils for months now. The quality is consistent and knowing it supports tribal farmers makes every purchase meaningful.', rating: 5 },
  { name: 'Ananya Patel', location: 'Delhi', text: 'The combos are such great value! I ordered the staples bundle and everything was fresh and well-packaged. Perfect for my monthly shopping.', rating: 5 },
  { name: 'Vikram Singh', location: 'Pune', text: 'Finally a brand that\'s truly natural and transparent. I scanned the QR on my turmeric pack and saw the exact farmer who grew it. Incredible!', rating: 5 },
]

export default function Home() {
  const { cartItems } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [bundles, setBundles] = useState([])
  const [reels, setReels] = useState([])
  const [banners, setBanners] = useState([])
  const [promoBanner, setPromoBanner] = useState(null)
  const [categories, setCategories] = useState([])
  const [categoryProducts, setCategoryProducts] = useState({})
  const [catLoading, setCatLoading] = useState({})
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const cartCount = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  const reelProducts = useMemo(() => {
    const available = products.filter(p => p.showOnHome !== false)
    if (available.length === 0) return reels
    return reels.map((reel, i) => ({
      ...reel,
      taggedProduct: available[i % available.length],
    }))
  }, [reels, products])

  const bestSellers = useMemo(() => getSectionProducts(products, settings, 'bestSellers'), [products, settings])
  const milletProducts = useMemo(() => products.filter(p => {
    const cat = typeof p.category === 'string' ? p.category : (p.category?.slug || p.category?.name || '')
    return cat.toLowerCase() === 'millets' && p.showOnHome !== false
  }), [products])
  const lentilProducts = useMemo(() => products.filter(p => {
    const cat = typeof p.category === 'string' ? p.category : (p.category?.slug || p.category?.name || '')
    return cat.toLowerCase() === 'lentils-beans' && p.showOnHome !== false
  }), [products])
  const spiceProducts = useMemo(() => products.filter(p => {
    const cat = typeof p.category === 'string' ? p.category : (p.category?.slug || p.category?.name || '')
    return cat.toLowerCase() === 'spices' && p.showOnHome !== false
  }), [products])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (isDemoMode()) {
        const savedProducts = getItems('products')
        const savedBundles = getItems('bundles')
        setProducts([...savedProducts, ...demoProducts.filter(dp => !savedProducts.some(s => s.name === dp.name))])
        setBundles([...savedBundles, ...demoCombos.filter(dc => !savedBundles.some(s => s.name === dc.name))])
        setReels(demoStories.map(s => ({ poster: s.image, alt: s.title, src: null, duration: s.duration })))
        setLoading(false)
        return
      }
      try {
        const [productsData, bundlesData, bannerSettings] = await Promise.all([
          api.getProducts({ limit: 100 }).then(r => r.data || []).catch(() => []),
          api.getBundles({ combo: 'true' }).then(r => r?.data || r || []).catch(() => []),
          api.getBannerSettings().catch(() => ({})),
        ])
        if (cancelled) return
        setProducts(productsData)
        setBundles(Array.isArray(bundlesData) ? bundlesData : bundlesData?.data || [])
        setReels(HOME_ASSETS.reels)
        const bs = bannerSettings || {}
        const heroBanners = ['hero1', 'hero2', 'hero3'].filter(k => bs[k]).map(k => ({
          id: k,
          desktopImage: bs[k].image,
          tabletImage: bs[k].image,
          mobileImage: bs[k].image,
          image: bs[k].image,
          heading: bs[k].title || '',
          subtext: bs[k].subtitle || '',
          ctaLabel: bs[k].buttonText || '',
          ctaHref: '/products',
        }))
        setBanners(heroBanners.length > 0 ? heroBanners : HOME_ASSETS.hero.map(s => ({
          id: s.title, ...s,
          heading: s.title, subtext: s.subtitle, ctaLabel: s.buttonText, ctaHref: '/products',
        })))
        setPromoBanner(bs.promotional?.image || null)
      } catch (err) { console.error(err) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    api.getCategories().then(data => {
      if (cancelled) return
      let cats = Array.isArray(data) ? data : data?.data || []
      if (isDemoMode() && cats.length === 0) cats = demoCategories()
      setCategories(cats)
      if (cats.length > 0 && !activeCategory) setActiveCategory(cats[0].id || cats[0]._id)
    }).catch(() => {
      if (!cancelled && isDemoMode()) {
        const cats = demoCategories()
        setCategories(cats)
        if (cats.length > 0) setActiveCategory(cats[0].id || cats[0]._id)
      }
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!activeCategory) return
    const cat = categories.find(c => (c.id || c._id) === activeCategory)
    if (!cat) return
    const catName = cat.slug || cat.name?.toLowerCase()
    if (categoryProducts[catName]?.length) return
    setCatLoading(prev => ({ ...prev, [catName]: true }))
    api.getProducts({ category: catName, limit: 8 }).then(r => {
      let data = r?.data || []
      if (isDemoMode() && data.length === 0) data = demoProductsByCategory(catName)
      setCategoryProducts(prev => ({ ...prev, [catName]: data }))
    }).catch(() => {
      if (isDemoMode()) setCategoryProducts(prev => ({ ...prev, [catName]: demoProductsByCategory(catName) }))
    }).finally(() => {
      setCatLoading(prev => ({ ...prev, [catName]: false }))
    })
  }, [activeCategory, categories])

  return (
    <div className="bg-white">
      <SeoHead title="HaiFarmer" description="Wild-harvested and natural products sourced directly from tribal communities. Pure. Honest. Sustainable." />

      {/* 1. Hero banner */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        <div className="rounded-2xl overflow-hidden">
          <KenBurnsHero slides={banners} />
        </div>
      </div>

      {/* 2. Promotional banner */}
      <section className="py-4 sm:py-5 lg:py-6 bg-white">
        <div className="section-container">
          <Link to="/products" className="group relative block rounded-xl overflow-hidden aspect-[4/1] sm:aspect-[6/1] lg:aspect-[10/1]">
            <picture>
              <source srcSet={cld(promoBanner || HOME_ASSETS.adBanner.desktopImage, 'f_auto,q_auto,w_1200')} media="(min-width: 768px)" />
              <img src={cld(promoBanner || HOME_ASSETS.adBanner.mobileImage, 'f_auto,q_auto,w_600')} alt={HOME_ASSETS.adBanner.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-center animate-kenburns-banner" />
            </picture>
          </Link>
        </div>
        <style>{`
          @keyframes kenburns-banner {
            0% { transform: scale(1) translateX(0); }
            50% { transform: scale(1.08) translateX(-1.5%); }
            100% { transform: scale(1) translateX(0); }
          }
          .animate-kenburns-banner {
            animation: kenburns-banner 12s ease-in-out infinite;
          }
          .animate-kenburns-banner:hover {
            animation-play-state: paused;
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-kenburns-banner {
              animation: none !important;
              transform: none !important;
            }
          }
        `}</style>
      </section>

      {/* 3. Super Saver Combos */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-8">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Best Value</span>
            <h2 className="mt-1 text-h2 font-bold">Super Saver Combos</h2>
            <p className="text-body-sm text-muted mt-1 max-w-md mx-auto">Curated bundles with the best savings</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-xl bg-white border border-border h-56 animate-pulse" />)}
            </div>
          ) : bundles.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {getSectionCombos(bundles, settings).slice(0, 8).map(bundle => (
                  <BundleCard key={bundle._id || bundle.id} bundle={bundle} />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link to="/combos" className="inline-flex items-center gap-2 bg-green-600 text-white px-7 py-2.5 rounded-lg text-body-sm font-semibold hover:bg-green-700 transition-colors">
                  View All Combos
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-10 bg-off-white rounded-xl border border-border">
              <p className="text-body-sm text-muted">No combos available yet.</p>
              <Link to="/products" className="mt-2 inline-flex text-body-sm font-semibold text-green-600 hover:text-green-700">Browse Products →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. 9:16 Vertical Videos — Reels with tagged products */}
      <section className="py-10 lg:py-14 bg-off-white overflow-hidden">
        <div className="section-container">
          <div className="text-center mb-6">
            <h2 className="font-heading text-h2 font-bold text-ink">Stories from the Soil</h2>
            <p className="text-body-sm text-muted mt-0.5">Short videos from our tribal communities</p>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar carousel-snap pb-2">
            {reelProducts.map((reel, i) => (
              <div key={i} className="flex-shrink-0 w-[200px] sm:w-[220px] lg:w-[240px]">
                <div className="aspect-[9/16] rounded-xl overflow-hidden bg-green-50 relative group cursor-pointer">
                  {reel.src ? (
                    <video muted loop playsInline preload="none"
                      className="h-full w-full object-cover object-center"
                      poster={reel.poster}
                      onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                      onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0 }}
                      onTouchStart={(e) => {
                        const v = e.currentTarget
                        v.paused ? v.play().catch(() => {}) : v.pause()
                      }}>
                      <source src={reel.src} type="video/mp4" />
                    </video>
                  ) : (
                    <>
                      <img src={reel.poster} alt={reel.alt} loading="lazy" className="h-full w-full object-cover object-center" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                          <svg className="h-5 w-5 text-ink ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    {reel.duration && (
                      <span className="inline-block rounded-full bg-white/20 backdrop-blur-sm px-2 py-0.5 text-micro font-medium text-white mb-1">{reel.duration}</span>
                    )}
                    <p className="text-caption font-medium text-white drop-shadow-sm line-clamp-1">{reel.alt}</p>
                  </div>
                </div>
                {reel.taggedProduct && (
                  <Link to={`/products/${(reel.taggedProduct.name || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`}
                    className="mt-2 block rounded-lg border border-border bg-white p-2.5 hover:shadow-sm transition">
                    <div className="flex items-center gap-2">
                      <img src={getImageUrl(reel.taggedProduct.image_url || reel.taggedProduct.images?.[0])} alt=""
                        className="h-10 w-10 rounded-lg object-cover bg-[#F0E6D3]"
                        onError={(e) => { e.target.src = generatePlaceholder('product', reel.taggedProduct.name) }} />
                      <div className="min-w-0 flex-1">
                        <p className="font-product text-caption font-semibold text-ink line-clamp-1">{reel.taggedProduct.name}</p>
                        <p className="font-product text-caption font-bold text-green-600">
                          {formatPrice(reel.taggedProduct.base_price || reel.taggedProduct.price || 0)}
                        </p>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Best Sellers */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-8">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Top Picks</span>
            <h2 className="mt-1 text-h2 font-bold">Our Best Sellers</h2>
            <p className="text-body-sm text-muted mt-1">Most loved products by our community</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-xl bg-white border border-border h-64 animate-pulse" />)}
            </div>
          ) : bestSellers.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {bestSellers.slice(0, 8).map(product => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link to="/products" className="inline-flex items-center gap-2 bg-green-600 text-white px-7 py-2.5 rounded-lg text-body-sm font-semibold hover:bg-green-700 transition-colors">
                  View All Products
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-off-white rounded-xl border border-border">
              <p className="text-body-sm text-muted">No products available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* 6. Full screen video */}
      <section className="py-10 lg:py-14 bg-off-white">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Watch & Learn</span>
            <h2 className="mt-1 text-h2 font-bold">From Farm to Table</h2>
            <p className="text-body-sm text-muted mt-0.5 max-w-md mx-auto">See how traditional farming nourishes communities.</p>
          </div>
          <div className="aspect-video rounded-xl overflow-hidden bg-green-50 max-w-5xl mx-auto shadow-lg">
            <div className="relative h-full w-full" style={{ padding: '56.25% 0 0 0' }}>
              <iframe src={`https://www.youtube-nocookie.com/embed/${HOME_ASSETS.youtube.videoId}?rel=0&showinfo=0`}
                title="HaiFarmer — From Farm to Table"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 h-full w-full rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Traditional Grains — Millets */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Traditional Grains</span>
            <h2 className="mt-0.5 text-h2 font-bold">Millets</h2>
            <Link to="/products?category=millets" className="inline-block mt-1 text-caption font-semibold text-green-600 hover:text-green-700 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white border border-border h-72 animate-pulse rounded-xl" />)}
            </div>
          ) : milletProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {milletProducts.slice(0, 8).map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-off-white rounded-xl border border-border">
              <p className="text-body-sm text-muted">No millet products yet.</p>
              <Link to="/products" className="mt-2 inline-flex text-body-sm font-semibold text-green-600 hover:text-green-700">Browse all →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 8. Protein Rich — Lentils & Beans */}
      <section className="py-10 lg:py-14 bg-off-white">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Protein Rich</span>
            <h2 className="mt-0.5 text-h2 font-bold">Lentils & Beans</h2>
            <Link to="/products?category=lentils-beans" className="inline-block mt-1 text-caption font-semibold text-green-600 hover:text-green-700 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white border border-border h-72 animate-pulse rounded-xl" />)}
            </div>
          ) : lentilProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {lentilProducts.slice(0, 8).map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-xl border border-border">
              <p className="text-body-sm text-muted">No lentil or bean products yet.</p>
              <Link to="/products" className="mt-2 inline-flex text-body-sm font-semibold text-green-600 hover:text-green-700">Browse all →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 9. Aromatic & Wild — Spices */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Aromatic & Wild</span>
            <h2 className="mt-0.5 text-h2 font-bold">Spices</h2>
            <Link to="/products?category=spices" className="inline-block mt-1 text-caption font-semibold text-green-600 hover:text-green-700 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white border border-border h-72 animate-pulse rounded-xl" />)}
            </div>
          ) : spiceProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {spiceProducts.slice(0, 8).map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-off-white rounded-xl border border-border">
              <p className="text-body-sm text-muted">No spice products yet.</p>
              <Link to="/products" className="mt-2 inline-flex text-body-sm font-semibold text-green-600 hover:text-green-700">Browse all →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 10. Shop by Category */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-8">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Shop by</span>
            <h2 className="mt-1 text-h2 font-bold">Category</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.length === 0 ? (
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-9 w-20 rounded-full bg-border animate-pulse" />)}
              </div>
            ) : (
              categories.map(cat => {
                const cid = cat.id || cat._id
                const isActive = cid === activeCategory
                return (
                  <button key={cid} onClick={() => setActiveCategory(cid)}
                    className={`px-4 py-2 rounded-full text-caption font-semibold transition-all border ${
                      isActive ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-muted border-border hover:border-green-300 hover:text-green-600'
                    }`}>
                    {cat.name}
                  </button>
                )
              })
            )}
          </div>
          {categories.map(cat => {
            const cid = cat.id || cat._id
            if (cid !== activeCategory) return null
            const catName = cat.slug || cat.name?.toLowerCase()
            const catProducts = categoryProducts[catName]
            const isLoading = catLoading[catName]
            return (
              <div key={cid}>
                <div className="grid lg:grid-cols-3 gap-4">
                  <Link to={`/products?category=${catName}`} className="group relative rounded-xl overflow-hidden min-h-[240px] lg:min-h-full flex flex-col justify-end p-5 lg:col-span-1">
                    <img src={cat.image_url || cat.image ? getImageUrl(cat.image_url || cat.image) : '/banner.png'} alt={cat.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-center" />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-800/30 to-transparent" />
                    <div className="relative z-10">
                      <h3 className="font-heading text-h3 font-bold text-white">{cat.name}</h3>
                      {cat.description && <p className="mt-1 text-body-sm text-white/70 line-clamp-1">{cat.description}</p>}
                      <span className="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-white group-hover:underline">Shop {cat.name} →</span>
                    </div>
                  </Link>
                  <div className="lg:col-span-2">
                    {isLoading ? (
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-[20px] bg-[#FAF3E8] h-[640px] animate-pulse" />)}
                      </div>
                    ) : catProducts && catProducts.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {catProducts.slice(0, 8).map(product => (
                          <ProductCard key={product.id || product._id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[180px] bg-white rounded-xl border border-border">
                        <p className="text-body-sm text-muted">No products in this category yet.</p>
                      </div>
                    )}
                  </div>
                </div>
                {catProducts && catProducts.length > 6 && (
                  <div className="mt-5 text-center">
                    <Link to={`/products?category=${catName}`}
                      className="inline-flex items-center gap-2 text-caption font-semibold text-green-600 hover:text-green-700 transition-colors">
                      View All {cat.name} Products →
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 11. Testimonials */}
      <section className="py-10 lg:py-14 bg-off-white">
        <div className="section-container">
          <div className="text-center mb-8">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Our Community</span>
            <h2 className="mt-1 text-h2 font-bold">What Our Customers Say</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-xl border border-border bg-white p-5 flex flex-col">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }, (_, j) => (
                    <svg key={j} className={`h-4 w-4 ${j < t.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-body-sm text-muted leading-relaxed flex-1">"{t.text}"</p>
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="font-product text-caption font-bold text-ink">{t.name}</p>
                  <p className="text-caption text-muted">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating cart */}
      <button type="button" onClick={() => navigate('/checkout')}
        className="fixed bottom-[76px] left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-all hover:bg-green-700 hover:-translate-y-1 sm:bottom-8 sm:left-8 sm:h-14 sm:w-14"
        aria-label="Shopping cart">
        <CartIcon className="h-6 w-6" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-sale px-2 py-0.5 text-micro font-bold text-white shadow-sm">{cartCount}</span>
        )}
      </button>
    </div>
  )
}
