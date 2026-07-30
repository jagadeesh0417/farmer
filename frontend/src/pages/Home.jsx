import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import ProductCard from '../components/ProductCard'
import BundleCard from '../components/BundleCard'
import HorizontalScroll from '../components/HorizontalScroll'
import StoryViewer from '../components/StoryViewer'
import PremiumHero from '../components/PremiumHero'
import PromoBanner from '../components/PromoBanner'
import WhyChooseUs from '../components/WhyChooseUs'
import FarmStory from '../components/FarmStory'
import FarmTimeline from '../components/FarmTimeline'

function getSuperSaverCombos(bundles) {
  return bundles.filter(b => (b.comboType === 'super_saver' || b.isSuperSaver) && b.showOnHome !== false)
}

function getNormalCombos(bundles) {
  return bundles.filter(b => (b.comboType || 'normal') !== 'super_saver' && !b.isSuperSaver && b.showOnHome !== false)
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
  { name: 'Sneha Reddy', location: 'Hyderabad', text: 'The millets are incredibly fresh and the taste is unmatched. I make millet dosa every weekend now and my kids love it!', rating: 5 },
  { name: 'Arun Kumar', location: 'Chennai', text: 'Been a customer for over a year. The spice blends are aromatic and the dry fruits are premium quality. Highly recommend!', rating: 5 },
]

const CATEGORY_CARDS = [
  { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: '🥭', count: '50+', color: 'from-orange-500/80' },
  { name: 'Groceries', slug: 'groceries', icon: '🛒', count: '100+', color: 'from-green-600/80' },
  { name: 'Millets', slug: 'millets', icon: '🌾', count: '15+', color: 'from-amber-600/80' },
  { name: 'Lentils & Beans', slug: 'lentils-beans', icon: '🫘', count: '20+', color: 'from-yellow-700/80' },
  { name: 'Spices', slug: 'spices', icon: '🌶', count: '30+', color: 'from-red-600/80' },
  { name: 'Oils', slug: 'oils', icon: '🫒', count: '10+', color: 'from-green-700/80' },
  { name: 'Dry Fruits', slug: 'dry-fruits', icon: '🥜', count: '15+', color: 'from-amber-800/80' },
  { name: 'Honey & Sweeteners', slug: 'sweeteners', icon: '🍯', count: '8+', color: 'from-yellow-500/80' },
]

