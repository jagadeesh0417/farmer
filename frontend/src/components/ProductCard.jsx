import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { formatPrice, getImageUrl, getImageProps, getImageSizes } from '../lib/utils'
import { generatePlaceholder } from '../lib/placeholders'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

function slugify(name) {
  return (name || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export default function ProductCard({ product, priority }) {
  const { cartItems, addToCart, removeFromCart, updateQuantity, productSelections, setProductSelection } = useCart()
  const { settings } = useSiteSettings()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const variants = product.product_variants || product.variants || []
  const hasVariants = variants.length > 1

  const selection = productSelections?.[product.id] || {}
  const selectedVariantId = selection.variantId || variants?.[0]?.id || variants?.[0]?._id
  const selectedVariant = variants.find(v => (v.id || v._id) === selectedVariantId) || variants?.[0] || null

  const price = selectedVariant?.price ?? product.base_price ?? product.price
  const mrp = selectedVariant?.original_price ?? selectedVariant?.originalPrice ?? selectedVariant?.mrp ?? product.mrp ?? price
  const savings = mrp - price
  const discountPercent = product.discount_percent || (mrp > price ? Math.round((savings / mrp) * 100) : 0)

  const cartItem = cartItems?.find(item => item.product_id === product.id && item.variant_id === selectedVariantId)
  const isInCart = Boolean(cartItem)
  const cartQuantity = cartItem?.quantity || selection.quantity || 1
  const productImage = product.image_url || product.images?.[0]
  const imageUrl = getImageUrl(productImage, settings?.placeholder_image)
  const fallbackSrc = generatePlaceholder('product', product.name)
  const imgProps = getImageProps(productImage, {
    width: 600,
    sizes: getImageSizes([1280, 768, 480]),
    priority,
  })

  const rating = product.rating ?? 0
  const reviewCount = product.reviewCount ?? 0
  const isBestSeller = product.isBestSeller || product.is_best_seller || product.totalSold > 50 || false

  useEffect(() => {
    if (selectedVariant && !selection.variantId) {
      setProductSelection(product.id, { variantId: selectedVariant.id || selectedVariant._id })
    }
  }, [product.id, selectedVariant?.id, selectedVariant?._id, selection.variantId, setProductSelection])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleVariantChange = (variantId) => {
    setProductSelection(product.id, { variantId })
    setDropdownOpen(false)
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
    await addToCart({ product_id: product.id, variant_id: selectedVariantId, quantity: 1, product, variant: selectedVariant })
  }

  const variantLabel = (v) => v.weight_label || v.weightLabel || v.name || v.unit || 'Default'

  return (
    <div className="group mx-auto w-full max-w-[360px] rounded-[20px] bg-[#FAF3E8] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-1">
      <Link to={`/products/${slugify(product.name)}`} className="relative block">
        {discountPercent > 0 && (
          <span className="absolute left-0 top-0 z-10 rounded-full bg-[#FFC107] px-3 py-1 text-[16px] font-bold text-[#111]">
            {discountPercent}% OFF
          </span>
        )}
        {isBestSeller && (
          <span className="absolute right-0 top-0 z-10 rounded-full bg-[#0E9F3E] px-3 py-1 text-[12px] font-bold text-white">
            Best Seller
          </span>
        )}

        <div className="relative flex h-[320px] w-[320px] max-w-full items-center justify-center overflow-hidden rounded-[20px] bg-[#FAF3E8] mx-auto">
          <img
            src={imgProps.src}
            alt={product.name}
            loading={imgProps.loading}
            fetchPriority={imgProps.fetchpriority}
            srcSet={imgProps.srcSet}
            sizes={imgProps.sizes}
            className="h-[260px] w-[260px] object-contain transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { if (e.currentTarget.dataset.fallbackApplied !== 'true') { e.currentTarget.dataset.fallbackApplied = 'true'; e.currentTarget.src = fallbackSrc } }}
          />
        </div>
      </Link>

      <div className="mt-[18px]">
        <Link to={`/products/${slugify(product.name)}`}>
          <h3 className="line-clamp-2 min-h-[2.6em] font-[Poppins] text-[26px] font-semibold leading-[1.3] text-[#111]">
            {product.name}
          </h3>
        </Link>

        {rating > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`text-[14px] leading-none ${s <= Math.round(rating) ? 'text-amber-500' : 'text-gray-300'}`}>★</span>
              ))}
            </div>
            <span className="font-[Poppins] text-[12px] text-gray-500">({reviewCount})</span>
          </div>
        )}

        <div className="mt-[14px] flex items-baseline gap-3">
          <span className="font-[Poppins] text-[32px] font-bold text-black">{formatPrice(price)}</span>
          {mrp > price && (
            <span className="font-[Poppins] text-[24px] font-medium text-gray-500 line-through">{formatPrice(mrp)}</span>
          )}
        </div>

        {hasVariants && (
          <div className="relative mt-[18px]" ref={dropdownRef}>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDropdownOpen(!dropdownOpen) }}
              className="flex h-[56px] w-full items-center justify-between rounded-full border-2 border-[#222] bg-white px-5 font-[Poppins] text-[22px] font-medium text-[#111]"
            >
              <span className="truncate">{variantLabel(selectedVariant)}</span>
              <svg className="h-6 w-6 shrink-0 text-[#222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-3xl border-2 border-[#222] bg-white shadow-lg">
                {variants.map(v => {
                  const vid = v.id || v._id
                  return (
                    <button
                      key={vid}
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVariantChange(vid) }}
                      className="flex h-[50px] w-full items-center px-5 font-[Poppins] text-[18px] font-medium text-[#111] hover:bg-[#FAF3E8]"
                    >
                      {variantLabel(v)}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-[18px]">
          {isInCart ? (
            <div className="flex h-[62px] w-full items-center justify-between overflow-hidden rounded-full border-2 border-[#222] bg-white px-2">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity - 1) }}
                className="flex h-12 w-12 items-center justify-center rounded-full text-[24px] font-semibold text-[#111] transition hover:bg-[#FAF3E8] disabled:opacity-50"
                disabled={cartQuantity <= 1}
              >
                −
              </button>
              <span className="font-[Poppins] text-[22px] font-semibold text-[#111]">{cartQuantity}</span>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity + 1) }}
                className="flex h-12 w-12 items-center justify-center rounded-full text-[24px] font-semibold text-[#111] transition hover:bg-[#FAF3E8]"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="h-[62px] w-full rounded-full bg-[#0E9F3E] font-[Poppins] text-[28px] font-semibold text-white transition hover:bg-[#0B8A34] active:scale-[0.98]"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
