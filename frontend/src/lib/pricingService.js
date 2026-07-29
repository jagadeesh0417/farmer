export function getItemPrice(item) {
  if (item.bundle) return Number(item.bundle.bundle_price || item.bundle.price || 0)
  return Number(item.variant?.price || item.product?.price || item.product?.basePrice || 0)
}

export function getItemName(item) {
  if (item.bundle) return item.bundle.bundle_name || item.bundle.name || 'Bundle'
  return item.product?.name || 'Product'
}

export function getItemImage(item) {
  if (item.bundle) return item.bundle.bundle_image_url || item.bundle.image_url
  return item.product?.images?.[0] || item.product?.image_url
}

export function getItemVariantName(item) {
  return item.variant?.weightLabel || item.variant?.weight_label || item.variant?.name || ''
}

function toNumber(val) {
  return Number(val) || 0
}

export function calculateSubtotal(items) {
  return items.reduce((sum, item) => {
    const price = getItemPrice(item)
    const qty = toNumber(item.quantity)
    return sum + price * qty
  }, 0)
}

export function calculateComboDiscount(items) {
  return items.reduce((sum, item) => {
    if (!item.bundle) return sum
    const bundleItems = item.bundle.items || item.bundle.bundle_items || []
    if (!bundleItems.length) return sum
    const originalTotal = bundleItems.reduce((s, bi) => {
      return s + toNumber(bi.price || bi.variant?.price || bi.variant_price || 0) * toNumber(bi.quantity || 1)
    }, 0)
    if (originalTotal <= 0) return sum
    const sellingPrice = getItemPrice(item)
    const savings = originalTotal - sellingPrice
    return sum + (savings > 0 ? savings * toNumber(item.quantity) : 0)
  }, 0)
}

export function calculateCouponDiscount(coupon, subtotal) {
  if (!coupon) return 0
  const st = toNumber(subtotal)
  if (coupon.discountType === 'percentage') {
    const disc = Math.round((st * toNumber(coupon.discountValue)) / 100)
    return coupon.maxDiscount ? Math.min(disc, toNumber(coupon.maxDiscount)) : disc
  }
  return toNumber(coupon.discountValue)
}

export function calculateShipping(subtotal, settings) {
  if (!settings) return 0
  const st = toNumber(subtotal)
  const freeThreshold = toNumber(settings.freeShippingThreshold || settings.freeShippingMinAmount || 1499)
  if (freeThreshold > 0 && st >= freeThreshold) return 0
  return toNumber(settings.deliveryCharge || settings.shipping_cost || settings.delivery_charge_amount || 0)
}

export function calculateTax(subtotal, settings) {
  if (!settings?.taxEnabled || !settings?.taxRate) return 0
  return Math.round((toNumber(subtotal) * toNumber(settings.taxRate)) / 100)
}

export function calculateCartTotals(items, appliedCoupon, settings) {
  const subtotal = calculateSubtotal(items)
  const comboDiscount = calculateComboDiscount(items)
  const couponDiscount = calculateCouponDiscount(appliedCoupon, subtotal)
  const shipping = calculateShipping(subtotal, settings)
  const tax = calculateTax(subtotal, settings)
  const grandTotal = Math.max(0, Math.round(subtotal - comboDiscount - couponDiscount + shipping + tax))
  return { subtotal, comboDiscount, couponDiscount, shipping, tax, grandTotal }
}
