import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../lib/api'

const CartContext = createContext(null)

const GUEST_CART_KEY = 'haifarmer_guest_cart'
const PRODUCT_SELECTIONS_KEY = 'haifarmer_product_selections'
const BUNDLE_SELECTIONS_KEY = 'haifarmer_bundle_selections'

function loadGuestCart() {
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]') } catch { return [] }
}

function saveGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [coupon, setCoupon] = useState(null)
  const [productSelections, setProductSelection] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PRODUCT_SELECTIONS_KEY) || '{}') } catch { return {} }
  })
  const [bundleSelections, setBundleSelection] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BUNDLE_SELECTIONS_KEY) || '{}') } catch { return {} }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => { localStorage.setItem(PRODUCT_SELECTIONS_KEY, JSON.stringify(productSelections)) }, [productSelections])
  useEffect(() => { localStorage.setItem(BUNDLE_SELECTIONS_KEY, JSON.stringify(bundleSelections)) }, [bundleSelections])

  useEffect(() => {
    setProductSelection(prev => {
      let changed = false
      const next = { ...prev }
      cartItems.forEach(item => {
        const pid = item.product?._id || item.product_id
        if (!pid) return
        if (next[pid]?.variantId === (item.variant?._id || item.variant_id) && next[pid]?.quantity === item.quantity) return
        next[pid] = { variantId: item.variant?._id || item.variant_id, quantity: item.quantity }
        changed = true
      })
      return changed ? next : prev
    })
  }, [cartItems])

  useEffect(() => {
    (async () => {
      setLoading(true)
      if (user) {
        try {
          const cart = await api.getCart()
          const items = (cart?.items || []).map(i => ({
            id: i._id,
            product_id: i.product?._id,
            variant_id: i.variantId,
            bundle_id: i.bundleId,
            quantity: i.quantity,
            product: i.product,
            variant: { _id: i.variantId, name: i.variantName, price: i.price, weightLabel: i.variantWeightLabel },
            bundle: i.bundleData,
          }))
          setCartItems(items)
          await mergeGuestCart(items)
        } catch { setCartItems([]) }
      } else {
        setCartItems(loadGuestCart())
      }
      setLoading(false)
    })()
  }, [user])

  async function mergeGuestCart(serverItems) {
    const guest = loadGuestCart()
    if (!guest.length) return
    for (const g of guest) {
      try {
        await api.addToCart({
          productId: g.product_id,
          variantId: g.variant_id,
          bundleId: g.bundle_id,
          quantity: g.quantity,
        })
      } catch { /* skip failed items */ }
    }
    localStorage.removeItem(GUEST_CART_KEY)
    const cart = await api.getCart()
    const items = (cart?.items || []).map(i => ({
      id: i._id, product_id: i.product?._id, variant_id: i.variantId,
      bundle_id: i.bundleId, quantity: i.quantity, product: i.product,
      variant: { _id: i.variantId, name: i.variantName, price: i.price, weightLabel: i.variantWeightLabel },
      bundle: i.bundleData,
    }))
    setCartItems(items)
  }

  const addToCart = useCallback(async function(item) {
    const itemData = {
      productId: item.product_id,
      variantId: item.variant_id,
      bundleId: item.bundle_id,
      isBundle: !!item.bundle_id,
      quantity: item.quantity || 1,
    }
    const fullItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      product_id: item.product_id,
      variant_id: item.variant_id,
      bundle_id: item.bundle_id,
      quantity: item.quantity || 1,
      product: item.product || null,
      variant: item.variant || null,
      bundle: item.bundle || null,
    }

    if (user) {
      try {
        const cart = await api.addToCart(itemData)
        const items = (cart?.items || []).map(i => ({
          id: i._id, product_id: i.product?._id, variant_id: i.variantId,
          bundle_id: i.bundleId, quantity: i.quantity, product: i.product,
          variant: { _id: i.variantId, name: i.variantName, price: i.price, weightLabel: i.variantWeightLabel },
          bundle: i.bundleData,
        }))
        setCartItems(items)
      } catch { setCartItems(prev => [...prev, fullItem]) }
    } else {
      const existing = cartItems.find(e => e.product_id === item.product_id && e.variant_id === item.variant_id && e.bundle_id === item.bundle_id)
      const updated = existing
        ? cartItems.map(e => e === existing ? { ...e, quantity: e.quantity + itemData.quantity } : e)
        : [...cartItems, fullItem]
      setCartItems(updated)
      saveGuestCart(updated)
    }
  }, [user, cartItems])

  const removeFromCart = useCallback(async function(itemId) {
    if (user) {
      try {
        await api.removeFromCart(itemId)
        const cart = await api.getCart()
        const items = (cart?.items || []).map(i => ({
          id: i._id, product_id: i.product?._id, variant_id: i.variantId,
          bundle_id: i.bundleId, quantity: i.quantity, product: i.product,
          variant: { _id: i.variantId, name: i.variantName, price: i.price, weightLabel: i.variantWeightLabel },
          bundle: i.bundleData,
        }))
        setCartItems(items)
      } catch { setCartItems(prev => prev.filter(t => t.id !== itemId)) }
    } else {
      const updated = cartItems.filter(t => t.id !== itemId)
      setCartItems(updated)
      saveGuestCart(updated)
    }
  }, [user])

  const updateQuantity = useCallback(async function(itemId, qty) {
    if (qty < 1) return
    if (user) {
      try {
        const cart = await api.updateCartItem(itemId, { quantity: qty })
        const items = (cart?.items || []).map(i => ({
          id: i._id, product_id: i.product?._id, variant_id: i.variantId,
          bundle_id: i.bundleId, quantity: i.quantity, product: i.product,
          variant: { _id: i.variantId, name: i.variantName, price: i.price, weightLabel: i.variantWeightLabel },
          bundle: i.bundleData,
        }))
        setCartItems(items)
      } catch { setCartItems(prev => prev.map(e => e.id === itemId ? { ...e, quantity: qty } : e)) }
    } else {
      const updated = cartItems.map(e => e.id === itemId ? { ...e, quantity: qty } : e)
      setCartItems(updated)
      saveGuestCart(updated)
    }
  }, [user])

  const totals = useMemo(() => {
    const baseTotal = cartItems.reduce((sum, item) => sum + (item.variant?.price || 0) * item.quantity, 0)
    return { baseTotal, discountTotal: 0, couponDiscount: 0, finalTotal: baseTotal }
  }, [cartItems])

  const value = {
    cartItems, setCartItems, addToCart, removeFromCart, updateQuantity,
    productSelections,
    setProductSelection: function(productId, sel) { setProductSelection(prev => ({ ...prev, [productId]: { ...prev[productId], ...sel } })) },
    bundleSelections,
    setBundleSelection: function(bundleId, sel) { setBundleSelection(prev => ({ ...prev, [bundleId]: { ...prev[bundleId], ...sel } })) },
    coupon, setCoupon, totals, loading,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}