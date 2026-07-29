import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { formatPrice, getImageUrl } from '../lib/utils'
import { getItemName, getItemPrice, getItemImage, getItemVariantName, calculateCartTotals } from '../lib/pricingService'
import { api } from '../lib/api'
import { toast } from 'react-toastify'

const WHATSAPP_NUMBER = '9709704563'
const ADDRESS_CACHE_KEY = 'haifarmer_checkout_address'

function loadCachedAddress() {
  try { return JSON.parse(localStorage.getItem(ADDRESS_CACHE_KEY)) } catch { return null }
}

function saveCachedAddress(addr) {
  try { localStorage.setItem(ADDRESS_CACHE_KEY, JSON.stringify(addr)) } catch {}
}

function clearCachedAddress() {
  try { localStorage.removeItem(ADDRESS_CACHE_KEY) } catch {}
}

const emptyAddress = {
  name: '', mobile: '', email: '',
  house: '', street: '', area: '', landmark: '',
  city: '', state: '', pincode: '', country: 'India',
  deliveryInstructions: '',
  billingSame: true,
  billingHouse: '', billingStreet: '', billingCity: '', billingState: '', billingPincode: '',
}

export default function Checkout() {
  const { user } = useAuth()
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCartAfterOrder, loading, appliedCoupon, couponError, couponLoading, handleApplyCoupon, handleRemoveCoupon } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [couponCode, setCouponCode] = useState('')
  const [placing, setPlacing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const [address, setAddress] = useState(() => ({
    ...emptyAddress,
    ...loadCachedAddress(),
    name: loadCachedAddress()?.name || user?.fullName || user?.user_metadata?.full_name || '',
    mobile: loadCachedAddress()?.mobile || user?.phone || user?.user_metadata?.phone || '',
    email: loadCachedAddress()?.email || user?.email || '',
  }))

  useEffect(() => { saveCachedAddress(address) }, [address])

  const addressComplete = address.name?.trim() && address.mobile?.trim() && address.house?.trim() && address.area?.trim() && address.city?.trim() && address.state?.trim() && address.pincode?.trim() && address.country?.trim()

  const paymentMethod = settings?.paymentMethod || (settings?.razorpayEnabled !== false ? 'both' : 'whatsapp')
  const showRazorpay = paymentMethod === 'both' || paymentMethod === 'razorpay'
  const showWhatsApp = paymentMethod === 'both' || paymentMethod === 'whatsapp'

  const { subtotal, comboDiscount, couponDiscount, shipping, tax, grandTotal } = useMemo(
    () => calculateCartTotals(cartItems, appliedCoupon, settings),
    [cartItems, appliedCoupon, settings]
  )

  const handleApplyCouponClick = () => {
    handleApplyCoupon(couponCode)
  }

  const handleRemoveCouponClick = () => {
    handleRemoveCoupon()
    setCouponCode('')
  }

  const buildWhatsAppMessage = () => {
    const orderLines = cartItems.map(i => {
      const name = getItemName(i)
      const variant = getItemVariantName(i)
      const price = getItemPrice(i)
      return `${name}${variant ? ` (${variant})` : ''} × ${i.quantity} = ${formatPrice(price * i.quantity)}`
    })
    const shipAddr = [
      address.house, address.street, address.area, address.landmark,
      address.city, address.state, address.pincode, address.country,
    ].filter(Boolean).join(', ')
    return [
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
      `👤 Name: ${address.name || 'Not provided'}`,
      `📱 Phone: ${address.mobile || 'Not provided'}`,
      `📍 Address: ${shipAddr}`,
      `📮 PIN: ${address.pincode || 'Not provided'}`,
      address.deliveryInstructions ? `📝 Instructions: ${address.deliveryInstructions}` : null,
    ].filter(Boolean).join('%0A')
  }

  const createOrderInBackend = async (paymentMethodType, paymentId) => {
    const shipAddr = {
      addressLine1: [address.house, address.street, address.area, address.landmark].filter(Boolean).join(', '),
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    }
    return api.createOrder({
      items: cartItems.map(i => ({
        name: getItemName(i),
        variantName: getItemVariantName(i),
        price: getItemPrice(i),
        quantity: i.quantity,
        image: getItemImage(i),
        bundle_id: i.bundle_id || null,
        originalPrice: getItemPrice(i),
        sellingPrice: getItemPrice(i),
      })),
      subtotal,
      shippingCost: shipping,
      couponCode: appliedCoupon?.code || null,
      couponDiscount,
      total: grandTotal,
      paymentId: paymentId || null,
      status: 'pending',
      paymentMethod: paymentMethodType,
      shippingAddress: shipAddr,
      guestInfo: { name: address.name, phone: address.mobile, email: address.email || user?.email || '' },
    })
  }

  const handlePlaceOrder = async (method) => {
    if (!addressComplete) { toast.error('Please fill in all required address fields'); return }
    setPlacing(true)
    try {
      if (method === 'whatsapp') {
        const message = buildWhatsAppMessage()
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
        await createOrderInBackend('whatsapp', null)
        toast.success('Order placed! Check WhatsApp for confirmation.')
      } else if (method === 'razorpay') {
        const options = {
          key: settings?.razorpayKeyId || 'rzp_live_SeagFUXcQMCgdT',
          amount: Math.round(grandTotal * 100), currency: 'INR',
          name: settings?.storeName || 'HAiFarmer', description: 'Order Payment',
          handler: async (response) => {
            try {
              await createOrderInBackend('razorpay', response.razorpay_payment_id)
              toast.success('Payment successful! Order placed.')
              setOrderSuccess(true)
              clearCachedAddress()
              await clearCartAfterOrder()
            } catch (err) {
              toast.error('Payment received but order failed. Please contact support.')
            }
          },
          prefill: { name: address.name, contact: address.mobile, email: address.email || user?.email || '' },
          theme: { color: '#16a34a' },
        }
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', () => {
          toast.error('Payment failed. Please try again.')
          setPlacing(false)
        })
        rzp.open()
        return
      }
      setOrderSuccess(true)
      clearCachedAddress()
      await clearCartAfterOrder()
    } catch (err) {
      toast.error(err.message || 'Order failed. Please try again.')
    }
    setPlacing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-green-600" />
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-5">
        <div className="max-w-md text-center">
          <div className="mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="font-heading text-h1 font-bold text-ink mb-2">Order Placed!</h1>
          <p className="text-green-800/60 mb-6">Thank you for your order. We'll confirm shortly.</p>
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3.5 text-body-sm font-semibold text-white hover:bg-green-700 transition">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-12 text-center bg-white">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-green-50 text-green-800/20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2"/></svg>
        </div>
        <h2 className="font-heading text-h2 font-bold text-ink">Your cart is empty</h2>
        <p className="mt-2 text-green-800/50">Add some fresh products to get started!</p>
        <Link to="/products" className="mt-6 btn-font inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3.5 text-body-sm font-semibold tracking-[0.06em] uppercase text-white transition-all hover:bg-green-700 hover:-translate-y-1 shadow-xl shadow-green-600/20 btn-lift">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-green-50 border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-3 sm:px-8 lg:px-10">
          <div className="flex items-center gap-2 text-caption text-green-800/40">
            <Link to="/cart" className="hover:text-green-600 transition-colors">Cart</Link>
            <span>/</span>
            <span className="text-green-800/70 font-medium">
              {step === 1 ? 'Quantity' : step === 2 ? 'Delivery Address' : step === 3 ? 'Order Summary' : 'Payment'}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { num: 1, label: 'Quantity' },
            { num: 2, label: 'Address' },
            { num: 3, label: 'Summary' },
            { num: 4, label: 'Payment' },
          ].map(s => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step >= s.num ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800/40'}`}>{s.num}</div>
              <span className={`text-sm font-semibold hidden sm:inline ${step >= s.num ? 'text-ink' : 'text-green-800/40'}`}>{s.label}</span>
              {s.num < 4 && <div className={`h-px w-8 sm:w-12 ${step > s.num ? 'bg-green-600' : 'bg-green-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Quantity */}
        {step === 1 && (
          <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h3 className="font-heading text-h4 font-bold text-ink mb-4">Order Items ({cartItems.length})</h3>
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 pb-3 border-b border-border last:border-0">
                    <img src={getImageUrl(getItemImage(item), settings?.placeholder_image)} alt={getItemName(item)} className="h-14 w-14 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-semibold text-ink truncate">{getItemName(item)}</p>
                      {getItemVariantName(item) && <p className="text-caption text-green-800/40">{getItemVariantName(item)}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => { if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1) }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-green-800/60 hover:bg-green-50 hover:text-green-700 transition-colors text-sm font-bold">−</button>
                        <span className="min-w-[1.5rem] text-center text-body-sm font-semibold text-ink">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-green-800/60 hover:bg-green-50 hover:text-green-700 transition-colors text-sm font-bold">+</button>
                        <button onClick={() => removeFromCart(item.id)}
                          className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors text-xs"
                          title="Remove item">✕</button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-body-sm font-semibold text-ink">{formatPrice(getItemPrice(item) * item.quantity)}</p>
                      <p className="text-caption text-green-800/40">×{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm h-fit sticky top-28">
              <h2 className="font-heading mb-3 text-h2 font-bold text-ink">Your Items</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 text-body-sm">
                    <span className="flex-1 truncate">{getItemName(item)}{getItemVariantName(item) ? ` (${getItemVariantName(item)})` : ''}</span>
                    <span className="text-green-800/50">×{item.quantity}</span>
                    <span className="font-semibold">{formatPrice(getItemPrice(item) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex justify-between text-body-sm font-semibold">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="mt-1 flex justify-between text-body-sm">
                  <span className="text-green-600">Coupon discount</span>
                  <span className="font-semibold text-green-600">-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <button onClick={() => setStep(2)}
                className="btn-font mt-5 w-full rounded-2xl bg-green-600 py-3.5 text-body-sm font-semibold tracking-[0.06em] uppercase text-white shadow-xl transition-all hover:bg-green-700 hover:-translate-y-1 btn-lift">
                Continue to Address
              </button>
              <Link to="/cart" className="mt-3 block text-center text-caption font-semibold text-green-600 hover:text-green-700">Back to Cart</Link>
            </div>
          </div>
        )}

        {/* Step 2: Delivery Address */}
        {step === 2 && (
          <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-heading mb-5 text-h3 font-bold text-ink">Delivery Address</h2>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption font-semibold text-green-800/60 mb-1">Full Name *</label>
                    <input value={address.name} onChange={e => setAddress(a => ({ ...a, name: e.target.value }))} placeholder="John Doe"
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-body-sm text-ink placeholder:text-green-800/30 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-green-800/60 mb-1">Mobile Number *</label>
                    <input value={address.mobile} onChange={e => setAddress(a => ({ ...a, mobile: e.target.value }))} placeholder="9876543210"
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-body-sm text-ink placeholder:text-green-800/30 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-caption font-semibold text-green-800/60 mb-1">Email (optional)</label>
                    <input value={address.email} onChange={e => setAddress(a => ({ ...a, email: e.target.value }))} placeholder="john@example.com"
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-body-sm text-ink placeholder:text-green-800/30 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-caption font-semibold text-green-800/60 mb-1">House / Flat Number *</label>
                    <input value={address.house} onChange={e => setAddress(a => ({ ...a, house: e.target.value }))} placeholder="House / Flat / Door No."
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-body-sm text-ink placeholder:text-green-800/30 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-green-800/60 mb-1">Street</label>
                    <input value={address.street} onChange={e => setAddress(a => ({ ...a, street: e.target.value }))} placeholder="Street name"
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-body-sm text-ink placeholder:text-green-800/30 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-green-800/60 mb-1">Area / Locality *</label>
                    <input value={address.area} onChange={e => setAddress(a => ({ ...a, area: e.target.value }))} placeholder="Area or locality"
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-body-sm text-ink placeholder:text-green-800/30 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-green-800/60 mb-1">Landmark</label>
                    <input value={address.landmark} onChange={e => setAddress(a => ({ ...a, landmark: e.target.value }))} placeholder="Nearby landmark"
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-body-sm text-ink placeholder:text-green-800/30 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-green-800/60 mb-1">City / Town *</label>
                    <input value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} placeholder="City"
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-body-sm text-ink placeholder:text-green-800/30 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-green-800/60 mb-1">State *</label>
                    <input value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} placeholder="State"
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-body-sm text-ink placeholder:text-green-800/30 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-green-800/60 mb-1">PIN Code *</label>
                    <input value={address.pincode} onChange={e => setAddress(a => ({ ...a, pincode: e.target.value }))} placeholder="PIN code"
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-body-sm text-ink placeholder:text-green-800/30 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-green-800/60 mb-1">Country *</label>
                    <input value={address.country} onChange={e => setAddress(a => ({ ...a, country: e.target.value }))} placeholder="India"
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-body-sm text-ink placeholder:text-green-800/30 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-caption font-semibold text-green-800/60 mb-1">Delivery Instructions (optional)</label>
                    <textarea value={address.deliveryInstructions} onChange={e => setAddress(a => ({ ...a, deliveryInstructions: e.target.value }))} placeholder="Leave at door, call on arrival, etc." rows={2}
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-body-sm text-ink placeholder:text-green-800/30 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={address.billingSame} onChange={e => setAddress(a => ({ ...a, billingSame: e.target.checked }))}
                    className="rounded border-green-300 text-green-600 focus:ring-green-500" />
                  <span className="text-body-sm text-green-800/70">Billing address same as shipping</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)}
                    className="btn-font flex-1 rounded-2xl border border-border bg-white py-3.5 text-center text-body-sm font-semibold text-green-800/60 transition-all hover:border-green-600 hover:text-green-600">
                    ← Back to Quantity
                  </button>
                  <button onClick={() => setStep(3)}
                    className="btn-font flex-1 rounded-2xl bg-green-600 py-3.5 text-body-sm font-semibold tracking-[0.06em] uppercase text-white shadow-xl transition-all hover:bg-green-700 hover:-translate-y-1 btn-lift">
                    Continue to Summary
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm h-fit sticky top-28">
              <h2 className="font-heading mb-3 text-h2 font-bold text-ink">Your Items</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 text-body-sm">
                    <span className="flex-1 truncate">{getItemName(item)}{getItemVariantName(item) ? ` (${getItemVariantName(item)})` : ''}</span>
                    <span className="text-green-800/50">×{item.quantity}</span>
                    <span className="font-semibold">{formatPrice(getItemPrice(item) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex justify-between text-body-sm font-semibold">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Order Summary */}
        {step === 3 && (
          <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
            <div className="space-y-4">
              {/* Delivery address card */}
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading text-h4 font-bold text-ink">Delivery Address</h3>
                  <button onClick={() => setStep(2)} className="text-caption font-semibold text-green-600 hover:text-green-700">Edit</button>
                </div>
                {addressComplete ? (
                  <>
                    <p className="text-body-sm text-ink">{address.name}</p>
                    <p className="text-body-sm text-green-800/60">{address.mobile}</p>
                    <p className="text-body-sm text-green-800/60">{address.email}</p>
                    <p className="text-body-sm text-green-800/60 mt-1">
                      {[address.house, address.street, address.area, address.landmark, address.city, address.state, address.pincode, address.country].filter(Boolean).join(', ')}
                    </p>
                    {address.deliveryInstructions && <p className="text-body-sm text-green-800/40 mt-1 italic">"{address.deliveryInstructions}"</p>}
                  </>
                ) : (
                  <p className="text-body-sm text-red-500">Please fill in your delivery address in Step 2</p>
                )}
              </div>

              {/* Items */}
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <h3 className="font-heading text-h4 font-bold text-ink mb-4">Order Items ({cartItems.length})</h3>
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4 pb-3 border-b border-border last:border-0">
                      <img src={getImageUrl(getItemImage(item), settings?.placeholder_image)} alt={getItemName(item)} className="h-14 w-14 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-semibold text-ink truncate">{getItemName(item)}</p>
                        {getItemVariantName(item) && <p className="text-caption text-green-800/40">{getItemVariantName(item)}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-body-sm font-semibold text-ink">{formatPrice(getItemPrice(item) * item.quantity)}</p>
                        <p className="text-caption text-green-800/40">×{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm h-fit sticky top-28">
              <h2 className="font-heading mb-4 text-h2 font-bold text-ink">Order Summary</h2>

              {/* Coupon */}
              {appliedCoupon ? (
                <div className="mb-4 rounded-xl border border-green-300 bg-green-50 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-caption font-semibold text-green-700">Coupon applied</p>
                      <p className="text-body-sm font-bold text-green-800">{appliedCoupon.code}</p>
                      <p className="text-caption text-green-600">Discount: -{formatPrice(couponDiscount)}</p>
                    </div>
                    <button onClick={handleRemoveCouponClick}
                      className="rounded-lg border border-green-300 bg-white px-3 py-1 text-caption font-semibold text-green-700 hover:bg-green-100 transition">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mb-4">
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code"
                    className="flex-1 rounded-xl border border-border bg-white px-3 py-2.5 text-body-sm text-ink placeholder:text-green-800/30 outline-none focus:border-green-600" />
                  <button onClick={handleApplyCouponClick} disabled={couponLoading || !couponCode.trim()}
                    className="rounded-xl border border-green-600/30 bg-green-600/10 px-5 py-2.5 text-caption font-semibold text-green-600 hover:bg-green-600 hover:text-white transition-all disabled:opacity-50">{couponLoading ? '...' : 'Apply'}</button>
                </div>
              )}
              {couponError && <p className="text-caption text-red-600 mb-2">{couponError}</p>}

              <div className="space-y-2 text-body-sm">
                <div className="flex justify-between"><span className="text-green-800/50">Subtotal</span><span className="font-semibold text-ink">{formatPrice(subtotal)}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between"><span className="text-green-800/50">Coupon discount</span><span className="font-semibold text-green-600">-{formatPrice(couponDiscount)}</span></div>}
                <div className="flex justify-between"><span className="text-green-800/50">Shipping</span><span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                <div className="border-t pt-2 flex justify-between text-body-lg"><span className="font-bold text-ink">Grand Total</span><span className="font-heading font-bold text-green-600">{formatPrice(grandTotal)}</span></div>
              </div>

              <button onClick={() => { if (addressComplete) setStep(4); else toast.error('Please fill in your delivery address first') }}
                className="btn-font mt-5 w-full rounded-2xl bg-green-600 py-3.5 text-body-sm font-semibold tracking-[0.06em] uppercase text-white shadow-xl transition-all hover:bg-green-700 hover:-translate-y-1 btn-lift">
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
            <div className="space-y-4">
              {/* Delivery address card */}
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading text-h4 font-bold text-ink">Delivery Address</h3>
                  <button onClick={() => setStep(2)} className="text-caption font-semibold text-green-600 hover:text-green-700">Edit</button>
                </div>
                <p className="text-body-sm text-ink">{address.name}</p>
                <p className="text-body-sm text-green-800/60">{address.mobile}</p>
                <p className="text-body-sm text-green-800/60">{address.email}</p>
                <p className="text-body-sm text-green-800/60 mt-1">
                  {[address.house, address.street, address.area, address.landmark, address.city, address.state, address.pincode, address.country].filter(Boolean).join(', ')}
                </p>
                {address.deliveryInstructions && <p className="text-body-sm text-green-800/40 mt-1 italic">"{address.deliveryInstructions}"</p>}
              </div>

              {/* Items */}
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <h3 className="font-heading text-h4 font-bold text-ink mb-4">Order Items ({cartItems.length})</h3>
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4 pb-3 border-b border-border last:border-0">
                      <img src={getImageUrl(getItemImage(item), settings?.placeholder_image)} alt={getItemName(item)} className="h-14 w-14 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-semibold text-ink truncate">{getItemName(item)}</p>
                        {getItemVariantName(item) && <p className="text-caption text-green-800/40">{getItemVariantName(item)}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-body-sm font-semibold text-ink">{formatPrice(getItemPrice(item) * item.quantity)}</p>
                        <p className="text-caption text-green-800/40">×{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm h-fit sticky top-28">
              <h2 className="font-heading mb-4 text-h2 font-bold text-ink">Order Summary</h2>

              <div className="space-y-2 text-body-sm">
                <div className="flex justify-between"><span className="text-green-800/50">Subtotal</span><span className="font-semibold text-ink">{formatPrice(subtotal)}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between"><span className="text-green-800/50">Coupon</span><span className="font-semibold text-green-600">-{formatPrice(couponDiscount)}</span></div>}
                <div className="flex justify-between"><span className="text-green-800/50">Shipping</span><span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                <div className="border-t pt-2 flex justify-between text-body-lg"><span className="font-bold text-ink">Grand Total</span><span className="font-heading font-bold text-green-600">{formatPrice(grandTotal)}</span></div>
              </div>

              {showRazorpay && showWhatsApp ? (
                <div className="mt-5 space-y-3">
                  <button onClick={() => handlePlaceOrder('razorpay')} disabled={placing}
                    className="btn-font w-full rounded-2xl bg-green-600 py-3.5 text-body-sm font-semibold tracking-[0.06em] uppercase text-white shadow-xl transition-all hover:bg-green-700 hover:-translate-y-1 disabled:opacity-50 btn-lift">
                    Pay with Razorpay
                  </button>
                  <div className="flex items-center gap-2"><span className="flex-1 border-t border-border" /><span className="text-caption text-green-800/30">OR</span><span className="flex-1 border-t border-border" /></div>
                  <button onClick={() => handlePlaceOrder('whatsapp')} disabled={placing}
                    className="btn-font w-full rounded-2xl bg-green-800 py-3.5 text-body-sm font-semibold tracking-[0.06em] uppercase text-white shadow-xl transition-all hover:bg-forest-950 hover:-translate-y-1 disabled:opacity-50 btn-lift">
                    Place Order via WhatsApp
                  </button>
                </div>
              ) : showRazorpay ? (
                <button onClick={() => handlePlaceOrder('razorpay')} disabled={placing}
                  className="btn-font mt-5 w-full rounded-2xl bg-green-600 py-3.5 text-body-sm font-semibold tracking-[0.06em] uppercase text-white shadow-xl transition-all hover:bg-green-700 hover:-translate-y-1 disabled:opacity-50 btn-lift">
                  {placing ? 'Processing...' : 'Pay with Razorpay'}
                </button>
              ) : (
                <button onClick={() => handlePlaceOrder('whatsapp')} disabled={placing}
                  className="btn-font mt-5 w-full rounded-2xl bg-green-800 py-3.5 text-body-sm font-semibold tracking-[0.06em] uppercase text-white shadow-xl transition-all hover:bg-forest-950 hover:-translate-y-1 disabled:opacity-50 btn-lift">
                  {placing ? 'Placing Order...' : 'Place Order via WhatsApp'}
                </button>
              )}

              <p className="mt-3 text-center text-caption text-green-800/30">
                {paymentMethod === 'razorpay' ? 'Secure payment via Razorpay' : paymentMethod === 'whatsapp' ? 'You will be redirected to WhatsApp' : 'Choose your payment method'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
