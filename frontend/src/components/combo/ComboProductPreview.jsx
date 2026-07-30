import { memo } from 'react'
import { getImageUrl } from '../../lib/utils'
import { generatePlaceholder } from '../../lib/placeholders'

function ComboProductPreview({ items = [], maxDisplay = 4, onViewDetails }) {
  if (!items.length) return null

  const displayItems = items.slice(0, maxDisplay)
  const remaining = items.length - maxDisplay

  return (
    <div className="space-y-2">
      <h4 className="text-caption font-bold text-[#8B9E7A] uppercase tracking-wider">What's Included</h4>
      <div className="space-y-1.5">
        {displayItems.map((item, i) => {
          const productName = item.product?.name || item.name || item.variantName || `Product ${i + 1}`
          const itemImage = item.image || item.product?.images?.[0] || item.product?.image_url
          const weight = item.variantWeight || item.variantName || item.variant?.weightLabel || ''
          return (
            <div key={item._id || i} className="flex items-center gap-2.5">
              <div className="h-8 w-8 sm:h-[36px] sm:w-[36px] rounded-full border-2 border-[#D7E8C8] overflow-hidden shrink-0 bg-white shadow-sm">
                <img src={getImageUrl(itemImage)} alt={productName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { e.target.src = generatePlaceholder('product', productName) }} />
              </div>
              <span className="text-body-sm font-medium text-[#1a1a1a] truncate">{productName}</span>
              {weight && <span className="text-caption text-[#8B9E7A] shrink-0">{weight}</span>}
            </div>
          )
        })}
      </div>
      {remaining > 0 && (
        <button onClick={onViewDetails}
          className="text-body-sm font-semibold text-[#2E7D32] hover:text-[#1B5E20] transition-colors flex items-center gap-1 group">
          <span>+{remaining} More {remaining === 1 ? 'Product' : 'Products'}</span>
          <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default memo(ComboProductPreview)
