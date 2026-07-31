import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { formatPrice, getImageUrl } from '../lib/utils'
import { getItemName, getItemPrice, getItemImage, getItemVariantName, calculateCartTotals } from '../lib/pricingService'
import { api } from '../lib/api'
import { toast } from 'react-toastify'
import CheckoutProgress from '../components/checkout/CheckoutProgress'
import CheckoutButton from '../components/checkout/CheckoutButton'
import MobileCheckoutBar from '../components/checkout/MobileCheckoutBar'
import { loadCachedAddress, isAddressComplete, addressToSummary, shippingAddressPayload, saveLastOrder, clearCachedAddress } from '../lib/checkout'

const WHATSAPP_NUMBER = '9709704563'

const METHOD_OPTIONS = [
  {
    key: 'razorpay', label: 'Razorpay', description: 'Pay securely via Razorpay gateway',
    icon: (cls) => (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h2m4 0h2m-9 4V9a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2zm11-6h2v5h-2" />
      </svg>
    ),
    badge: 'Recommended',
  },
  {
    key: 'upi', label: 'UPI', description: 'GPay, PhonePe, Paytm & more',
    icon: (cls) => (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <path strokeLinecap="round" d="M2 10h20M6 15h4" />
      </svg>
    ),
  },
  {
    key: 'card', label: 'Credit / Debit Card', description: 'Visa, Mastercard, RuPay, Amex',
    icon: (cls) => (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path strokeLinecap="round" d="M2 9h20" />
      </svg>
    ),
  },
  {
    key: 'cod', label: 'Cash on Delivery', description: 'Pay in cash when your order arrives',
    icon: (cls) => (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M6 12h.01M18 12h.01" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'whatsapp', label: 'WhatsApp', description: 'Place your order on WhatsApp',
    icon: (cls) => (
      <svg className={cls} fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
]

export default function CheckoutPayment() {
  const { user } = useAuth()
  const { cartItems, appliedCoupon, loading, clearCartAfterOrder } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [method, setMethod] = useState(null)
  const [placing, setPlacing] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const address = loadCachedAddress()
  const addressMissing = !isAddressComplete(address)

  const { subtotal, shipping, tax, grandTotal } = useMemo(
    () => calculateCartTotals(cartItems, appliedCoupon, settings),
    [cartItems, appliedCoupon, settings]
  )
  const couponDiscount = appliedCoupon ? (calculateCartTotals(cartItems, appliedCoupon, settings).couponDiscount) : 0

  const paymentMode = settings?.paymentMethod || (settings?.razorpayEnabled !== false ? 'both' : 'whatsapp')
  const showRazorpayGroup = paymentMode === 'both' || paymentMode === 'razorpay'
  const showWhatsApp = paymentMode === 'both' || paymentMode === 'whatsapp'
  const showCod = settings?.codEnabled === true

  const availableMethods = METHOD_OPTIONS.filter(m => {
    if (m.key === 'whatsapp') return showWhatsApp
    if (m.key === 'cod') return showCod
    return showRazorpayGroup
  })

  const buildOrderPayload = (paymentMethodType, paymentId, paymentStatus) => ({
    items: cartItems.map(i => ({
      name: getItemName(i),
      variantName: getItemVariantName(i),
      price: getItemPrice(i),
      quantity: i.quantity,
      image: getItemImage(i),
      productId: i.product_id || i.product?._id || null,
      variantId: i.variant_id || i.variant?._id || null,
      bundle_id: i.bundle_id || i.bundle?._id || null,
    })),
    subtotal,
    shippingCost: shipping,
    couponCode: appliedCoupon?.code || null,
    couponDiscount,
    total: grandTotal,
    paymentMethod: paymentMethodType,
    paymentStatus,
    paymentId: paymentId || null,
    shippingAddress: shippingAddressPayload(address),
    guestInfo: { name: address?.name, phone: address?.mobile, email: address?.email || user?.email || '' },
  })

  const finishOrder = async (order, orderMethod) => {
    saveLastOrder({ ...order, clientPaymentMethod: orderMethod })
    clearCachedAddress()
    await clearCartAfterOrder()
    navigate(`/order/success?id=${order._id}`)
  }

  const createOrderInBackend = async (methodType, paymentId) => {
    const payload = buildOrderPayload(methodType, paymentId, paymentId ? 'paid' : 'pending')
    return api.createOrder(payload)
  }

  const handlePlaceOrder = async () => {
    if (placing) return
    if (cartItems.length === 0) { toast.error('Your cart is empty'); navigate('/checkout'); return }
    if (addressMissing) { toast.error('Please add your delivery address first'); navigate('/checkout/address'); return }
    if (!method) { toast.error('Please select a payment method'); return }
    setPlacing(true)

    try {
      if (method === 'cod' || method === 'whatsapp') {
        if (method === 'whatsapp') {
          const orderLines = cartItems.map(i => `${getItemName(i)}${getItemVariantName(i) ? ` (${getItemVariantName(i)})` : ''} × ${i.quantity} = ${formatPrice(getItemPrice(i) * i.quantity)}`)
          const message = [
            `🧾 *New HAiFarmer Order*`, ``,
            ...orderLines, ``,
            `━━━━━━━━━━━━━━`,
            `💰 Subtotal: ${formatPrice(subtotal)}`,
            `🚚 Shipping: ${shipping === 0 ? 'FREE' : formatPrice(shipping)}`,
            couponDiscount > 0 ? `🎟️ Coupon: -${formatPrice(couponDiscount)}` : null,
            `━━━━━━━━━━━━━━`,
            `💳 *Total: ${formatPrice(grandTotal)}*`,
            `💳 *Payment: WhatsApp*`, ``,
            `━━ 📋 Delivery Details ━━`,
            `👤 Name: ${address?.name || 'Not provided'}`,
            `📱 Phone: ${address?.mobile || 'Not provided'}`,
            `📍 Address: ${addressToSummary(address)}`,
          ].filter(Boolean).join('%0A')
          window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
        }
        const order = await createOrderInBackend(method, null)
        await finishOrder(order, method)
        toast.success(method === 'cod' ? 'Order placed! Pay on delivery.' : 'Order placed! Check WhatsApp for confirmation.')
        return
      }

      // Razorpay-backed: online / upi / card
      const options = {
        key: settings?.razorpayKeyId || 'rzp_live_SeagFUXcQMCgdT',
        amount: Math.round(grandTotal * 100),
        currency: 'INR',
        name: settings?.storeName || 'HAiFarmer',
        description: 'Order Payment',
        method: method === 'upi' ? { upi: {} } : method === 'card' ? { card: {} } : undefined,
        handler: async (response) => {
          try {
            const order = await createOrderInBackend(method, response.razorpay_payment_id)
            await finishOrder(order, method)
            toast.success('Payment successful! Order placed.')
          } catch (err) {
            toast.error('Payment received but order failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
        prefill: { name: address?.name, contact: address?.mobile, email: address?.email || user?.email || '' },
        theme: { color: '#16a34a' },
      }
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.')
        setPlacing(false)
      })
      rzp.open()
    } catch (err) {
      toast.error(err.message || 'Order failed. Please try again.')
      setPlacing(false)
    }
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
          <h2 className="font-heading text-h2 font-bold text-[#1a1a1a]">Your cart is empty</h2>
          <Link to="/products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-8 py-3.5 text-body-sm font-semibold text-white transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5 shadow-lg shadow-[#2E7D32]/20">Browse Products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAF5] pb-24 lg:pb-0">
      <div className="border-b border-[#E5EDD8] bg-white">
        <div className="mx-auto max-w-5xl px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2 text-caption text-[#8B9E7A]">
            <Link to="/checkout" className="hover:text-[#2E7D32] transition-colors">Checkout</Link>
            <span>/</span>
            <span className="text-[#1a1a1a] font-medium">Payment</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-10">
        <CheckoutProgress current={3} />

        {addressMissing && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-body-sm font-medium text-amber-800">Delivery address is missing.</p>
            </div>
            <Link to="/checkout/address" className="shrink-0 rounded-full bg-[#2E7D32] px-4 py-2 text-caption font-semibold text-white hover:bg-[#1B5E20] transition-colors">Add Address</Link>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
          {/* Left column */}
          <div className="space-y-4">
            {/* Address */}
            <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F5E9]">
                    <svg className="h-4 w-4 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-h4 font-bold text-[#1a1a1a]">Delivery Address</h3>
                </div>
                <Link to="/checkout/address" className="text-caption font-semibold text-[#2E7D32] hover:text-[#1B5E20] underline underline-offset-2">Edit</Link>
              </div>
              {!addressMissing ? (
                <div className="bg-[#F8FAF5] rounded-xl p-4 space-y-1">
                  <p className="text-body-sm font-semibold text-[#1a1a1a]">{address.name}</p>
                  <p className="text-caption text-[#8B9E7A]">{address.mobile}{address.email ? ` · ${address.email}` : ''}</p>
                  <p className="text-body-sm text-[#1a1a1a] mt-1">{addressToSummary(address)}</p>
                  {address.deliveryInstructions && <p className="text-caption text-[#8B9E7A] mt-1 italic">"{address.deliveryInstructions}"</p>}
                </div>
              ) : (
                <p className="text-body-sm text-red-500">Please add your delivery address to continue.</p>
              )}
            </div>

            {/* Payment method */}
            <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <h3 className="font-heading text-h4 font-bold text-[#1a1a1a] mb-4">Payment Method</h3>
              <div className="space-y-3">
                {availableMethods.map(m => {
                  const selected = method === m.key
                  return (
                    <button key={m.key} type="button" onClick={() => setMethod(m.key)}
                      className={`w-full flex items-center gap-3.5 rounded-2xl border-2 p-4 text-left transition-all ${
                        selected
                          ? 'border-[#2E7D32] bg-[#F4F9EF] shadow-md shadow-[#2E7D32]/10'
                          : 'border-[#E5EDD8] bg-white hover:border-[#A5D6A7]'
                      }`}>
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-[#2E7D32] text-white' : 'bg-[#F4F9EF] text-[#8B9E7A]'}`}>
                        {m.icon('h-5 w-5')}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="text-body-sm font-bold text-[#1a1a1a]">{m.label}</span>
                          {m.badge && <span className="rounded-full bg-[#E8F5E9] px-2 py-0.5 text-micro font-semibold text-[#2E7D32]">{m.badge}</span>}
                        </span>
                        <span className="block text-caption text-[#8B9E7A] mt-0.5">{m.description}</span>
                      </span>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${selected ? 'border-[#2E7D32] bg-[#2E7D32]' : 'border-[#D7E8C8] bg-white'}`}>
                        {selected && <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className="mt-4 text-center text-caption text-[#B0B0B0]">
                {method === 'cod' ? 'Pay when your order arrives' : method ? 'Secured by Razorpay' : 'Select a payment method to continue'}
              </p>
            </div>

            {/* Items */}
            <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <h3 className="font-heading text-h4 font-bold text-[#1a1a1a] mb-4">Order Review — Items ({cartItems.length})</h3>
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 pb-3 border-b border-[#E5EDD8] last:border-0 last:pb-0">
                    <img src={getImageUrl(getItemImage(item), settings?.placeholder_image)} alt={getItemName(item)}
                      className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover shrink-0 border border-[#E5EDD8]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-semibold text-[#1a1a1a] truncate">{getItemName(item)}</p>
                      {getItemVariantName(item) && <p className="text-caption text-[#8B9E7A]">{getItemVariantName(item)}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-body-sm font-semibold text-[#1a1a1a]">{formatPrice(getItemPrice(item) * item.quantity)}</p>
                      <p className="text-caption text-[#8B9E7A]">×{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
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
              <CheckoutButton onClick={handlePlaceOrder} loading={placing} disabled={!method || cartItems.length === 0}>
                Place Order
              </CheckoutButton>
              <p className="mt-3 text-center text-caption text-[#B0B0B0]">By placing this order you agree to our terms.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <MobileCheckoutBar total={formatPrice(grandTotal)}>
        <CheckoutButton onClick={handlePlaceOrder} loading={placing} disabled={!method || cartItems.length === 0}>
          Place Order
        </CheckoutButton>
      </MobileCheckoutBar>
    </div>
  )
}
