import { Link } from 'react-router-dom'
import { formatPrice, getImageUrl } from '../lib/utils'

function slugify(name) {
  return (name || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export default function LifestyleCard({ product, headline }) {
  const variants = product.product_variants || product.variants || []
  const hasVariants = variants.length > 1
  const firstPrice = variants[0]?.price ?? product.base_price ?? product.price ?? 0
  const lastPrice = variants[variants.length - 1]?.price ?? firstPrice
  const mrp = variants[0]?.original_price ?? variants[0]?.originalPrice ?? variants[0]?.mrp ?? product.mrp ?? firstPrice
  const savings = mrp - firstPrice
  const discountPercent = product.discount_percent || (mrp > firstPrice ? Math.round((savings / mrp) * 100) : 0)
  const imageUrl = getImageUrl(product.image_url || product.images?.[0])

  return (
    <Link to={`/products/${slugify(product.name)}`} className="lifestyle-card group block">
      {/* Full-bleed background image */}
      <div className="absolute inset-0 bg-green-100">
        <img src={imageUrl} alt={product.name} loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { if (!e.currentTarget.dataset.fallback) { e.currentTarget.dataset.fallback = 'true'; e.currentTarget.style.background = 'linear-gradient(135deg, #EADBC8, #F8F4EE)' } }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* Brand badge top-left */}
      <div className="absolute left-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-sm">
        <span className="text-[9px] font-bold uppercase text-green-600 leading-tight text-center">HF</span>
      </div>

      {/* Optional certification top-right */}
      <div className="absolute right-3 top-3 z-10 rounded-full bg-white/80 px-2.5 py-1 text-[9px] font-semibold uppercase text-ink shadow-sm">
        Certified
      </div>

      {/* Optional headline overlay */}
      {headline && (
        <div className="absolute left-4 right-4 top-1/3 z-10">
          <p className="text-sm font-semibold text-white leading-snug drop-shadow-lg">{headline}</p>
        </div>
      )}

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="h-[38px] w-[38px] flex-shrink-0 overflow-hidden rounded-lg border border-white/30 bg-white shadow-sm">
            <img src={imageUrl} alt="" className="h-full w-full object-cover" loading="lazy"
              onError={(e) => { if (!e.currentTarget.dataset.fallback) { e.currentTarget.dataset.fallback = 'true'; e.currentTarget.style.background = '#EADBC8' } }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white drop-shadow-sm">{product.name}</p>
            <div className="flex items-baseline gap-2">
              {hasVariants ? (
                <span className="text-sm font-bold text-green-200">{formatPrice(firstPrice)} – {formatPrice(lastPrice)}</span>
              ) : (
                <>
                  <span className="text-sm font-bold text-green-200">{formatPrice(firstPrice)}</span>
                  {mrp > firstPrice && <span className="text-[11px] text-white/60 line-through">{formatPrice(mrp)}</span>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
