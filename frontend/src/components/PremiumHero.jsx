import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const FARM_BG = 'https://res.cloudinary.com/drp7pfa2w/image/upload/f_auto,q_auto,w_1920/haifarmer/hero-farm-bg'

function Leaf({ className, delay }) {
  return (
    <div
      className={`absolute text-green-600/15 pointer-events-none animate-float ${className}`}
      style={{ animationDelay: `${delay}s`, animationDuration: `${8 + Math.random() * 4}s` }}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 6-2 9-7-1 3-1 6-1 6l2 1c.5-2 1-5 3-8 1-2-1-4-4-4z" />
      </svg>
    </div>
  )
}

export default function PremiumHero() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative w-full overflow-hidden bg-[#1B4332] min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] flex items-center">
      {/* Background image with parallax */}
      <div className="absolute inset-0">
        <img src={FARM_BG} alt=""
          className="w-full h-full object-cover object-center"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          loading="eager" />
      </div>

      {/* Dark green gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1B4332]/90 via-[#1B4332]/70 to-[#1B4332]/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/40 via-transparent to-transparent" />

      {/* Floating leaves */}
      <Leaf className="top-[15%] left-[8%]" delay={0} />
      <Leaf className="top-[25%] right-[12%]" delay={1.5} />
      <Leaf className="bottom-[30%] left-[15%]" delay={3} />
      <Leaf className="top-[40%] right-[5%]" delay={0.8} />
      <Leaf className="bottom-[20%] right-[20%]" delay={2.5} />
      <Leaf className="top-[60%] left-[5%]" delay={4} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-28">
        <div className="max-w-2xl">
          {/* Organic badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
            <span className="text-micro font-semibold text-white/90 uppercase tracking-wider">100% Organic & Natural</span>
          </div>

          <h1 className="font-heading text-[clamp(2.2rem,6vw,4rem)] font-bold text-white leading-[1.1] tracking-tight">
            Fresh From Our Farms<br />
            <span className="text-[#4CAF50]">To Your Home</span>
          </h1>

          <p className="mt-4 sm:mt-5 text-body sm:text-body-lg text-white/80 max-w-lg leading-relaxed">
            Chemical-free, naturally grown products sourced directly from tribal communities. Pure. Honest. Sustainable.
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 mt-7 sm:mt-8">
            <Link to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-7 sm:px-8 py-3 sm:py-3.5 text-body-sm font-bold text-white shadow-xl shadow-[#2E7D32]/30 transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5 active:scale-[0.98]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Shop Now
            </Link>
            <Link to="/products?category="
              className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/25 px-7 sm:px-8 py-3 sm:py-3.5 text-body-sm font-bold text-white transition-all hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.98]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Explore Categories
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 sm:gap-10 mt-10 sm:mt-12">
            <div>
              <p className="font-heading text-h2 font-bold text-white">10K+</p>
              <p className="text-caption text-white/60">Happy Customers</p>
            </div>
            <div>
              <p className="font-heading text-h2 font-bold text-white">500+</p>
              <p className="text-caption text-white/60">Organic Products</p>
            </div>
            <div>
              <p className="font-heading text-h2 font-bold text-white">50+</p>
              <p className="text-caption text-white/60">Tribal Communities</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          25% { transform: translateY(-10px) rotate(5deg); opacity: 1; }
          75% { transform: translateY(5px) rotate(-3deg); opacity: 0.8; }
        }
        .animate-float { animation: float ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-float { animation: none !important; opacity: 0.4 !important; }
        }
      `}</style>
    </section>
  )
}
