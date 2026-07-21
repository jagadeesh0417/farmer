import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts } from '../lib/productService'
import SeoHead from '../components/SeoHead'
import ProductCard from '../components/ProductCard'


const CATEGORY_CARDS = [
  { name: 'All Products', slug: '', icon: 'M4 6h16M4 12h16M4 18h16' },
  { name: 'Millets', slug: 'millets', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { name: 'Honey', slug: 'honey', icon: 'M12 2C8 2 4 5 4 9c0 3 2 6 4 8l4 5 4-5c2-2 4-5 4-8 0-4-4-7-8-7z' },
  { name: 'Spices', slug: 'spices', icon: 'M12 2a10 10 0 1010 10M12 2v10l6 6' },
  { name: 'Combos', slug: 'combos', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9-4 9 4' },
]

const HARVEST_TYPES = [
  { label: 'Wild Harvested', count: 34 },
  { label: 'Farm Grown', count: 18 },
  { label: 'Natural', count: 27 },
  { label: 'Handcrafted', count: 15 },
]
const PRICE_RANGES = [
  { label: 'Under ₹200', min: 0, max: 200 },
  { label: '₹200 – ₹500', min: 200, max: 500 },
  { label: '₹500 – ₹1000', min: 500, max: 1000 },
  { label: 'Above ₹1000', min: 1000, max: Infinity },
]
const BENEFITS = [
  { label: 'Immunity Booster', count: 12 },
  { label: 'Rich in Protein', count: 8 },
  { label: 'Diabetes Friendly', count: 6 },
  { label: 'Gluten Free', count: 10 },
  { label: 'Antioxidant Rich', count: 7 },
  { label: 'Gut Friendly', count: 5 },
]

const FILTER_ICONS = { 'Harvest Type': '🌱', 'Price': '💰', 'Benefits': '✨' }

function ChevronDown({ open }) {
  return (
    <svg className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [viewMode, setViewMode] = useState('grid')
  const [filterOpen, setFilterOpen] = useState({ 'Harvest Type': true, 'Price': true, 'Benefits': true })
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
        setProducts(result?.data || [])
        setTotal(result?.total || 0)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [page, catSlug, search, sort])

  const totalPages = Math.ceil(total / 50)

  const FilterSection = ({ title, children }) => {
    const open = filterOpen[title] !== false
    return (
      <div className="border-b border-ink/10 pb-5 last:border-0 last:pb-0">
        <button onClick={() => setFilterOpen(prev => ({ ...prev, [title]: !prev[title] }))}
          className="flex w-full items-center justify-between mb-3">
          <span className="font-heading text-sm font-semibold text-ink flex items-center gap-2">
            {FILTER_ICONS[title] && <span className="text-sm">{FILTER_ICONS[title]}</span>}
            {title}
          </span>
          <ChevronDown open={open} />
        </button>
        {open && <div className="space-y-1">{children}</div>}
      </div>
    )
  }

  const FilterCheckbox = ({ label, count, checked, onChange }) => (
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-xs text-muted transition-colors hover:bg-ink/5">
      <div className="flex items-center gap-2.5">
        <input type="checkbox" checked={checked} onChange={onChange}
          className="h-4 w-4 rounded border-ink/20 text-terracotta-500 focus:ring-terracotta-500/30 accent-terracotta-500" />
        {label}
      </div>
      {count != null && <span className="text-[10px] text-muted/40">({count})</span>}
    </label>
  )

  const FilterRadio = ({ label, checked, onChange, name }) => (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs text-muted transition-colors hover:bg-ink/5">
      <input type="radio" checked={checked} onChange={onChange} name={name}
        className="h-4 w-4 border-ink/20 text-terracotta-500 focus:ring-terracotta-500/30 accent-terracotta-500" />
      {label}
    </label>
  )

  return (
    <div className="min-h-screen bg-cream-50">
      <SeoHead title="All Products" description="Explore our handpicked range of wild-harvested and natural products, crafted with care and honesty by tribal communities." />

      {/* Header */}
      <section className="relative bg-forest-900 pt-32 pb-20 sm:pt-36 sm:pb-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center relative z-10">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-terracotta-500 mb-3">Rooted in Tradition. Shared with Love.</p>
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-cream-50 tracking-tight">All Products</h1>
          <p className="mt-4 text-sm text-cream-50/60 max-w-lg mx-auto">Explore our handpicked range of wild-harvested and natural products, crafted with care and honesty by tribal communities.</p>
        </div>
      </section>

      {/* Category cards */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="-mt-8 relative z-10 grid grid-cols-3 sm:grid-cols-5 gap-3">
          {CATEGORY_CARDS.map(cat => {
            const isActive = (catSlug === cat.slug) || (!catSlug && !cat.slug)
            return (
              <button key={cat.slug || cat.name} onClick={() => updateParams({ category: cat.slug || null, page: '1' })}
                className={`flex flex-col items-center gap-3 rounded-xl p-5 sm:p-6 text-center transition-all duration-200 ${
                  isActive
                    ? 'bg-terracotta-500 text-cream-50 shadow-lg shadow-terracotta-500/25'
                    : 'bg-card-cream text-ink border border-ink/10 hover:shadow-md hover:-translate-y-0.5'
                }`}>
                <svg className={`h-7 w-7 ${isActive ? 'text-cream-50' : 'text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={cat.icon} />
                </svg>
                <span className="font-heading text-xs font-bold tracking-wide uppercase">{cat.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-10">
        <div className="flex gap-10">
          {/* Sidebar filters */}
          <aside className={`${sidebarOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} lg:relative lg:inset-auto lg:z-auto lg:block lg:w-64 lg:flex-shrink-0`}>
            {sidebarOpen && <div className="absolute inset-0 bg-forest-900/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
            <div className="relative w-72 max-w-[85vw] bg-cream-50 p-6 lg:w-auto lg:bg-transparent lg:p-0 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm4 6a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm2 6a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" /></svg>
                  <span className="font-heading text-sm font-bold text-ink">Filters</span>
                </div>
                <button onClick={() => updateParams({ category: null, page: '1' })} className="text-[10px] font-semibold tracking-wider uppercase text-terracotta-500 hover:text-terracotta-600 flex items-center gap-1">
                  ↻ Reset All
                </button>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted hover:text-ink"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              <div className="space-y-6">
                <FilterSection title="Harvest Type">
                  {HARVEST_TYPES.map(t => (
                    <FilterCheckbox key={t.label} label={t.label} count={t.count} />
                  ))}
                </FilterSection>
                <FilterSection title="Price">
                  {PRICE_RANGES.map(r => (
                    <FilterRadio key={r.label} label={r.label} name="price" />
                  ))}
                </FilterSection>
                <FilterSection title="Benefits">
                  {BENEFITS.map(b => (
                    <FilterCheckbox key={b.label} label={b.label} count={b.count} />
                  ))}
                </FilterSection>
              </div>

              {/* Note card */}
              <div className="mt-8 rounded-xl bg-card-cream p-5 border border-ink/5 relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 text-ink/[0.03]">
                  <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor"><path d="M50 10C30 30 15 55 15 75c0 10 5 15 15 15 20 0 55-30 55-55C85 20 70 10 50 10z"/></svg>
                </div>
                <div className="relative z-10">
                  <p className="text-xs text-muted leading-relaxed">All our products are sourced ethically and crafted with care by tribal communities.</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-muted">
                Showing <span className="font-semibold text-ink">{products.length}</span> of <span className="font-semibold text-ink">{total}</span> products
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-ink/10 bg-card-cream p-0.5">
                  <button onClick={() => setViewMode('grid')}
                    className={`rounded-md p-1.5 transition-all ${viewMode === 'grid' ? 'bg-cream-50 text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                  </button>
                  <button onClick={() => setViewMode('list')}
                    className={`rounded-md p-1.5 transition-all ${viewMode === 'list' ? 'bg-cream-50 text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </button>
                </div>
                <select value={sort} onChange={(e) => updateParams({ sort: e.target.value, page: '1' })}
                  className="rounded-xl border border-ink/10 bg-card-cream px-4 py-2 text-xs text-ink outline-none focus:border-terracotta-500">
                  <option value="created_at">Featured</option>
                  <option value="price">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-font rounded-xl border border-ink/10 bg-card-cream px-4 py-2 text-xs font-semibold text-ink">
                  <svg className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm4 6a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm2 6a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" /></svg>
                  Filters
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-ink/20 border-t-terracotta-500" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                <p className="font-heading text-2xl font-semibold text-ink italic">No products found</p>
                <p className="mt-1 text-sm text-muted">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}
                      className="btn-font rounded-lg border border-ink/10 bg-card-cream px-4 py-2 text-xs font-semibold text-muted transition-all hover:bg-ink/5 disabled:opacity-30">‹ Prev</button>
                    {Array.from({ length: Math.min(totalPages <= 5 ? totalPages : 3, totalPages) }, (_, i) => {
                      let p
                      if (totalPages <= 5) p = i + 1
                      else if (page <= 3) p = i + 1
                      else if (page >= totalPages - 2) p = totalPages - 4 + i
                      else p = page - 2 + i
                      return (
                        <button key={p} onClick={() => updateParams({ page: String(p) })}
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all ${page === p ? 'bg-terracotta-500 text-cream-50 shadow-sm' : 'border border-ink/10 bg-card-cream text-muted hover:bg-ink/5 hover:text-ink'}`}>{p}</button>
                      )
                    })}
                    <button disabled={page >= totalPages} onClick={() => updateParams({ page: String(page + 1) })}
                      className="btn-font rounded-lg border border-ink/10 bg-card-cream px-4 py-2 text-xs font-semibold text-muted transition-all hover:bg-ink/5 disabled:opacity-30">Next ›</button>
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