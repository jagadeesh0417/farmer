import { useState, useRef, memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { formatPrice, getImageUrl } from '../../lib/utils'
import { generatePlaceholder } from '../../lib/placeholders'
import { flyToCart, triggerBadgePop } from '../../lib/cartAnimations'
import ComboBadge from './ComboBadge'
import ComboProductPreview from './ComboProductPreview'
import ComboBenefits from './ComboBenefits'
import ComboDetailsModal from './ComboDetailsModal'

function calculateBundlePrice(bundle) {
  const items = bundle?.items || bundle?.bundle_items || []
  const total = items.reduce((sum, item) => sum + Number(item.price || item.variant?.price || item.variant_price || 0) * Number(item.quantity || 1), 0)
  if (total > 0) {
    const discountPct = Number(bundle?.discountPercent || bundle?.bundle_discount_percent || 0)
    return Number((total - total * discountPct / 100).toFixed(2))
  }
  return Number(bundle?.price || bundle?.bundle_price || 0)
}

function ComboCard({ bundle, priority }) {
  const { addToCart, removeFromCart, cartItems, updateQuantity, itemCount } = useCart()
  const [modalOpen, setModalOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const imgRef = useRef(null)

  const id = bundle._id || bundle.id
  const name = bundle.name || bundle.bundle_name
  const image = bundle.image || bundle.bundle_image_url || bundle.image_url
  const discountPct = Math.round(bundle.discountPercent || bundle.bundle_discount_percent || 0)
  const items = bundle?.items || bundle?.bundle_items || []
  const slug = bundle.slug || id
  const description = (bundle.description || bundle.bundle_description || '').split('[CONTAINS]')[0].trim()

  const originalTotal = items.reduce((sum, item) => sum + (item.price || item.variant?.price || 0) * (item.quantity || 1), 0) || 0
  const bundlePrice = calculateBundlePrice(bundle)
  const savings = discountPct > 0 && originalTotal > 0 ? Math.round(originalTotal - bundlePrice) : 0
  const cartItem = cartItems?.find(item => item.bundle_id === id || item.bundle?._id === id)
  const isInCart = Boolean(cartItem)
  const cartQuantity = cartItem?.quantity || 1

  const bundleFallback = generatePlaceholder('bundle', name)

  const handleAddToCart = useCallback(async (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (adding) return
    setAdding(true)
    try {
      if (isInCart) {
        await removeFromCart(cartItem.id)
      } else {
        await addToCart({
          bundle_id: id,
          quantity: 1,
          bundle: { _id: id, name, price: bundlePrice, discountPercent: discountPct, image, items, ...bundle }
        })
        if (imgRef.current) flyToCart(imgRef.current, getImageUrl(image))
        if (typeof itemCount === 'number') {
          requestAnimationFrame(() => {
            const badge = document.querySelector('.cart-badge')
            if (badge) triggerBadgePop(badge)
          })
        }
      }
    } catch { }
    setTimeout(() => setAdding(false), 800)
  }, [id, name, bundlePrice, discountPct, image, items, bundle, isInCart, cartItem, addToCart, removeFromCart, itemCount])

  const handleQuantityChange = useCallback(async (newQty) => {
    if (cartItem) {
      if (newQty < 1) await removeFromCart(cartItem.id)
      else await updateQuantity(cartItem.id, newQty)
    }
  }, [cartItem, removeFromCart, updateQuantity])

  const handleViewDetails = useCallback(() => setModalOpen(true), [])
  const handleCloseModal = useCallback(() => setModalOpen(false), [])

  return (
    <>
      <div className="group flex flex-col rounded-[20px] border border-[#D7E8C8] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_16px_32px_rgba(46,125,50,0.12)] hover:border-[#4CAF50] overflow-hidden
        max-sm:w-full sm:w-full">
        {/* Image Section */}
        <Link to={`/combos/${slug}`} className="relative block w-full aspect-[16/9] overflow-hidden bg-[#F4F9EF]">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
            <ComboBadge discountPct={discountPct} itemCount={items.length} />
          </div>

          {/* Image */}
          <img ref={imgRef} src={getImageUrl(image)} alt={name}
            className="w-full h-full object-contain p-4 sm:p-6 transition-transform duration-500 group-hover:scale-105"
            loading={priority ? 'eager' : 'lazy'}
            fetchpriority={priority ? 'high' : undefined}
            onError={(e) => { e.target.src = bundleFallback }} />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 sm:p-5 gap-3">
          {/* Name */}
          <Link to={`/combos/${slug}`} className="group/link">
            <h3 className="font-heading text-h3 sm:text-h2 font-bold text-[#1a1a1a] leading-tight group-hover/link:text-[#2E7D32] transition-colors">
              {name}
            </h3>
          </Link>

          {/* Description */}
          {description && (
            <p className="text-body-sm text-[#8B9E7A] leading-relaxed line-clamp-2">{description}</p>
          )}

          {/* Price Section */}
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-heading text-h2 font-bold text-[#2E7D32]">{formatPrice(bundlePrice)}</span>
            {originalTotal > bundlePrice && (
              <span className="text-body-sm text-[#B0B0B0] line-through">{formatPrice(originalTotal)}</span>
            )}
            {savings > 0 && (
              <span className="text-caption font-bold text-[#F5A623]">Save {formatPrice(savings)}</span>
            )}
          </div>
          {discountPct > 0 && (
            <span className="inline-flex self-start rounded-full bg-[#E8F5E9] px-2.5 py-0.5 text-micro font-bold text-[#2E7D32]">
              You save {discountPct}%
            </span>
          )}

          {/* Divider */}
          <div className="border-t border-[#E5EDD8]" />

          {/* What's Included */}
          <ComboProductPreview items={items} maxDisplay={4} onViewDetails={handleViewDetails} />

          {/* Benefits */}
          <ComboBenefits savings={savings} />

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-auto pt-1">
            {isInCart ? (
              <div className="flex items-center justify-between rounded-full border-2 border-[#222] bg-white overflow-hidden h-11 sm:h-12">
                <button onClick={() => handleQuantityChange(cartQuantity - 1)}
                  className="flex h-full w-11 sm:w-12 items-center justify-center text-body font-bold text-[#1a1a1a] hover:bg-[#FAF3E8] transition-colors"
                  disabled={cartQuantity <= 1}
                  aria-label="Decrease quantity">−</button>
                <span className="font-product text-body-sm font-semibold text-[#1a1a1a] min-w-[2rem] text-center">{cartQuantity}</span>
                <button onClick={() => handleQuantityChange(cartQuantity + 1)}
                  className="flex h-full w-11 sm:w-12 items-center justify-center text-body font-bold text-[#1a1a1a] hover:bg-[#FAF3E8] transition-colors"
                  aria-label="Increase quantity">+</button>
              </div>
            ) : (
              <button onClick={handleAddToCart} disabled={adding}
                className="w-full h-11 sm:h-12 rounded-full bg-[#2E7D32] text-body-sm font-bold text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
                {adding ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" /></svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                )}
                {adding ? 'Adding...' : 'Add Combo to Cart'}
              </button>
            )}
            <button onClick={handleViewDetails}
              className="w-full h-10 rounded-full border-2 border-[#D7E8C8] bg-white text-caption font-bold text-[#2E7D32] hover:bg-[#F4F9EF] hover:border-[#4CAF50] transition-all active:scale-[0.98] flex items-center justify-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && <ComboDetailsModal bundle={bundle} onClose={handleCloseModal} />}
    </>
  )
}

export default memo(ComboCard)
