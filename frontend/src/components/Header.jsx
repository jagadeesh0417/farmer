import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../contexts/CartContext'
import { fetchSiteSettings } from '../contexts/SiteSettingsContext'
import { CartIcon, MenuIcon, CloseIcon } from './Icons'

const ANNOUNCEMENTS = [
  'Free Delivery across all India',
  'COD available',
  'Get 15% off on All Orders! Use Code HAI15',
  'Get 15% off + Mystery Gift on Orders above ₹999',
  'Monsoon Sale is Live — FLAT 25% OFF on select items',
]

const MEGA_CATEGORIES = [
  {
    title: 'Wild Harvested',
    items: [
      { label: 'Honey', to: '/products?category=honey' },
      { label: 'Forest Spices', to: '/products?category=spices' },
      { label: 'Herbs & Roots', to: '/products?category=herbs' },
      { label: 'Wild Rice', to: '/products?category=rice' },
    ]
  },
  {
    title: 'Farm Grown',
    items: [
      { label: 'Millets', to: '/products?category=millets' },
      { label: 'Lentils & Beans', to: '/products?category=lentils-beans' },
      { label: 'Oils & Ghee', to: '/products?category=oils' },
      { label: 'Sugar & Jaggery', to: '/products?category=sugar' },
    ]
  },
  {
    title: 'Sourced For You',
    items: [
      { label: 'Combos & Bundles', to: '/combos' },
      { label: 'Gift Boxes', to: '/products' },
      { label: 'New Arrivals', to: '/products' },
    ]
  },
]

const MEGA_CONDITIONS = [
  {
    title: 'Immunity Care',
    items: [
      { label: 'Cough & Cold', to: '/products' },
      { label: 'Respiratory Care', to: '/products' },
      { label: 'General Wellness', to: '/products' },
    ]
  },
  {
    title: 'Gut Care',
    items: [
      { label: 'Digestive Health', to: '/products?category=millets' },
      { label: 'Colon Cleansing', to: '/products' },
      { label: 'Metabolism Care', to: '/products' },
    ]
  },
  {
    title: 'Heart Care',
    items: [
      { label: 'Cholesterol Care', to: '/products' },
      { label: 'Blood Pressure', to: '/products' },
      { label: 'Healthy Cooking', to: '/products?category=oils' },
    ]
  },
  {
    title: 'Energy & Vitality',
    items: [
      { label: 'Natural Energy', to: '/products?category=sugar' },
      { label: 'Stamina Support', to: '/products' },
      { label: 'Daily Nutrition', to: '/products?category=spices' },
    ]
  },
]

