import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { fetchSiteSettings } from '../contexts/SiteSettingsContext'
import { CartIcon, AccountIcon, LogoutIcon, MenuIcon, CloseIcon } from './Icons'

export default function Header() {
  const { user, signOut } = useAuth()
  const { cartItems } = useCart()
  const navigate = useNavigate()
  const [logo, setLogo] = useState('')
  const [headerText, setHeaderText] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdown, setDropdown] = useState(null)

  const totalItems = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchSiteSettings()
        setLogo(s?.logo || s?.logo_url || '')
        setHeaderText(s?.headerText1 || s?.header_text_1 || '')
      } catch { setLogo(''); setHeaderText('') }
    })()
  }, [])

  const closeMenu = () => { setMenuOpen(false); setDropdown(null) }

  const navItems = [
    { label: 'Home', to: '/', end: true },
    { label: 'Shop ▾', to: '/products', children: [
      { label: 'All Products', to: '/products' },
      { label: 'Millets', to: '/products?category=millets' },
      { label: 'Honey', to: '/products?category=honey' },
      { label: 'Spices', to: '/products?category=spices' },
      { label: 'Combos', to: '/combos' },
    ]},
    { label: 'Our Story ▾', to: '/about', children: [
      { label: 'About Us', to: '/about' },
      { label: 'Our Farmers', to: '/farmers' },
    ]},
    { label: 'Impact ▾', to: '/#impact' },
    { label: 'Journal ▾', to: '/#journal' },
    { label: 'Contact', to: '/#contact' },
  ]

  const underlineClass = ({ isActive }) =>
    `nav-underline px-3 py-2 text-[11px] font-medium tracking-[0.18em] uppercase transition-colors duration-200 ` +
    (isActive ? 'text-gold-500 active' : 'text-cream-50/70 hover:text-gold-500')

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-forest-900/95 shadow-[0_4px_30px_rgba(0,0,0,0.25)] backdrop-blur-md' : 'bg-forest-900'}`}>
      {headerText && (
        <div className="overflow-hidden px-4 py-1.5 text-[10px] font-medium tracking-[0.12em] uppercase text-cream-50/60 bg-forest-950/80">
          <div className="header-marquee whitespace-nowrap">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="mx-10 inline-block whitespace-pre">{headerText}</span>
            ))}
          </div>
        </div>
      )}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 lg:px-10">
        <Link to="/" className="flex items-center gap-3 group" onClick={closeMenu}>
          {logo ? (
            <img src={logo} alt="HaiFarmer" loading="eager" className="h-11 w-auto object-contain sm:h-12" />
          ) : (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta-500 shadow-lg">
                <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6 text-cream-50">
                  <path d="M16 4C12 4 8 8 8 14c0 8 8 14 8 14s8-6 8-14c0-6-4-10-8-10z" fill="currentColor" opacity="0.9"/>
                  <path d="M16 8c-2 0-4 3-4 6 0 4 4 8 4 8s4-4 4-8c0-3-2-6-4-6z" fill="currentColor" opacity="0.6"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-xl font-bold tracking-tight text-cream-50 leading-none">HaiFarmer</span>
                <span className="text-[8px] tracking-[0.2em] uppercase text-cream-50/40 mt-0.5">From the wild. For the world.</span>
              </div>
            </>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={underlineClass}>Home</NavLink>
          <div className="relative" onMouseEnter={() => setDropdown('shop')} onMouseLeave={() => setDropdown(null)}>
            <NavLink to="/products" className={underlineClass}>Shop <span className="text-[8px]">▾</span></NavLink>
            {dropdown === 'shop' && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-forest-950 border border-gold-500/10 shadow-xl py-2 z-50">
                {[{ label: 'All Products', to: '/products' }, { label: 'Millets', to: '/products?category=millets' }, { label: 'Honey', to: '/products?category=honey' }, { label: 'Spices', to: '/products?category=spices' }, { label: 'Combos', to: '/combos' }].map(item => (
                  <Link key={item.to} to={item.to} onClick={closeMenu} className="block px-4 py-2 text-xs text-cream-50/60 hover:text-gold-500 hover:bg-cream-50/5 transition-colors">{item.label}</Link>
                ))}
              </div>
            )}
          </div>
          <div className="relative" onMouseEnter={() => setDropdown('story')} onMouseLeave={() => setDropdown(null)}>
            <NavLink to="/about" className={underlineClass}>Our Story <span className="text-[8px]">▾</span></NavLink>
            {dropdown === 'story' && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-forest-950 border border-gold-500/10 shadow-xl py-2 z-50">
                <Link to="/about" onClick={closeMenu} className="block px-4 py-2 text-xs text-cream-50/60 hover:text-gold-500 hover:bg-cream-50/5 transition-colors">About Us</Link>
                <Link to="/farmers" onClick={closeMenu} className="block px-4 py-2 text-xs text-cream-50/60 hover:text-gold-500 hover:bg-cream-50/5 transition-colors">Our Farmers</Link>
              </div>
            )}
          </div>
          <a href="/#impact" className={`nav-underline px-3 py-2 text-[11px] font-medium tracking-[0.18em] uppercase text-cream-50/70 hover:text-gold-500`}>Impact <span className="text-[8px]">▾</span></a>
          <a href="/#journal" className={`nav-underline px-3 py-2 text-[11px] font-medium tracking-[0.18em] uppercase text-cream-50/70 hover:text-gold-500`}>Journal <span className="text-[8px]">▾</span></a>
          <a href="/#contact" className={`nav-underline px-3 py-2 text-[11px] font-medium tracking-[0.18em] uppercase text-cream-50/70 hover:text-gold-500`}>Contact</a>
        </nav>

        <div className="flex items-center gap-2">
          <button aria-label="Search" className="hidden sm:flex items-center justify-center rounded-xl p-2 text-cream-50/70 hover:text-gold-500 hover:bg-cream-50/10 transition-all">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
          {user ? (
            <Link to="/account" onClick={closeMenu} className="rounded-xl p-2 text-cream-50/70 hover:text-gold-500 hover:bg-cream-50/10 transition-all" aria-label="Account">
              <AccountIcon className="h-4 w-4" />
            </Link>
          ) : (
            <Link to="/login" className="rounded-xl p-2 text-cream-50/70 hover:text-gold-500 hover:bg-cream-50/10 transition-all" aria-label="Sign in">
              <AccountIcon className="h-4 w-4" />
            </Link>
          )}
          <button onClick={() => navigate('/checkout')} aria-label="Cart" className="relative flex items-center justify-center rounded-xl p-2 text-cream-50/70 hover:text-gold-500 hover:bg-cream-50/10 transition-all">
            <CartIcon className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-terracotta-500 min-w-[17px] h-[17px] px-1 text-[8px] font-bold text-cream-50 shadow-sm">{totalItems}</span>
            )}
          </button>
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-cream-50/70 hover:text-gold-500 md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-cream-50/10 bg-forest-900/98 px-5 py-4 space-y-1 backdrop-blur-xl shadow-xl max-h-[80vh] overflow-y-auto">
          {[{ to: '/', label: 'Home', end: true }, { to: '/products', label: 'Shop' }, { to: '/about', label: 'Our Story' }, { to: '/#impact', label: 'Impact' }, { to: '/#journal', label: 'Journal' }, { to: '/#contact', label: 'Contact' }].map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={closeMenu}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-sm font-semibold tracking-[0.05em] transition-all ${isActive ? 'bg-cream-50/10 text-gold-500' : 'text-cream-50/70 hover:text-cream-50 hover:bg-cream-50/5'}`}>{item.label}</NavLink>
          ))}
          {user && (
            <button onClick={() => { signOut(); closeMenu() }} className="block w-full text-left rounded-xl px-4 py-3 text-sm font-semibold text-terracotta-500 hover:bg-cream-50/10 transition-all">Sign Out</button>
          )}
        </div>
      )}
    </header>
  )
}