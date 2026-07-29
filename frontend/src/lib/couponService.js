import { api } from './api'

export async function validateCoupon(code, cartValue, cartItems) {
  const result = await api.validateCoupon(code, cartValue, cartItems)
  if (!result.valid) throw new Error(result.error)
  return result
}

export async function applyCoupon(code, cartValue, cartItems) {
  try {
    const result = await api.validateCoupon(code, cartValue, cartItems)
    return result
  } catch (err) {
    return { valid: false, error: err.message }
  }
}

export { calculateCouponDiscount as getCouponDiscount } from './pricingService'