export default function Home() {
  const { cartItems } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [bundles, setBundles] = useState([])
  const [reels, setReels] = useState([])
  const [banners, setBanners] = useState([])
  const [promoBanner, setPromoBanner] = useState({ desktopImage: null, mobileImage: null, link: '/products' })
  const [shopCategoryBanner, setShopCategoryBanner] = useState({ desktopImage: null, mobileImage: null, buttonLink: '/products', enabled: true })
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const cartCount = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  const reelProducts = useMemo(() => {
    return reels.map(reel => ({ ...reel, taggedProduct: reel.productId || null }))
  }, [reels])

  const bestSellers = useMemo(() => getSectionProducts(products, settings, 'bestSellers'), [products, settings])
  const groceries = useMemo(() => products.filter(p => p.showOnHome !== false), [products])
  const superSaverCombos = useMemo(() => getSuperSaverCombos(bundles), [bundles])
  const normalCombos = useMemo(() => getNormalCombos(bundles), [bundles])
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
        setReels(demoStories.map(s => ({ poster: s.poster, alt: s.alt || s.title, src: null, duration: s.duration })))
        setLoading(false)
        return
      }
      try {
        const [productsData, bundlesData, bannerSettings, storiesData] = await Promise.all([
          api.getProducts({ limit: 100 }).then(r => r.data || []).catch(() => []),
          api.getBundles({ combo: 'true' }).then(r => r?.data || r || []).catch(() => []),
          api.getBannerSettings().catch(() => ({})),
          api.getStories().catch(() => []),
        ])
        if (cancelled) return
        setProducts(productsData)
        setBundles(Array.isArray(bundlesData) ? bundlesData : bundlesData?.data || [])
        setReels(Array.isArray(storiesData) ? storiesData.map(s => ({
          ...s, poster: s.thumbnail, alt: s.title, src: s.videoUrl, productId: s.productId, taggedProduct: s.productId,
        })) : [])
        const bs = bannerSettings || {}
        const heroBanners = ['hero1', 'hero2', 'hero3'].filter(k => bs[k]).map(k => ({
          id: k, desktopImage: bs[k].desktopImage || bs[k].image, mobileImage: bs[k].mobileImage || bs[k].image,
          image: bs[k].image, ctaHref: bs[k].buttonLink || '/products',
        }))
        setBanners(heroBanners.length > 0 ? heroBanners : HOME_ASSETS.hero.map(s => ({
          id: s.title, desktopImage: s.desktopImage || s.image, mobileImage: s.mobileImage || s.tabletImage || s.image,
          image: s.image, ctaHref: '/products',
        })))
        const promo = bs.promotional || {}
        setPromoBanner({ desktopImage: promo.desktopImage || promo.image, mobileImage: promo.mobileImage || promo.image, link: promo.buttonLink || '/products' })
        const scBanner = bs.shopByCategory || {}
        setShopCategoryBanner({ desktopImage: scBanner.desktopImage, mobileImage: scBanner.mobileImage, buttonLink: scBanner.buttonLink || '/products', enabled: scBanner.enabled !== false })
      } catch (err) { console.error(err) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="bg-[#FAFDF8]">
      <SeoHead title="HaiFarmer" description="Wild-harvested and natural products sourced directly from tribal communities. Pure. Honest. Sustainable." />

      {/* 1. Premium Hero */}
      <PremiumHero />

      {/* 2. Promotional Banner */}
      <PromoBanner banner={promoBanner} />

      {/* 3. Why Choose Us */}
      <WhyChooseUs />

      {/* 4. Super Savers */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-[#2E7D32]">Best Value</span>
            <h2 className="mt-0.5 font-heading text-h2 font-bold text-[#1B4332]">Super Savers</h2>
            <p className="mt-1 text-body-sm text-[#5A7A60]">Limited-time deals with maximum savings</p>
          </div>
          {loading ? (
            <HorizontalScroll>
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="min-w-[280px] w-[280px] rounded-xl bg-[#FAFDF8] border border-[#D7E8C8] h-96 animate-pulse shrink-0" />)}
            </HorizontalScroll>
          ) : superSaverCombos.length > 0 ? (
            <>
              <HorizontalScroll>
                {superSaverCombos.map(bundle => (
                  <div key={bundle._id || bundle.id} className="min-w-[280px] sm:min-w-[300px] lg:min-w-[340px] w-[280px] sm:w-[300px] lg:w-[340px] shrink-0">
                    <BundleCard bundle={bundle} />
                  </div>
                ))}
              </HorizontalScroll>
              <div className="mt-6 text-center">
                <Link to="/combos?tab=super-savers"
                  className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-6 py-2.5 text-caption font-bold text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5">
                  View All Deals
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-10 bg-[#FAFDF8] rounded-xl border border-[#D7E8C8]">
              <p className="text-body-sm text-[#5A7A60]">No deals available yet. Check back soon!</p>
              <Link to="/products" className="mt-2 inline-flex text-body-sm font-semibold text-[#2E7D32] hover:text-[#1B5E20]">Browse Products →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 5. Stories From The Soil */}
      <section className="py-10 lg:py-14 bg-[#FAFDF8] overflow-hidden">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-[#2E7D32]">Real Stories</span>
            <h2 className="mt-0.5 font-heading text-h2 font-bold text-[#1B4332]">Stories From The Soil</h2>
            <p className="mt-1 text-body-sm text-[#5A7A60]">Meet the farmers behind your food</p>
          </div>
          <HorizontalScroll>
            {reelProducts.map((reel, i) => (
              <div key={i} className="min-w-[170px] sm:min-w-[220px] lg:min-w-[240px] w-[170px] sm:w-[220px] lg:w-[240px] shrink-0 cursor-pointer" onClick={() => { setViewerIndex(i); setViewerOpen(true) }}>
                <div className="aspect-[9/16] rounded-xl overflow-hidden bg-[#E8F5E9] relative group shadow-sm transition-shadow duration-300 hover:shadow-lg">
                  {reel.poster ? (
                    <img src={reel.poster} alt={reel.alt} loading="lazy" className="h-full w-full object-cover object-center" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#C8E6C9]">
                      <svg className="h-8 w-8 text-[#2E7D32]/40" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-md">
                      <svg className="h-5 w-5 text-[#1B4332] ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1B4332]/70 to-transparent p-3">
                    {reel.duration && (
                      <span className="inline-block rounded-full bg-white/20 backdrop-blur-sm px-2 py-0.5 text-micro font-medium text-white mb-1">{reel.duration}</span>
                    )}
                    <p className="text-caption font-medium text-white drop-shadow-sm line-clamp-1">{reel.alt}</p>
                  </div>
                </div>
              </div>
            ))}
          </HorizontalScroll>
          <div className="mt-6 text-center">
            <Link to="/stories"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#D7E8C8] px-6 py-2.5 text-caption font-bold text-[#2E7D32] transition-all hover:bg-[#F4F9EF] hover:border-[#4CAF50]">
              View All Stories
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {viewerOpen && (
            <StoryViewer stories={reelProducts} initialIndex={viewerIndex} onClose={() => setViewerOpen(false)} />
          )}
        </div>
      </section>

      {/* 6. Shop by Category — Image Cards */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-8">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-[#2E7D32]">Shop by</span>
            <h2 className="mt-1 font-heading text-h2 font-bold text-[#1B4332]">Category</h2>
            <p className="mt-1 text-body-sm text-[#5A7A60]">Explore our wide range of organic products</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {CATEGORY_CARDS.map((cat) => (
              <Link key={cat.slug} to={`/products?category=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#F4F9EF] border border-[#D7E8C8] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(46,125,50,0.15)]">
                {/* Placeholder gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} to-[#1B4332]/90 opacity-60 group-hover:opacity-70 transition-opacity duration-300`} />
                {/* Icon */}
                <div className="absolute top-3 left-3 text-2xl sm:text-3xl">{cat.icon}</div>
                {/* Overlay content */}
                <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4">
                  <h3 className="font-heading text-body sm:text-h4 font-bold text-white drop-shadow-lg">{cat.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-micro font-semibold text-white/80">{cat.count} products</span>
                    <span className="text-micro font-bold text-white bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 transition-all group-hover:bg-white/30">
                      Shop →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Our Best Sellers */}
      <section className="py-10 lg:py-14 bg-[#FAFDF8]">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-[#2E7D32]">Top Picks</span>
            <h2 className="mt-0.5 font-heading text-h2 font-bold text-[#1B4332]">Our Best Sellers</h2>
            <p className="mt-1 text-body-sm text-[#5A7A60]">Most loved products by our community</p>
          </div>
          {loading ? (
            <HorizontalScroll>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="min-w-[170px] sm:min-w-[220px] w-[170px] sm:w-[220px] rounded-xl bg-white border border-[#D7E8C8] h-72 animate-pulse shrink-0" />)}
            </HorizontalScroll>
          ) : bestSellers.length > 0 ? (
            <HorizontalScroll>
              {bestSellers.map(product => (
                <div key={product.id || product._id} className="min-w-[170px] sm:min-w-[220px] lg:min-w-[240px] w-[170px] sm:w-[220px] lg:w-[240px] shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </HorizontalScroll>
          ) : (
            <div className="text-center py-10 bg-white rounded-xl border border-[#D7E8C8]">
              <p className="text-body-sm text-[#5A7A60]">No products available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* 8. Farm Story */}
      <FarmStory />

      {/* 9. Groceries */}
      <section className="py-10 lg:py-14 bg-[#FAFDF8] overflow-hidden">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-[#2E7D32]">Everyday Essentials</span>
            <h2 className="mt-0.5 font-heading text-h2 font-bold text-[#1B4332]">Groceries</h2>
            <p className="mt-1 text-body-sm text-[#5A7A60]">Stock your kitchen with nature's best</p>
          </div>
          {loading ? (
            <HorizontalScroll>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="min-w-[170px] sm:min-w-[220px] w-[170px] sm:w-[220px] rounded-xl bg-white border border-[#D7E8C8] h-72 animate-pulse shrink-0" />)}
            </HorizontalScroll>
          ) : groceries.length > 0 ? (
            <HorizontalScroll>
              {groceries.map(product => (
                <div key={product.id || product._id} className="min-w-[170px] sm:min-w-[220px] lg:min-w-[240px] w-[170px] sm:w-[220px] lg:w-[240px] shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </HorizontalScroll>
          ) : (
            <div className="text-center py-10 bg-white rounded-xl border border-[#D7E8C8]">
              <p className="text-body-sm text-[#5A7A60]">No products available yet.</p>
              <Link to="/products" className="mt-2 inline-flex text-body-sm font-semibold text-[#2E7D32] hover:text-[#1B5E20]">Browse all →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 10. Healthy Combos */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-[#2E7D32]">Curated Bundles</span>
            <h2 className="mt-0.5 font-heading text-h2 font-bold text-[#1B4332]">Healthy Combos</h2>
            <p className="mt-1 text-body-sm text-[#5A7A60]">Save more with our specially curated bundles</p>
          </div>
          {loading ? (
            <HorizontalScroll>
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="min-w-[280px] w-[280px] rounded-xl bg-white border border-[#D7E8C8] h-96 animate-pulse shrink-0" />)}
            </HorizontalScroll>
          ) : normalCombos.length > 0 ? (
            <>
              <HorizontalScroll>
                {normalCombos.map(bundle => (
                  <div key={bundle._id || bundle.id} className="min-w-[280px] sm:min-w-[300px] lg:min-w-[340px] w-[280px] sm:w-[300px] lg:w-[340px] shrink-0">
                    <BundleCard bundle={bundle} />
                  </div>
                ))}
              </HorizontalScroll>
              <div className="mt-6 text-center">
                <Link to="/combos"
                  className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-6 py-2.5 text-caption font-bold text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5">
                  View All Combos
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-10 bg-[#FAFDF8] rounded-xl border border-[#D7E8C8]">
              <p className="text-body-sm text-[#5A7A60]">No combos available yet.</p>
              <Link to="/products" className="mt-2 inline-flex text-body-sm font-semibold text-[#2E7D32]">Browse Products →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 11. From Farm to Table — Timeline */}
      <FarmTimeline />

      {/* 12. Traditional Grains — Millets */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F9EF] border border-[#D7E8C8] px-3 py-1 mb-3">
              <span className="text-base">🌾</span>
              <span className="text-micro font-bold text-[#2E7D32] uppercase tracking-wider">Superfood</span>
            </div>
            <h2 className="font-heading text-h2 font-bold text-[#1B4332]">Traditional Grains — Millets</h2>
            <p className="mt-1 text-body-sm text-[#5A7A60] max-w-md mx-auto">Nutritious, gluten-free ancient grains packed with protein and fiber</p>
          </div>
          {loading ? (
            <HorizontalScroll>
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="min-w-[170px] sm:min-w-[220px] w-[170px] sm:w-[220px] rounded-xl bg-white border border-[#D7E8C8] h-72 animate-pulse shrink-0" />)}
            </HorizontalScroll>
          ) : milletProducts.length > 0 ? (
            <>
              <HorizontalScroll>
                {milletProducts.map(product => (
                  <div key={product.id || product._id} className="min-w-[170px] sm:min-w-[220px] lg:min-w-[240px] w-[170px] sm:w-[220px] lg:w-[240px] shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </HorizontalScroll>
              <div className="mt-6 text-center flex items-center justify-center gap-3">
                <Link to="/products?category=millets"
                  className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-6 py-2.5 text-caption font-bold text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5">
                  Shop Millets
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-10 bg-[#FAFDF8] rounded-xl border border-[#D7E8C8]">
              <p className="text-body-sm text-[#5A7A60]">No millet products yet.</p>
              <Link to="/products" className="mt-2 inline-flex text-body-sm font-semibold text-[#2E7D32]">Browse all →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 13. Protein Rich — Lentils & Beans */}
      <section className="py-10 lg:py-14 bg-[#FAFDF8]">
        <div className="section-container">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F9EF] border border-[#D7E8C8] px-3 py-1 mb-3">
              <span className="text-base">💪</span>
              <span className="text-micro font-bold text-[#2E7D32] uppercase tracking-wider">Protein Rich</span>
            </div>
            <h2 className="font-heading text-h2 font-bold text-[#1B4332]">Lentils & Beans</h2>
            <p className="mt-1 text-body-sm text-[#5A7A60]">Farm-fresh lentils and beans packed with natural protein</p>
          </div>
          {loading ? (
            <HorizontalScroll>
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="min-w-[170px] sm:min-w-[220px] w-[170px] sm:w-[220px] rounded-xl bg-white border border-[#D7E8C8] h-72 animate-pulse shrink-0" />)}
            </HorizontalScroll>
          ) : lentilProducts.length > 0 ? (
            <>
              <HorizontalScroll>
                {lentilProducts.map(product => (
                  <div key={product.id || product._id} className="min-w-[170px] sm:min-w-[220px] lg:min-w-[240px] w-[170px] sm:w-[220px] lg:w-[240px] shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </HorizontalScroll>
              <div className="mt-6 text-center">
                <Link to="/products?category=lentils-beans"
                  className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-6 py-2.5 text-caption font-bold text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5">
                  View All
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-10 bg-white rounded-xl border border-[#D7E8C8]">
              <p className="text-body-sm text-[#5A7A60]">No lentil or bean products yet.</p>
              <Link to="/products" className="mt-2 inline-flex text-body-sm font-semibold text-[#2E7D32]">Browse all →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 14. Aromatic & Wild — Spices */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F9EF] border border-[#D7E8C8] px-3 py-1 mb-3">
              <span className="text-base">🌶</span>
              <span className="text-micro font-bold text-[#2E7D32] uppercase tracking-wider">Aromatic & Wild</span>
            </div>
            <h2 className="font-heading text-h2 font-bold text-[#1B4332]">Spices</h2>
            <p className="mt-1 text-body-sm text-[#5A7A60]">Wild-harvested spices with intense flavor and aroma</p>
          </div>
          {loading ? (
            <HorizontalScroll>
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="min-w-[170px] sm:min-w-[220px] w-[170px] sm:w-[220px] rounded-xl bg-white border border-[#D7E8C8] h-72 animate-pulse shrink-0" />)}
            </HorizontalScroll>
          ) : spiceProducts.length > 0 ? (
            <>
              <HorizontalScroll>
                {spiceProducts.map(product => (
                  <div key={product.id || product._id} className="min-w-[170px] sm:min-w-[220px] lg:min-w-[240px] w-[170px] sm:w-[220px] lg:w-[240px] shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </HorizontalScroll>
              <div className="mt-6 text-center">
                <Link to="/products?category=spices"
                  className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-6 py-2.5 text-caption font-bold text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5">
                  Shop Spices
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-10 bg-[#FAFDF8] rounded-xl border border-[#D7E8C8]">
              <p className="text-body-sm text-[#5A7A60]">No spice products yet.</p>
              <Link to="/products" className="mt-2 inline-flex text-body-sm font-semibold text-[#2E7D32]">Browse all →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 15. What Our Customers Say */}
      <section className="py-10 lg:py-14 bg-[#FAFDF8]">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-[#2E7D32]">Our Community</span>
            <h2 className="mt-1 font-heading text-h2 font-bold text-[#1B4332]">What Our Customers Say</h2>
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-body-sm font-bold text-[#1B4332]">4.9/5</span>
              <span className="text-caption text-[#5A7A60]">based on 10,000+ reviews</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-2xl border border-[#D7E8C8] bg-white p-5 flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(46,125,50,0.08)]">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }, (_, j) => (
                    <svg key={j} className={`h-3.5 w-3.5 ${j < t.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-micro font-bold text-amber-500 ml-1">Verified Purchase</span>
                </div>
                <p className="text-body-sm text-[#5A7A60] leading-relaxed flex-1">"{t.text}"</p>
                <div className="mt-4 pt-3 border-t border-[#E5EDD8] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold text-caption">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-caption font-bold text-[#1B4332]">{t.name}</p>
                    <p className="text-micro text-[#5A7A60]">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating cart */}
      <button type="button" onClick={() => navigate('/checkout')}
        className="fixed bottom-[76px] left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#2E7D32] text-white shadow-lg transition-all hover:bg-[#1B5E20] hover:-translate-y-1 sm:bottom-8 sm:left-8"
        aria-label="Shopping cart">
        <CartIcon className="h-6 w-6" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-[#F5A623] px-2 py-0.5 text-micro font-bold text-white shadow-sm">{cartCount}</span>
        )}
      </button>
    </div>
  )
}
