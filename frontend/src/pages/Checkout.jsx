import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { formatPrice, getImageUrl } from '../lib/utils'
import { getItemName, getItemPrice, getItemImage, getItemVariantName, calculateCartTotals } from '../lib/pricingService'
import { toast } from 'react-toastify'
import CheckoutProgress from '../components/checkout/CheckoutProgress'
import CheckoutButton from '../components/checkout/CheckoutButton'
import MobileCheckoutBar from '../components/checkout/MobileCheckoutBar'
import { loadCachedAddress, isAddressComplete } from '../lib/checkout'

export default function Checkout() {
  const { cartItems, updateQuantity, removeFromCart, loading, appliedCoupon, couponError, couponLoading, handleApplyCoupon, handleRemoveCoupon } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [couponCode, setCouponCode] = useState('')
  const [proceeding, setProceeding] = useState(false)

  const { subtotal, shipping, tax, grandTotal } = useMemo(
    () => calculateCartTotals(cartItems, appliedCoupon, settings),
    [cartItems, appliedCoupon, settings]
  )
  const couponDiscount = appliedCoupon ? (calculateCartTotals(cartItems, appliedCoupon, settings).couponDiscount) : 0

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleApplyCouponClick = () => { handleApplyCoupon(couponCode) }
  const handleRemoveCouponClick = () => { handleRemoveCoupon(); setCouponCode('') }

  const handleProceed = () => {
    if (proceeding) return
    if (cartItems.length === 0) { toast.error('Your cart is empty. Add some products first.'); return }
    setProceeding(true)
    setTimeout(() => {
      if (!isAddressComplete(loadCachedAddress())) {
        toast.info('Please add your delivery address to continue.')
        navigate('/checkout/address')
        return
      }
      navigate('/checkout/payment')
    }, 400)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#D7E8C8] border-t-[#2E7D32]" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center px-5">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[20px] bg-white border-2 border-[#D7E8C8] text-[#8B9E7A]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-12 w-12">
              <circle cx="9" cy="20" r="1.6" fill="#8B9E7A"/>
              <circle cx="18" cy="20" r="1.6" fill="#8B9E7A"/>
              <path d="M3 3h2l2.5 12.5a2 2 0 0 0 2 1.5h7.5a2 2 0 0 0 2-1.5L21 7H7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="font-heading text-h2 font-bold text-[#1a1a1a]">Your cart is empty</h2>
          <p className="mt-2 text-[#8B9E7A]">Add some fresh products to get started!</p>
          <Link to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-8 py-3.5 text-body-sm font-semibold text-white transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5 shadow-lg shadow-[#2E7D32]/20">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAF5] pb-24 lg:pb-0">
      {/* Breadcrumb */}
      <div className="border-b border-[#E5EDD8] bg-white">
        <div className="mx-auto max-w-5xl px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2 text-caption text-[#8B9E7A]">
            <Link to="/cart" className="hover:text-[#2E7D32] transition-colors">Cart</Link>
            <span>/</span>
            <span className="text-[#1a1a1a] font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-10">
        <CheckoutProgress current={1} />

        <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
          {/* Left: items + coupon */}
          <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-h4 font-bold text-[#1a1a1a]">Review Items ({cartItems.length})</h3>
              <Link to="/cart" className="text-caption font-semibold text-[#2E7D32] hover:text-[#1B5E20] underline underline-offset-2">Edit Cart</Link>
            </div>
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 pb-3 border-b border-[#E5EDD8] last:border-0 last:pb-0">
                  <img src={getImageUrl(getItemImage(item), settings?.placeholder_image)} alt={getItemName(item)}
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover shrink-0 border border-[#E5EDD8]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-semibold text-[#1a1a1a] truncate">{getItemName(item)}</p>
                    {getItemVariantName(item) && <p className="text-caption text-[#8B9E7A]">{getItemVariantName(item)}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => { if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1) }}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#222] bg-white text-[#1a1a1a] font-bold text-caption hover:bg-[#FAF3E8] transition-all active:scale-90">−</button>
                      <span className="min-w-[1.5rem] text-center text-body-sm font-semibold text-[#1a1a1a]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#222] bg-white text-[#1a1a1a] font-bold text-caption hover:bg-[#FAF3E8] transition-all active:scale-90">+</button>
                      <button onClick={() => removeFromCart(item.id)}
                        className="ml-1 flex h-7 w-7 items-center justify-center rounded-full border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors text-xs"
                        title="Remove item">✕</button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-body-sm font-semibold text-[#1a1a1a]">{formatPrice(getItemPrice(item) * item.quantity)}</p>
                    <p className="text-caption text-[#8B9E7A]">×{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mt-5 pt-5 border-t border-[#E5EDD8]">
              <h4 className="text-caption font-semibold text-[#8B9E7A] mb-2 uppercase tracking-wide">Apply Coupon</h4>
              {appliedCoupon ? (
                <div className="rounded-xl border border-[#C8E6C9] bg-[#E8F5E9] p-3 flex items-center justify-between">
                  <div>
                    <p className="text-caption font-bold text-[#2E7D32] uppercase tracking-wide">{appliedCoupon.code}</p>
                    <p className="text-caption text-[#4CAF50]">−{formatPrice(couponDiscount)}</p>
                  </div>
                  <button onClick={handleRemoveCouponClick}
                    className="rounded-lg border border-[#A5D6A7] bg-white px-2.5 py-1 text-micro font-semibold text-[#2E7D32] hover:bg-[#C8E6C9] transition-all">
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code"
                      className="flex-1 rounded-xl border border-[#E5EDD8] bg-white px-3 py-3 text-caption text-[#1a1a1a] placeholder:text-[#B0B0B0] outline-none focus:border-[#2E7D32]" />
                    <button onClick={handleApplyCouponClick} disabled={couponLoading || !couponCode.trim()}
                      className="rounded-xl bg-[#2E7D32] px-5 py-3 text-caption font-semibold text-white hover:bg-[#1B5E20] transition-all disabled:opacity-50">
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-caption text-red-500 mt-1">{couponError}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Right: sticky order summary */}
          <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sticky top-24 h-fit">
            <h2 className="font-heading text-h2 font-bold text-[#1a1a1a] mb-4">Order Summary</h2>
            <div className="space-y-2.5 text-body-sm">
              <div className="flex justify-between"><span className="text-[#8B9E7A]">Subtotal</span><span className="font-semibold text-[#1a1a1a]">{formatPrice(subtotal)}</span></div>
              {couponDiscount > 0 && <div className="flex justify-between"><span className="text-[#8B9E7A]">Coupon</span><span className="font-semibold text-[#2E7D32]">−{formatPrice(couponDiscount)}</span></div>}
              <div className="flex justify-between"><span className="text-[#8B9E7A]">Shipping</span><span className={`font-semibold ${shipping === 0 ? 'text-[#2E7D32]' : 'text-[#1a1a1a]'}`}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              {tax > 0 && <div className="flex justify-between"><span className="text-[#8B9E7A]">Tax</span><span className="font-semibold text-[#1a1a1a]">{formatPrice(tax)}</span></div>}
              <div className="border-t border-[#E5EDD8] !mt-3 !mb-2" />
              <div className="flex justify-between"><span className="text-body font-bold text-[#1a1a1a]">Total</span><span className="font-heading text-h3 font-bold text-[#2E7D32]">{formatPrice(grandTotal)}</span></div>
            </div>

            <div className="mt-5 hidden lg:block">
              <CheckoutButton onClick={handleProceed} loading={proceeding}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                </svg>
                Proceed to Payment
              </CheckoutButton>
              <Link to="/cart" className="mt-3 block text-center text-caption font-semibold text-[#2E7D32] hover:text-[#1B5E20]">Back to Cart</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <MobileCheckoutBar total={formatPrice(grandTotal)}>
        <CheckoutButton onClick={handleProceed} loading={proceeding}>Proceed to Payment</CheckoutButton>
      </MobileCheckoutBar>
    </div>
  )
}
