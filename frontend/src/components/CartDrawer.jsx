import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { formatPrice, getImageUrl } from '../lib/utils'
import { getItemName, getItemPrice, getItemImage, getItemVariantName } from '../lib/pricingService'
import { CartIcon, CloseIcon } from './Icons'

export default function CartDrawer() {
  const {
    cartItems, itemCount, cartDrawerOpen, closeCartDrawer,
    updateQuantity, removeFromCart, totals, loading,
  } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()

  useEffect(() => {
    if (!cartDrawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') closeCartDrawer() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [cartDrawerOpen, closeCartDrawer])

  if (!cartDrawerOpen) return null

  const goCheckout = () => { closeCartDrawer(); navigate('/checkout') }

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      {/* Backdrop */}
      <div className="drawer-backdrop absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={closeCartDrawer} />
      {/* Panel */}
      <aside className="drawer-panel absolute top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5EDD8] shrink-0">
          <h2 className="font-heading text-lg font-bold text-[#1a1a1a] flex items-center gap-2">
            <CartIcon className="h-5 w-5 text-green-600" />
            Your Cart
            {itemCount > 0 && <span className="rounded-full bg-green-600 px-2 py-0.5 text-micro font-bold text-white">{itemCount}</span>}
          </h2>
          <button type="button" onClick={closeCartDrawer} aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-green-50 hover:text-green-700">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" aria-live="polite">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-16 w-16 rounded-xl bg-border/60" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3.5 w-3/4 rounded bg-border/60" />
                  <div className="h-3 w-1/2 rounded bg-border/60" />
                  <div className="h-3 w-1/3 rounded bg-border/60" />
                </div>
              </div>
            ))
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <CartIcon className="h-7 w-7 text-green-600/50" />
              </div>
              <p className="mt-4 text-body font-semibold text-[#1a1a1a]">Your cart is empty</p>
              <p className="mt-1 text-caption text-muted">Add some fresh products to get started!</p>
              <Link to="/products" onClick={closeCartDrawer}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-body-sm font-semibold text-white transition hover:bg-green-700 hover:-translate-y-0.5">
                Browse Products
              </Link>
            </div>
          ) : (
            cartItems.map(item => {
              const unitPrice = getItemPrice(item)
              return (
                <div key={item.id} className="drawer-item flex gap-3 rounded-2xl border border-[#E5EDD8] bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <img
                    src={getImageUrl(getItemImage(item), settings?.placeholder_image)}
                    alt={getItemName(item)}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-xl border border-[#E5EDD8] object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-body-sm font-semibold text-[#1a1a1a] leading-tight">{getItemName(item)}</p>
                        {getItemVariantName(item) && (
                          <p className="mt-0.5 text-caption font-medium text-[#8B9E7A]">{getItemVariantName(item)}</p>
                        )}
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${getItemName(item)} from cart`}
                        className="shrink-0 p-1 text-[#B0B0B0] transition hover:text-red-500 rounded-md hover:bg-red-50">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      {/* Stepper */}
                      <div className="flex h-8 items-center overflow-hidden rounded-full border-2 border-[#222] bg-white">
                        <button type="button"
                          onClick={() => { if (item.quantity <= 1) removeFromCart(item.id); else updateQuantity(item.id, item.quantity - 1) }}
                          aria-label="Decrease quantity"
                          className="flex h-full w-8 items-center justify-center font-bold text-[#1a1a1a] transition hover:bg-[#FAF3E8] active:scale-90">
                          −
                        </button>
                        <span className="min-w-[28px] text-center text-body-sm font-semibold text-[#1a1a1a]">{item.quantity}</span>
                        <button type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="flex h-full w-8 items-center justify-center font-bold text-[#1a1a1a] transition hover:bg-[#FAF3E8] active:scale-90">
                          +
                        </button>
                      </div>
                      <p className="text-body-sm font-bold text-[#1a1a1a]">{formatPrice(unitPrice * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-[#E5EDD8] px-5 py-4 space-y-3 shrink-0 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-medium text-muted">Subtotal</span>
              <span className="text-h4 font-bold text-[#1a1a1a]">{formatPrice(totals.subtotal)}</span>
            </div>
            <p className="text-caption text-muted">Shipping and taxes calculated at checkout.</p>
            <button type="button" onClick={goCheckout}
              className="w-full rounded-full bg-green-600 py-3 text-body-sm font-bold text-white transition hover:bg-green-700 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg shadow-green-600/20">
              Proceed to Checkout
            </button>
            <div className="flex items-center justify-center gap-4">
              <button type="button" onClick={closeCartDrawer} className="text-caption font-semibold text-[#2E7D32] hover:underline">
                Continue Shopping
              </button>
              <Link to="/cart" onClick={closeCartDrawer} className="text-caption font-semibold text-[#2E7D32] hover:underline">
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
