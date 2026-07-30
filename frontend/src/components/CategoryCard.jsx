import { Link } from 'react-router-dom'
import { useMemo } from 'react'

const MAX_PREVIEW = 4

export default function CategoryCard({ category, products = [] }) {
  const previewProducts = useMemo(() => products.slice(0, MAX_PREVIEW), [products])

  if (products.length === 0) return null

  const collage = !category.image_url && previewProducts.length > 0

  const productImages = previewProducts
    .map(p => p.images?.[0] || p.image || p.image_url)
    .filter(Boolean)

  return (
    <Link to={`/products?category=${category.slug}`}
      className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#F4F9EF] border border-[#D7E8C8] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(46,125,50,0.15)] block">
      {/* Background: category image or product collage */}
      {category.image_url ? (
        <img src={category.image_url} alt={category.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy" />
      ) : collage ? (
        <div className="absolute inset-0 grid grid-cols-2 gap-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden">
              {productImages[i] ? (
                <img src={productImages[i]} alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy" />
              ) : (
                <div className="w-full h-full bg-[#E8F5E9]" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E7D32]/40 to-[#1B4332]/60" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/85 via-[#1B4332]/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4">
        {/* Product count badge */}
        <div className="absolute top-3 right-3 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5">
          <span className="text-micro font-bold text-white">{products.length} {products.length === 1 ? 'item' : 'items'}</span>
        </div>

        <h3 className="font-heading text-body sm:text-h4 font-bold text-white drop-shadow-lg">{category.name}</h3>

        {/* Preview product images - overlapping thumbnails */}
        {collage && productImages.length > 1 && (
          <div className="flex items-center mt-1.5">
            <div className="flex">
              {productImages.slice(0, 3).map((src, i) => (
                <div key={i}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white overflow-hidden -mr-2 last:mr-0 shadow-sm"
                  style={{ zIndex: 3 - i }}>
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
              {products.length > 3 && (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#2E7D32] border-2 border-white flex items-center justify-center shadow-sm">
                  <span className="text-[9px] font-bold text-white">+{products.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-2 flex items-center gap-1.5 text-micro font-bold text-white bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 self-start transition-all group-hover:bg-[#2E7D32] group-hover:shadow-lg">
          Shop Now
          <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
