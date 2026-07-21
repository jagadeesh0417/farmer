import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useCart } from '../contexts/CartContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import SeoHead from '../components/SeoHead'
import { api } from '../lib/api'
import { optimizeImage } from '../lib/utils'
import { CartIcon } from '../components/Icons'

export default function Home() {
  const { cartItems } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const cartCount = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [productsData, bannerData] = await Promise.all([
          api.getProducts({ limit: 8 }).then(r => r.data || []).catch(() => []),
          api.getBanners({ position: 'hero' }).catch(() => []),
        ])
        if (cancelled) return
        setProducts(productsData)
        setBanners(bannerData)
      } catch (err) { console.error(err) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const bgImage = banners?.[0]?.image || settings?.hero_image || ''

  return (
    <div className="bg-cream-50">
      <SeoHead title="HaiFarmer" description="Wild-harvested and natural products sourced directly from tribal communities. Pure. Honest. Sustainable." />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center bg-forest-900 overflow-hidden">
        <div className="absolute inset-0">
          {bgImage && (
            <img src={optimizeImage(bgImage, 2000)} alt="" className="h-full w-full object-cover" loading="eager" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-forest-900/90 via-forest-900/70 to-forest-900/40" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl animate-fade-up">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-terracotta-500 mb-4">Rooted in Tradition. Shared with Love.</p>
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] text-cream-50 tracking-tight">
                Real Food.<br />
                <span className="text-gold-500 italic">Real Farmers.</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-cream-50/60 sm:text-base">
                Discover wild-harvested and natural products sourced directly from tribal communities. Pure. Honest. Sustainable.
              </p>
              <Link to="/products" className="mt-8 inline-flex items-center gap-2 bg-terracotta-500 px-9 py-3.5 text-[11px] font-semibold tracking-[0.16em] uppercase text-cream-50 transition-all hover:bg-terracotta-600 hover:-translate-y-0.5 shadow-xl shadow-terracotta-500/25 btn-lift" style={{ borderRadius: '4px' }}>
                Explore Our Products
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {['100% Natural', 'Ethically Sourced', 'Farm to Home'].map(label => (
                  <div key={label} className="flex items-center gap-2 text-[10px] font-medium tracking-[0.15em] uppercase text-cream-50/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex justify-end">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full animate-spin-slow" viewBox="0 0 100 100">
                  <defs><path id="sealPath" d="M50 5a45 45 0 1 1 0 90 45 45 0 0 1 0-90" fill="none" /></defs>
                  <text fontSize="7" fontWeight="600" letterSpacing="4" fill="#C9A24C"><textPath href="#sealPath" startOffset="3%">WILD · NATURAL · ETHICAL ·</textPath></text>
                </svg>
                <div className="flex flex-col items-center">
                  <span className="font-heading text-4xl font-bold text-gold-500 leading-none">100%</span>
                  <span className="text-[8px] tracking-[0.15em] uppercase text-gold-500/60">Pure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="curve-divider absolute bottom-0 left-0 right-0 z-10" />
      </section>

      {/* Our Story — From the Tribes */}
      <section className="relative py-24 lg:py-28 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-terracotta-500">Our Story</p>
              <div className="zigzag inline-block mt-1 mb-6" />
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-ink tracking-tight leading-[1.08]">
                From the <span className="text-terracotta-500 italic">Tribes</span>
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-muted">
                HaiFarmer was born from a simple belief — that the purest food comes from the closest bond with nature.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                We work hand-in-hand with tribal communities across India, bringing you whole, natural products while creating real impact where it matters most.
              </p>
              <Link to="/about" className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-terracotta-500 hover:text-terracotta-600 transition-colors">
                Read Our Story
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden bg-forest-900/5 aspect-[4/3]">
                <div className="w-full h-full bg-gradient-to-br from-sage-300/30 to-cream-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto rounded-full bg-terracotta-500/10 flex items-center justify-center">
                      <svg className="h-10 w-10 text-terracotta-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <p className="mt-4 text-sm text-muted italic">Tribal women harvesting</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-48 h-48 rounded-2xl bg-terracotta-500/10 -z-10" />
            </div>
          </div>
        </div>
        {/* Features */}
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 mt-14">
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: '🤝', title: 'Direct from Tribes', desc: 'No middlemen. Just honest relationships and fair trade.' },
              { icon: '🌿', title: '100% Natural', desc: 'Wild-harvested and chemical-free, as nature intended.' },
              { icon: '💪', title: 'Creating Impact', desc: 'Empowering tribal communities and preserving their traditions.' },
            ].map(f => (
              <div key={f.title} className="flex gap-4 items-start">
                <span className="text-2xl shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-heading text-base font-semibold text-ink">{f.title}</h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="relative bg-forest-900 py-24 lg:py-28 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-gold-500">Our Collection</p>
              <h2 className="mt-3 font-heading text-4xl sm:text-5xl font-bold text-cream-50 tracking-tight leading-[1.08]">Best Sellers</h2>
              <Link to="/products" className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-gold-500 hover:text-gold-400 transition-colors">
                View All Products
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-forest-950/60 skeleton h-64" />
                ))
              ) : products.length > 0 ? (
                products.slice(0, 4).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-forest-950/60 border border-gold-500/10 p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-forest-900 mx-auto flex items-center justify-center text-2xl">🌾</div>
                    <p className="mt-2 font-heading text-sm text-cream-50/60">Product</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Impact — Empowering Lives, Naturally */}
      <section id="impact" className="relative bg-forest-900 py-24 lg:py-28 overflow-hidden gold-diamond-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-gold-500">Our Impact</p>
              <h2 className="mt-2 font-heading text-4xl sm:text-5xl font-bold text-cream-50 tracking-tight leading-[1.08]">Empowering Lives,<br /><span className="text-gold-500 italic">Naturally</span></h2>
              <p className="mt-5 text-sm leading-relaxed text-cream-50/60 max-w-md">
                Every purchase you make helps us support tribal families and preserve natural ecosystems.
              </p>
              <Link to="/about" className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-gold-500 hover:text-gold-400 transition-colors">
                See Our Impact
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: '👥', label: 'Tribal Lives Supported', value: '12,500+' },
                { icon: '👨‍🌾', label: 'Tribal Farmers Empowered', value: '250+' },
                { icon: '🌳', label: 'Forest Produce Sourced', value: '50+' },
                { icon: '🌿', label: 'Natural & Sustainable', value: '100%' },
              ].map((stat, i) => (
                <div key={stat.label} className={`${i % 2 === 0 ? 'lg:translate-y-6' : ''}`}>
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0">
                      <svg className="h-5 w-5 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                    <div>
                      <span className="font-heading text-3xl font-bold text-gold-500 block">{stat.value}</span>
                      <span className="text-[11px] text-cream-50/60 leading-tight block mt-0.5">{stat.label}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Floating cart */}
      <button type="button" onClick={() => navigate('/checkout')}
        className="fixed bottom-[76px] left-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta-500 text-cream-50 shadow-[0_8px_32px_rgba(176,83,47,0.35)] transition-all hover:bg-terracotta-600 hover:-translate-y-1 sm:bottom-8 sm:left-8 sm:h-16 sm:w-16 btn-lift"
        aria-label="Shopping cart">
        <CartIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-forest-900 px-2 py-0.5 text-xs font-bold text-cream-50 shadow-sm">{cartCount}</span>
        )}
      </button>
    </div>
  )
}