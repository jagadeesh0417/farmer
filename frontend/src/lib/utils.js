import { getImageWithFallback, generatePlaceholder } from './placeholders'

const PLACEHOLDER_IMAGE = 'https://res.cloudinary.com/drp7pfa2w/image/upload/f_auto,q_auto/haifarmer/placeholder'
const CLOUDINARY_REGEX = /https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//

export function optimizeImage(url, width = 600) {
  if (!url) return url
  if (!CLOUDINARY_REGEX.test(url)) return url
  const idx = url.indexOf('/upload/') + 8
  return url.slice(0, idx) + `q_auto:good,f_auto,dpr_2.0,w_${width},c_limit/` + url.slice(idx)
}

export function getSrcSet(url, widths = [300, 600, 900, 1200]) {
  if (!url || !CLOUDINARY_REGEX.test(url)) return undefined
  return widths.map(w => `${optimizeImage(url, w)} ${w}w`).join(', ')
}

export function getImageSizes(breakpoints) {
  if (!breakpoints || breakpoints.length === 0) return '100vw'
  return breakpoints.map(bp => `(min-width: ${bp}px) ${Math.round(bp * 0.25)}px`).join(', ') + ', 100vw'
}

export function formatPrice(amount) {
  if (amount == null || isNaN(amount)) return '₹0'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(amount))
}

export function discountPercent(originalPrice, salePrice) {
  if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

export function getImageUrl(path, fallback) {
  if (!path) return fallback || PLACEHOLDER_IMAGE
  if (CLOUDINARY_REGEX.test(path)) return optimizeImage(path, 600)
  if (path.startsWith('http') && !path.includes('placehold.co')) return path
  if (path.startsWith('data:')) return path
  if (path.startsWith('/')) return path
  return fallback || PLACEHOLDER_IMAGE
}

export function smartImageUrl(path, entity = 'product', name = '') {
  if (path && !path.includes('placeholder') && !path.includes('placehold.co')) return getImageUrl(path)
  return generatePlaceholder(entity, name || entity)
}

export function getImageProps(path, { width = 600, sizes, priority } = {}) {
  const src = getImageUrl(path)
  const isCloudinary = CLOUDINARY_REGEX.test(src)
  const srcSet = isCloudinary ? getSrcSet(path, [300, 600, 900, 1200]) : undefined
  return {
    src: isCloudinary ? optimizeImage(path, width) : src,
    srcSet,
    sizes,
    loading: priority ? 'eager' : 'lazy',
    fetchpriority: priority ? 'high' : undefined,
  }
}

export { calculateSubtotal as calculateTotal } from './pricingService'

export function calculateSavings(items) {
  return items.reduce((sum, item) => {
    if (item.original_price && item.original_price > item.price) {
      return sum + (item.original_price - item.price) * (item.quantity || 0)
    }
    return sum
  }, 0)
}

export { calculateShipping as getShippingCost } from './pricingService'
