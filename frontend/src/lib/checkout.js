import { INDIAN_STATES } from './indianStates'

export const ADDRESS_CACHE_KEY = 'haifarmer_checkout_address'
export const LAST_ORDER_KEY = 'haifarmer_last_order'

export function loadCachedAddress() {
  try { return JSON.parse(localStorage.getItem(ADDRESS_CACHE_KEY)) } catch { return null }
}

export function saveCachedAddress(addr) {
  try { localStorage.setItem(ADDRESS_CACHE_KEY, JSON.stringify(addr)) } catch {}
}

export function clearCachedAddress() {
  try { localStorage.removeItem(ADDRESS_CACHE_KEY) } catch {}
}

export function saveLastOrder(order) {
  try { localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order)) } catch {}
}

export function loadLastOrder() {
  try { return JSON.parse(localStorage.getItem(LAST_ORDER_KEY)) } catch { return null }
}

export function clearLastOrder() {
  try { localStorage.removeItem(LAST_ORDER_KEY) } catch {}
}

export const emptyAddress = {
  name: '', mobile: '', alternateMobile: '', email: '',
  house: '', street: '', area: '', landmark: '',
  district: '', city: '', state: '', pincode: '', country: 'India',
  deliveryInstructions: '',
  setDefault: true,
  billingSame: true,
  billingHouse: '', billingStreet: '', billingCity: '', billingState: '', billingPincode: '',
}

export const ADDRESS_VALIDATORS = {
  name: (v) => v?.trim() ? '' : 'Full name is required',
  mobile: (v) => /^[0-9]{10}$/.test(v?.trim()) ? '' : 'Please enter a valid 10-digit mobile number.',
  house: (v) => v?.trim() ? '' : 'House/Flat number is required',
  area: (v) => v?.trim() ? '' : 'Street/Area is required',
  district: (v) => v?.trim() ? '' : 'District is required',
  city: (v) => v?.trim() ? '' : 'City/Town/Village is required',
  state: (v) => INDIAN_STATES.includes(v) ? '' : 'Please select a state',
  pincode: (v) => /^[0-9]{6}$/.test(v?.trim()) ? '' : 'Please enter a valid 6-digit PIN code.',
}

export function isAddressComplete(addr) {
  if (!addr) return false
  return Object.keys(ADDRESS_VALIDATORS).every(k => {
    if (k === 'mobile') return /^[0-9]{10}$/.test(addr.mobile?.trim())
    if (k === 'pincode') return /^[0-9]{6}$/.test(addr.pincode?.trim())
    if (k === 'state') return INDIAN_STATES.includes(addr.state)
    return addr[k]?.trim()
  })
}

export function addressToSummary(addr) {
  if (!addr) return ''
  return [addr.house, addr.street, addr.area, addr.landmark, addr.city, addr.district, addr.state, addr.pincode, addr.country].filter(Boolean).join(', ')
}

export function shippingAddressPayload(addr) {
  return {
    addressLine1: [addr.house, addr.street, addr.area, addr.landmark].filter(Boolean).join(', '),
    city: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    label: addr.area || addr.city || '',
    addressLine2: addr.landmark || '',
  }
}