export default function Header() {
  const { cartItems } = useCart()
  const navigate = useNavigate()
  const [logo, setLogo] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [megaCategoryOpen, setMegaCategoryOpen] = useState(false)
  const [megaConditionOpen, setMegaConditionOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const totalItems = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchSiteSettings()
        setLogo(s?.logo || s?.logo_url || '')
      } catch {}
    })()
  }, [])

  const closeAll = () => { setMenuOpen(false); setMegaCategoryOpen(false); setMegaConditionOpen(false); setSearchOpen(false) }

  return (
    <>
      {/* Announcement bar */}
      <div className="announcement-bar bg-green-600 text-white text-nav font-medium tracking-[0.06em] overflow-hidden h-9 flex items-center">
        <div className="announcement-marquee">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="mx-12 inline-block whitespace-nowrap">{ANNOUNCEMENTS[i % ANNOUNCEMENTS.length]}</span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="section-container flex items-center justify-between py-3 lg:py-4">
          {/* Left: desktop nav + mega dropdowns */}
          <nav className="hidden lg:flex items-center gap-0 flex-1">
            <div className="relative" onMouseEnter={() => { setMegaCategoryOpen(true); setMegaConditionOpen(false) }} onMouseLeave={() => setMegaCategoryOpen(false)}>
              <button className={`px-4 py-2 text-nav font-medium text-ink hover:text-green-600 transition-colors flex items-center gap-1 ${megaCategoryOpen ? 'text-green-600' : ''}`}>
                Shop By Category
                <svg className={`h-3 w-3 transition-transform ${megaCategoryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
            <div className="relative" onMouseEnter={() => { setMegaConditionOpen(true); setMegaCategoryOpen(false) }} onMouseLeave={() => setMegaConditionOpen(false)}>
              <button className={`px-4 py-2 text-nav font-medium text-ink hover:text-green-600 transition-colors flex items-center gap-1 ${megaConditionOpen ? 'text-green-600' : ''}`}>
                Shop By Condition
                <svg className={`h-3 w-3 transition-transform ${megaConditionOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
            <NavLink to="/products" className={({ isActive }) => `px-4 py-2 text-nav font-medium transition-colors ${isActive ? 'text-green-600' : 'text-ink hover:text-green-600'}`}>All Products</NavLink>
            <NavLink to="/combos" className={({ isActive }) => `px-4 py-2 text-nav font-medium transition-colors ${isActive ? 'text-green-600' : 'text-ink hover:text-green-600'}`}>Combos</NavLink>
            <NavLink to="/about" className={({ isActive }) => `px-4 py-2 text-nav font-medium transition-colors ${isActive ? 'text-green-600' : 'text-ink hover:text-green-600'}`}>Our Story</NavLink>
          </nav>

          {/* Right: Logo + icons */}
          <div className="hidden lg:flex items-center gap-0 flex-1 justify-end">
            <Link to="/" className="flex items-center gap-2 shrink-0 mr-4" onClick={closeAll}>
              {logo ? (
                <img src={logo} alt="HaiFarmer" loading="eager" className="h-10 lg:h-12 w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-green-600">
                    <svg viewBox="0 0 32 32" fill="none" className="h-5 w-5 lg:h-6 lg:w-6 text-white">
                      <path d="M16 4C12 4 8 8 8 14c0 8 8 14 8 14s8-6 8-14c0-6-4-10-8-10z" fill="currentColor" opacity="0.9"/>
                      <path d="M16 8c-2 0-4 3-4 6 0 4 4 8 4 8s4-4 4-8c0-3-2-6-4-6z" fill="currentColor" opacity="0.6"/>
                    </svg>
                  </div>
                  <span className="font-heading text-h3 lg:text-h2 font-bold text-green-600 tracking-tight">HaiFarmer</span>
                </div>
              )}
            </Link>

            <div className="w-px h-4 bg-border mx-2" />

            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="flex items-center justify-center p-2 text-muted hover:text-green-600 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
            <button onClick={() => navigate('/orders')} aria-label="Track order" className="flex items-center justify-center p-2 text-muted hover:text-green-600 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            </button>
            <button onClick={() => navigate('/checkout')} aria-label="Cart" className="relative flex items-center justify-center p-2 text-muted hover:text-green-600 transition-colors">
              <CartIcon className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-green-600 min-w-[18px] h-[18px] px-1 text-micro font-bold text-white shadow-sm">{totalItems}</span>
              )}
            </button>
          </div>

          {/* Mobile: right icons */}
          <div className="flex lg:hidden items-center gap-0">
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="flex items-center justify-center p-2 text-muted hover:text-green-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
            <button onClick={() => navigate('/checkout')} aria-label="Cart" className="relative flex items-center justify-center p-2 text-muted hover:text-green-600">
              <CartIcon className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-green-600 min-w-[18px] h-[18px] px-1 text-micro font-bold text-white shadow-sm">{totalItems}</span>
              )}
            </button>
            <button type="button" className="flex items-center justify-center p-2 text-muted hover:text-green-600" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mega dropdown - Shop By Category */}
        {megaCategoryOpen && (
          <div className="hidden lg:block absolute left-0 right-0 top-full bg-white border-t border-border shadow-md" onMouseEnter={() => setMegaCategoryOpen(true)} onMouseLeave={() => setMegaCategoryOpen(false)}>
            <div className="section-container py-8">
              <div className="grid grid-cols-4 gap-8">
                {MEGA_CATEGORIES.map(cat => (
                  <div key={cat.title}>
                    <h3 className="font-heading text-body-sm font-bold text-ink mb-4">{cat.title}</h3>
                    <ul className="space-y-2.5">
                      {cat.items.map(item => (
                        <li key={item.label}>
                          <Link to={item.to} onClick={() => setMegaCategoryOpen(false)} className="text-body-sm text-muted hover:text-green-600 transition-colors">{item.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                <Link to="/products" onClick={() => setMegaCategoryOpen(false)} className="text-body-sm font-semibold text-green-600 hover:text-green-700 transition-colors">View All Products →</Link>
                <Link to="/combos" onClick={() => setMegaCategoryOpen(false)} className="text-body-sm font-semibold text-green-600 hover:text-green-700 transition-colors">Shop Combos →</Link>
              </div>
            </div>
          </div>
        )}

        {/* Mega dropdown - Shop By Condition */}
        {megaConditionOpen && (
          <div className="hidden lg:block absolute left-0 right-0 top-full bg-white border-t border-border shadow-md" onMouseEnter={() => setMegaConditionOpen(true)} onMouseLeave={() => setMegaConditionOpen(false)}>
            <div className="section-container py-8">
              <div className="grid grid-cols-4 gap-8">
                {MEGA_CONDITIONS.map(cond => (
                  <div key={cond.title}>
                    <h3 className="font-heading text-body-sm font-bold text-ink mb-4">{cond.title}</h3>
                    <ul className="space-y-2.5">
                      {cond.items.map(item => (
                        <li key={item.label}>
                          <Link to={item.to} onClick={() => setMegaConditionOpen(false)} className="text-body-sm text-muted hover:text-green-600 transition-colors">{item.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <Link to="/products" onClick={() => setMegaConditionOpen(false)} className="text-body-sm font-semibold text-green-600 hover:text-green-700 transition-colors">Browse All Products →</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center border-b border-border px-5 py-4">
            <svg className="h-5 w-5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" placeholder="Search products..." autoFocus className="flex-1 ml-3 text-lg text-ink placeholder:text-muted-light outline-none bg-transparent" />
            <button onClick={() => setSearchOpen(false)} className="text-sm font-medium text-muted hover:text-ink ml-4">Cancel</button>
          </div>
          <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
            <h3 className="text-nav font-semibold tracking-[0.12em] uppercase text-muted mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Honey', 'Millets', 'Spices', 'Lentils & Beans', 'Oils & Ghee', 'Combos', 'Wild Harvested', 'Farm Grown'].map(item => (
                <Link key={item} to="/products" onClick={() => setSearchOpen(false)} className="block rounded-none border border-border px-4 py-3 text-sm text-ink hover:border-green-600 hover:text-green-600 transition-all">{item}</Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <span className="font-heading text-h3 font-bold text-ink">Menu</span>
            <button onClick={() => setMenuOpen(false)} className="p-1 text-muted hover:text-ink"><CloseIcon className="h-5 w-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-1 font-menu">
            <NavLink to="/" end onClick={closeAll} className={({ isActive }) => `block rounded-none px-4 py-3 text-sm font-semibold ${isActive ? 'bg-green-50 text-green-600' : 'text-ink hover:bg-green-50 hover:text-green-600'}`}>Home</NavLink>
            <NavLink to="/products" onClick={closeAll} className={({ isActive }) => `block rounded-none px-4 py-3 text-sm font-semibold ${isActive ? 'bg-green-50 text-green-600' : 'text-ink hover:bg-green-50 hover:text-green-600'}`}>All Products</NavLink>
            <NavLink to="/combos" onClick={closeAll} className={({ isActive }) => `block rounded-none px-4 py-3 text-sm font-semibold ${isActive ? 'bg-green-50 text-green-600' : 'text-ink hover:bg-green-50 hover:text-green-600'}`}>Combos</NavLink>
            <NavLink to="/about" onClick={closeAll} className={({ isActive }) => `block rounded-none px-4 py-3 text-sm font-semibold ${isActive ? 'bg-green-50 text-green-600' : 'text-ink hover:bg-green-50 hover:text-green-600'}`}>Our Story</NavLink>
            <NavLink to="/contact" onClick={closeAll} className={({ isActive }) => `block rounded-none px-4 py-3 text-sm font-semibold ${isActive ? 'bg-green-50 text-green-600' : 'text-ink hover:bg-green-50 hover:text-green-600'}`}>Contact</NavLink>

            <div className="pt-4 border-t border-border mt-4">
              <h4 className="text-nav font-semibold tracking-[0.1em] uppercase text-muted mb-3 px-4">Shop By Category</h4>
              {MEGA_CATEGORIES.map(cat => (
                <div key={cat.title} className="mb-3">
                  <p className="text-caption font-semibold text-ink px-4 py-1">{cat.title}</p>
                  {cat.items.map(item => (
                    <Link key={item.label} to={item.to} onClick={closeAll} className="block rounded-none px-8 py-2 text-sm text-muted hover:text-green-600 hover:bg-green-50">{item.label}</Link>
                  ))}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border mt-2">
              <h4 className="text-nav font-semibold tracking-[0.1em] uppercase text-muted mb-3 px-4">Shop By Condition</h4>
              {MEGA_CONDITIONS.map(cond => (
                <div key={cond.title} className="mb-3">
                  <p className="text-caption font-semibold text-ink px-4 py-1">{cond.title}</p>
                  {cond.items.map(item => (
                    <Link key={item.label} to={item.to} onClick={closeAll} className="block rounded-none px-8 py-2 text-sm text-muted hover:text-green-600 hover:bg-green-50">{item.label}</Link>
                  ))}
                </div>
              ))}
            </div>

            <div className="pt-4 px-4">
              <a href="https://wa.me/919709704563?text=Hello%20HaiFarmer" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-600 text-white rounded-none px-4 py-3 text-sm font-semibold hover:bg-green-700 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Talk to Us
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
