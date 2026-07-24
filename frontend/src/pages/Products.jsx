import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts } from '../lib/productService'
import { DEMO_MODE } from '../lib/withDemoFallback'
import { demoProducts } from '../lib/demoData'
import SeoHead from '../components/SeoHead'
import ProductCard from '../components/ProductCard'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
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
    const load = async () => {
      setLoading(true)
      try {
        const result = await getProducts(page, 50, catSlug || null, search || null, sort, false)
        setProducts(DEMO_MODE && (!result?.data || result.data.length === 0) ? demoProducts : (result?.data || []))
        setTotal(DEMO_MODE && (!result?.data || result.data.length === 0) ? demoProducts.length : (result?.total || 0))
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
        <div className="section-container py-4 lg:py-5">
          <div className="flex items-center gap-2 text-body-sm text-muted">
            <Link to="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-green-600">All Products</Link>
            {catSlug && <><span>/</span><span className="text-ink font-semibold">{catSlug}</span></>}
          </div>
          <h1 className="font-heading text-h2 lg:text-h1 font-bold text-ink mt-2">{collectionTitle}</h1>
          <p className="text-body text-muted mt-1 max-w-xl">{collectionDesc}</p>
        </div>
      </div>

      <div className="section-container py-8 lg:py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-body-sm text-muted">Showing <span className="font-semibold text-ink">{products.length}</span> of <span className="font-semibold text-ink">{total}</span> products</p>
          <select value={sort} onChange={(e) => updateParams({ sort: e.target.value, page: '1' })}
            className="border border-border px-3 py-2 text-body-sm text-ink outline-none focus:border-green-600 bg-white">
            <option value="created_at">Featured</option>
            <option value="price">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name: A-Z</option>
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
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
  )
}
