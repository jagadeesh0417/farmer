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

export function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0)
}

export function calculateCouponDiscount(coupon, subtotal) {
  if (!coupon) return 0
  if (coupon.discountType === 'percentage') {
    const disc = Math.round((subtotal * coupon.discountValue) / 100)
    return coupon.maxDiscount ? Math.min(disc, coupon.maxDiscount) : disc
  }
  return coupon.discountValue || 0
}

export function calculateShipping(subtotal, settings) {
  if (!settings) return 0
  const freeThreshold = Number(settings.freeShippingThreshold || settings.freeShippingMinAmount || 1499)
  if (subtotal >= freeThreshold) return 0
  return Number(settings.deliveryCharge || settings.shipping_cost || settings.delivery_charge_amount || 0)
}

export function calculateTax(subtotal, settings) {
  if (!settings?.taxEnabled || !settings?.taxRate) return 0
  return Math.round((subtotal * Number(settings.taxRate)) / 100)
}

export function calculateFinalTotal({ subtotal, comboDiscount, couponDiscount, shipping, tax }) {
  const s = Number(subtotal) || 0
  const cd = Number(comboDiscount) || 0
  const cp = Number(couponDiscount) || 0
  const sh = Number(shipping) || 0
  const tx = Number(tax) || 0
  const raw = s - cd - cp + sh + tx
  const grandTotal = Number(raw.toFixed(2))
  console.log({ subtotal: s, comboDiscount: cd, couponDiscount: cp, deliveryCharge: sh, tax: tx, grandTotal })
  return grandTotal
}

export function calculateCartTotals(items, appliedCoupon, settings) {
  const subtotal = calculateSubtotal(items)
  const couponDiscount = calculateCouponDiscount(appliedCoupon, subtotal)
  const shipping = calculateShipping(subtotal, settings)
  const tax = calculateTax(subtotal, settings)
  const discountTotal = 0
  const finalTotal = calculateFinalTotal({ subtotal, couponDiscount, shipping, tax })
  return { subtotal, discountTotal, couponDiscount, shipping, tax, finalTotal }
}
