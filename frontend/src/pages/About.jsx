import { Link } from 'react-router-dom'
import SeoHead from '../components/SeoHead'

const WHATSAPP_NUMBER = '9709704563'

export default function About() {
  return (
    <div className="min-h-screen bg-cream-50">
      <SeoHead title="About" description="HAiFarmer connects tribal farmers directly with customers for fresh, 100% natural products. Rainwater-fed farming, no middlemen, direct from farmers to your doorstep." />

      {/* HERO */}
      <section className="relative bg-forest-900 py-20 sm:py-28 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-block rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-gold-500">Our Story</span>
          <h1 className="mt-4 font-heading text-4xl font-bold text-cream-50 sm:text-5xl lg:text-6xl tracking-tight">About HAiFarmer</h1>
          <p className="mt-4 text-lg text-cream-50/70 max-w-2xl mx-auto leading-relaxed">
            Real Food. Real Farmers. Real Health. We connect tribal farmers directly with customers, ensuring fresh, 100% natural products reach your doorstep.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: '🌿', title: '100% Natural', desc: 'All our products are naturally grown without any chemicals or pesticides. Pure, traditional farming passed down through generations.' },
              { icon: '💧', title: 'Rainwater Fed', desc: 'Our farms are irrigated purely through rainwater, preserving natural taste and nutrition. Sustainable agriculture at its finest.' },
              { icon: '👨‍🌾', title: 'Direct from Farmers', desc: 'No middlemen. Fair prices for farmers, fresh products for you. We believe in ethical trade that uplifts indigenous communities.' },
            ].map(item => (
              <div key={item.title} className="group rounded-3xl border border-border-warm bg-white p-8 text-center shadow-sm hover:shadow-lg transition">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-cream-100 text-4xl group-hover:bg-terracotta-500/10 transition">{item.icon}</div>
                <h3 className="font-heading text-xl font-bold text-text-dark">{item.title}</h3>
                <p className="mt-3 text-sm text-forest-900/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="organic-divider"><div className="absolute inset-0 bg-forest-900" /></div>

      {/* JOIN FARMERS */}
      <section className="relative bg-forest-900 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-gold-500">Join Us</span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-cream-50 sm:text-4xl tracking-tight">Want to sell your farm products?</h2>
          <p className="mx-auto mt-4 max-w-lg text-cream-50/70 leading-relaxed">
            Join our growing community of farmers and reach thousands of customers directly. We provide the platform, you provide the purity.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello HAiFarmer, I am a farmer and want to sell my products on your platform.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-terracotta-500 px-8 py-3 text-sm font-semibold tracking-[0.08em] uppercase text-cream-50 shadow-lg transition hover:bg-terracotta-600"
          >Contact on WhatsApp</a>
        </div>
      </section>

      <div className="organic-divider organic-divider-reverse"><div className="absolute inset-0 bg-cream-100" /></div>

      {/* STORY */}
      <section className="bg-cream-100 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-text-dark sm:text-4xl tracking-tight">Our Mission</h2>
          <p className="mt-6 text-base text-forest-900/70 leading-relaxed">
            HAiFarmer was born from a simple belief — that the best food comes from the earth, grown with care by hands that respect nature. 
            We work directly with tribal farming communities who have cultivated this land for generations using traditional, sustainable methods.
          </p>
          <p className="mt-4 text-base text-forest-900/70 leading-relaxed">
            Every product you buy supports indigenous farmers, preserves ancient agricultural wisdom, and brings the purest, 
            most nutritious food to your table. No pesticides. No chemicals. Just nature's best, delivered with love.
          </p>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="bg-forest-900 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-gold-500">The Journey</span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-cream-50 sm:text-4xl tracking-tight">From Eluru to Remote Tribal Villages</h2>
          <p className="mt-6 text-base text-cream-50/70 leading-relaxed">
            Our journey began with a simple question — why is the pure, chemical-free food grown by tribal farmers not reaching our tables? 
            So we travelled deep into tribal regions, from Eluru to the most remote villages, meeting farmers who still cultivate using 
            traditional methods passed down through generations.
          </p>
          <p className="mt-4 text-base text-cream-50/70 leading-relaxed">
            We believe in taking the time to do things right. Before launching products, we travel deeper into tribal regions, 
            sourcing more natural products that deserve a place in every home. Every product tells a story of the farmer who grew it, 
            the land that nurtured it, and the traditions that shaped it.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { number: '946+', label: 'Community Members', sub: 'Growing every day' },
              { number: '20+', label: 'Traditional Products', sub: 'From tribal farms' },
              { number: '100%', label: 'Chemical Free', sub: 'Naturally grown' },
            ].map(item => (
              <div key={item.label} className="rounded-2xl border border-gold-500/20 bg-forest-950 p-6">
                <p className="font-heading text-2xl font-bold text-gold-500">{item.number}</p>
                <p className="mt-1 text-sm font-semibold text-cream-50">{item.label}</p>
                <p className="mt-0.5 text-[10px] text-cream-50/50">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="organic-divider"><div className="absolute inset-0 bg-cream-100" /></div>

      {/* HOW IT WORKS */}
      <section className="bg-cream-100 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block rounded-full border border-terracotta-500/20 bg-terracotta-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-terracotta-500">How It Works</span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-text-dark sm:text-4xl tracking-tight">Farm to Home</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              { step: '01', title: 'Tribal Farmers', desc: 'We source directly from indigenous farming communities who use traditional, chemical-free methods.' },
              { step: '02', title: 'Handpicked Harvest', desc: 'Every product is carefully handpicked, sun-dried, and processed using age-old techniques.' },
              { step: '03', title: 'Quality Check', desc: 'We verify each batch for purity, freshness, and authenticity before it reaches you.' },
              { step: '04', title: 'Your Doorstep', desc: 'Packed with care and delivered directly to your home. No middlemen, no compromises.' },
            ].map(item => (
              <div key={item.step} className="group rounded-3xl border border-border-warm bg-white p-6 text-center shadow-sm hover:shadow-lg transition">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream-100 font-heading text-xl font-bold text-terracotta-500 group-hover:bg-terracotta-500 group-hover:text-cream-50 transition">{item.step}</div>
                <h3 className="font-heading text-lg font-bold text-text-dark">{item.title}</h3>
                <p className="mt-2 text-sm text-forest-900/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="organic-divider"><div className="absolute inset-0 bg-forest-900" /></div>
    </div>
  )
}
