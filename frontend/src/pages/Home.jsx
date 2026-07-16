import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import ProductCard from '../components/ProductCard'
import BundleCard from '../components/BundleCard'
import { getImageUrl } from '../lib/utils'
import { CartIcon } from '../components/Icons'

const PLACEHOLDER_SVG = '/placeholder.jpg'

function slugify(name) {
  return (name || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function prefetchImage(src) {
  if (!src) return
  const img = new Image()
  img.src = src
}

export default function Home() {
  const { cartItems } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)

  const [homeAssets, setHomeAssets] = useState({
    legacyHomeBannerUrl: '',
    homeMainBanner1Url: '',
    homeMainBanner2Url: '',
    homeMainBanner3Url: '',
    homeMainBanner4Url: '',
    homeMiddleTopBannerUrl: '',
    homeMiddleBottomBannerUrl: '',
    homeRightStoryBannerUrl: '',
    adBannerLeftUrl: '',
    adBannerRightUrl: ''
  })

  const [bannerLinksMap, setBannerLinksMap] = useState({})
  const [carouselIdx, setCarouselIdx] = useState(0)
  const [transition, setTransition] = useState(true)
  const [paused, setPaused] = useState(false)
  const [touchStart, setTouchStart] = useState(null)

  const carouselRef = useRef(null)
  const cartCount = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  const handleBannerClick = (key) => {
    const url = bannerLinksMap[key]
    if (url) {
      if (url.startsWith('/')) navigate(url)
      else window.open(url, '_blank')
    }
  }

  const bannerUrls = [
    homeAssets.homeMainBanner1Url || homeAssets.legacyHomeBannerUrl || '',
    homeAssets.homeMainBanner2Url || '',
    homeAssets.homeMainBanner3Url || '',
    homeAssets.homeMainBanner4Url || ''
  ].filter(u => u !== '')

  const sideBanners = {
    middleTop: homeAssets.homeMiddleTopBannerUrl || '',
    middleBottom: homeAssets.homeMiddleBottomBannerUrl || '',
    rightStory: homeAssets.homeRightStoryBannerUrl || ''
  }

  const promoBanners = [
    { url: homeAssets.promoBanner1Url || '', link: homeAssets.promoBanner1Link || '' },
    { url: homeAssets.promoBanner2Url || '', link: homeAssets.promoBanner2Link || '' },
    { url: homeAssets.promoBanner3Url || '', link: homeAssets.promoBanner3Link || '' },
  ].filter(b => b.url)

  const adBanners = {
    left: homeAssets.adBannerLeftUrl || '',
    right: homeAssets.adBannerRightUrl || ''
  }

  const goPrev = () => {
    setCarouselIdx(prev => prev > 0 ? prev - 1 : bannerUrls.length - 1)
  }
  const goNext = () => {
    setCarouselIdx(prev => (prev + 1) % bannerUrls.length)
  }
  const goDot = (i) => {
    setTransition(true)
    setCarouselIdx(i)
  }

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX)
  const handleTouchEnd = (e) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev()
    setTouchStart(null)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [supabaseMod, settingsMod] = await Promise.all([
          import('../lib/supabase'),
          import('../lib/productService')
        ])
        const { supabase } = supabaseMod
        const { getNewArrivals, getComboBundles, getBannerLinks } = await import('../lib/productService')

        const [productsData, bundlesData, bannerLinksData] = await Promise.all([
          getNewArrivals().catch(() => []),
          getComboBundles().catch(() => []),
          getBannerLinks().catch(() => [])
        ])

        if (cancelled) return
        setProducts(productsData || [])
        setBundles(bundlesData || [])

        const bannerLinksMapNew = {}
        ;(bannerLinksData || []).forEach(bl => {
          if (bl.is_active) bannerLinksMapNew[bl.banner_key] = bl.link_url
        })
        setBannerLinksMap(bannerLinksMapNew)

        const s = settings || {}
        const assets = {
          legacyHomeBannerUrl: s.home_banner_url || '',
          homeMainBanner1Url: s.home_main_banner_1_url || s.home_left_banner_url || '',
          homeMainBanner2Url: s.home_main_banner_2_url || '',
          homeMainBanner3Url: s.home_main_banner_3_url || '',
          homeMainBanner4Url: s.home_main_banner_4_url || '',
          homeMiddleTopBannerUrl: s.home_middle_top_banner_url || '',
          homeMiddleBottomBannerUrl: s.home_middle_bottom_banner_url || '',
          homeRightStoryBannerUrl: s.home_right_story_banner_url || '',
          adBannerLeftUrl: s.ad_banner_left_url || '',
          adBannerRightUrl: s.ad_banner_right_url || '',
          promoBanner1Url: s.promo_banner_1_url || '',
          promoBanner1Link: s.promo_banner_1_link || '',
          promoBanner2Url: s.promo_banner_2_url || '',
          promoBanner2Link: s.promo_banner_2_link || '',
          promoBanner3Url: s.promo_banner_3_url || '',
          promoBanner3Link: s.promo_banner_3_link || ''
        }
        setHomeAssets(assets)

        Object.values(assets).forEach(prefetchImage)
      } catch (err) {
        console.error('Error loading homepage data:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)')
    const handler = (e) => setIsMobile(e.matches)
    setIsMobile(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (paused || bannerUrls.length < 2) return
    const id = window.setInterval(() => setCarouselIdx(prev => (prev + 1) % bannerUrls.length), 2100)
    return () => window.clearInterval(id)
  }, [paused, bannerUrls.length])

  const displayProducts = products.length > 5 ? [...products, ...products, ...products] : products

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6 sm:py-8 lg:px-8">
      {/* BANNER GRID SECTION */}
      {(bannerUrls.length > 0) && (
        <section className="grid gap-3 md:grid-cols-[2fr,1fr] lg:grid-cols-[2.2fr,0.85fr,0.6fr]">
          <div
            className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex h-48 sm:h-64 lg:h-[330px]"
              style={{
                width: `${100 * bannerUrls.length}%`,
                transform: `translateX(-${100 / bannerUrls.length * carouselIdx}%)`,
                transition: transition ? 'transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1)' : 'none'
              }}
            >
              {bannerUrls.map((url, idx) => {
                const bannerKey = ['home_main_banner_1', 'home_main_banner_2', 'home_main_banner_3', 'home_main_banner_4'][idx]
                const hasLink = !!bannerLinksMap[bannerKey]
                return (
                  <img
                    key={`main-banner-${idx}`}
                    src={url}
                    alt={`Main offer banner ${idx + 1}`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                    onClick={() => handleBannerClick(bannerKey)}
                    className={`h-48 w-full flex-shrink-0 object-cover sm:h-64 lg:h-[330px]${hasLink ? ' cursor-pointer hover:opacity-90' : ''}`}
                    style={{ width: `${100 / bannerUrls.length}%` }}
                  />
                )
              })}
            </div>
            {bannerUrls.length > 1 && (
              <>
                <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-700 shadow hover:bg-white transition sm:p-2" aria-label="Previous banner">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-700 shadow hover:bg-white transition sm:p-2" aria-label="Next banner">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {bannerUrls.map((_, i) => (
                    <button key={i} onClick={() => goDot(i)} className={`h-2 w-2 rounded-full transition ${i === carouselIdx ? 'bg-white' : 'bg-white/50'}`} aria-label={`Go to banner ${i + 1}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <img
                src={sideBanners.middleTop}
                alt="Top side offer banner"
                loading="eager"
                fetchPriority="high"
                onClick={() => handleBannerClick('home_middle_top_banner')}
                className={`w-full object-contain sm:h-[158px] sm:object-cover lg:h-[159px] ${bannerLinksMap.home_middle_top_banner ? 'cursor-pointer hover:opacity-90' : ''}`}
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <img
                src={sideBanners.middleBottom}
                alt="Bottom side offer banner"
                loading="eager"
                fetchPriority="high"
                onClick={() => handleBannerClick('home_middle_bottom_banner')}
                className={`w-full object-contain sm:h-[158px] sm:object-cover lg:h-[159px] ${bannerLinksMap.home_middle_bottom_banner ? 'cursor-pointer hover:opacity-90' : ''}`}
              />
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
            <img
              src={sideBanners.rightStory}
              alt="Farmer story banner"
              loading="eager"
              fetchPriority="high"
              onClick={() => handleBannerClick('home_right_story_banner')}
              className={`h-48 w-full object-cover sm:h-64 lg:h-[330px] ${bannerLinksMap.home_right_story_banner ? 'cursor-pointer hover:opacity-90' : ''}`}
            />
          </div>
        </section>
      )}

      {/* NEW ARRIVALS SECTION */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">New arrivals</h2>
          <Link className="text-brand-600 hover:text-brand-700" to="/products">Browse all</Link>
        </div>
        <p className="text-slate-600 text-sm mt-1 mb-6">Naturally grown from tribal villages 🌿 Rainwater-fed 🌧 Minimal pollution</p>
        <div className="relative mt-6">
          {products.length === 0
            ? <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">No new arrivals selected yet.</div>
            : (
              <>
                <div
                  ref={carouselRef}
                  className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-10"
                  style={isMobile ? { paddingLeft: 'calc(50% - 100px)', paddingRight: 'calc(50% - 100px)' } : undefined}
                >
                  {displayProducts.map((product, idx) => (
                    <div key={`${product.id}-${idx}`} data-new-arrival-card="true" className="w-[170px] flex-none">
                      <ProductCard product={product} compact />
                    </div>
                  ))}
                </div>
              </>
            )
          }
        </div>
      </section>

      {/* 3 MIDDLE PROMO BANNERS */}
      {promoBanners.length > 0 && (
        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          {promoBanners.map((b, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {b.link ? (
                <a href={b.link.startsWith('/') ? b.link : undefined} onClick={b.link.startsWith('/') ? undefined : () => window.open(b.link, '_blank')} target={b.link.startsWith('/') ? undefined : '_blank'} rel={b.link.startsWith('/') ? undefined : 'noopener noreferrer'}>
                  <img src={b.url} alt={`Promotional banner ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover transition hover:opacity-90 sm:aspect-[3/2]" />
                </a>
              ) : (
                <img src={b.url} alt={`Promotional banner ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover sm:aspect-[3/2]" />
              )}
            </div>
          ))}
        </section>
      )}

      {/* AD BANNERS */}
      {(adBanners.left || adBanners.right) && (
        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {adBanners.left && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img
                src={adBanners.left}
                alt="Advertisement banner for dry fruits"
                onClick={() => handleBannerClick('ad_banner_left')}
                className={`aspect-[16/5] w-full object-cover ${bannerLinksMap.ad_banner_left ? 'cursor-pointer hover:opacity-90' : ''}`}
              />
            </div>
          )}
          {adBanners.right && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img
                src={adBanners.right}
                alt="Advertisement banner for spices and masalas"
                onClick={() => handleBannerClick('ad_banner_right')}
                className={`aspect-[16/5] w-full object-cover ${bannerLinksMap.ad_banner_right ? 'cursor-pointer hover:opacity-90' : ''}`}
              />
            </div>
          )}
        </section>
      )}

      {/* COMBOS SECTION */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Combo's</h2>
          <Link className="text-brand-600 hover:text-brand-700" to="/combos">View bundles</Link>
        </div>
        <p className="text-slate-600 text-sm mt-1 mb-6">Curated bundles from tribal farms 🌿 Natural farming 🌿 Pure quality</p>
        <div className="mt-6 grid grid-cols-1 gap-6">
          {bundles.length === 0
            ? <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">No combos selected yet.</div>
            : bundles.map(b => <BundleCard key={b.id} bundle={b} />)
          }
        </div>
      </section>

      {/* FLOATING CART BUTTON */}
      <button
        type="button"
        onClick={() => navigate('/checkout')}
        className="fixed bottom-[68px] right-4 z-50 inline-flex h-14 w-14 animate-[bounce_3s_ease-in-out_infinite] items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_14px_28px_rgba(22,163,74,0.35)] transition hover:-translate-y-1 hover:bg-brand-700 sm:bottom-6 sm:right-8 sm:h-16 sm:w-16"
        aria-label="Open shopping cart"
      >
        <CartIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">{cartCount}</span>
        )}
      </button>
    </div>
  )
}
