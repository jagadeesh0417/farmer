import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, getCategories } from '../lib/productService'
import SeoHead from '../components/SeoHead'
import ProductCard from '../components/ProductCard'

const CATEGORY_ICONS = {
  'All': '🌾',
  'Natural Sweeteners': '🍯',
  'Lentils & Beans': '🫘',
  'Spices & Seasonings': '🌶️',
  'Millets': '🌿',
  'Salt & Essentials': '🧂',
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const page = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'created_at'
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [cats, result] = await Promise.all([getCategories(), getProducts(page, 50, category || null, search || null, sort, false)])
        setCategories(cats || [])
        setProducts(result?.data || [])
        setTotal(result?.total || 0)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [page, category, search, sort])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams(prev => { prev.set('search', searchInput); prev.set('page', '1'); return prev })
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <SeoHead title="Products" description="Browse our selection of premium organic produce from tribal villages — millets, honey, spices, lentils and more." />

      {/* Hero */}
      <section className="relative bg-forest-900 pt-28 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="absolute top-10 right-10 text-gold-500/5 leaf-float hidden lg:block">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor"><path d="M50 10C30 30 15 55 15 75c0 10 5 15 15 15 20 0 55-30 55-55C85 20 70 10 50 10z"/></svg>
        </div>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-gold-500">From Tribal Farms</span>
          <h1 className="mt-4 font-heading text-4xl font-bold text-cream-50 sm:text-5xl lg:text-6xl tracking-tight">Our Products</h1>
          <p className="mt-3 text-cream-50/50 max-w-lg mx-auto">Premium organic produce straight from indigenous farming communities. Pesticide-free, chemical-free, pure.</p>
        </div>
      </section>

      {/* Category cards */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="-mt-8 relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {[
            { name: 'All', slug: '', icon: '🌾' },
            ...(categories.map(c => ({ name: c.name, slug: c.slug || c.id, icon: CATEGORY_ICONS[c.name] || '🌿' }))),
          ].map(cat => (
            <button key={cat.name} onClick={() => setSearchParams(prev => { if (cat.slug) prev.set('category', cat.slug); else prev.delete('category'); prev.set('page', '1'); return prev })}
              className={`group rounded-2xl p-4 text-center transition-all duration-300 ${category === cat.slug ? 'bg-forest-900 text-cream-50 shadow-lg shadow-forest-900/20' : 'bg-white text-forest-900/60 border border-border-warm hover:shadow-md hover:-translate-y-0.5'}`}>
              <span className="block text-2xl mb-1">{cat.icon}</span>
              <span className="text-[10px] font-semibold tracking-[0.05em] uppercase">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-8">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products..."
              className="w-64 rounded-xl border border-border-warm bg-white px-4 py-2.5 text-sm text-text-dark placeholder:text-forest-900/40 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 outline-none" />
            <button type="submit"
              className="btn-font rounded-xl bg-terracotta-500 px-6 py-2.5 text-sm font-semibold tracking-[0.05em] uppercase text-cream-50 transition-all hover:bg-terracotta-600 hover:-translate-y-0.5">Search</button>
          </form>
          <select value={sort} onChange={(e) => setSearchParams(prev => { prev.set('sort', e.target.value); prev.set('page', '1'); return prev })}
            className="rounded-xl border border-border-warm bg-white px-4 py-2.5 text-sm text-text-dark focus:border-terracotta-500 outline-none">
            <option value="created_at">Newest</option>
            <option value="price">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-forest-900/20 border-t-terracotta-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="font-heading text-2xl font-semibold text-text-dark italic">No products found</p>
            <p className="mt-1 text-sm text-forest-900/50">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map(product => <ProductCard key={product.id} product={product} compact />)}
            </div>
            {total > 50 && (
              <div className="mt-10 flex justify-center gap-3">
                <button disabled={page <= 1} onClick={() => setSearchParams(prev => { prev.set('page', page - 1); return prev })}
                  className="btn-font rounded-xl border border-border-warm bg-white px-6 py-2.5 text-sm font-semibold text-text-dark hover:bg-cream-100 transition-all disabled:opacity-50 hover:-translate-y-0.5">Previous</button>
                <span className="flex items-center px-4 text-sm font-semibold text-text-dark">Page {page}</span>
                <button disabled={products.length < 50} onClick={() => setSearchParams(prev => { prev.set('page', page + 1); return prev })}
                  className="btn-font rounded-xl border border-border-warm bg-white px-6 py-2.5 text-sm font-semibold text-text-dark hover:bg-cream-100 transition-all disabled:opacity-50 hover:-translate-y-0.5">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
