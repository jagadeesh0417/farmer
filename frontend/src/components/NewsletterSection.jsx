import { memo, useState } from 'react'
import { toast } from 'react-toastify'

function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email?.trim()) return
    setLoading(true)
    // Simulate subscription
    await new Promise(r => setTimeout(r, 800))
    toast.success('You\'ve subscribed! Check your inbox for organic tips.')
    setEmail('')
    setLoading(false)
  }

  return (
    <section className="relative overflow-hidden py-14 lg:py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1B4332] via-[#2E7D32] to-[#1B5E20]" />

      {/* Decorative circles */}
      <div className="absolute top-0 -right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-10 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#4CAF50]/10 blur-3xl" />

      {/* Leaf decorations */}
      <div className="absolute top-8 left-8 text-white/5 text-6xl transform -rotate-12 hidden sm:block">🌿</div>
      <div className="absolute bottom-8 right-8 text-white/5 text-6xl transform rotate-45 hidden sm:block">🌾</div>

      <div className="relative z-10 section-container">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm mb-5">
            <span className="text-2xl">🌿</span>
          </div>
          <h2 className="font-heading text-h2 font-bold text-white">Join Our Organic Family</h2>
          <p className="mt-2 text-body-sm text-white/70 max-w-md mx-auto">
            Get exclusive offers, organic recipes, and healthy living tips delivered to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 sm:mt-7 flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-5 py-3 text-body-sm text-white placeholder:text-white/40 outline-none focus:border-white/40 focus:bg-white/15 transition-all" />
            <button type="submit" disabled={loading}
              className="rounded-full bg-white px-6 py-3 text-caption font-bold text-[#1B4332] shadow-lg transition-all hover:bg-[#C8E6C9] hover:-translate-y-0.5 disabled:opacity-70">
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>

          <p className="mt-4 text-micro text-white/40">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  )
}

export default memo(NewsletterSection)
