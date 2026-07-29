import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../lib/api'
import { isDemoMode } from '../lib/withDemoFallback'
import { getItems } from '../lib/demoStore'
import { demoProducts } from '../lib/demoData'

const ProductContext = createContext(null)

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [productMap, setProductMap] = useState({})
  const fetchTimer = useRef(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    if (isDemoMode()) {
      const saved = getItems('products')
      const all = [...saved, ...demoProducts.filter(dp => !saved.some(s => s.name === dp.name))]
      setProducts(all)
      buildMap(all)
      setLoading(false)
      return
    }
    try {
      const result = await api.getProducts({ limit: 200, active: 'all' })
      const data = result.data || []
      setProducts(data)
      buildMap(data)
    } catch (err) {
      console.error('Failed to load products:', err)
    }
    finally { setLoading(false) }
  }, [])

  const buildMap = (data) => {
    const map = {}
    data.forEach(p => {
      map[p._id || p.id] = p
      if (p.slug) map[p.slug] = p
    })
    setProductMap(map)
  }

  useEffect(() => { refresh() }, [refresh])

  const getProduct = useCallback((idOrSlug) => {
    return productMap[idOrSlug] || null
  }, [productMap])

  const getProducts = useCallback((ids) => {
    return ids.map(id => productMap[id]).filter(Boolean)
  }, [productMap])

  const value = {
    products,
    loading,
    getProduct,
    getProducts,
    productMap,
    refresh,
  }

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() {
  return useContext(ProductContext)
}
