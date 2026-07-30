import { memo, useEffect, useRef } from 'react'
import { getImageUrl, formatPrice } from '../../lib/utils'
import { generatePlaceholder } from '../../lib/placeholders'
import ComboPriceBreakdown from './ComboPriceBreakdown'
import { NutritionBadge } from './ComboBadge'

function ComboDetailsModal({ bundle, onClose }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  const name = bundle.name || bundle.bundle_name
  const image = bundle.image || bundle.bundle_image_url || bundle.image_url
  const description = bundle.description || bundle.bundle_description || ''
  const items = bundle.items || bundle.bundle_items || []
  const discountPct = Math.round(bundle.discountPercent || bundle.bundle_discount_percent || 0)
  const originalTotal = items.reduce((sum, item) => sum + (item.price || item.variant?.price || 0) * (item.quantity || 1), 0)
  const bundlePrice = discountPct > 0 && originalTotal > 0
    ? Number((originalTotal - originalTotal * discountPct / 100).toFixed(2))
    : Number(bundle.price || bundle.bundle_price || originalTotal)

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div ref={overlayRef} onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog" aria-modal="true" aria-label={name}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-fadeIn">
        {/* Close button */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md text-[#1a1a1a] hover:bg-white transition-all"
          aria-label="Close modal">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <div className="relative w-full aspect-[16/9] bg-[#F4F9EF] overflow-hidden">
          <img src={getImageUrl(image)} alt={name}
            className="w-full h-full object-contain p-4 sm:p-6"
            onError={(e) => { e.target.src = generatePlaceholder('bundle', name) }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Name + Description */}
          <div>
            <h2 className="font-heading text-h2 font-bold text-[#1a1a1a]">{name}</h2>
            {description && (
              <p className="text-body-sm text-[#8B9E7A] mt-1.5 line-clamp-2">{description.split('[CONTAINS]')[0].trim()}</p>
            )}
          </div>

          {/* Full product list */}
          <div>
            <h3 className="text-caption font-bold text-[#8B9E7A] uppercase tracking-wider mb-3">
              Products in this Combo ({items.length})
            </h3>
            <div className="space-y-2">
              {items.map((item, i) => {
                const productName = item.product?.name || item.name || item.variantName || `Product ${i + 1}`
                const itemImage = item.image || item.product?.images?.[0] || item.product?.image_url
                const weight = item.variantWeight || item.variantName || item.variant?.weightLabel || ''
                const itemPrice = item.price || item.variant?.price || 0
                return (
                  <div key={item._id || i}
                    className="flex items-center gap-3 rounded-xl bg-[#F8FAF5] border border-[#E5EDD8] p-3">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden shrink-0 bg-white border border-[#D7E8C8]">
                      <img src={getImageUrl(itemImage)} alt={productName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { e.target.src = generatePlaceholder('product', productName) }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-semibold text-[#1a1a1a] truncate">{productName}</p>
                      <p className="text-caption text-[#8B9E7A]">
                        {weight && <span>{weight}</span>}
                        {itemPrice > 0 && <span>{weight ? ' · ' : ''}{formatPrice(itemPrice)}</span>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-caption font-semibold text-[#1a1a1a]">Qty {item.quantity || 1}</p>
                      {itemPrice > 0 && (
                        <p className="text-caption text-[#8B9E7A]">{formatPrice(itemPrice * (item.quantity || 1))}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Nutrition badges */}
          <div className="flex flex-wrap gap-1.5">
            <NutritionBadge label="High Protein" icon="💪" />
            <NutritionBadge label="Rich Fiber" icon="🌾" />
            <NutritionBadge label="Natural" icon="🌿" />
            <NutritionBadge label="Chemical Free" icon="✅" />
            <NutritionBadge label="Organic" icon="🌱" />
          </div>

          {/* Price breakdown */}
          <ComboPriceBreakdown originalTotal={originalTotal} bundlePrice={bundlePrice} discountPct={discountPct} />
        </div>
      </div>
    </div>
  )
}

export default memo(ComboDetailsModal)
