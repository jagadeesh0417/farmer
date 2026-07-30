import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { formatPrice, getImageUrl } from '../lib/utils'
import { getItemName, getItemPrice, getItemImage, getItemVariantName, calculateCartTotals } from '../lib/pricingService'
import { api } from '../lib/api'
import { toast } from 'react-toastify'
import { INDIAN_STATES } from '../lib/indianStates'

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
  district: '', city: '', state: '', pincode: '', country: 'India',
  deliveryInstructions: '',
  billingSame: true,
  billingHouse: '', billingStreet: '', billingCity: '', billingState: '', billingPincode: '',
}

const VALIDATORS = {
  name: (v) => v?.trim() ? '' : 'Full name is required',
  mobile: (v) => /^[0-9]{10}$/.test(v?.trim()) ? '' : 'Please enter a valid 10-digit mobile number.',
  house: (v) => v?.trim() ? '' : 'House/Flat number is required',
  area: (v) => v?.trim() ? '' : 'Street/Area is required',
  district: (v) => v?.trim() ? '' : 'District is required',
  city: (v) => v?.trim() ? '' : 'City/Town/Village is required',
  state: (v) => INDIAN_STATES.includes(v) ? '' : 'Please select a state',
  pincode: (v) => /^[0-9]{6}$/.test(v?.trim()) ? '' : 'Please enter a valid 6-digit PIN code.',
}

