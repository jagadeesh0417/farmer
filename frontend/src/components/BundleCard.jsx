import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { formatPrice, getImageUrl } from '../lib/utils'
import { generatePlaceholder } from '../lib/placeholders'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

function calculateBundlePrice(bundle) {
  const items = bundle?.items || bundle?.bundle_items || []
  const total = items.reduce((sum, item) => sum + Number(item.price || item.variant?.price || item.variant_price || 0) * Number(item.quantity || 1), 0)
  if (total > 0) {
    const discountPct = Number(bundle?.discountPercent || bundle?.bundle_discount_percent || 0)
    return Number((total - total * discountPct / 100).toFixed(2))
  }
  return Number(bundle?.price || bundle?.bundle_price || 0)
}

export default function BundleCard({ bundle }) {
  const { addToCart, removeFromCart, cartItems, updateQuantity } = useCart()
  const { settings } = useSiteSettings()

  const id = bundle._id || bundle.id
  const name = bundle.name || bundle.bundle_name
  const image = bundle.image || bundle.bundle_image_url || bundle.image_url
  const description = bundle.description || bundle.bundle_description || ''
  const discountPct = Math.round(bundle.discountPercent || bundle.bundle_discount_percent || 0)
  const items = bundle?.items || bundle?.bundle_items || []
  const slug = bundle.slug || id

  const originalTotal = items.reduce((sum, item) => sum + (item.price || item.variant?.price || 0) * item.quantity, 0) || 0
  const bundlePrice = calculateBundlePrice(bundle)
  const savings = discountPct > 0 && originalTotal > 0 ? Math.round(originalTotal - bundlePrice) : 0
  const cartItem = cartItems?.find(item => item.bundle_id === id || item.bundle?._id === id)
  const isInCart = Boolean(cartItem)
  const cartQuantity = cartItem?.quantity || 1
  const bundleFallback = generatePlaceholder('bundle', name)

  const handleQuantityChange = async (newQty) => {
    if (cartItem) {
      if (newQty < 1) await removeFromCart(cartItem.id)
      else await updateQuantity(cartItem.id, newQty)
    }
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInCart) {
      await removeFromCart(cartItem.id)
    } else {
      await addToCart({ bundle_id: id, quantity: 1, bundle: { _id: id, name, price: bundlePrice, discountPercent: discountPct, image, items, ...bundle } })
    }
  }

  return (
    <div className="group flex h-full w-full flex-col rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link to={`/combos/${slug}`} className="relative block w-full">
        {discountPct > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-[#F5A623] px-2.5 py-1 text-micro font-bold text-[#1a1a1a] font-product shadow-sm">
            {discountPct}% OFF
          </span>
        )}
        {items.length > 0 && (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-[#1a1a1a]/80 px-2.5 py-1 text-micro font-semibold text-white shadow-sm">
            {items.length} Items
          </span>
        )}

        <div className="relative w-full overflow-hidden rounded-t-xl bg-[#F0E6D3]">
          <img src={getImageUrl(image, settings?.placeholder_image)} alt={name}
            className="aspect-square w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.target.src = bundleFallback }} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <Link to={`/combos/${slug}`}>
          <h3 className="line-clamp-2 text-center font-product text-body-sm font-extrabold tracking-tighter leading-tight text-black min-h-[2.5rem]">
            {name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-baseline justify-center gap-2 min-h-[1.5rem]">
          <span className="font-product text-body font-bold text-black">{formatPrice(bundlePrice)}</span>
          {originalTotal > bundlePrice && (
            <span className="font-product text-caption font-medium text-gray-400 line-through">{formatPrice(originalTotal)}</span>
          )}
        </div>
        {savings > 0 && (
          <p className="mt-0.5 text-center font-product text-micro font-semibold text-[#F5A623]">Save {formatPrice(savings)}</p>
        )}

        <div className="mt-auto pt-2.5">
          {isInCart ? (
            <div className="flex h-9 w-full items-center justify-between overflow-hidden rounded-full border-2 border-[#222] bg-white">
              <button type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity - 1) }}
                className="flex h-full w-9 items-center justify-center text-body font-bold text-[#1a1a1a] transition hover:bg-[#FAF3E8] disabled:opacity-40 font-product"
                disabled={cartQuantity <= 1}>−</button>
              <span className="font-product text-body-sm font-semibold text-[#1a1a1a]">{cartQuantity}</span>
              <button type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity + 1) }}
                className="flex h-full w-9 items-center justify-center text-body font-bold text-[#1a1a1a] transition hover:bg-[#FAF3E8] font-product">+</button>
            </div>
          ) : (
            <button onClick={handleAddToCart}
              className="h-9 w-full rounded-full bg-[#0E9F3E] font-product text-btn font-semibold text-white transition hover:bg-[#0B8A34] active:scale-[0.98]">
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
