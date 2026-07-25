import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { isDemoMode } from '../lib/withDemoFallback'
import { demoCombos } from '../lib/demoData'
import { api } from '../lib/api'
import SeoHead from '../components/SeoHead'
import BundleCard from '../components/BundleCard'

export default function Combos() {
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      if (isDemoMode()) {
        setBundles(demoCombos)
        setLoading(false)
        return
      }
      try {
        const data = await api.getBundles({ combo: 'true' })
        setBundles(Array.isArray(data) ? data : data?.data || [])
      } catch (e) {
        console.error(e)
        setBundles([])
      }
      finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="bg-white min-h-screen">
      <SeoHead title="Super Saver Combos" description="Save big with curated product bundles from HaiFarmer. Best value, pure quality." />

      {/* Hero */}
      <section className="bg-green-600">
        <div className="section-container py-14 lg:py-20 text-center">
          <span className="inline-flex items-center text-body-sm font-semibold tracking-[0.12em] uppercase text-white/80">Curated Bundles</span>
          <h1 className="mt-3 font-heading text-h1 font-bold text-white">Super Saver Combos</h1>
          <p className="mt-3 text-body text-white/80 max-w-lg mx-auto font-medium">Save big with our thoughtfully curated product bundles from tribal farms. Best value, pure quality.</p>
        </div>
      </section>

      <div className="section-container py-10 lg:py-14">
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin border-2 border-border border-t-green-600" />
          </div>
        ) : bundles.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="font-heading text-h2 font-bold text-ink">No combos available</p>
            <p className="mt-1 text-body text-muted font-medium">Check back soon for exciting bundles!</p>
            <Link to="/products" className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 text-body font-semibold hover:bg-green-700 transition-colors">
              Browse Products →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map(bundle => <BundleCard key={bundle._id || bundle.id} bundle={bundle} compact />)}
          </div>
        )}
      </div>
    </div>
  )
}
