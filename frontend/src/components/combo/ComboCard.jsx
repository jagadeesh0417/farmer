import { useState, useRef, memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { formatPrice, getImageUrl } from '../../lib/utils'
import { generatePlaceholder } from '../../lib/placeholders'
import { flyToCart } from '../../lib/cartAnimations'
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

function getStockStatus(bundle, items) {
  if (bundle?.stock !== undefined && bundle?.stock !== null) {
    const s = Number(bundle.stock)
    if (s <= 0) return { label: 'Out of Stock', tone: 'text-[#E02B2B]', out: true }
    if (s <= 5) return { label: 'Limited Stock', tone: 'text-[#B89239]', out: false }
    return { label: 'In Stock', tone: 'text-[#2E7D32]', out: false }
  }
  const levels = items.map(i => Number(i.stock ?? i.stock_quantity ?? i.variant?.stock))
  const defined = levels.filter(v => !Number.isNaN(v))
  if (defined.length === 0) return { label: 'In Stock', tone: 'text-[#2E7D32]', out: false }
  const min = Math.min(...defined)
  if (min <= 0) return { label: 'Out of Stock', tone: 'text-[#E02B2B]', out: true }
  if (min <= 5) return { label: 'Limited Stock', tone: 'text-[#B89239]', out: false }
  return { label: 'In Stock', tone: 'text-[#2E7D32]', out: false }
}

function ComboCard({ bundle, priority }) {
  const { addToCart, cartItems, updateQuantity, openCartDrawer } = useCart()
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
  const stock = getStockStatus(bundle, items)

  const cartItem = cartItems?.find(item => item.bundle_id === id || item.bundle?._id === id)
  const isInCart = Boolean(cartItem)
  const cartQuantity = cartItem?.quantity || 1

  const bundleFallback = generatePlaceholder('bundle', name)
  const includedNames = items.slice(0, 3).map(i => i.name || i.variant?.name || '').filter(Boolean).join(', ')
  const isSuperSaver = bundle.comboType === 'super_saver' || bundle.isSuperSaver

  const handleAddToCart = useCallback(async (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (adding) return
    setAdding(true)
    try {
      await addToCart({
        bundle_id: id,
        quantity: 1,
        bundle: { _id: id, name, price: bundlePrice, discountPercent: discountPct, image, items, ...bundle }
      })
      if (imgRef.current) flyToCart(imgRef.current, getImageUrl(image))
    } catch { }
    setTimeout(() => setAdding(false), 600)
  }, [id, name, bundlePrice, discountPct, image, items, bundle, adding, addToCart])

  const handleQuantityChange = useCallback(async (newQty) => {
    if (cartItem) {
      if (newQty < 1) await updateQuantity(cartItem.id, 0)
      else await updateQuantity(cartItem.id, newQty)
    }
  }, [cartItem, updateQuantity])

  const handleViewDetails = useCallback(() => setModalOpen(true), [])
  const handleCloseModal = useCallback(() => setModalOpen(false), [])

  return (
    <>
      <div className="group flex h-full flex-col rounded-[20px] border border-[#E5EDD8] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_18px_36px_rgba(0,0,0,0.10)] hover:border-green-300 overflow-hidden">
        {/* Image — large, ~65% of card */}
        <Link to={`/combos/${slug}`} className="relative block shrink-0 overflow-hidden bg-white">
          <div className="aspect-[4/3] w-full flex items-center justify-center p-4 sm:p-5">
            <img ref={imgRef} src={getImageUrl(image)} alt={name}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
              loading={priority ? 'eager' : 'lazy'}
              fetchpriority={priority ? 'high' : undefined}
              onError={(e) => { e.target.src = bundleFallback }} />
          </div>

          {/* Discount badge — green */}
          {discountPct > 0 && (
            <span className="absolute top-3 left-3 rounded-full bg-green-600 px-2.5 py-1 text-micro font-bold text-white shadow-sm">
              {discountPct}% OFF
            </span>
          )}
          {isSuperSaver && (
            <span className="absolute top-3 right-3 rounded-full bg-[#B89239] px-2.5 py-1 text-micro font-bold text-white shadow-sm">
              Super Saver
            </span>
          )}

          {/* Out of stock overlay */}
          {stock.out && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
              <span className="rounded-full bg-[#E02B2B] px-3 py-1.5 text-micro font-bold text-white shadow">Out of Stock</span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-1.5 p-3.5 sm:p-4">
          {/* Name — max 2 lines */}
          <Link to={`/combos/${slug}`} className="block">
            <h3 className="font-product text-[15px] font-bold leading-snug text-[#1a1a1a] line-clamp-2 transition-colors group-hover:text-[#0E9F3E]">{name}</h3>
          </Link>

          {/* Description — max 2 lines */}
          {description && (
            <p className="text-caption text-muted leading-snug line-clamp-2">{description}</p>
          )}

          {/* Included items strip */}
          {includedNames && (
            <p className="truncate text-[11px] font-medium text-[#8B9E7A]">
              <span className="font-semibold text-[#5f7563]">Includes:</span> {includedNames}
              {items.length > 3 ? ` +${items.length - 3} more` : ''}
            </p>
          )}

          {/* Price row — aligned identically across cards */}
          <div className="mt-1 flex min-h-[24px] flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-product text-[17px] font-bold leading-none text-[#1a1a1a]">{formatPrice(bundlePrice)}</span>
            {originalTotal > bundlePrice && (
              <span className="text-body-sm text-[#B0B0B0] line-through leading-none">{formatPrice(originalTotal)}</span>
            )}
            {savings > 0 && (
              <span className="rounded-full bg-green-600/10 px-2 py-0.5 text-[11px] font-bold text-green-700 leading-none">Save {formatPrice(savings)}</span>
            )}
          </div>

          {/* Stock status */}
          <p className={`text-[11px] font-semibold leading-none ${stock.tone}`}>
            {stock.label}
          </p>

          {/* CTA — same height for every card */}
          <div className="mt-auto pt-2">
            {isInCart ? (
              <div className="stepper-enter flex flex-col gap-1.5">
                <div className="flex h-10 w-full items-center justify-between overflow-hidden rounded-full border-2 border-[#222] bg-white">
                  <button type="button" onClick={() => handleQuantityChange(cartQuantity - 1)}
                    className="flex h-full w-10 items-center justify-center text-body font-bold text-[#1a1a1a] transition hover:bg-[#FAF3E8] active:scale-90"
                    aria-label="Decrease quantity">−</button>
                  <span key={cartQuantity} className="qty-pop font-product min-w-[2rem] text-center text-body-sm font-semibold text-[#1a1a1a]">{cartQuantity}</span>
                  <button type="button" onClick={() => handleQuantityChange(cartQuantity + 1)}
                    className="flex h-full w-10 items-center justify-center text-body font-bold text-[#1a1a1a] transition hover:bg-[#FAF3E8] active:scale-90"
                    aria-label="Increase quantity">+</button>
                </div>
                <button type="button" onClick={openCartDrawer}
                  className="proceed-in flex h-8 w-full items-center justify-center gap-1.5 rounded-full bg-green-600/10 font-product text-caption font-bold text-green-700 transition-colors hover:bg-green-600 hover:text-white">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  Proceed to Cart
                </button>
              </div>
            ) : (
              <button type="button" onClick={handleAddToCart} disabled={adding || stock.out}
                className="ripple-btn flex h-10 w-full items-center justify-center gap-2 rounded-full bg-green-600 font-product text-body-sm font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0">
                {adding ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" /></svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                )}
                {adding ? 'Adding...' : stock.out ? 'Out of Stock' : 'Add to Cart'}
              </button>
            )}
            <button type="button" onClick={handleViewDetails}
              className="mt-1.5 flex h-7 w-full items-center justify-center gap-1 text-caption font-semibold text-[#2E7D32] transition-colors hover:text-[#1B5E20] hover:underline underline-offset-2">
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
