import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { formatPrice, getImageUrl } from '../lib/utils'
import { getItemName, getItemPrice, getItemImage, getItemVariantName, calculateCartTotals } from '../lib/pricingService'

function CartItemCard({ item, settings, onVariantChange, onQuantityChange, onRemove }) {
  const product = item.product
  const variants = product?.variants || []
  const hasMultipleVariants = variants.length > 1
  const [editingVariant, setEditingVariant] = useState(false)
  const lineTotal = getItemPrice(item) * item.quantity

  return (
    <div className="flex gap-4 sm:gap-5 rounded-2xl border border-[#E5EDD8] bg-white p-3 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(46,125,50,0.08)] hover:border-[#C8E0B0]">
      {/* Image */}
      <div className="relative shrink-0">
        <img src={getImageUrl(getItemImage(item), settings?.placeholder_image)}
          alt={getItemName(item)}
          className="h-20 w-20 sm:h-[100px] sm:w-[100px] rounded-xl object-cover border border-[#E5EDD8]" />
        {item.bundle && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#F5A623] text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shadow-sm">COMBO</span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 min-w-0 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-body-sm sm:text-body font-semibold text-[#1a1a1a] leading-tight line-clamp-2">{getItemName(item)}</h3>
            <button onClick={() => onRemove(item.id)}
              className="shrink-0 p-1 text-[#B0B0B0] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              title="Remove item">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Variant */}
          <div className="flex items-center gap-2 mt-0.5">
            {getItemVariantName(item) && (
              <span className="text-caption text-[#8B9E7A] font-medium">{getItemVariantName(item)}</span>
            )}
            {hasMultipleVariants && (
              <button onClick={() => setEditingVariant(!editingVariant)}
                className="text-caption font-semibold text-[#2E7D32] hover:text-[#1B5E20] underline underline-offset-2">
                Change
              </button>
            )}
          </div>

          {/* Variant switcher */}
          {editingVariant && hasMultipleVariants && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {variants.filter(v => v.isActive !== false && String(v._id) !== String(item.variant_id || item.variant?._id)).map(v => (
                <button key={v._id} onClick={() => { onVariantChange(item, v); setEditingVariant(false) }}
                  className="px-2.5 py-1 text-caption font-medium rounded-lg border border-[#D7E8C8] bg-white hover:bg-[#F4F9EF] hover:border-[#4CAF50] transition-all text-[#1a1a1a]">
                  {v.weightLabel || v.name} — {formatPrice(v.price)}
                </button>
              ))}
            </div>
          )}

          {/* Unit price */}
          <p className="mt-1 text-body-sm font-semibold text-[#2E7D32]">{formatPrice(getItemPrice(item))}</p>
        </div>

        {/* Bottom row: quantity + line total */}
        <div className="flex items-center justify-between mt-2 sm:mt-3">
          {/* Circular quantity controls */}
          <div className="flex items-center gap-0">
            <button onClick={() => { if (item.quantity <= 1) onRemove(item.id); else onQuantityChange(item.id, item.quantity - 1) }}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-[#222] bg-white text-[#1a1a1a] font-bold text-body-sm hover:bg-[#FAF3E8] transition-all active:scale-90">
              −
            </button>
            <input type="text" inputMode="numeric" value={item.quantity}
              onChange={e => { const v = parseInt(e.target.value, 10); if (!isNaN(v) && v >= 1) onQuantityChange(item.id, v) }}
              className="w-[36px] text-center text-body-sm font-semibold text-[#1a1a1a] bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            <button onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-[#222] bg-white text-[#1a1a1a] font-bold text-body-sm hover:bg-[#FAF3E8] transition-all active:scale-90">
              +
            </button>
          </div>

          {/* Line total */}
          <div className="text-right">
            <p className="text-body-sm font-bold text-[#1a1a1a]">{formatPrice(lineTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CouponCard({ appliedCoupon, couponDiscount, couponError, couponLoading, couponCode, setCouponCode, onApply, onRemove }) {
  const [open, setOpen] = useState(false)

  if (appliedCoupon) {
    return (
      <div className="rounded-2xl border border-[#C8E6C9] bg-[#E8F5E9] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2E7D32]">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-caption font-bold text-[#2E7D32] uppercase tracking-wide">{appliedCoupon.code}</p>
              <p className="text-caption text-[#4CAF50]">Discount: −{formatPrice(couponDiscount)}</p>
            </div>
          </div>
          <button onClick={onRemove}
            className="rounded-lg border border-[#A5D6A7] bg-white px-3 py-1.5 text-caption font-semibold text-[#2E7D32] hover:bg-[#C8E6C9] transition-all">
            Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#E5EDD8] bg-white">
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-body-sm font-semibold text-[#1a1a1a]">
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Have a coupon?
        </span>
        <svg className={`h-4 w-4 text-[#8B9E7A] transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-[#E5EDD8] px-4 pb-4 pt-3">
          <div className="flex gap-2">
            <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 rounded-xl border border-[#D7E8C8] bg-white px-3.5 py-2.5 text-body-sm text-[#1a1a1a] placeholder:text-[#B0B0B0] outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10" />
            <button onClick={onApply} disabled={couponLoading || !couponCode.trim()}
              className="rounded-xl bg-[#2E7D32] px-5 py-2.5 text-caption font-semibold text-white hover:bg-[#1B5E20] transition-all disabled:opacity-50">
              {couponLoading ? '...' : 'Apply'}
            </button>
          </div>
          {couponError && <p className="text-caption text-red-500 mt-1.5">{couponError}</p>}
        </div>
      )}
    </div>
  )
}

export default function Cart() {
  const { cartItems, addToCart, removeFromCart, updateQuantity, loading, appliedCoupon, couponDiscount, couponError, couponLoading, handleApplyCoupon, handleRemoveCoupon } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [confirmRemove, setConfirmRemove] = useState(null)
  const [couponCode, setCouponCode] = useState('')

  const { subtotal, shipping, tax, grandTotal } = useMemo(
    () => calculateCartTotals(cartItems, appliedCoupon, settings),
    [cartItems, appliedCoupon, settings]
  )

  const handleVariantChange = async (item, newVariant) => {
    const qty = item.quantity
    const productId = item.product_id || item.product?._id
    if (!productId) return
    await removeFromCart(item.id)
    await addToCart({
      product_id: productId,
      variant_id: newVariant._id,
      quantity: qty,
      product: item.product,
      variant: { _id: newVariant._id, name: newVariant.name, price: newVariant.price, weightLabel: newVariant.weightLabel },
    })
  }

  const handleQuantityChange = (itemId, qty) => {
    updateQuantity(itemId, qty)
  }

  const handleRemove = (itemId) => {
    setConfirmRemove(itemId)
  }

  const handleApplyCouponClick = () => {
    handleApplyCoupon(couponCode)
  }

  const handleRemoveCouponClick = () => {
    handleRemoveCoupon()
    setCouponCode('')
  }

  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#D7E8C8] border-t-[#2E7D32]" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAF5]">
        <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-24 text-center">
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-[24px] bg-white border-2 border-[#D7E8C8] shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-12 w-12 text-[#8B9E7A]">
              <circle cx="9" cy="20" r="1.6" fill="#8B9E7A"/>
              <circle cx="18" cy="20" r="1.6" fill="#8B9E7A"/>
              <path d="M3 3h2l2.5 12.5a2 2 0 0 0 2 1.5h7.5a2 2 0 0 0 2-1.5L21 7H7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="font-heading text-h2 font-bold text-[#1a1a1a] mb-2">Your cart is empty</h2>
          <p className="text-[#8B9E7A] mb-8 text-body-sm">Looks like you haven't added anything yet. Let's fix that!</p>
          <Link to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-8 py-3.5 text-body-sm font-semibold text-white transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5 shadow-lg shadow-[#2E7D32]/20">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAF5]">
      {/* Breadcrumb */}
      <div className="border-b border-[#E5EDD8] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2 text-caption text-[#8B9E7A]">
            <Link to="/" className="hover:text-[#2E7D32] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#1a1a1a] font-medium">Cart</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="font-heading text-h1 font-bold text-[#1a1a1a] tracking-tight">Shopping Cart</h1>
            <p className="text-caption text-[#8B9E7A] mt-0.5">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
          </div>
          <Link to="/products"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border-2 border-[#D7E8C8] px-4 py-2 text-caption font-semibold text-[#2E7D32] hover:bg-[#F4F9EF] hover:border-[#4CAF50] transition-all">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
          {/* Left: Cart Items */}
          <div className="space-y-3 sm:space-y-4">
            {cartItems.map(item => (
              <CartItemCard key={item.id} item={item} settings={settings}
                onVariantChange={handleVariantChange}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove} />
            ))}

            {/* Continue shopping mobile */}
            <Link to="/products"
              className="flex sm:hidden items-center justify-center gap-2 rounded-2xl border border-[#D7E8C8] bg-white p-3.5 text-body-sm font-semibold text-[#2E7D32] hover:bg-[#F4F9EF] transition-all">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Continue Shopping
            </Link>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:sticky sm:top-24">
              <h2 className="font-heading text-h2 font-bold text-[#1a1a1a] mb-5">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-5">
                <CouponCard appliedCoupon={appliedCoupon} couponDiscount={couponDiscount}
                  couponError={couponError} couponLoading={couponLoading}
                  couponCode={couponCode} setCouponCode={setCouponCode}
                  onApply={handleApplyCouponClick} onRemove={handleRemoveCouponClick} />
              </div>

              {/* Price breakdown */}
              <div className="space-y-2.5 text-body-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#8B9E7A]">Subtotal</span>
                  <span className="font-semibold text-[#1a1a1a]">{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B9E7A]">Coupon discount</span>
                    <span className="font-semibold text-[#2E7D32]">−{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#8B9E7A]">Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-[#2E7D32]' : 'text-[#1a1a1a]'}`}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B9E7A]">Tax</span>
                    <span className="font-semibold text-[#1a1a1a]">{formatPrice(tax)}</span>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-[#E5EDD8] !mt-4 !mb-3" />

                <div className="flex justify-between items-center">
                  <span className="text-body font-bold text-[#1a1a1a]">Total</span>
                  <span className="font-heading text-h3 font-bold text-[#2E7D32]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <button onClick={() => navigate('/checkout')} disabled={cartItems.length === 0}
                className="mt-6 w-full rounded-full bg-[#2E7D32] py-3.5 text-body-sm font-semibold text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0">
                Proceed to Checkout
              </button>

              {/* Trust badges */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[#F4F9EF] py-2 px-3">
                  <svg className="h-3.5 w-3.5 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <span className="text-micro font-semibold text-[#2E7D32]">Secure Checkout</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[#F4F9EF] py-2 px-3">
                  <svg className="h-3.5 w-3.5 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" /><polyline points="17,6 23,6 23,12" />
                  </svg>
                  <span className="text-micro font-semibold text-[#2E7D32]">Free Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm remove dialog */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4" onClick={() => setConfirmRemove(null)}>
          <div className="w-full max-w-sm rounded-[20px] bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
            <p className="text-body font-semibold text-[#1a1a1a] text-center mb-1">Remove this item?</p>
            <p className="text-caption text-[#8B9E7A] text-center mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { removeFromCart(confirmRemove); setConfirmRemove(null) }}
                className="flex-1 rounded-full bg-red-600 py-2.5 text-body-sm font-semibold text-white hover:bg-red-700 transition-all">
                Remove
              </button>
              <button onClick={() => setConfirmRemove(null)}
                className="flex-1 rounded-full border-2 border-[#D7E8C8] py-2.5 text-body-sm font-semibold text-[#1a1a1a] hover:bg-[#F4F9EF] transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
