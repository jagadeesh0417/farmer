import { memo } from 'react'
import { formatPrice } from '../../lib/utils'

const benefits = [
  { icon: '💰', label: 'Save money with bundle pricing' },
  { icon: '🌾', label: 'Carefully curated by experts' },
  { icon: '⭐', label: 'Better value than buying separately' },
  { icon: '🚚', label: 'Free delivery on eligible orders' },
  { icon: '✅', label: 'Premium quality guaranteed' },
]

function ComboBenefits({ savings }) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-[#F4F9EF] to-white border border-[#D7E8C8] p-4">
      <h4 className="text-caption font-bold text-[#2E7D32] uppercase tracking-wider mb-2.5">Why Buy This Combo?</h4>
      <div className="space-y-1.5">
        {savings > 0 && (
          <div className="flex items-center gap-2 text-body-sm font-semibold text-[#1a1a1a] bg-white rounded-lg px-3 py-1.5 border border-[#D7E8C8]">
            <span className="text-base">🎉</span>
            <span>Save <span className="text-[#F5A623]">{formatPrice(savings)}</span> with this bundle</span>
          </div>
        )}
        {benefits.map((b, i) => (
          <div key={i} className="flex items-center gap-2 text-body-sm text-[#1a1a1a]/80">
            <span className="text-sm w-5 text-center shrink-0">{b.icon}</span>
            <span>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(ComboBenefits)
