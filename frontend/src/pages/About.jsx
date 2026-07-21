import { Link } from 'react-router-dom'
import SeoHead from '../components/SeoHead'

const WHATSAPP_NUMBER = '9709704563'

export default function About() {
  return (
    <div className="bg-white">
      <SeoHead title="Our Story" description="HAiFarmer connects tribal farmers directly with customers for fresh, 100% natural products. Rainwater-fed farming, no middlemen, direct from farmers to your doorstep." />

      {/* Hero */}
      <section className="relative bg-green-800 overflow-hidden">
        <div className="relative min-h-[45vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-green-800/80 to-green-800/40" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 w-full text-center">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-white/80">Our Story</span>
            <h1 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">About HAiFarmer</h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              Real Food. Real Farmers. Real Health. We connect tribal farmers directly with customers, ensuring fresh, 100% natural products reach your doorstep.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 lg:py-18 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: '🌿', title: '100% Natural', desc: 'All our products are naturally grown without any chemicals or pesticides. Pure, traditional farming passed down through generations.' },
              { icon: '💧', title: 'Rainwater Fed', desc: 'Our farms are irrigated purely through rainwater, preserving natural taste and nutrition. Sustainable agriculture at its finest.' },
              { icon: '👨‍🌾', title: 'Direct from Farmers', desc: 'No middlemen. Fair prices for farmers, fresh products for you. We believe in ethical trade that uplifts indigenous communities.' },
            ].map(item => (
              <div key={item.title} className="group rounded-xl border border-border bg-white p-8 text-center transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-xl bg-green-50 text-4xl">{item.icon}</div>
                <h3 className="font-heading text-xl font-bold text-ink">{item.title}</h3>
                <p className="mt-3 text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Farmers */}
      <section className="relative bg-green-800 py-14 lg:py-18 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center relative z-10">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-white/80">Join Us</span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl tracking-tight">Want to sell your farm products?</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/60 leading-relaxed">
            Join our growing community of farmers and reach thousands of customers directly. We provide the platform, you provide the purity.
          </p>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello HAiFarmer, I am a farmer and want to sell my products on your platform.')}`}
            target="_blank" rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-green-600 px-10 py-3.5 text-sm font-semibold text-white transition-all hover:bg-green-500 hover:-translate-y-0.5">
            Contact on WhatsApp
          </a>
        </div>
      </section>

      {/* Mission */}
      <section className="py-14 lg:py-18 bg-off-white">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-10 text-center">
          <span className="inline-flex items-center rounded-full bg-green-50 px-4 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-green-600">Our Mission</span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-ink sm:text-4xl tracking-tight">Why We Do What We Do</h2>
          <p className="mt-6 text-base text-muted leading-relaxed">
            HAiFarmer was born from a simple belief — that the best food comes from the earth, grown with care by hands that respect nature.
            We work directly with tribal farming communities who have cultivated this land for generations using traditional, sustainable methods.
          </p>
          <p className="mt-4 text-base text-muted leading-relaxed">
            Every product you buy supports indigenous farmers, preserves ancient agricultural wisdom, and brings the purest,
            most nutritious food to your table. No pesticides. No chemicals. Just nature&apos;s best, delivered with love.
          </p>
        </div>
      </section>

      {/* Journey */}
      <section className="bg-green-800 py-14 lg:py-18 overflow-hidden">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-10 text-center">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-white/80">The Journey</span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl tracking-tight">From Eluru to Remote Tribal Villages</h2>
          <p className="mt-6 text-base text-white/60 leading-relaxed">
            Our journey began with a simple realization — the pure, chemical-free food grown by tribal farmers was not reaching the tables that needed it most.
            So we travelled deep into tribal regions, from Eluru to the most remote villages, meeting farmers who still cultivate using
            traditional methods passed down through generations.
          </p>
          <p className="mt-4 text-base text-white/60 leading-relaxed">
            We believe in taking the time to do things right. Before launching products, we travel deeper into tribal regions,
            sourcing more natural products that deserve a place in every home. Every product tells a story of the farmer who grew it,
            the land that nurtured it, and the traditions that shaped it.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { number: '946+', label: 'Community Members', sub: 'Growing every day' },
              { number: '20+', label: 'Traditional Products', sub: 'From tribal farms' },
              { number: '100%', label: 'Chemical Free', sub: 'Naturally grown' },
            ].map(item => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="font-heading text-3xl font-bold text-green-300">{item.number}</p>
                <p className="mt-1 text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-0.5 text-[10px] text-white/40">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 lg:py-18 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-green-50 px-4 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-green-600">How It Works</span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-ink sm:text-4xl tracking-tight">Farm to Home</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              { step: '01', title: 'Tribal Farmers', desc: 'We source directly from indigenous farming communities who use traditional, chemical-free methods.' },
              { step: '02', title: 'Handpicked Harvest', desc: 'Every product is carefully handpicked, sun-dried, and processed using age-old techniques.' },
              { step: '03', title: 'Quality Check', desc: 'We verify each batch for purity, freshness, and authenticity before it reaches you.' },
              { step: '04', title: 'Your Doorstep', desc: 'Packed with care and delivered directly to your home. No middlemen, no compromises.' },
            ].map(item => (
              <div key={item.step} className="group rounded-xl border border-border bg-white p-8 text-center transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-green-50 font-heading text-xl font-bold text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">{item.step}</div>
                <h3 className="font-heading text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
