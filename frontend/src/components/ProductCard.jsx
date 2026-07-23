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
    <div className="group mx-auto w-full max-w-[360px] rounded-[20px] bg-[#FAF3E8] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-1">
      <Link to={`/products/${slugify(product.name)}`} className="relative block">
        {discountPercent > 0 && (
          <span className="absolute left-0 top-0 z-10 rounded-full bg-[#FFC107] px-3 py-1 text-caption font-bold text-[#111] font-product">
            {discountPercent}% OFF
          </span>
        )}
        {isBestSeller && (
          <span className="absolute right-0 top-0 z-10 rounded-full bg-[#0E9F3E] px-3 py-1 text-micro font-bold text-white font-product">
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
          <h3 className="line-clamp-2 min-h-[2.6em] font-product text-product-name font-semibold leading-[1.3] text-[#111]">
            {product.name}
          </h3>
        </Link>

        {rating > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`text-body-sm leading-none ${s <= Math.round(rating) ? 'text-amber-500' : 'text-gray-300'}`}>★</span>
              ))}
            </div>
            <span className="font-product text-caption text-gray-500">({reviewCount})</span>
          </div>
        )}

        <div className="mt-[14px] flex items-baseline gap-3">
          <span className="font-product text-price-lg font-bold text-black">{formatPrice(price)}</span>
          {mrp > price && (
            <span className="font-product text-price font-medium text-gray-500 line-through">{formatPrice(mrp)}</span>
          )}
        </div>

        {hasVariants && (
          <div className="mt-[18px] flex flex-wrap gap-2">
            {variants.map(v => {
              const vid = v.id || v._id
              const isSelected = vid === selectedVariantId
              return (
                <button
                  key={vid}
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVariantChange(vid) }}
                  className={`px-4 py-2 rounded-full text-btn font-semibold border-2 transition-all font-product ${
                    isSelected
                      ? 'bg-[#0E9F3E] border-[#0E9F3E] text-white'
                      : 'bg-white border-[#222] text-[#111] hover:border-[#0E9F3E] hover:text-[#0E9F3E]'
                  }`}
                >
                  {variantLabel(v)}
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-[18px]">
          {isInCart ? (
            <div className="flex h-[56px] w-full items-center justify-between overflow-hidden rounded-full border-2 border-[#222] bg-white px-2">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity - 1) }}
                className="flex h-11 w-11 items-center justify-center rounded-full text-body-lg font-semibold text-[#111] transition hover:bg-[#FAF3E8] disabled:opacity-50 font-product"
                disabled={cartQuantity <= 1}
              >
                −
              </button>
              <span className="font-product text-body font-semibold text-[#111]">{cartQuantity}</span>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity + 1) }}
                className="flex h-11 w-11 items-center justify-center rounded-full text-body-lg font-semibold text-[#111] transition hover:bg-[#FAF3E8] font-product"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="h-[56px] w-full rounded-full bg-[#0E9F3E] font-product text-btn font-semibold text-white transition hover:bg-[#0B8A34] active:scale-[0.98]"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
