import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { isDemoMode } from '../lib/withDemoFallback'
import { demoCombos } from '../lib/demoData'
import { api } from '../lib/api'
import SeoHead from '../components/SeoHead'
import BundleCard from '../components/BundleCard'

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
]

export default function Combos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [localSearch, setLocalSearch] = useState('')
  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'newest'
  const tab = searchParams.get('tab') || 'all'

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

  const hasFilters = search

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = { combo: 'true', page, limit: 50, sort }
        if (search) params.search = search
        const data = await api.getBundles(params)
        if (isDemoMode()) {
          setBundles(demoCombos)
          setTotal(demoCombos.length)
        } else {
          setBundles(Array.isArray(data) ? data : data?.data || [])
          setTotal(data?.total || (Array.isArray(data) ? data.length : 0))
        }
      } catch (e) {
        console.error(e)
        if (isDemoMode()) { setBundles(demoCombos); setTotal(demoCombos.length) }
        else setBundles([])
      }
      finally { setLoading(false) }
    }
    load()
  }, [page, search, sort])

  const filteredBundles = useMemo(() => {
    if (tab === 'super-savers') return bundles.filter(b => b.comboType === 'super_saver' || b.isSuperSaver)
    return bundles
  }, [bundles, tab])

  const totalPages = Math.ceil(total / 50)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    updateParams({ search: localSearch || null, page: '1' })
  }

  const setTab = (t) => updateParams({ tab: t === 'all' ? null : t, page: '1' })

  const pageTitle = tab === 'super-savers' ? 'Super Savers' : 'Combos'
  const pageDesc = tab === 'super-savers' ? 'Best value bundles with maximum savings. Curated for you.' : 'Browse all our specially priced combo bundles.'

  return (
    <div className="bg-white min-h-screen">
      <SeoHead title={pageTitle} description={pageDesc} />

      {/* Breadcrumb + Header */}
      <div className="bg-white border-b border-border">
        <div className="section-container py-4 lg:py-5 text-center">
          <div className="flex items-center justify-center gap-2 text-body-sm text-muted">
            <Link to="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <span className="text-ink font-semibold">{pageTitle}</span>
          </div>
          <h1 className="font-heading text-h2 lg:text-h1 font-bold text-ink mt-2">{pageTitle}</h1>
          <p className="text-body text-muted mt-1 max-w-xl mx-auto">{pageDesc}</p>

          {/* Tab filters */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <button onClick={() => setTab('all')}
              className={`px-5 py-2 rounded-full text-caption font-semibold transition-all border ${
                tab !== 'super-savers' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-muted border-border hover:border-green-300 hover:text-green-600'
              }`}>All Combos</button>
            <button onClick={() => setTab('super-savers')}
              className={`px-5 py-2 rounded-full text-caption font-semibold transition-all border ${
                tab === 'super-savers' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-muted border-border hover:border-green-300 hover:text-green-600'
              }`}>Super Savers</button>
          </div>
        </div>
      </div>

      <div className="section-container py-8 lg:py-10">
        <div className="flex gap-8">
          {/* Sidebar filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="space-y-6">
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
                  <span className="text-caption font-semibold text-muted uppercase tracking-wider">Search combos</span>
                </div>
                <form onSubmit={handleSearchSubmit} className="px-3">
                  <div className="relative">
                    <input value={localSearch} onChange={e => setLocalSearch(e.target.value)} placeholder="Search combos" className="w-full rounded-lg border border-border px-3 py-2 text-body-sm outline-none focus:border-green-500 pr-8" />
                    {localSearch && (
                      <button type="button" onClick={() => { setLocalSearch(''); updateParams({ search: null, page: '1' }) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-sm">&times;</button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-body-sm text-muted">Showing <span className="font-semibold text-ink">{filteredBundles.length}</span> of <span className="font-semibold text-ink">{total}</span> {tab === 'super-savers' ? 'super savers' : 'combos'}</p>
              <select value={sort} onChange={(e) => updateParams({ sort: e.target.value, page: '1' })}
                className="border border-border px-3 py-2 text-body-sm text-ink outline-none focus:border-green-600 bg-white rounded-lg">
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="flex min-h-[40vh] items-center justify-center"><div className="h-10 w-10 animate-spin border-2 border-border border-t-green-600 rounded-full" /></div>
            ) : filteredBundles.length === 0 ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                <p className="text-body font-semibold text-ink">No combos found</p>
                <p className="text-body-sm text-muted mt-1">Try adjusting your search.</p>
                <Link to="/products" className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 text-body-sm font-semibold hover:bg-green-700 transition-colors rounded-lg">
                  Browse Products →
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredBundles.map(bundle => <BundleCard key={bundle._id || bundle.id} bundle={bundle} />)}
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
