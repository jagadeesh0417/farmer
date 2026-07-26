import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { isDemoMode } from '../lib/withDemoFallback'
import { getItems } from '../lib/demoStore'
import { demoProducts } from '../lib/demoData'
import SeoHead from '../components/SeoHead'
import ProductCard from '../components/ProductCard'

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'created_at', label: 'Featured' },
  { value: 'price', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
]

const RATING_OPTIONS = [5, 4, 3, 2, 1]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [localSearch, setLocalSearch] = useState('')
  const page = parseInt(searchParams.get('page') || '1')
  const catSlug = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'newest'
  const minRating = parseInt(searchParams.get('minRating') || '0')

  const updateParams = (updates) => {
    setSearchParams(prev => {
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === '' || v === undefined) prev.delete(k)
        else prev.set(k, v)
      })
      return prev
    })
  }

  const clearAll = () => {
    setSearchParams({})
    setLocalSearch('')
  }

  const hasFilters = catSlug || search || minRating > 0

  useEffect(() => {
    api.getCategories().then(data => {
      const cats = Array.isArray(data) ? data : data?.data || []
      setCategories(cats.filter(c => c.isActive !== false))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = { page, limit: 50, sort, active: 'true' }
        if (catSlug) params.category = catSlug
        if (search) params.search = search
        const result = await api.getProducts(params)
        if (isDemoMode()) {
          const saved = getItems('products')
          const merged = (!result?.data || result.data.length === 0) ? [...saved, ...demoProducts.filter(dp => !saved.some(s => s.name === dp.name))] : (result?.data || [])
          setProducts(merged)
          setTotal(merged.length)
        } else {
          setProducts(result?.data || [])
          setTotal(result?.total || 0)
        }
      } catch (e) {
        console.error(e)
        if (isDemoMode()) {
          const saved = getItems('products')
          const merged = [...saved, ...demoProducts.filter(dp => !saved.some(s => s.name === dp.name))]
          setProducts(merged)
          setTotal(merged.length)
        }
      }
      finally { setLoading(false) }
    }
    load()
  }, [page, catSlug, search, sort])

  const categoryCounts = useMemo(() => {
    const counts = {}
    products.forEach(p => {
      const cat = typeof p.category === 'string' ? p.category.toLowerCase() : (p.category?.slug || p.category?.name || '').toLowerCase()
      if (cat) counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [products])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    updateParams({ search: localSearch || null, page: '1' })
  }

  const totalPages = Math.ceil(total / 50)

  const collectionTitle = catSlug ? catSlug.charAt(0).toUpperCase() + catSlug.slice(1) : 'All Products'
  const collectionDesc = catSlug
    ? `Browse our range of ${catSlug} — wild-harvested and naturally processed.`
    : 'Explore our handpicked range of wild-harvested and natural products, crafted with care by tribal communities.'

  return (
    <div className="bg-white min-h-screen">
      <SeoHead title={collectionTitle} description={collectionDesc} />

      {/* Breadcrumb + Header */}
      <div className="bg-white border-b border-border">
        <div className="section-container py-4 lg:py-5 text-center">
          <div className="flex items-center justify-center gap-2 text-body-sm text-muted">
            <Link to="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-green-600">All Products</Link>
            {catSlug && <><span>/</span><span className="text-ink font-semibold">{catSlug}</span></>}
          </div>
          <h1 className="font-heading text-h2 lg:text-h1 font-bold text-ink mt-2 text-center">{collectionTitle}</h1>
          <p className="text-body text-muted mt-1 max-w-xl mx-auto">{collectionDesc}</p>
        </div>
      </div>

      <div className="section-container py-8 lg:py-10">
        {/* Mobile category filter */}
        <div className="lg:hidden mb-6 overflow-x-auto hide-scrollbar -mx-4 px-4">
          <div className="flex gap-2 pb-2">
            <button onClick={() => updateParams({ category: '', page: '1' })}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${!catSlug ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
            {categories.map(cat => (
              <button key={cat._id || cat.slug} onClick={() => updateParams({ category: cat.slug || cat.name?.toLowerCase(), page: '1' })}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${catSlug === (cat.slug || cat.name?.toLowerCase()) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat.name}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-h4 font-bold text-ink">Filters</h3>
                {hasFilters && (
                  <button onClick={clearAll}
                    className="text-caption text-green-600 hover:text-green-700 font-semibold">Clear all</button>
                )}
              </div>

              {/* Search */}
              <div>
                <div className="mb-2 px-3 py-1.5">
                  <span className="text-caption font-semibold text-muted uppercase tracking-wider">Search products</span>
                </div>
                <form onSubmit={handleSearchSubmit} className="px-3">
                  <div className="relative">
                    <input value={localSearch} onChange={e => setLocalSearch(e.target.value)} placeholder="Search products" className="w-full rounded-lg border border-border px-3 py-2 text-body-sm outline-none focus:border-green-500 pr-8" />
                    {localSearch && (
                      <button type="button" onClick={() => { setLocalSearch(''); updateParams({ search: null, page: '1' }) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-sm">&times;</button>
                    )}
                  </div>
                </form>
              </div>

              {/* Categories */}
              <div>
                <div className="mb-1 px-3 py-1.5">
                  <span className="text-caption font-semibold text-muted uppercase tracking-wider">Categories</span>
                </div>
                <ul className="space-y-0.5">
                  <li>
                    <button onClick={() => updateParams({ category: '', page: '1' })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-body-sm transition flex items-center justify-between ${!catSlug ? 'bg-green-50 text-green-700 font-semibold' : 'text-muted hover:bg-gray-50 hover:text-ink'}`}>
                      <span>All</span>
                      <span className="text-xs text-muted">{products.length}</span>
                    </button>
                  </li>
                  {categories.map(cat => {
                    const slug = cat.slug || cat.name?.toLowerCase()
                    const count = categoryCounts[slug] || 0
                    return (
                      <li key={cat._id || slug}>
                        <button onClick={() => updateParams({ category: slug, page: '1' })}
                          className={`w-full text-left px-3 py-2 rounded-lg text-body-sm transition flex items-center justify-between ${catSlug === slug ? 'bg-green-50 text-green-700 font-semibold' : 'text-muted hover:bg-gray-50 hover:text-ink'}`}>
                          <span>{cat.name}</span>
                          <span className="text-xs text-muted">{count}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Rating */}
              <div>
                <div className="mb-2 px-3 py-1.5">
                  <span className="text-caption font-semibold text-muted uppercase tracking-wider">Rating</span>
                </div>
                <div className="px-3 space-y-1">
                  {RATING_OPTIONS.map(r => (
                    <button key={r} onClick={() => updateParams({ minRating: minRating === r ? null : String(r), page: '1' })}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-body-sm transition flex items-center gap-1 ${minRating === r ? 'bg-green-50 text-green-700 font-semibold' : 'text-muted hover:bg-gray-50 hover:text-ink'}`}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg key={i} className={`h-4 w-4 ${i < r ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                      <span className="text-xs text-muted ml-1">& Up</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-body-sm text-muted">Showing <span className="font-semibold text-ink">{products.length}</span> of <span className="font-semibold text-ink">{total}</span> products</p>
              <select value={sort} onChange={(e) => updateParams({ sort: e.target.value, page: '1' })}
                className="border border-border px-3 py-2 text-body-sm text-ink outline-none focus:border-green-600 bg-white rounded-lg">
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="flex min-h-[40vh] items-center justify-center"><div className="h-10 w-10 animate-spin border-2 border-border border-t-green-600 rounded-full" /></div>
            ) : products.length === 0 ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                <p className="text-body font-semibold text-ink">No products found</p>
                <p className="text-body-sm text-muted mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {products.map(product => <ProductCard key={product.id || product._id} product={product} />)}
                </div>
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}
                      className="border border-border px-3 py-2 text-body-sm font-semibold text-muted hover:bg-green-50 disabled:opacity-30 rounded-lg">‹ Prev</button>
                    {Array.from({ length: Math.min(totalPages <= 5 ? totalPages : 3, totalPages) }, (_, i) => {
                      let p; if (totalPages <= 5) p = i + 1; else if (page <= 3) p = i + 1; else if (page >= totalPages - 2) p = totalPages - 4 + i; else p = page - 2 + i
                      return (
                        <button key={p} onClick={() => updateParams({ page: String(p) })}
                          className={`flex h-9 w-9 items-center justify-center text-body-sm font-semibold transition-all rounded-lg ${page === p ? 'bg-green-600 text-white' : 'border border-border text-muted hover:bg-green-50'}`}>{p}</button>
                      )
                    })}
                    <button disabled={page >= totalPages} onClick={() => updateParams({ page: String(page + 1) })}
                      className="border border-border px-3 py-2 text-body-sm font-semibold text-muted hover:bg-green-50 disabled:opacity-30 rounded-lg">Next ›</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}