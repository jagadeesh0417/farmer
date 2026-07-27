import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { formatPrice, getImageUrl } from '../lib/utils'

function getItemName(item) {
  if (item.bundle) return item.bundle.bundle_name || item.bundle.name || 'Bundle'
  return item.product?.name || 'Product'
}

function getItemPrice(item) {
  if (item.bundle) return item.bundle.bundle_price || 0
  return item.variant?.price || item.product?.price || item.product?.basePrice || 0
}

function getItemImage(item) {
  if (item.bundle) return item.bundle.bundle_image_url || item.bundle.image_url
  return item.product?.images?.[0] || item.product?.image_url
}

function getItemVariantName(item) {
  return item.variant?.weightLabel || item.variant?.weight_label || item.variant?.name || ''
}

export default function Cart() {
  const { cartItems, addToCart, removeFromCart, updateQuantity, totals } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [editingVariant, setEditingVariant] = useState(null)

  const total = totals?.finalTotal || 0

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
    setEditingVariant(null)
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="bg-green-50 border border-border rounded-2xl p-12 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-white mx-auto text-green-800/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2"/></svg>
            </div>
            <h2 className="font-heading text-h2 font-bold text-ink mb-2">Your cart is empty</h2>
            <p className="text-green-800/50 mb-6">Add some fresh products to get started!</p>
            <Link to="/products" className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3.5 text-body-sm font-semibold tracking-[0.06em] uppercase text-white transition-all hover:bg-green-700 hover:-translate-y-1 shadow-xl shadow-green-600/20 btn-lift">Browse Products</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-green-50 border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-3 sm:px-8 lg:px-10">
          <div className="flex items-center gap-2 text-caption text-green-800/40">
            <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-green-800/70 font-medium">Shopping Cart</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <h1 className="font-heading mb-8 text-h1 font-bold text-ink tracking-tight">Shopping Cart</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
          {/* Cart Items */}
          <div className="space-y-3">
            {cartItems.map(item => {
              const variants = item.product?.variants || []
              const hasMultipleVariants = variants.length > 1
              return (
                <div key={item.id} className="flex gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm hover:shadow-md transition-all">
                  <img src={getImageUrl(getItemImage(item), settings?.placeholder_image)} alt={getItemName(item)}
                    className="h-20 w-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink truncate">{getItemName(item)}</h3>
                    {getItemVariantName(item) && (
                      <div className="flex items-center flex-wrap gap-x-1">
                        <p className="text-caption text-green-800/40">{getItemVariantName(item)}</p>
                        {hasMultipleVariants && (
                          <button onClick={() => setEditingVariant(editingVariant === item.id ? null : item.id)}
                            className="text-caption font-semibold text-green-600 hover:text-green-700 ml-1">
                            (change)
                          </button>
                        )}
                      </div>
                    )}
                    {editingVariant === item.id && hasMultipleVariants && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {variants.filter(v => v.isActive !== false && String(v._id) !== String(item.variant_id || item.variant?._id)).map(v => (
                          <button key={v._id} onClick={() => handleVariantChange(item, v)}
                            className="px-2.5 py-1 text-caption font-medium rounded-lg border border-border hover:bg-green-50 hover:border-green-600 transition-all">
                            {v.weightLabel || v.name} — {formatPrice(v.price)}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-body-sm font-semibold text-green-600">{formatPrice(getItemPrice(item))}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-green-800/60 hover:bg-green-50 transition-all">-</button>
                      <span className="min-w-[2rem] text-center text-body-sm font-semibold text-ink">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-green-800/60 hover:bg-green-50 transition-all">+</button>
                      <button onClick={() => removeFromCart(item.id)} className="ml-auto text-caption font-semibold text-green-600 hover:text-green-700 transition-colors">Remove</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm h-fit sticky top-28">
            <h2 className="font-heading mb-4 text-h2 font-bold text-ink">Order Summary</h2>
            <div className="space-y-3 text-body-sm">
              <div className="flex justify-between">
                <span className="text-green-800/50">Subtotal ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span>
                <span className="font-semibold text-ink">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-800/50">Shipping</span>
                <span className="font-semibold text-green-800">Calculated at checkout</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} disabled={cartItems.length === 0}
              className="btn-font mt-6 w-full rounded-2xl bg-green-600 py-3.5 text-body-sm font-semibold tracking-[0.06em] uppercase text-white shadow-xl transition-all hover:bg-green-700 hover:-translate-y-1 disabled:opacity-50 btn-lift">
              Proceed to Checkout
            </button>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-green-50 p-2"><p className="text-micro font-semibold text-green-800">🔒 Secure Checkout</p></div>
              <div className="rounded-xl bg-green-50 p-2"><p className="text-micro font-semibold text-green-800">🚚 Free Shipping</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
