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
  const imgRef = useRef(null)
  const busyRef = useRef(false)
  const [pendingAdd, setPendingAdd] = useState(false)
  const [pendingQty, setPendingQty] = useState(false)

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

  const hasNoVariants = variants.length === 0
  const cartItem = cartItems?.find(item => {
    const itemPid = item.product_id ?? item.product?._id ?? item.product?.id ?? null
    const matchesProduct = String(itemPid) === String(pid)
    if (!matchesProduct) return false
    if (hasNoVariants) return true
    const itemVid = item.variant_id ?? item.variant?._id ?? null
    return String(itemVid) === String(selectedVariantId)
  })
  const quantity = cartItem?.quantity || 0
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

  const changeQuantity = async (newQty) => {
    if (busyRef.current || !cartItem) return
    busyRef.current = true
    setPendingQty(true)
    try {
      if (newQty < 1) await removeFromCart(cartItem.id)
      else await updateQuantity(cartItem.id, newQty)
    } catch {
      /* state falls back to server/local storage */
    } finally {
      busyRef.current = false
      setPendingQty(false)
    }
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (busyRef.current || quantity > 0) return
    busyRef.current = true
    setPendingAdd(true)
    try {
      await addToCart({ product_id: pid, variant_id: selectedVariantId, quantity: 1, product, variant: selectedVariant })
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
        isUpdate: false,
      })
    } catch {
      /* keep Add to Cart state */
    } finally {
      busyRef.current = false
      setPendingAdd(false)
    }
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
          {quantity === 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={pendingAdd}
              className="ripple-btn flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-[#0E9F3E] font-product text-btn font-semibold text-white transition active:scale-[0.98] disabled:opacity-80 max-sm:h-[36px] max-sm:text-[12px] sm:h-[44px]"
            >
              {pendingAdd ? (
                <>
                  <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Adding...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M9 20a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
          ) : (
            <div className="stepper-enter flex h-10 w-full items-center justify-between overflow-hidden rounded-full border-2 border-[#0E9F3E] bg-white transition-all max-sm:h-[36px] sm:h-[44px]">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); changeQuantity(quantity - 1) }}
                disabled={pendingQty}
                aria-label="Decrease quantity"
                className="flex h-full w-10 shrink-0 items-center justify-center text-body font-bold text-[#0E9F3E] transition hover:bg-[#E8F5E9] active:scale-90 disabled:opacity-60 font-product max-sm:w-9 sm:w-11"
              >−</button>
              <span key={quantity} className="qty-pop min-w-[1.5rem] text-center font-product text-body-sm font-semibold text-[#1a1a1a]">
                {pendingQty ? (
                  <span className="mx-auto block h-4 w-4 animate-spin rounded-full border-2 border-[#D7E8C8] border-t-[#0E9F3E]" />
                ) : quantity}
              </span>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); changeQuantity(quantity + 1) }}
                disabled={pendingQty}
                aria-label="Increase quantity"
                className="flex h-full w-10 shrink-0 items-center justify-center bg-[#0E9F3E] font-product text-body font-bold text-white transition hover:bg-[#0B8A34] active:scale-90 disabled:opacity-60 max-sm:w-9 sm:w-11"
              >+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
