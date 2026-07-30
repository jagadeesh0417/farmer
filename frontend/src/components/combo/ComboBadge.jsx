import { memo } from 'react'

function ComboBadge({ discountPct, itemCount, variant = 'default', className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {discountPct > 0 && (
        <span className="inline-flex items-center rounded-full bg-[#F5A623] px-2.5 py-1 text-micro font-bold text-[#1a1a1a] shadow-sm">
          {discountPct}% OFF
        </span>
      )}
      {itemCount > 0 && (
        <span className="inline-flex items-center rounded-full bg-[#1a1a1a]/80 px-2.5 py-1 text-micro font-semibold text-white shadow-sm">
          {itemCount} {itemCount === 1 ? 'Product' : 'Products'}
        </span>
      )}
    </div>
  )
}

function NutritionBadge({ label, icon }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#F4F9EF] border border-[#D7E8C8] px-2.5 py-1 text-micro font-semibold text-[#2E7D32]">
      {icon && <span className="text-xs">{icon}</span>}
      {label}
    </span>
  )
}

function RibbonBadge({ label, type = 'best-seller' }) {
  const styles = {
    'best-seller': 'bg-[#F5A623] text-[#1a1a1a]',
    'most-popular': 'bg-[#2E7D32] text-white',
    'limited': 'bg-red-600 text-white',
  }
  return (
    <div className={`absolute top-0 left-0 z-20 rounded-br-xl px-3 py-1 text-micro font-bold shadow-sm ${styles[type] || styles['best-seller']}`}>
      {label}
    </div>
  )
}

export default memo(ComboBadge)
export { NutritionBadge, RibbonBadge }
