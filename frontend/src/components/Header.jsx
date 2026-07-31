import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useCart } from '../contexts/CartContext'
import { fetchSiteSettings } from '../contexts/SiteSettingsContext'
import { formatPrice, getImageUrl } from '../lib/utils'
import { getItemName, getItemImage, getItemPrice, getItemVariantName } from '../lib/pricingService'
import { CartIcon, MenuIcon, CloseIcon } from './Icons'
import Logo from './Logo'

export default function Header() {
  const { cartItems, itemCount, totals, openCartDrawer } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [settings, setSettings] = useState(null)
  const [announceIdx, setAnnounceIdx] = useState(0)
  const [cartHover, setCartHover] = useState(false)
  const openTimer = useRef(null)
  const closeTimer = useRef(null)

  const totalItems = itemCount ?? (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  const showCartPanel = useCallback(() => {
    clearTimeout(closeTimer.current)
    clearTimeout(openTimer.current)
    openTimer.current = setTimeout(() => setCartHover(true), 120)
  }, [])

  const hideCartPanel = useCallback(() => {
    clearTimeout(openTimer.current)
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setCartHover(false), 250)
  }, [])

  useEffect(() => () => { clearTimeout(openTimer.current); clearTimeout(closeTimer.current) }, [])

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
        setSettings(s)
      } catch {}
    })()
  }, [])

  const closeAll = () => { setMenuOpen(false); setSearchOpen(false) }

  return (
    <>
      {/* Announcement bar */}
      {settings?.announcementEnabled !== false && (settings?.announcements?.filter(a => a.isActive !== false)?.length > 0 || settings?.headerText1) && (
        <div className="announcement-bar bg-green-600 text-white text-nav font-medium tracking-[0.06em] overflow-hidden h-9 flex items-center">
          <div className="announcement-marquee">
            {(() => {
              const activeAnnouncements = settings?.announcements?.filter(a => a.isActive !== false) || []
              const texts = activeAnnouncements.length > 0
                ? activeAnnouncements.map(a => `${a.icon || ''} ${a.text || ''}`.trim())
                : [settings.headerText1]
              return texts.map((text, i) => (
                <span key={i} className="mx-12 inline-block whitespace-nowrap">{text}</span>
              ))
            })()}
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="section-container flex items-center justify-between h-16 lg:h-20">
          {/* Left: Logo + Brand */}
          <Logo onClick={closeAll} />

          {/* Center: desktop nav */}
          <nav className="hidden lg:flex items-center gap-0">
            <NavLink to="/products" className={({ isActive }) => `px-4 py-2 text-nav font-medium transition-colors ${isActive ? 'text-green-600' : 'text-ink hover:text-green-600'}`}>All Products</NavLink>
            <NavLink to="/combos" className={({ isActive }) => `px-4 py-2 text-nav font-medium transition-colors ${isActive ? 'text-green-600' : 'text-ink hover:text-green-600'}`}>Combos</NavLink>
            <NavLink to="/about" className={({ isActive }) => `px-4 py-2 text-nav font-medium transition-colors ${isActive ? 'text-green-600' : 'text-ink hover:text-green-600'}`}>Our Story</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `px-4 py-2 text-nav font-medium transition-colors ${isActive ? 'text-green-600' : 'text-ink hover:text-green-600'}`}>Contact</NavLink>
          </nav>

          {/* Right: icons */}
          <div className="hidden lg:flex items-center gap-0">
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="flex items-center justify-center p-2 text-muted hover:text-green-600 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
            <div className="relative">
              <button onClick={openCartDrawer} onMouseEnter={showCartPanel} onMouseLeave={hideCartPanel} aria-label="Cart"
                className="relative flex items-center gap-1.5 rounded-full px-2 py-1.5 text-muted hover:text-green-600 transition-colors">
                <span className="relative">
                  <CartIcon className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span key={totalItems} className="cart-badge cart-badge-bounce absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-green-600 min-w-[18px] h-[18px] px-1 text-micro font-bold text-white shadow-sm">{totalItems}</span>
                  )}
                </span>
                {totalItems > 0 && (
                  <span className="text-caption font-bold text-[#2E7D32]">{formatPrice(totals.subtotal)}</span>
                )}
              </button>

            {/* Mini cart dropdown */}
            {cartHover && (
              <div onMouseEnter={showCartPanel} onMouseLeave={hideCartPanel}
                className="header-dropdown absolute right-0 top-full z-50 mt-2 w-[340px] rounded-2xl border border-[#E5EDD8] bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.14)]">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-heading text-h4 font-bold text-[#1a1a1a]">Your Cart</p>
                  <span className="rounded-full bg-[#F4F9EF] px-2.5 py-1 text-micro font-bold text-[#2E7D32]">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                </div>
                {cartItems.length === 0 ? (
                  <p className="py-6 text-center text-caption text-[#8B9E7A]">Your cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto mb-3">
                      {cartItems.slice(0, 3).map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img src={getImageUrl(getItemImage(item), settings?.placeholder_image)} alt={getItemName(item)}
                            className="h-11 w-11 rounded-lg object-cover shrink-0 border border-[#E5EDD8]" />
                          <div className="flex-1 min-w-0">
                            <p className="text-caption font-semibold text-[#1a1a1a] truncate">{getItemName(item)}</p>
                            {getItemVariantName(item) && <p className="text-micro text-[#8B9E7A]">{getItemVariantName(item)}</p>}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-caption font-semibold text-[#1a1a1a]">{formatPrice(getItemPrice(item) * item.quantity)}</p>
                            <p className="text-micro text-[#8B9E7A]">×{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {cartItems.length > 3 && (
                        <p className="text-micro text-[#8B9E7A] text-center pt-1">+ {cartItems.length - 3} more item{cartItems.length - 3 !== 1 ? 's' : ''}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-[#E5EDD8] pt-3 mb-3">
                      <span className="text-caption text-[#8B9E7A]">Subtotal</span>
                      <span className="font-heading text-h4 font-bold text-[#2E7D32]">{formatPrice(totals.subtotal)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setCartHover(false); navigate('/cart') }}
                        className="flex-1 rounded-full border-2 border-[#D7E8C8] py-2.5 text-caption font-bold text-[#2E7D32] hover:bg-[#F4F9EF] transition-all">
                        View Cart
                      </button>
                      <button onClick={() => { setCartHover(false); navigate('/checkout') }}
                        className="flex-1 rounded-full bg-[#2E7D32] py-2.5 text-caption font-bold text-white shadow-md shadow-[#2E7D32]/20 hover:bg-[#1B5E20] transition-all">
                        Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            </div>
          </div>

          {/* Mobile: right icons */}
          <div className="flex lg:hidden items-center gap-0">
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="flex items-center justify-center p-2 text-muted hover:text-green-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
            <button onClick={openCartDrawer} aria-label="Cart" className="relative flex items-center justify-center p-2 text-muted hover:text-green-600">
              <CartIcon className="h-5 w-5" />
              {totalItems > 0 && (
                <span key={totalItems} className="cart-badge cart-badge-bounce absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-green-600 min-w-[18px] h-[18px] px-1 text-micro font-bold text-white shadow-sm">{totalItems}</span>
              )}
            </button>
            <button type="button" className="flex items-center justify-center p-2 text-muted hover:text-green-600" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
              {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center border-b border-border px-5 py-4">
            <svg className="h-5 w-5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" placeholder="Search products..." autoFocus aria-label="Search products" className="flex-1 ml-3 text-lg text-ink placeholder:text-muted-light outline-none bg-transparent" />
            <button onClick={() => setSearchOpen(false)} className="text-sm font-medium text-muted hover:text-ink ml-4">Cancel</button>
          </div>
          <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
            <h3 className="text-nav font-semibold tracking-[0.12em] uppercase text-muted mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Honey', 'Millets', 'Spices', 'Lentils & Beans', 'Oils & Ghee', 'Combos'].map(item => (
                <Link key={item} to="/products" onClick={() => setSearchOpen(false)} className="block border border-border px-4 py-3 text-sm text-ink hover:border-green-600 hover:text-green-600 transition-all">{item}</Link>
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
            <NavLink to="/" end onClick={closeAll} className={({ isActive }) => `block px-4 py-3 text-sm font-semibold ${isActive ? 'bg-green-50 text-green-600' : 'text-ink hover:bg-green-50 hover:text-green-600'}`}>Home</NavLink>
            <NavLink to="/products" onClick={closeAll} className={({ isActive }) => `block px-4 py-3 text-sm font-semibold ${isActive ? 'bg-green-50 text-green-600' : 'text-ink hover:bg-green-50 hover:text-green-600'}`}>All Products</NavLink>
            <NavLink to="/combos" onClick={closeAll} className={({ isActive }) => `block px-4 py-3 text-sm font-semibold ${isActive ? 'bg-green-50 text-green-600' : 'text-ink hover:bg-green-50 hover:text-green-600'}`}>Combos</NavLink>
            <NavLink to="/about" onClick={closeAll} className={({ isActive }) => `block px-4 py-3 text-sm font-semibold ${isActive ? 'bg-green-50 text-green-600' : 'text-ink hover:bg-green-50 hover:text-green-600'}`}>Our Story</NavLink>
            <NavLink to="/contact" onClick={closeAll} className={({ isActive }) => `block px-4 py-3 text-sm font-semibold ${isActive ? 'bg-green-50 text-green-600' : 'text-ink hover:bg-green-50 hover:text-green-600'}`}>Contact</NavLink>

            <div className="pt-4 px-4">
              <a href="https://wa.me/919848579053?text=Hello%20HaiFarmer" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 text-sm font-semibold hover:bg-green-700 transition-colors">
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
