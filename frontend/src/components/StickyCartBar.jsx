import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { formatPrice } from '../lib/utils'
import { CartIcon } from './Icons'

const HIDDEN_ROUTES = ['/cart', '/checkout', '/payment']

export default function StickyCartBar() {
  const { cartItems, itemCount, totals, openCartDrawer } = useCart()
  const { pathname } = useLocation()
  const isHiddenRoute = HIDDEN_ROUTES.some(r => pathname === r || pathname.startsWith(`${r}/`))
  const shouldShow = itemCount > 0 && !isHiddenRoute

  const [mounted, setMounted] = useState(shouldShow)
  const [anim, setAnim] = useState(shouldShow ? 'sticky-bar-enter' : '')

  useEffect(() => {
    if (shouldShow) {
      setMounted(true)
      const raf = requestAnimationFrame(() => setAnim('sticky-bar-enter'))
      return () => cancelAnimationFrame(raf)
    }
    setAnim('sticky-bar-exit')
    const t = setTimeout(() => { setMounted(false); setAnim('') }, 300)
    return () => clearTimeout(t)
  }, [shouldShow])

  if (!mounted) return null

  const total = itemCount ?? (cartItems || []).reduce((sum, i) => sum + (i.quantity || 0), 0)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[76px] z-[60] flex justify-center px-3 pr-[74px] sm:bottom-6 sm:pr-3">
      <button type="button" onClick={openCartDrawer}
        aria-label={`View cart: ${total} item${total !== 1 ? 's' : ''}, total ${formatPrice(totals.subtotal)}`}
        className={`pointer-events-auto sticky-cart-bar flex w-full max-w-md items-center gap-3 rounded-2xl border border-[#2E7D32]/40 bg-[#1B5E20] py-2.5 pl-3 pr-2.5 text-left shadow-[0_16px_40px_rgba(27,94,32,0.45)] transition-transform hover:-translate-y-0.5 active:scale-[0.99] ${anim}`}>
        <span className="relative shrink-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <CartIcon className="h-5 w-5 text-white" />
          </span>
          {total > 0 && (
            <span key={total} className="cart-badge cart-badge-bounce absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#F5A623] px-1 text-micro font-bold text-white shadow-sm">
              {total > 99 ? '99+' : total}
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-micro font-semibold uppercase tracking-wide text-white/60">
            {total} item{total !== 1 ? 's' : ''}
          </span>
          <span className="block font-heading text-h4 font-bold leading-tight text-white">
            {formatPrice(totals.subtotal)}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-body-sm font-bold text-[#1B5E20] shadow-sm">
          View Cart
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>
  )
}
