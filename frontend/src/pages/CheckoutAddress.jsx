import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { toast } from 'react-toastify'
import CheckoutProgress from '../components/checkout/CheckoutProgress'
import CheckoutButton from '../components/checkout/CheckoutButton'
import MobileCheckoutBar from '../components/checkout/MobileCheckoutBar'
import { INDIAN_STATES } from '../lib/indianStates'
import { emptyAddress, loadCachedAddress, saveCachedAddress, ADDRESS_VALIDATORS, isAddressComplete } from '../lib/checkout'

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

export default function CheckoutAddress() {
  const { user } = useAuth()
  const { cartItems, loading } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()

  const [address, setAddress] = useState(() => {
    const cached = loadCachedAddress()
    return {
      ...emptyAddress,
      ...cached,
      name: cached?.name || user?.fullName || user?.user_metadata?.full_name || '',
      mobile: cached?.mobile || user?.phone || user?.user_metadata?.phone || '',
      email: cached?.email || user?.email || '',
    }
  })
  const [touched, setTouched] = useState({})
  const [stateSearch, setStateSearch] = useState('')
  const [stateOpen, setStateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const stateRef = useRef(null)

  useEffect(() => { saveCachedAddress(address) }, [address])
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const errors = {}
  for (const key of Object.keys(ADDRESS_VALIDATORS)) {
    errors[key] = touched[key] ? ADDRESS_VALIDATORS[key](address[key]) : ''
  }
  const addressComplete = isAddressComplete(address)

  const handleContinue = () => {
    if (submitting) return
    if (cartItems.length === 0) { toast.error('Your cart is empty'); navigate('/checkout'); return }
    Object.keys(ADDRESS_VALIDATORS).forEach(k => setTouched(t => ({ ...t, [k]: true })))
    if (!addressComplete) { toast.error('Please fill in all required address fields'); return }
    setSubmitting(true)
    setTimeout(() => navigate('/checkout/payment'), 350)
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
            <span className="text-[#1a1a1a] font-medium">Delivery Address</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-10">
        <CheckoutProgress current={2} />

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
                <AddressField label="Alternate Mobile (optional)" value={address.alternateMobile} error=""
                  onChange={v => setAddress(a => ({ ...a, alternateMobile: v.replace(/[^0-9]/g, '').slice(0, 10) }))}
                  placeholder="Optional" type="tel" />
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
                <label className="sm:col-span-2 flex items-center gap-2.5 cursor-pointer select-none">
                  <input type="checkbox" checked={address.setDefault}
                    onChange={e => setAddress(a => ({ ...a, setDefault: e.target.checked }))}
                    className="h-4 w-4 rounded border-[#D7E8C8] accent-[#2E7D32]" />
                  <span className="text-body-sm font-medium text-[#1a1a1a]">Save this address for next time</span>
                  <svg className="h-4 w-4 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </label>
              </div>

              <div className="flex gap-3 pt-2 hidden lg:flex">
                <Link to="/checkout"
                  className="flex-1 rounded-full border-2 border-[#D7E8C8] bg-white py-3.5 text-body-sm font-semibold text-[#8B9E7A] transition-all hover:border-[#2E7D32] hover:text-[#2E7D32] flex items-center justify-center">
                  ← Back
                </Link>
                <div className="flex-1">
                  <CheckoutButton onClick={handleContinue} loading={submitting}>
                    Continue to Payment
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                    </svg>
                  </CheckoutButton>
                </div>
              </div>
            </div>
          </div>

          {/* Right rail hint */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sticky top-24">
              <h3 className="font-heading text-h4 font-bold text-[#1a1a1a] mb-3">Delivery Details</h3>
              <p className="text-body-sm text-[#8B9E7A] leading-relaxed">
                We deliver across India. Orders usually reach within {settings?.deliveryEtaText?.toLowerCase() || '2–4 business days'}.
                Your address is saved locally and carried through to payment securely.
              </p>
              <div className="mt-4 space-y-2 text-caption text-[#8B9E7A]">
                <p className="flex items-center gap-2"><svg className="h-4 w-4 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>100% secure checkout</p>
                <p className="flex items-center gap-2"><svg className="h-4 w-4 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Cash on Delivery available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <MobileCheckoutBar>
        <CheckoutButton onClick={handleContinue} loading={submitting}>Continue to Payment</CheckoutButton>
      </MobileCheckoutBar>
    </div>
  )
}
