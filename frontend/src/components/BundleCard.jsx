import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { formatPrice, getImageUrl } from '../lib/utils'
import { generatePlaceholder } from '../lib/placeholders'

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

  const id = bundle._id || bundle.id
  const name = bundle.name || bundle.bundle_name
  const image = bundle.image || bundle.bundle_image_url || bundle.image_url
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
    <div className="group flex flex-col rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden
      max-sm:w-[170px] max-sm:min-w-[170px] max-sm:max-w-[170px] max-sm:h-[340px] max-sm:min-h-[340px] max-sm:max-h-[340px]
      sm:h-full sm:w-full">
      {/* Image */}
      <Link to={`/combos/${slug}`} className="relative block w-full flex-shrink-0 max-sm:h-[170px] sm:aspect-square sm:w-full">
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
        <div className="relative w-full h-full overflow-hidden rounded-t-xl bg-[#F0E6D3]">
          <img src={getImageUrl(image)} alt={name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.target.src = bundleFallback }} />
        </div>
      </Link>

      {/* Content area */}
      <div className="flex flex-1 flex-col overflow-hidden max-sm:px-2 max-sm:pb-2 sm:px-2.5 sm:pb-2.5 sm:pt-2">
        {/* Title */}
        <Link to={`/combos/${slug}`} className="flex-shrink-0 max-sm:h-[32px] sm:h-8 flex items-center justify-center overflow-hidden">
          <h3 className="truncate text-center font-product text-body-sm font-extrabold tracking-tighter leading-tight text-black
            max-sm:text-[12px]">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex-shrink-0 flex items-center justify-center gap-1
          max-sm:h-[36px] sm:min-h-[1.5rem] sm:mt-1">
          <span className="font-product text-body font-bold text-black max-sm:text-[13px]">{formatPrice(bundlePrice)}</span>
          {originalTotal > bundlePrice && (
            <span className="font-product text-caption font-medium text-gray-400 line-through max-sm:text-[11px]">{formatPrice(originalTotal)}</span>
          )}
        </div>
        {savings > 0 && (
          <p className="flex-shrink-0 text-center font-product text-micro font-semibold text-[#F5A623] max-sm:text-[10px] max-sm:leading-[12px]">Save {formatPrice(savings)}</p>
        )}

        {/* Button */}
        <div className="max-sm:mt-2 sm:mt-auto flex-shrink-0">
          {isInCart ? (
            <div className="flex h-9 w-full items-center justify-between overflow-hidden rounded-full border-2 border-[#222] bg-white max-sm:h-[36px]">
              <button type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity - 1) }}
                className="flex h-full w-9 items-center justify-center text-body font-bold text-[#1a1a1a] transition hover:bg-[#FAF3E8] disabled:opacity-40 font-product max-sm:w-8"
                disabled={cartQuantity <= 1}>−</button>
              <span className="font-product text-body-sm font-semibold text-[#1a1a1a]">{cartQuantity}</span>
              <button type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity + 1) }}
                className="flex h-full w-9 items-center justify-center text-body font-bold text-[#1a1a1a] transition hover:bg-[#FAF3E8] font-product max-sm:w-8">+</button>
            </div>
          ) : (
            <button onClick={handleAddToCart}
              className="h-9 w-full rounded-full bg-[#0E9F3E] font-product text-btn font-semibold text-white transition hover:bg-[#0B8A34] active:scale-[0.98] max-sm:h-[36px] max-sm:text-[12px]">
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
