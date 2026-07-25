import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts } from '../lib/productService'
import { getCategories } from '../lib/productService'
import { isDemoMode } from '../lib/withDemoFallback'
import { demoProducts } from '../lib/demoData'
import SeoHead from '../components/SeoHead'
import ProductCard from '../components/ProductCard'

const sortOptions = [
  { value: 'created_at', label: 'Featured' },
  { value: 'price', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const page = parseInt(searchParams.get('page') || '1')
  const catSlug = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'created_at'

  const updateParams = (updates) => {
    setSearchParams(prev => {
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === '' || v === undefined) prev.delete(k)
        else prev.set(k, v)
      })
      return prev
    })
  }

  useEffect(() => {
    getCategories().then(res => {
      if (res?.categories) setCategories(res.categories.filter(c => c.isActive !== false))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const result = await getProducts(page, 50, catSlug || null, search || null, sort, false)
        setProducts(isDemoMode() && (!result?.data || result.data.length === 0) ? demoProducts : (result?.data || []))
        setTotal(isDemoMode() && (!result?.data || result.data.length === 0) ? demoProducts.length : (result?.total || 0))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [page, catSlug, search, sort])

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
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-h4 font-bold text-ink">Filters</h3>
                {catSlug && (
                  <button onClick={() => updateParams({ category: '', page: '1' })}
                    className="text-caption text-green-600 hover:text-green-700 font-semibold">Clear</button>
                )}
              </div>
              <div className="mb-1 px-3 py-1.5">
                <span className="text-caption font-semibold text-muted uppercase tracking-wider">Category</span>
              </div>
              <ul className="space-y-0.5">
                <li>
                  <button onClick={() => updateParams({ category: '', page: '1' })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-body-sm transition ${!catSlug ? 'bg-green-50 text-green-700 font-semibold' : 'text-muted hover:bg-gray-50 hover:text-ink'}`}>All Products</button>
                </li>
                {categories.map(cat => (
                  <li key={cat._id || cat.slug}>
                    <button onClick={() => updateParams({ category: cat.slug || cat.name?.toLowerCase(), page: '1' })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-body-sm transition ${catSlug === (cat.slug || cat.name?.toLowerCase()) ? 'bg-green-50 text-green-700 font-semibold' : 'text-muted hover:bg-gray-50 hover:text-ink'}`}>{cat.name}</button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-body-sm text-muted">Showing <span className="font-semibold text-ink">{products.length}</span> of <span className="font-semibold text-ink">{total}</span> products</p>
              <select value={sort} onChange={(e) => updateParams({ sort: e.target.value, page: '1' })}
                className="border border-border px-3 py-2 text-body-sm text-ink outline-none focus:border-green-600 bg-white">
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="flex min-h-[40vh] items-center justify-center"><div className="h-10 w-10 animate-spin border-2 border-border border-t-green-600" /></div>
            ) : products.length === 0 ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                <p className="text-body font-semibold text-ink">No products found</p>
                <p className="text-body-sm text-muted mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {products.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}
                      className="border border-border px-3 py-2 text-body-sm font-semibold text-muted hover:bg-green-50 disabled:opacity-30">‹ Prev</button>
                    {Array.from({ length: Math.min(totalPages <= 5 ? totalPages : 3, totalPages) }, (_, i) => {
                      let p; if (totalPages <= 5) p = i + 1; else if (page <= 3) p = i + 1; else if (page >= totalPages - 2) p = totalPages - 4 + i; else p = page - 2 + i
                      return (
                        <button key={p} onClick={() => updateParams({ page: String(p) })}
                          className={`flex h-9 w-9 items-center justify-center text-body-sm font-semibold transition-all ${page === p ? 'bg-green-600 text-white' : 'border border-border text-muted hover:bg-green-50'}`}>{p}</button>
                      )
                    })}
                    <button disabled={page >= totalPages} onClick={() => updateParams({ page: String(page + 1) })}
                      className="border border-border px-3 py-2 text-body-sm font-semibold text-muted hover:bg-green-50 disabled:opacity-30">Next ›</button>
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
