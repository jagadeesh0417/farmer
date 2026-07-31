import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { formatPrice, getImageProps, getImageSizes } from '../lib/utils'
import { generatePlaceholder } from '../lib/placeholders'
import { flyToCart, triggerBadgePop } from '../lib/cartAnimations'
import { showCartToast } from '../components/CartToast'

function slugify(name) {
  return (name || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export default function ProductCard({ product, priority }) {
  const { cartItems, addToCart, removeFromCart, updateQuantity, productSelections, setProductSelection, itemCount } = useCart()
  const [added, setAdded] = useState(false)
  const imgRef = useRef(null)

  const variants = product.product_variants || product.variants || []
  const hasVariants = variants.length > 1

  const pid = product.id || product._id
  const selection = productSelections?.[pid] || {}
  const selectedVariantId = selection.variantId || variants?.[0]?.id || variants?.[0]?._id
  const selectedVariant = variants.find(v => (v.id || v._id) === selectedVariantId) || variants?.[0] || null

  const price = selectedVariant?.price ?? product.base_price ?? product.price
  const mrp = selectedVariant?.original_price ?? selectedVariant?.originalPrice ?? selectedVariant?.mrp ?? product.mrp ?? price
  const savings = mrp - price
  const discountPercent = product.discount_percent || (mrp > price ? Math.round((savings / mrp) * 100) : 0)

  const cartItem = cartItems?.find(item => item.product_id === pid && item.variant_id === selectedVariantId)
  const isInCart = Boolean(cartItem)
  const cartQuantity = cartItem?.quantity || selection.quantity || 1
  const productImage = product.image_url || product.images?.[0]
  const fallbackSrc = generatePlaceholder('product', product.name)
  const imgProps = getImageProps(productImage, {
    width: 400,
    sizes: getImageSizes([1280, 768, 480]),
    priority,
  })

  useEffect(() => {
    if (selectedVariant && !selection.variantId) {
      setProductSelection(pid, { variantId: selectedVariant.id || selectedVariant._id })
    }
  }, [pid, selectedVariant?.id, selectedVariant?._id, selection.variantId, setProductSelection])

  const handleVariantChange = (variantId) => {
    setProductSelection(pid, { variantId })
  }

  const handleQuantityChange = async (newQty) => {
    if (cartItem) {
      if (newQty < 1) await removeFromCart(cartItem.id)
      else await updateQuantity(cartItem.id, newQty)
    }
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (added) return
    setAdded(true)
    try {
      await addToCart({ product_id: product.id, variant_id: selectedVariantId, quantity: 1, product, variant: selectedVariant })
      if (imgRef.current) flyToCart(imgRef.current, productImage || imgProps.src)
      if (typeof itemCount === 'number') {
        requestAnimationFrame(() => {
          const badge = document.querySelector('.cart-badge')
          if (badge) triggerBadgePop(badge)
        })
      }
      showCartToast({
        productName: product.name,
        productImage: productImage || imgProps.src,
        price: price,
        quantity: 1,
        slug: slugify(product.name),
        isUpdate: Boolean(cartItem),
      })
    } catch {
      setAdded(false)
      return
    }
    setTimeout(() => setAdded(false), 1500)
  }

  const variantLabel = (v) => v.weight_label || v.weightLabel || v.name || v.unit || 'Default'

  return (
    <div className="group flex flex-col rounded-[18px] border-2 border-[#D7E8C8] bg-gradient-to-b from-[#FCFDFB] to-[#F4F9EF] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7),0_6px_18px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-[5px] hover:border-[#4CAF50] hover:shadow-[0_12px_28px_rgba(76,175,80,0.18)] overflow-hidden border-t-[5px] border-t-[#2E7D32]
      max-sm:w-[170px] max-sm:min-w-[170px] max-sm:max-w-[170px] sm:w-full sm:h-full">
      {/* Fixed image container */}
      <Link to={`/products/${slugify(product.name)}`} className="relative block w-full flex-shrink-0 max-sm:h-[170px] sm:h-[220px] p-2.5 sm:p-3">
        {discountPercent > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-[#F5A623] px-2.5 py-1 text-micro font-bold text-[#1a1a1a] font-product shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
        <div className="w-full h-full overflow-hidden rounded-[14px] bg-white">
          <img ref={imgRef}
            src={imgProps.src}
            alt={product.name}
            loading={imgProps.loading}
            fetchPriority={imgProps.fetchpriority}
            srcSet={imgProps.srcSet}
            sizes={imgProps.sizes}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { if (e.currentTarget.dataset.fallbackApplied !== 'true') { e.currentTarget.dataset.fallbackApplied = 'true'; e.currentTarget.src = fallbackSrc } }}
          />
        </div>
      </Link>

      {/* Content — fixed sections with equal gaps */}
      <div className="flex flex-1 flex-col px-4 pb-4 max-sm:px-3 max-sm:pb-3">
        {/* Title — 2 lines fixed height */}
        <Link to={`/products/${slugify(product.name)}`} className="flex-shrink-0 flex items-start justify-center overflow-hidden max-sm:h-[44px] sm:h-[48px]">
          <h3 className="text-center font-product text-body-sm font-extrabold tracking-tighter leading-tight text-black max-sm:text-[12px] max-sm:leading-[14px] line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price — fixed height */}
        <div className="flex-shrink-0 flex items-center justify-center gap-1 max-sm:h-[32px] sm:h-[32px]">
          <span className="font-product text-body font-bold text-black max-sm:text-[13px]">{formatPrice(price)}</span>
          {mrp > price && (
            <span className="font-product text-caption font-medium text-gray-400 line-through max-sm:text-[11px]">{formatPrice(mrp)}</span>
          )}
        </div>

        {/* Variant — fixed height, always reserves space */}
        <div className="flex-shrink-0 max-sm:h-[40px] sm:h-[44px] flex items-center">
          {hasVariants ? (
            <div className="relative w-full">
              <select
                value={selectedVariantId || ''}
                onChange={(e) => handleVariantChange(e.target.value)}
                aria-label="Select variant"
                className="h-9 w-full appearance-none rounded-full border-2 border-[#222] bg-white px-3 pr-8 text-center font-product text-caption font-semibold text-[#1a1a1a] outline-none transition-colors focus:border-[#0E9F3E] max-sm:h-[36px] max-sm:text-[11px] sm:h-[38px]"
              >
                {variants.map(v => {
                  const vid = v.id || v._id
                  return (
                    <option key={vid} value={vid}>
                      {variantLabel(v)}
                    </option>
                  )
                })}
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          ) : null}
        </div>

        {/* Button — always at bottom */}
        <div className="mt-auto flex-shrink-0 max-sm:pt-1 sm:pt-1.5">
          {isInCart ? (
            <>
              <div className="flex h-10 w-full items-center justify-between overflow-hidden rounded-full border-2 border-[#222] bg-white max-sm:h-[36px] sm:h-[44px]">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity - 1) }}
                  className="flex h-full w-10 items-center justify-center text-body font-bold text-[#1a1a1a] transition hover:bg-[#FAF3E8] font-product max-sm:w-9 sm:w-11"
                  aria-label="Decrease quantity"
                >−</button>
                <span className="font-product text-body-sm font-semibold text-[#1a1a1a]">{cartQuantity}</span>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity + 1) }}
                  className="flex h-full w-10 items-center justify-center text-body font-bold text-[#1a1a1a] transition hover:bg-[#FAF3E8] font-product max-sm:w-9 sm:w-11"
                  aria-label="Increase quantity"
                >+</button>
              </div>
              <Link to="/cart" onClick={(e) => e.stopPropagation()}
                className="proceed-in mt-1.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-full bg-[#0E9F3E]/10 font-product text-caption font-bold text-[#0E9F3E] transition-colors hover:bg-[#0E9F3E] hover:text-white max-sm:h-7">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                Proceed to Cart
              </Link>
            </>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={added}
              className="h-10 w-full rounded-full font-product text-btn font-semibold text-white transition active:scale-[0.98] max-sm:h-[36px] max-sm:text-[12px] sm:h-[44px] flex items-center justify-center gap-1.5"
              style={{ background: added ? '#16a34a' : '#0E9F3E' }}
            >{added ? <><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Added</> : 'Add to Cart'}</button>
          )}
        </div>
      </div>
    </div>
  )
}