function AddressField({ label, required, value, onChange, onBlur, error, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-caption font-semibold text-[#8B9E7A] mb-1">
        {label}{required ? ' *' : ''}
      </label>
      <input value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur}
        placeholder={placeholder} type={type}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-body-sm text-[#1a1a1a] placeholder:text-[#B0B0B0] outline-none transition-all ${error ? 'border-red-400' : 'border-[#E5EDD8] focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10'}`} />
      {error && <p className="text-caption text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function StepIndicator({ step, steps }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
              step > s.num
                ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/20'
                : step === s.num
                  ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/20 ring-4 ring-[#2E7D32]/10'
                  : 'bg-[#E5EDD8] text-[#8B9E7A]'
            }`}>
              {step > s.num ? (
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : s.num}
            </div>
            <span className={`mt-1.5 text-micro sm:text-caption font-semibold hidden sm:block ${
              step >= s.num ? 'text-[#1a1a1a]' : 'text-[#B0B0B0]'
            }`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-[2px] w-10 sm:w-16 lg:w-24 mx-1 sm:mx-2 transition-colors duration-300 ${
              step > s.num ? 'bg-[#2E7D32]' : 'bg-[#E5EDD8]'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}

function SummarySidebar({ cartItems, subtotal, couponDiscount, shipping, tax, grandTotal, appliedCoupon, couponCode, setCouponCode, couponLoading, couponError, onApplyCoupon, onRemoveCoupon, settings }) {
  return (
    <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sticky top-24">
      <h2 className="font-heading text-h2 font-bold text-[#1a1a1a] mb-4">Your Items</h2>

      {/* Mini items list */}
      <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
        {cartItems.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <img src={getImageUrl(getItemImage(item), settings?.placeholder_image)} alt={getItemName(item)}
              className="h-11 w-11 rounded-lg object-cover shrink-0 border border-[#E5EDD8]" />
            <div className="flex-1 min-w-0">
              <p className="text-caption font-semibold text-[#1a1a1a] truncate">{getItemName(item)}</p>
              {getItemVariantName(item) && (
                <p className="text-micro text-[#8B9E7A]">{getItemVariantName(item)}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-caption font-semibold text-[#1a1a1a]">{formatPrice(getItemPrice(item) * item.quantity)}</p>
              <p className="text-micro text-[#8B9E7A]">×{item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon */}
      <div className="mb-4">
        {appliedCoupon ? (
          <div className="rounded-xl border border-[#C8E6C9] bg-[#E8F5E9] p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption font-bold text-[#2E7D32] uppercase tracking-wide">{appliedCoupon.code}</p>
                <p className="text-caption text-[#4CAF50]">−{formatPrice(couponDiscount)}</p>
              </div>
              <button onClick={onRemoveCoupon}
                className="rounded-lg border border-[#A5D6A7] bg-white px-2.5 py-1 text-micro font-semibold text-[#2E7D32] hover:bg-[#C8E6C9] transition-all">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code"
                className="flex-1 rounded-xl border border-[#E5EDD8] bg-white px-3 py-2.5 text-caption text-[#1a1a1a] placeholder:text-[#B0B0B0] outline-none focus:border-[#2E7D32]" />
              <button onClick={onApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                className="rounded-xl bg-[#2E7D32] px-4 py-2.5 text-caption font-semibold text-white hover:bg-[#1B5E20] transition-all disabled:opacity-50">
                {couponLoading ? '...' : 'Apply'}
              </button>
            </div>
            {couponError && <p className="text-caption text-red-500 mt-1">{couponError}</p>}
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="space-y-2 text-body-sm">
        <div className="flex justify-between">
          <span className="text-[#8B9E7A]">Subtotal</span>
          <span className="font-semibold text-[#1a1a1a]">{formatPrice(subtotal)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-[#8B9E7A]">Coupon</span>
            <span className="font-semibold text-[#2E7D32]">−{formatPrice(couponDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-[#8B9E7A]">Shipping</span>
          <span className={`font-semibold ${shipping === 0 ? 'text-[#2E7D32]' : 'text-[#1a1a1a]'}`}>
            {shipping === 0 ? 'FREE' : formatPrice(shipping)}
          </span>
        </div>
        {tax > 0 && (
          <div className="flex justify-between">
            <span className="text-[#8B9E7A]">Tax</span>
            <span className="font-semibold text-[#1a1a1a]">{formatPrice(tax)}</span>
          </div>
        )}
        <div className="border-t border-[#E5EDD8] !mt-3 !mb-2" />
        <div className="flex justify-between">
          <span className="text-body font-bold text-[#1a1a1a]">Total</span>
          <span className="font-heading text-h3 font-bold text-[#2E7D32]">{formatPrice(grandTotal)}</span>
        </div>
      </div>
    </div>
  )
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

  const [touched, setTouched] = useState({})
  const [stateSearch, setStateSearch] = useState('')
  const [stateOpen, setStateOpen] = useState(false)
  const stateRef = useRef(null)

  useEffect(() => { saveCachedAddress(address) }, [address])

  const errors = {}
  for (const key of Object.keys(VALIDATORS)) {
    errors[key] = touched[key] ? VALIDATORS[key](address[key]) : ''
  }

  const hasError = Object.values(errors).some(e => e)
  const addressComplete = !hasError && Object.keys(VALIDATORS).every(k => {
    if (k === 'mobile') return /^[0-9]{10}$/.test(address.mobile?.trim())
    if (k === 'pincode') return /^[0-9]{6}$/.test(address.pincode?.trim())
    if (k === 'state') return INDIAN_STATES.includes(address.state)
    return address[k]?.trim()
  })

  const paymentMethod = settings?.paymentMethod || (settings?.razorpayEnabled !== false ? 'both' : 'whatsapp')
  const showRazorpay = paymentMethod === 'both' || paymentMethod === 'razorpay'
  const showWhatsApp = paymentMethod === 'both' || paymentMethod === 'whatsapp'

  const { subtotal, shipping, tax, grandTotal } = useMemo(
    () => calculateCartTotals(cartItems, appliedCoupon, settings),
    [cartItems, appliedCoupon, settings]
  )
  const couponDiscount = appliedCoupon ? (calculateCartTotals(cartItems, appliedCoupon, settings).couponDiscount) : 0

  const handleApplyCouponClick = () => { handleApplyCoupon(couponCode) }
  const handleRemoveCouponClick = () => { handleRemoveCoupon(); setCouponCode('') }

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

  const steps = [
    { num: 1, label: 'Cart' },
    { num: 2, label: 'Address' },
    { num: 3, label: 'Summary' },
    { num: 4, label: 'Payment' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#D7E8C8] border-t-[#2E7D32]" />
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center px-5">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#E8F5E9] shadow-lg shadow-[#2E7D32]/10">
            <svg className="h-12 w-12 text-[#2E7D32]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-heading text-h1 font-bold text-[#1a1a1a] mb-2">Order Placed!</h1>
          <p className="text-[#8B9E7A] mb-8">Thank you for your order. We'll confirm shortly.</p>
          <Link to="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-8 py-3.5 text-body-sm font-semibold text-white transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5 shadow-lg shadow-[#2E7D32]/20">
            Continue Shopping
          </Link>
        </div>
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
    <div className="min-h-screen bg-[#F8FAF5]">
      {/* Breadcrumb */}
      <div className="border-b border-[#E5EDD8] bg-white">
        <div className="mx-auto max-w-5xl px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2 text-caption text-[#8B9E7A]">
            <Link to="/cart" className="hover:text-[#2E7D32] transition-colors">Cart</Link>
            <span>/</span>
            <span className="text-[#1a1a1a] font-medium">
              {steps.find(s => s.num === step)?.label || 'Checkout'}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-10">
        {/* Step indicator */}
        <StepIndicator step={step} steps={steps} />

        {/* Step 1: Cart Review */}
        {step === 1 && (
          <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
            <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <h3 className="font-heading text-h4 font-bold text-[#1a1a1a] mb-4">Review Items ({cartItems.length})</h3>
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
            </div>

            <SummarySidebar cartItems={cartItems} subtotal={subtotal}
              couponDiscount={couponDiscount} shipping={shipping} tax={tax} grandTotal={grandTotal}
              appliedCoupon={appliedCoupon} couponCode={couponCode} setCouponCode={setCouponCode}
              couponLoading={couponLoading} couponError={couponError}
              onApplyCoupon={handleApplyCouponClick} onRemoveCoupon={handleRemoveCouponClick}
              settings={settings}>
              <button onClick={() => setStep(2)}
                className="btn-font mt-5 w-full rounded-full bg-[#2E7D32] py-3.5 text-body-sm font-semibold text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5">
                Continue to Address
              </button>
              <Link to="/cart" className="mt-3 block text-center text-caption font-semibold text-[#2E7D32] hover:text-[#1B5E20]">Back to Cart</Link>
            </SummarySidebar>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
            <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <h2 className="font-heading text-h3 font-bold text-[#1a1a1a] mb-5">Delivery Address</h2>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <AddressField label="Full Name" required value={address.name} error={errors.name}
                    onChange={v => setAddress(a => ({ ...a, name: v }))}
                    onBlur={() => setTouched(t => ({ ...t, name: true }))}
                    placeholder="John Doe" />
                  <AddressField label="Mobile Number" required value={address.mobile} error={errors.mobile}
                    onChange={v => setAddress(a => ({ ...a, mobile: v.replace(/[^0-9]/g, '').slice(0, 10) }))}
                    onBlur={() => setTouched(t => ({ ...t, mobile: true }))}
                    placeholder="9876543210" type="tel" />
                  <div className="sm:col-span-2">
                    <AddressField label="Email" value={address.email} error=""
                      onChange={v => setAddress(a => ({ ...a, email: v }))}
                      placeholder="john@example.com" type="email" />
                  </div>
                  <div className="sm:col-span-2">
                    <AddressField label="House / Flat No." required value={address.house} error={errors.house}
                      onChange={v => setAddress(a => ({ ...a, house: v }))}
                      onBlur={() => setTouched(t => ({ ...t, house: true }))}
                      placeholder="House / Flat / Door No." />
                  </div>
                  <div className="sm:col-span-2">
                    <AddressField label="Street / Area" required value={address.area} error={errors.area}
                      onChange={v => setAddress(a => ({ ...a, area: v }))}
                      onBlur={() => setTouched(t => ({ ...t, area: true }))}
                      placeholder="Street or locality" />
                  </div>
                  <AddressField label="Landmark" value={address.landmark} error=""
                    onChange={v => setAddress(a => ({ ...a, landmark: v }))}
                    placeholder="Nearby landmark (optional)" />
                  <div>
                    <label className="block text-caption font-semibold text-[#8B9E7A] mb-1">State *</label>
                    <div className="relative" ref={stateRef}>
                      <input value={stateOpen ? stateSearch : (address.state || '')}
                        onChange={e => { setStateSearch(e.target.value); setStateOpen(true) }}
                        onFocus={() => { setStateOpen(true); setStateSearch('') }}
                        placeholder="Search state..."
                        className={`w-full rounded-xl border px-4 py-2.5 text-body-sm outline-none bg-white transition-all ${errors.state ? 'border-red-400' : 'border-[#E5EDD8] focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10'}`} />
                      {stateOpen && (
                        <>
                          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#E5EDD8] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {INDIAN_STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase())).map(s => (
                              <button key={s} type="button" onClick={() => { setAddress(a => ({ ...a, state: s })); setStateOpen(false); setStateSearch(''); setTouched(t => ({ ...t, state: true })) }}
                                className={`w-full text-left px-4 py-2.5 text-body-sm hover:bg-[#F4F9EF] transition-colors ${address.state === s ? 'bg-[#E8F5E9] text-[#2E7D32] font-semibold' : 'text-[#1a1a1a]'}`}>{s}</button>
                            ))}
                          </div>
                          <div className="fixed inset-0 z-10" onClick={() => setStateOpen(false)} />
                        </>
                      )}
                    </div>
                    {errors.state && <p className="text-caption text-red-500 mt-1">{errors.state}</p>}
                  </div>
                  <AddressField label="District" required value={address.district} error={errors.district}
                    onChange={v => setAddress(a => ({ ...a, district: v }))}
                    onBlur={() => setTouched(t => ({ ...t, district: true }))}
                    placeholder="District" />
                  <AddressField label="City / Town / Village" required value={address.city} error={errors.city}
                    onChange={v => setAddress(a => ({ ...a, city: v }))}
                    onBlur={() => setTouched(t => ({ ...t, city: true }))}
                    placeholder="City / Town / Village" />
                  <AddressField label="PIN Code" required value={address.pincode} error={errors.pincode}
                    onChange={v => setAddress(a => ({ ...a, pincode: v.replace(/[^0-9]/g, '').slice(0, 6) }))}
                    onBlur={() => setTouched(t => ({ ...t, pincode: true }))}
                    placeholder="6-digit PIN code" type="tel" />
                  <div>
                    <label className="block text-caption font-semibold text-[#8B9E7A] mb-1">Country</label>
                    <input value="India" readOnly
                      className="w-full rounded-xl border border-[#E5EDD8] bg-gray-50 px-4 py-2.5 text-body-sm text-[#8B9E7A] outline-none cursor-not-allowed" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-caption font-semibold text-[#8B9E7A] mb-1">Delivery Instructions (optional)</label>
                    <textarea value={address.deliveryInstructions} onChange={e => setAddress(a => ({ ...a, deliveryInstructions: e.target.value }))} placeholder="Leave at door, call on arrival, etc." rows={2}
                      className="w-full rounded-xl border border-[#E5EDD8] bg-white px-4 py-2.5 text-body-sm text-[#1a1a1a] placeholder:text-[#B0B0B0] outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)}
                    className="flex-1 rounded-full border-2 border-[#D7E8C8] bg-white py-3.5 text-body-sm font-semibold text-[#8B9E7A] transition-all hover:border-[#2E7D32] hover:text-[#2E7D32]">
                    ← Back
                  </button>
                  <button onClick={() => { Object.keys(VALIDATORS).forEach(k => setTouched(t => ({ ...t, [k]: true }))); if (addressComplete) setStep(3) }}
                    className="flex-1 rounded-full bg-[#2E7D32] py-3.5 text-body-sm font-semibold text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    disabled={!addressComplete}>
                    Continue to Summary
                  </button>
                </div>
              </div>
            </div>

            <SummarySidebar cartItems={cartItems} subtotal={subtotal}
              couponDiscount={couponDiscount} shipping={shipping} tax={tax} grandTotal={grandTotal}
              appliedCoupon={appliedCoupon} couponCode={couponCode} setCouponCode={setCouponCode}
              couponLoading={couponLoading} couponError={couponError}
              onApplyCoupon={handleApplyCouponClick} onRemoveCoupon={handleRemoveCouponClick}
              settings={settings} />
          </div>
        )}

        {/* Step 3: Order Summary */}
        {step === 3 && (
          <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
            <div className="space-y-4">
              {/* Delivery address card */}
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
                  <button onClick={() => setStep(2)} className="text-caption font-semibold text-[#2E7D32] hover:text-[#1B5E20] underline underline-offset-2">Edit</button>
                </div>
                {addressComplete ? (
                  <div className="bg-[#F8FAF5] rounded-xl p-4 space-y-1">
                    <p className="text-body-sm font-semibold text-[#1a1a1a]">{address.name}</p>
                    <p className="text-caption text-[#8B9E7A]">{address.mobile}{address.email ? ` · ${address.email}` : ''}</p>
                    <p className="text-body-sm text-[#1a1a1a] mt-1">
                      {[address.house, address.street, address.area, address.landmark, address.city, address.district, address.state, address.pincode, address.country].filter(Boolean).join(', ')}
                    </p>
                    {address.deliveryInstructions && <p className="text-caption text-[#8B9E7A] mt-1 italic">"{address.deliveryInstructions}"</p>}
                  </div>
                ) : (
                  <p className="text-body-sm text-red-500">Please fill in your delivery address in the previous step.</p>
                )}
              </div>

              {/* Items */}
              <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <h3 className="font-heading text-h4 font-bold text-[#1a1a1a] mb-4">Order Items ({cartItems.length})</h3>
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

            <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sticky top-24">
              <h2 className="font-heading text-h2 font-bold text-[#1a1a1a] mb-4">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="rounded-xl border border-[#C8E6C9] bg-[#E8F5E9] p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-caption font-bold text-[#2E7D32] uppercase tracking-wide">{appliedCoupon.code}</p>
                        <p className="text-caption text-[#4CAF50]">−{formatPrice(couponDiscount)}</p>
                      </div>
                      <button onClick={handleRemoveCouponClick}
                        className="rounded-lg border border-[#A5D6A7] bg-white px-2.5 py-1 text-micro font-semibold text-[#2E7D32] hover:bg-[#C8E6C9] transition-all">Remove</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code"
                      className="flex-1 rounded-xl border border-[#E5EDD8] bg-white px-3 py-2.5 text-body-sm text-[#1a1a1a] placeholder:text-[#B0B0B0] outline-none focus:border-[#2E7D32]" />
                    <button onClick={handleApplyCouponClick} disabled={couponLoading || !couponCode.trim()}
                      className="rounded-xl bg-[#2E7D32] px-4 py-2.5 text-caption font-semibold text-white hover:bg-[#1B5E20] transition-all disabled:opacity-50">
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-caption text-red-500 mt-1">{couponError}</p>}
              </div>

              <div className="space-y-2.5 text-body-sm">
                <div className="flex justify-between"><span className="text-[#8B9E7A]">Subtotal</span><span className="font-semibold text-[#1a1a1a]">{formatPrice(subtotal)}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between"><span className="text-[#8B9E7A]">Coupon</span><span className="font-semibold text-[#2E7D32]">−{formatPrice(couponDiscount)}</span></div>}
                <div className="flex justify-between"><span className="text-[#8B9E7A]">Shipping</span><span className={`font-semibold ${shipping === 0 ? 'text-[#2E7D32]' : 'text-[#1a1a1a]'}`}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                {tax > 0 && <div className="flex justify-between"><span className="text-[#8B9E7A]">Tax</span><span className="font-semibold text-[#1a1a1a]">{formatPrice(tax)}</span></div>}
                <div className="border-t border-[#E5EDD8] !mt-3 !mb-2" />
                <div className="flex justify-between"><span className="text-body font-bold text-[#1a1a1a]">Total</span><span className="font-heading text-h3 font-bold text-[#2E7D32]">{formatPrice(grandTotal)}</span></div>
              </div>

              <button onClick={() => { if (addressComplete) setStep(4); else toast.error('Please fill in your delivery address first') }}
                className="mt-5 w-full rounded-full bg-[#2E7D32] py-3.5 text-body-sm font-semibold text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5">
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
            <div className="space-y-4">
              {/* Delivery address card */}
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
                  <button onClick={() => setStep(2)} className="text-caption font-semibold text-[#2E7D32] hover:text-[#1B5E20] underline underline-offset-2">Edit</button>
                </div>
                <div className="bg-[#F8FAF5] rounded-xl p-4 space-y-1">
                  <p className="text-body-sm font-semibold text-[#1a1a1a]">{address.name}</p>
                  <p className="text-caption text-[#8B9E7A]">{address.mobile}{address.email ? ` · ${address.email}` : ''}</p>
                  <p className="text-body-sm text-[#1a1a1a] mt-1">
                    {[address.house, address.street, address.area, address.landmark, address.city, address.district, address.state, address.pincode, address.country].filter(Boolean).join(', ')}
                  </p>
                  {address.deliveryInstructions && <p className="text-caption text-[#8B9E7A] mt-1 italic">"{address.deliveryInstructions}"</p>}
                </div>
              </div>

              {/* Items */}
              <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <h3 className="font-heading text-h4 font-bold text-[#1a1a1a] mb-4">Order Items ({cartItems.length})</h3>
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

              {/* Payment option card */}
              <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <h3 className="font-heading text-h4 font-bold text-[#1a1a1a] mb-4">Payment Method</h3>
                <div className="space-y-3">
                  {showRazorpay && showWhatsApp ? (
                    <>
                      <button onClick={() => handlePlaceOrder('razorpay')} disabled={placing}
                        className="w-full rounded-full bg-[#2E7D32] py-3.5 text-body-sm font-semibold text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 10c0-3.87-3.13-7-7-7s-7 3.13-7 7" />
                        </svg>
                        {placing ? 'Processing...' : 'Pay Online (Razorpay)'}
                      </button>
                      <div className="flex items-center gap-3">
                        <span className="flex-1 border-t border-[#E5EDD8]" />
                        <span className="text-caption text-[#B0B0B0]">OR</span>
                        <span className="flex-1 border-t border-[#E5EDD8]" />
                      </div>
                      <button onClick={() => handlePlaceOrder('whatsapp')} disabled={placing}
                        className="w-full rounded-full bg-[#1B5E20] py-3.5 text-body-sm font-semibold text-white shadow-lg shadow-[#1B5E20]/20 transition-all hover:bg-[#0D3B0F] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        {placing ? 'Placing Order...' : 'Order via WhatsApp'}
                      </button>
                    </>
                  ) : showRazorpay ? (
                    <button onClick={() => handlePlaceOrder('razorpay')} disabled={placing}
                      className="w-full rounded-full bg-[#2E7D32] py-3.5 text-body-sm font-semibold text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0">
                      {placing ? 'Processing...' : 'Pay with Razorpay'}
                    </button>
                  ) : (
                    <button onClick={() => handlePlaceOrder('whatsapp')} disabled={placing}
                      className="w-full rounded-full bg-[#1B5E20] py-3.5 text-body-sm font-semibold text-white shadow-lg shadow-[#1B5E20]/20 transition-all hover:bg-[#0D3B0F] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0">
                      {placing ? 'Placing Order...' : 'Place Order via WhatsApp'}
                    </button>
                  )}
                </div>
                <p className="mt-3 text-center text-caption text-[#B0B0B0]">
                  {paymentMethod === 'razorpay' ? 'Secured by Razorpay' : paymentMethod === 'whatsapp' ? 'You will be redirected to WhatsApp' : 'Choose your payment method above'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sticky top-24">
              <h2 className="font-heading text-h2 font-bold text-[#1a1a1a] mb-4">Payment Summary</h2>
              <div className="space-y-2.5 text-body-sm">
                <div className="flex justify-between"><span className="text-[#8B9E7A]">Subtotal</span><span className="font-semibold text-[#1a1a1a]">{formatPrice(subtotal)}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between"><span className="text-[#8B9E7A]">Coupon</span><span className="font-semibold text-[#2E7D32]">−{formatPrice(couponDiscount)}</span></div>}
                <div className="flex justify-between"><span className="text-[#8B9E7A]">Shipping</span><span className={`font-semibold ${shipping === 0 ? 'text-[#2E7D32]' : 'text-[#1a1a1a]'}`}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                {tax > 0 && <div className="flex justify-between"><span className="text-[#8B9E7A]">Tax</span><span className="font-semibold text-[#1a1a1a]">{formatPrice(tax)}</span></div>}
                <div className="border-t border-[#E5EDD8] !mt-3 !mb-2" />
                <div className="flex justify-between"><span className="text-body font-bold text-[#1a1a1a]">Total</span><span className="font-heading text-h3 font-bold text-[#2E7D32]">{formatPrice(grandTotal)}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
