import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import BundleCard from '../components/BundleCard'
import HorizontalScroll from '../components/HorizontalScroll'
import KenBurnsHero from '../components/KenBurnsHero'
import StoryViewer from '../components/StoryViewer'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import SeoHead from '../components/SeoHead'
import { api } from '../lib/api'
import { formatPrice, getImageUrl } from '../lib/utils'
import { cld } from '../lib/cloudinary'
import { generatePlaceholder, heroPlaceholder, bannerPlaceholder } from '../lib/placeholders'
import { isDemoMode } from '../lib/withDemoFallback'
import { getItems } from '../lib/demoStore'
import { demoProducts, demoCombos, demoStories, demoCategories, demoProductsByCategory } from '../lib/demoData'
import WhyChooseUs from '../components/WhyChooseUs'
import FarmTimeline from '../components/FarmTimeline'
import TestimonialsCarousel from '../components/TestimonialsCarousel'
import { HOME_ASSETS } from '../lib/homeAssets'

function catNameOf(p) {
  return (typeof p.category === 'string' ? p.category : (p.category?.slug || p.category?.name || '')).toLowerCase()
}

const DEMO_REVIEWS = [
  { name: 'Priya Sharma', designation: 'Nutrition Client', product: 'Wild Forest Honey', text: 'The forest honey is pure magic. You can taste the difference — it\'s nothing like the processed stuff from supermarkets. My whole family loves it!', rating: 5, status: 'published', featured: true, displayOrder: 0 },
  { name: 'Rajesh Kumar', designation: 'Customer', product: 'Millet Starter Combo', text: 'I\'ve been buying millets and lentils for months now. The quality is consistent and knowing it supports tribal farmers makes every purchase meaningful.', rating: 5, status: 'published', featured: true, displayOrder: 1 },
  { name: 'Ananya Patel', designation: 'Fitness Enthusiast', product: 'Staples Bundle', text: 'The combos are such great value! I ordered the staples bundle and everything was fresh and well-packaged. Perfect for my monthly shopping.', rating: 5, status: 'published', featured: false, displayOrder: 2 },
  { name: 'Vikram Singh', designation: 'Customer', product: 'Organic Turmeric Powder', text: 'Finally a brand that\'s truly natural and transparent. I scanned the QR on my turmeric pack and saw the exact farmer who grew it. Incredible!', rating: 5, status: 'published', featured: false, displayOrder: 3 },
  { name: 'Sneha Reddy', designation: 'Home Cook', product: 'Foxtail Millet 1kg', text: 'The millets are incredibly fresh and the taste is unmatched. I make millet dosa every weekend now and my kids love it!', rating: 5, status: 'published', featured: false, displayOrder: 4 },
  { name: 'Arun Kumar', designation: 'Doctor', product: 'Premium Spice Box', text: 'Been a customer for over a year. The spice blends are aromatic and the dry fruits are premium quality. Highly recommend!', rating: 5, status: 'published', featured: false, displayOrder: 5 },
]

