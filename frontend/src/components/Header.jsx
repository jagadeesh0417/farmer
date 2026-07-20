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

  const goToCheckout = () => navigate('/checkout')
  const closeMenu = () => setMenuOpen(false)

  const navLinkClass = ({ isActive }) =>
    `relative px-4 py-2 text-sm font-medium tracking-[0.06em] uppercase transition-all duration-300 ` +
    (scrolled
      ? isActive ? 'text-gold-500' : 'text-cream-50/70 hover:text-gold-500'
      : isActive ? 'text-gold-500' : 'text-cream-50/80 hover:text-cream-50')

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-forest-900/95 shadow-[0_4px_30px_rgba(0,0,0,0.25)] backdrop-blur-md' : 'bg-gradient-to-b from-black/40 to-transparent'}`}>
      {headerText && (
        <div className={`overflow-hidden px-4 py-1.5 text-[10px] font-medium tracking-[0.12em] uppercase text-cream-50/60 transition-all duration-500 ${scrolled ? 'bg-forest-950/80' : 'bg-black/20'}`}>
          <div className="header-marquee whitespace-nowrap">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="mx-10 inline-block whitespace-pre">{headerText}</span>
            ))}
          </div>
        </div>
      )}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 lg:px-10">
        <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
          {logo ? (
            <img src={logo} alt="HAiFarmer logo" loading="eager" className="h-12 w-auto object-contain sm:h-14" />
          ) : (
            <span className="inline-flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta-500 text-lg font-bold text-cream-50 sm:h-12 sm:w-12 sm:text-xl shadow-lg">H</span>
              <span className={`font-heading text-xl font-semibold tracking-tight transition-colors duration-300 ${scrolled ? 'text-cream-50' : 'text-cream-50'}`}>HAiFarmer</span>
            </span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/products" className={navLinkClass}>Products</NavLink>
          <NavLink to="/combos" className={navLinkClass}>Combos</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={goToCheckout} aria-label="View cart"
            className={`relative flex items-center justify-center rounded-xl p-2 transition-all duration-300 ${scrolled ? 'text-cream-50/80 hover:text-gold-500 hover:bg-cream-50/10' : 'text-cream-50/80 hover:text-cream-50 hover:bg-white/10'}`}>
            <CartIcon className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-terracotta-500 min-w-[18px] h-[18px] px-1 text-[9px] font-bold text-cream-50 shadow-sm">{totalItems}</span>
            )}
          </button>
          {user ? (
            <>
              <Link to="/account" onClick={closeMenu}
                className={`rounded-xl p-2 transition-all duration-300 ${scrolled ? 'text-cream-50/80 hover:text-gold-500 hover:bg-cream-50/10' : 'text-cream-50/80 hover:text-cream-50 hover:bg-white/10'}`}
                aria-label="Account dashboard">
                <AccountIcon className="h-5 w-5" />
              </Link>
              <button onClick={signOut}
                className={`hidden sm:inline-flex btn-font items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold tracking-[0.06em] uppercase transition-all duration-300 ${scrolled ? 'text-cream-50/70 hover:text-cream-50 hover:bg-cream-50/10' : 'text-cream-50/80 hover:text-cream-50 hover:bg-white/10'}`}>
                <LogoutIcon className="h-3.5 w-3.5" />Sign Out
              </button>
            </>
          ) : (
            <a href="https://wa.me/9709704563?text=Hello%20HAiFarmer%2C%20I%20would%20like%20to%20place%20an%20order"
              target="_blank" rel="noopener noreferrer"
              className="hidden sm:inline-flex btn-font items-center gap-1.5 rounded-xl bg-terracotta-500 px-5 py-2.5 text-xs font-semibold tracking-[0.06em] uppercase text-cream-50 transition-all duration-300 hover:bg-terracotta-600 hover:-translate-y-0.5 shadow-lg shadow-terracotta-500/20">Order Now</a>
          )}
          <button type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all md:hidden ${scrolled ? 'text-cream-50/80 hover:text-gold-500' : 'text-cream-50/80 hover:text-cream-50'}`}
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-cream-50/10 bg-forest-900/98 px-5 py-4 space-y-1 backdrop-blur-xl shadow-xl">
          {[{ to: '/', label: 'Home' }, { to: '/products', label: 'Products' }, { to: '/combos', label: 'Combos' }, { to: '/about', label: 'About' }].map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={closeMenu}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-sm font-semibold tracking-[0.05em] transition-all ${isActive ? 'bg-cream-50/10 text-gold-500' : 'text-cream-50/70 hover:text-cream-50 hover:bg-cream-50/5'}`}>{item.label}</NavLink>
          ))}
          {user ? (
            <button onClick={() => { signOut(); closeMenu() }} className="block w-full text-left rounded-xl px-4 py-3 text-sm font-semibold text-terracotta-500 hover:bg-cream-50/10 transition-all">Sign Out</button>
          ) : (
            <a href="https://wa.me/9709704563?text=Hello%20HAiFarmer%2C%20I%20would%20like%20to%20place%20an%20order"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-terracotta-500/20 px-4 py-3 text-sm font-semibold text-gold-500 hover:bg-terracotta-500/30 transition-all">Order via WhatsApp</a>
          )}
        </div>
      )}
    </header>
  )
}
