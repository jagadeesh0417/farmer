import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import SeoHead from '../components/SeoHead'
import BundleCard from '../components/BundleCard'
import { getComboBundles as getSupabaseComboBundles } from '../lib/productService'

export default function Combos() {
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        let data = await api.getBundles({ combo: 'true' })
        if (!data || data.length === 0) data = await getSupabaseComboBundles().catch(() => [])
        setBundles(data || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-cream-50">
      <SeoHead title="Combos & Bundles" description="Save big with curated product bundles from HAiFarmer. Organic vegetable combos, fruit bundles, spice packs and more at special discount prices." />

      {/* Hero */}
      <section className="relative bg-forest-900 pt-28 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="absolute top-10 right-10 text-gold-500/5 leaf-float hidden lg:block">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor"><path d="M50 10C30 30 15 55 15 75c0 10 5 15 15 15 20 0 55-30 55-55C85 20 70 10 50 10z"/></svg>
        </div>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-gold-500">Curated Bundles</span>
          <h1 className="mt-4 font-heading text-4xl font-bold text-cream-50 sm:text-5xl lg:text-6xl tracking-tight">Family Combos</h1>
          <p className="mt-3 text-cream-50/50 max-w-lg mx-auto">Save big with our thoughtfully curated product bundles from tribal farms. Best value, pure quality.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-10">
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-forest-900/20 border-t-terracotta-500" />
          </div>
        ) : bundles.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="font-heading text-2xl font-semibold text-text-dark italic">No combos available</p>
            <p className="mt-1 text-sm text-forest-900/50">Check back soon for exciting bundles!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bundles.map(bundle => <BundleCard key={bundle._id} bundle={bundle} />)}
          </div>
        )}
      </div>
    </div>
  )
}
