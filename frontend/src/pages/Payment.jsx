import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { formatPrice } from '../lib/utils'
import { api } from '../lib/api'
import { toast } from 'react-toastify'

function getItemName(item) {
  if (item.bundle) return item.bundle.bundle_name || item.bundle.name || 'Bundle'
  return item.product?.name || 'Product'
}

function getItemPrice(item) {
  if (item.bundle) return item.bundle.bundle_price || 0
  return item.variant?.price || item.product?.price || 0
}

function getItemVariantName(item) {
  return item.variant?.weight_label || item.variant?.name || ''
}

export default function Payment() {
  const { user } = useAuth()
  const { cartItems, totals } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)

  const total = totals?.finalTotal || 0
  const shippingCost = total >= 1499 ? 0 : (settings?.shipping_cost || settings?.delivery_charge_amount || 0)
  const totalWithShipping = total + shippingCost

  const handlePayment = async () => {
    setProcessing(true)
    try {
      const options = {
        key: 'rzp_live_SeagFUXcQMCgdT',
        amount: Math.round(totalWithShipping * 100),
        currency: 'INR',
        name: settings?.store_name || 'HAiFarmer',
        description: 'Order Payment',
        handler: async (response) => {
          try {
            await api.createOrder({
              items: cartItems.map(i => ({
                name: getItemName(i),
                variantName: getItemVariantName(i),
                price: getItemPrice(i),
                quantity: i.quantity
              })),
              total: totalWithShipping,
              shippingCost,
              paymentId: response.razorpay_payment_id,
              paymentMethod: 'razorpay',
            })
            toast.success('Payment successful! Order placed.')
            navigate('/')
          } catch (err) {
            toast.error('Payment received but order failed. Please contact support.')
          }
        },
        prefill: { email: user?.email || '', phone: user?.phone || '' },
        theme: { color: '#16a34a' },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="heading-font mb-8 text-3xl font-extrabold text-slate-900">Checkout</h1>

      {/* Cart Items */}
      {cartItems.length === 0 ? (
        <div className="mx-auto max-w-lg text-center py-12">
          <p className="text-slate-500 mb-4">Your cart is empty</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-green-700">Browse Products</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="h-16 w-16 shrink-0 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden">
                  {item.product?.images?.[0] ? (
                    <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl text-slate-300">📦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{getItemName(item)}</p>
                  <p className="text-sm text-slate-500">{getItemVariantName(item)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900">{formatPrice(getItemPrice(item))}</p>
                  <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-semibold">{formatPrice(total)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Shipping</span><span className="font-semibold">{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span></div>
              <div className="border-t pt-2 flex justify-between"><span className="font-bold text-slate-900">Total</span><span className="font-bold text-brand-700">{formatPrice(totalWithShipping)}</span></div>
            </div>
            <button onClick={handlePayment} disabled={processing || cartItems.length === 0}
              className="mt-6 w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-brand-700 transition disabled:opacity-50">
              {processing ? 'Processing...' : 'Pay with Razorpay'}
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">Secured by Razorpay</p>
          </div>
        </div>
      )}
    </div>
  )
}
