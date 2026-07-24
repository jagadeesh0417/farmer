import { useEffect } from 'react'
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
  const fallbackSrc = generatePlaceholder('product', product.name)
  const imgProps = getImageProps(productImage, {
    width: 400,
    sizes: getImageSizes([1280, 768, 480]),
    priority,
  })

  useEffect(() => {
    if (selectedVariant && !selection.variantId) {
      setProductSelection(product.id, { variantId: selectedVariant.id || selectedVariant._id })
    }
  }, [product.id, selectedVariant?.id, selectedVariant?._id, selection.variantId, setProductSelection])

  const handleVariantChange = (variantId) => {
    setProductSelection(product.id, { variantId })
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
    <div className="group flex h-full w-full flex-col rounded-2xl bg-[#FAF3E8] p-4">
      <Link to={`/products/${slugify(product.name)}`} className="relative block">
        {discountPercent > 0 && (
          <span className="absolute left-1 top-1 z-10 rounded-full bg-[#F5A623] px-2.5 py-1 text-micro font-bold text-[#1a1a1a] font-product shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        <div className="relative mx-auto flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-[#F0E6D3] p-4">
          <img
            src={imgProps.src}
            alt={product.name}
            loading={imgProps.loading}
            fetchPriority={imgProps.fetchpriority}
            srcSet={imgProps.srcSet}
            sizes={imgProps.sizes}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { if (e.currentTarget.dataset.fallbackApplied !== 'true') { e.currentTarget.dataset.fallbackApplied = 'true'; e.currentTarget.src = fallbackSrc } }}
          />
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <Link to={`/products/${slugify(product.name)}`}>
          <h3 className="line-clamp-2 text-center font-product text-body-sm font-semibold leading-tight text-[#1a1a1a]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline justify-center gap-2">
          <span className="font-product text-body font-bold text-[#1a1a1a]">{formatPrice(price)}</span>
          {mrp > price && (
            <span className="font-product text-caption font-medium text-gray-400 line-through">{formatPrice(mrp)}</span>
          )}
        </div>

        {hasVariants && (
          <div className="relative mt-3">
            <select
              value={selectedVariantId || ''}
              onChange={(e) => handleVariantChange(e.target.value)}
              aria-label="Select variant"
              className="h-10 w-full appearance-none rounded-full border-2 border-[#222] bg-white px-4 pr-10 text-center font-product text-caption font-semibold text-[#1a1a1a] outline-none transition-colors focus:border-[#0E9F3E]"
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
            <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}

        <div className="mt-auto pt-3">
          {isInCart ? (
            <div className="flex h-10 w-full items-center justify-between overflow-hidden rounded-full border-2 border-[#222] bg-white">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity - 1) }}
                className="flex h-full w-10 items-center justify-center text-body font-bold text-[#1a1a1a] transition hover:bg-[#FAF3E8] disabled:opacity-40 font-product"
                disabled={cartQuantity <= 1}
              >
                −
              </button>
              <span className="font-product text-body-sm font-semibold text-[#1a1a1a]">{cartQuantity}</span>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity + 1) }}
                className="flex h-full w-10 items-center justify-center text-body font-bold text-[#1a1a1a] transition hover:bg-[#FAF3E8] font-product"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="h-10 w-full rounded-full bg-[#0E9F3E] font-product text-btn font-semibold text-white transition hover:bg-[#0B8A34] active:scale-[0.98]"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