export default function Home() {
  const { settings, loading: settingsLoading } = useSiteSettings()
  const [homeSections, setHomeSections] = useState({})
  const [reels, setReels] = useState([])
  const [banners, setBanners] = useState([])
  const [promoBanner, setPromoBanner] = useState({ desktopImage: null, mobileImage: null, link: '/products' })
  const [shopCategoryBanner, setShopCategoryBanner] = useState({ desktopImage: null, mobileImage: null, buttonLink: '/products', enabled: true })
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [categories, setCategories] = useState([])
  const [reviews, setReviews] = useState([])
  const [categoryProducts, setCategoryProducts] = useState({})
  const [catLoading, setCatLoading] = useState({})
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  const reelProducts = useMemo(() => {
    return reels.map(reel => ({
      ...reel,
      taggedProduct: reel.productId || null,
    }))
  }, [reels])

  const bestSellers = homeSections.bestSellers || []
  const groceries = homeSections.groceries || []
  const superSaverCombos = homeSections.superSaverCombos?.length
    ? homeSections.superSaverCombos
    : demoCombos.map(c => ({ ...c, comboType: 'super_saver', showOnHome: true }))
  const normalCombos = homeSections.combos || []
  const milletProducts = homeSections.millets || []
  const lentilProducts = homeSections.lentilsBeans?.length
    ? homeSections.lentilsBeans
    : demoProductsByCategory('lentils-beans')
  const spiceProducts = homeSections.spices || []

  useEffect(() => {
    if (isDemoMode()) return
    let cancelled = false
    async function load() {
      try {
        const [homeData, bannerSettings, storiesData, reviewsData] = await Promise.all([
          api.getHomeSections().then(r => r?.homeSections || {}).catch(() => ({})),
          api.getBannerSettings().catch(() => ({})),
          api.getStories().catch(() => []),
          api.getReviews().catch(() => []),
        ])
        if (cancelled) return
        setHomeSections(homeData || {})
        const loadedReviews = Array.isArray(reviewsData) ? reviewsData.filter(r => r.status !== 'draft') : []
        setReviews(loadedReviews.length > 0 ? loadedReviews : DEMO_REVIEWS.map((r, i) => ({ ...r, _id: `fallback-review-${i}` })))
        setReels(Array.isArray(storiesData) ? storiesData.map(s => ({
          ...s,
          poster: s.thumbnail,
          alt: s.title,
          src: s.videoUrl,
          productId: s.productId,
          taggedProduct: s.productId,
        })) : [])
        const bs = bannerSettings || {}
        const heroBanners = ['hero1', 'hero2', 'hero3']
          .filter(k => bs[k] && (bs[k].desktopImage || bs[k].mobileImage || bs[k].image))
          .map(k => ({
            id: k,
            desktopImage: bs[k].desktopImage || bs[k].image,
            mobileImage: bs[k].mobileImage || bs[k].image,
            image: bs[k].image,
            heading: bs[k].heading || bs[k].title,
            subtext: bs[k].subtext || bs[k].subtitle,
            ctaLabel: bs[k].buttonText || 'Shop Now',
            ctaHref: bs[k].buttonLink || '/products',
          }))
        setBanners(heroBanners.length > 0 ? heroBanners : HOME_ASSETS.hero.map((s, i) => ({
          id: s.title || `hero-fallback-${i}`,
          image: s.image || heroPlaceholder(i),
          desktopImage: s.desktopImage || heroPlaceholder(i),
          mobileImage: s.mobileImage || s.tabletImage || heroPlaceholder(i),
          heading: s.title || 'HAiFarmer',
          subtext: s.subtitle || 'Fresh from Forests, Straight to Your Home',
          ctaLabel: s.buttonText || 'Shop Now',
          ctaHref: '/products',
        })))
        const promo = bs.promotional || {}
        setPromoBanner({
          desktopImage: promo.desktopImage || promo.image || bannerPlaceholder(),
          mobileImage: promo.mobileImage || promo.image || bannerPlaceholder(),
          link: promo.buttonLink || '/products',
        })
        const scBanner = bs.shopByCategory || {}
        setShopCategoryBanner({
          desktopImage: scBanner.desktopImage,
          mobileImage: scBanner.mobileImage,
          buttonLink: scBanner.buttonLink || '/products',
          enabled: scBanner.enabled !== false,
        })
      } catch (err) { console.error(err) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!isDemoMode() || settingsLoading) return
    const savedProducts = getItems('products')
    const savedBundles = getItems('bundles')
    const allProducts = [...savedProducts, ...demoProducts.filter(dp => !savedProducts.some(s => s.name === dp.name))]
    const allBundles = [...savedBundles, ...demoCombos.filter(dc => !savedBundles.some(s => s.name === dc.name))]
    const hs = settings?.homeSections || {}
    const idsFor = (key) => Array.isArray(hs[key]) ? hs[key] : []
    const hasConfig = Object.values(hs).some(arr => Array.isArray(arr) && arr.length > 0)
    const pick = (key) => {
      const ids = idsFor(key)
      return allProducts.filter(p => ids.includes(p.id || p._id) || ids.includes(p.name))
    }
    const pickBundles = (key) => {
      const ids = idsFor(key)
      return allBundles.filter(b => ids.includes(b.id || b._id) || ids.includes(b.name))
    }
    if (hasConfig) {
      setHomeSections({
        bestSellers: pick('bestSellers'),
        groceries: pick('groceries'),
        millets: pick('millets'),
        lentilsBeans: pick('lentilsBeans'),
        spices: pick('spices'),
        superSaverCombos: pickBundles('superSaverCombos'),
        combos: pickBundles('combos'),
      })
    } else {
      setHomeSections({
        bestSellers: allProducts.filter(p => p.isFeatured),
        groceries: allProducts,
        millets: allProducts.filter(p => catNameOf(p) === 'millets'),
        lentilsBeans: allProducts.filter(p => catNameOf(p) === 'lentils-beans'),
        spices: allProducts.filter(p => catNameOf(p) === 'spices'),
        superSaverCombos: allBundles.filter(b => (b.comboType === 'super_saver' || b.isSuperSaver) && b.showOnHome !== false),
        combos: allBundles.filter(b => (b.comboType || 'normal') !== 'super_saver' && !b.isSuperSaver && b.showOnHome !== false),
      })
    }
    setReels(demoStories.map(s => ({ poster: s.poster, alt: s.alt || s.title, src: null, duration: s.duration })))
    setBanners(HOME_ASSETS.hero.map((s, i) => ({
      id: s.title || `hero-fallback-${i}`,
      image: s.image || heroPlaceholder(i),
      desktopImage: s.desktopImage || heroPlaceholder(i),
      mobileImage: s.mobileImage || s.tabletImage || heroPlaceholder(i),
      heading: s.title || 'HAiFarmer',
      subtext: s.subtitle || 'Fresh from Forests, Straight to Your Home',
      ctaLabel: s.buttonText || 'Shop Now',
      ctaHref: '/products',
    })))
    setPromoBanner({ desktopImage: bannerPlaceholder(), mobileImage: bannerPlaceholder(), link: '/products' })
    const savedReviews = getItems('reviews')
    const demoReviews = DEMO_REVIEWS.map((r, i) => ({ ...r, _id: `demo-review-${i}` }))
    const mergedReviews = [
      ...savedReviews.filter(r => r.status !== 'draft'),
      ...demoReviews.filter(d => !savedReviews.some(s => s.name === d.name)),
    ].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    setReviews(mergedReviews)
    setLoading(false)
  }, [settings, settingsLoading])

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
      <KenBurnsHero slides={banners} />

      {/* 2. Promotional banner */}
      <section className="py-4 sm:py-5 lg:py-6 bg-white">
        <div className="section-container">
          <Link to={promoBanner.link} className="group relative block rounded-xl overflow-hidden aspect-[4/1] sm:aspect-[6/1] lg:aspect-[10/1]">
            {(promoBanner.desktopImage || promoBanner.mobileImage) ? (
              <picture>
                {promoBanner.desktopImage && (
                  <source media="(min-width: 768px)"
                    srcSet={cld(promoBanner.desktopImage, 'f_auto,q_auto,w_1200')} />
                )}
                <img src={cld(promoBanner.mobileImage || promoBanner.desktopImage, 'f_auto,q_auto,w_600')}
                  alt="Promotional banner" loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center animate-promo-kenburns" />
              </picture>
            ) : (
              <div className="w-full h-32 sm:h-40 bg-green-50 rounded-xl flex items-center justify-center text-muted text-body-sm">
                Promotional Banner — Upload from Admin Panel
              </div>
            )}
          </Link>
        </div>
        <style>{`
          @keyframes promo-kenburns {
            0% { transform: scale(1) translateX(0); }
            50% { transform: scale(1.08) translateX(-1.5%); }
            100% { transform: scale(1) translateX(0); }
          }
          .animate-promo-kenburns {
            animation: promo-kenburns 12s ease-in-out infinite;
          }
          .animate-promo-kenburns:hover {
            animation-play-state: paused;
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-promo-kenburns {
              animation: none !important;
              transform: none !important;
            }
          }
        `}</style>
      </section>

      {/* 3. Why Choose Us */}
      <WhyChooseUs />

      {/* 4. Super Savers */}
      {!loading && superSaverCombos.length === 0 ? null : (
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Best Value</span>
            <h2 className="mt-0.5 text-h2 font-bold">Super Savers</h2>
            <Link to="/combos?tab=super-savers" className="inline-block mt-1 text-caption font-semibold text-green-600 hover:text-green-700">View All →</Link>
          </div>
          {loading ? (
            <HorizontalScroll>
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="min-w-[280px] w-[280px] rounded-xl bg-white border border-border h-96 animate-pulse shrink-0" />)}
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
              <div className="mt-6 text-center sm:hidden">
                <Link to="/combos?tab=super-savers" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg text-body-sm font-semibold hover:bg-green-700 transition-colors">View All Super Savers</Link>
              </div>
            </>
          ) : null}
        </div>
      </section>
      )}

      {/* 5. 9:16 Vertical Videos — Reels with tagged products */}
      <section className="py-10 lg:py-14 bg-off-white overflow-hidden">
        <div className="section-container">
          <div className="text-center mb-6">
            <h2 className="font-heading text-h2 font-bold text-ink">Stories from the Soil</h2>
            <p className="text-body-sm text-muted mt-0.5">Short videos from our tribal communities</p>
          </div>
          <HorizontalScroll>
            {reelProducts.map((reel, i) => (
              <div key={i} className="min-w-[170px] sm:min-w-[220px] lg:min-w-[240px] w-[170px] sm:w-[220px] lg:w-[240px] shrink-0 cursor-pointer" onClick={() => { setViewerIndex(i); setViewerOpen(true) }}>
                <div className="aspect-[9/16] rounded-xl overflow-hidden bg-green-50 relative group">
                  {reel.poster ? (
                    <img src={reel.poster} alt={reel.alt} loading="lazy" className="h-full w-full object-cover object-center" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-green-100">
                      <svg className="h-8 w-8 text-green-600/40" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                      <svg className="h-5 w-5 text-ink ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    {reel.duration && (
                      <span className="inline-block rounded-full bg-white/20 backdrop-blur-sm px-2 py-0.5 text-micro font-medium text-white mb-1">{reel.duration}</span>
                    )}
                    <p className="text-caption font-medium text-white drop-shadow-sm line-clamp-1">{reel.alt}</p>
                  </div>
                </div>
              </div>
            ))}
          </HorizontalScroll>

          {/* Story Viewer */}
          {viewerOpen && (
            <StoryViewer
              stories={reelProducts}
              initialIndex={viewerIndex}
              onClose={() => setViewerOpen(false)}
            />
          )}
        </div>
      </section>

      {/* 6. Best Sellers */}
      {!loading && bestSellers.length === 0 ? null : (
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Top Picks</span>
            <h2 className="mt-0.5 text-h2 font-bold">Our Best Sellers</h2>
            <Link to="/products" className="inline-block mt-1 text-caption font-semibold text-green-600 hover:text-green-700">View All →</Link>
          </div>
          {loading ? (
            <HorizontalScroll>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="min-w-[170px] sm:min-w-[220px] w-[170px] sm:w-[220px] rounded-xl bg-white border border-border h-72 animate-pulse shrink-0" />)}
            </HorizontalScroll>
          ) : bestSellers.length > 0 ? (
            <>
              <HorizontalScroll>
                {bestSellers.map(product => (
                  <div key={product.id || product._id} className="min-w-[170px] sm:min-w-[220px] lg:min-w-[240px] w-[170px] sm:w-[220px] lg:w-[240px] shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </HorizontalScroll>
              <div className="mt-6 text-center sm:hidden">
                <Link to="/products" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg text-body-sm font-semibold hover:bg-green-700 transition-colors">View All Products</Link>
              </div>
            </>
          ) : null}
        </div>
      </section>
      )}

      {/* 7. Groceries — horizontal scroll */}
      {!loading && groceries.length === 0 ? null : (
      <section className="py-10 lg:py-14 bg-off-white overflow-hidden">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Everyday Essentials</span>
            <h2 className="mt-0.5 text-h2 font-bold">Groceries</h2>
            <Link to="/products" className="inline-block mt-1 text-caption font-semibold text-green-600 hover:text-green-700 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <HorizontalScroll>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="min-w-[170px] sm:min-w-[220px] w-[170px] sm:w-[220px] rounded-xl bg-white border border-border h-72 animate-pulse shrink-0" />)}
            </HorizontalScroll>
          ) : groceries.length > 0 ? (
            <HorizontalScroll>
              {groceries.map(product => (
                <div key={product.id || product._id} className="min-w-[170px] sm:min-w-[220px] lg:min-w-[240px] w-[170px] sm:w-[220px] lg:w-[240px] shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </HorizontalScroll>
          ) : null}
        </div>
      </section>
      )}

      {/* 8. Combos */}
      {!loading && normalCombos.length === 0 ? null : (
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Curated Bundles</span>
            <h2 className="mt-0.5 text-h2 font-bold">Combos</h2>
            <Link to="/combos" className="inline-block mt-1 text-caption font-semibold text-green-600 hover:text-green-700">View All →</Link>
          </div>
          {loading ? (
            <HorizontalScroll>
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="min-w-[280px] w-[280px] rounded-xl bg-white border border-border h-96 animate-pulse shrink-0" />)}
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
              <div className="mt-6 text-center sm:hidden">
                <Link to="/combos" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg text-body-sm font-semibold hover:bg-green-700 transition-colors">View All Combos</Link>
              </div>
            </>
          ) : null}
        </div>
      </section>
      )}

      {/* 9. Full screen video */}
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

      {/* 10. Traditional Grains — Millets */}
      {!loading && milletProducts.length === 0 ? null : (
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Traditional Grains</span>
            <h2 className="mt-0.5 text-h2 font-bold">Millets</h2>
            <Link to="/products?category=millets" className="inline-block mt-1 text-caption font-semibold text-green-600 hover:text-green-700">View All →</Link>
          </div>
          {loading ? (
            <HorizontalScroll>
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="min-w-[170px] sm:min-w-[220px] w-[170px] sm:w-[220px] rounded-xl bg-white border border-border h-72 animate-pulse shrink-0" />)}
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
              <div className="mt-6 text-center sm:hidden">
                <Link to="/products?category=millets" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg text-body-sm font-semibold hover:bg-green-700 transition-colors">View All</Link>
              </div>
            </>
          ) : null}
        </div>
      </section>
      )}

      {/* 11. Protein Rich — Lentils & Beans */}
      {!loading && lentilProducts.length === 0 ? null : (
      <section className="py-10 lg:py-14 bg-off-white">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Protein Rich</span>
            <h2 className="mt-0.5 text-h2 font-bold">Lentils & Beans</h2>
            <Link to="/products?category=lentils-beans" className="inline-block mt-1 text-caption font-semibold text-green-600 hover:text-green-700">View All →</Link>
          </div>
          {loading ? (
            <HorizontalScroll>
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="min-w-[170px] sm:min-w-[220px] w-[170px] sm:w-[220px] rounded-xl bg-white border border-border h-72 animate-pulse shrink-0" />)}
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
              <div className="mt-6 text-center sm:hidden">
                <Link to="/products?category=lentils-beans" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg text-body-sm font-semibold hover:bg-green-700 transition-colors">View All</Link>
              </div>
            </>
          ) : null}
        </div>
      </section>
      )}

      {/* 12. Aromatic & Wild — Spices */}
      {!loading && spiceProducts.length === 0 ? null : (
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Aromatic & Wild</span>
            <h2 className="mt-0.5 text-h2 font-bold">Spices</h2>
            <Link to="/products?category=spices" className="inline-block mt-1 text-caption font-semibold text-green-600 hover:text-green-700">View All →</Link>
          </div>
          {loading ? (
            <HorizontalScroll>
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="min-w-[170px] sm:min-w-[220px] w-[170px] sm:w-[220px] rounded-xl bg-white border border-border h-72 animate-pulse shrink-0" />)}
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
              <div className="mt-6 text-center sm:hidden">
                <Link to="/products?category=spices" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg text-body-sm font-semibold hover:bg-green-700 transition-colors">View All</Link>
              </div>
            </>
          ) : null}
        </div>
      </section>
      )}

      {/* 13. Our Process — Farm to Table */}
      <FarmTimeline />



      {/* 14. Shop by Category */}
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
                  <Link to={shopCategoryBanner.enabled !== false && shopCategoryBanner.desktopImage ? shopCategoryBanner.buttonLink || `/products?category=${catName}` : `/products?category=${catName}`}
                    className="group relative rounded-xl overflow-hidden min-h-[240px] lg:min-h-full flex flex-col justify-end p-5 lg:col-span-1">
                    {shopCategoryBanner.enabled !== false && shopCategoryBanner.desktopImage ? (
                      <picture>
                        <source media="(min-width: 768px)" srcSet={cld(shopCategoryBanner.desktopImage, 'f_auto,q_auto,w_800')} />
                        <img src={cld(shopCategoryBanner.mobileImage || shopCategoryBanner.desktopImage, 'f_auto,q_auto,w_600')}
                          alt={cat.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-center" />
                      </picture>
                    ) : (
                      <img src={cat.image_url || cat.image ? getImageUrl(cat.image_url || cat.image) : '/banner.png'} alt={cat.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-center" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-800/30 to-transparent" />
                    <div className="relative z-10">
                      <h3 className="font-heading text-h3 font-bold text-white">{cat.name}</h3>
                      {cat.description && <p className="mt-1 text-body-sm text-white/70 line-clamp-1">{cat.description}</p>}
                      <span className="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-white group-hover:underline">Shop {cat.name} →</span>
                    </div>
                  </Link>
                  <div className="lg:col-span-2 min-w-0">
                    {isLoading ? (
                      <HorizontalScroll>
                        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="min-w-[200px] w-[200px] rounded-xl bg-white border border-border h-72 animate-pulse shrink-0" />)}
                      </HorizontalScroll>
                    ) : catProducts && catProducts.length > 0 ? (
                      <HorizontalScroll>
                        {catProducts.slice(0, 8).map(product => (
                          <div key={product.id || product._id} className="min-w-[170px] sm:min-w-[220px] lg:min-w-[240px] w-[170px] sm:w-[220px] lg:w-[240px] shrink-0">
                            <ProductCard product={product} />
                          </div>
                        ))}
                      </HorizontalScroll>
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

      {/* 15. Testimonials */}
      {reviews.length > 0 && (() => {
        const avgRating = (reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length)
        return (
          <section className="py-10 lg:py-14 bg-off-white">
            <div className="section-container">
              <div className="text-center mb-8">
                <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Our Community</span>
                <h2 className="mt-1 text-h2 font-bold">What Our Customers Say</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <svg key={i} className={`w-4 h-4 ${i <= Math.round(avgRating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-body-sm font-bold text-ink">{avgRating.toFixed(1)}/5</span>
                  <span className="text-caption text-muted">based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <TestimonialsCarousel reviews={reviews} />
            </div>
          </section>
        )
      })()}
    </div>
  )
}
