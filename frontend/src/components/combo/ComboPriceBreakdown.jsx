import { memo } from 'react'
import { formatPrice } from '../../lib/utils'

function ComboPriceBreakdown({ originalTotal, bundlePrice, discountPct }) {
  const savings = originalTotal - bundlePrice

  if (!originalTotal && !bundlePrice) return null

  return (
    <div className="rounded-xl bg-[#F4F9EF] border border-[#D7E8C8] p-4 space-y-2">
      {originalTotal > 0 && (
        <div className="flex justify-between text-body-sm">
          <span className="text-[#8B9E7A]">Individual Total</span>
          <span className="font-semibold text-[#1a1a1a]">{formatPrice(originalTotal)}</span>
        </div>
      )}
      {savings > 0 && (
        <div className="flex justify-between text-body-sm">
          <span className="text-[#8B9E7A]">Combo Discount</span>
          <span className="font-semibold text-[#F5A623]">−{formatPrice(savings)}</span>
        </div>
      )}
      <div className="border-t border-[#D7E8C8] pt-2 flex justify-between">
        <span className="text-body-sm font-bold text-[#1a1a1a]">Final Price</span>
        <span className="font-heading text-h4 font-bold text-[#2E7D32]">{formatPrice(bundlePrice)}</span>
      </div>
      {discountPct > 0 && (
        <p className="text-caption text-[#2E7D32] font-semibold text-center pt-1">You save {discountPct}%</p>
      )}
    </div>
  )
}

export default memo(ComboPriceBreakdown)
