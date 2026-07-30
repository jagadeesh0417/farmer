import { useEffect, useRef, useState } from 'react'

const STEPS = [
  {
    label: '01',
    title: 'Seeds',
    desc: 'Heirloom, non-GMO seeds selected by tribal farmers',
    icon: <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7"><path d="M16 4C10 4 6 10 6 16c0 4 2 8 6 10l-2 4h12l-2-4c4-2 6-6 6-10 0-6-4-12-10-12z" fill="white"/><path d="M16 8c-3 0-5 3-5 6 0 2 1 4 3 5l-1 2h6l-1-2c2-1 3-3 3-5 0-3-2-6-5-6z" fill="#1B5E20" opacity="0.3"/></svg>,
  },
  {
    label: '02',
    title: 'Organic Farming',
    desc: 'Grown naturally with compost, no chemicals',
    icon: <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7"><rect x="4" y="12" width="24" height="16" rx="2" stroke="white" strokeWidth="1.8"/><path d="M16 6v6M12 8l4-4 4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 18h12M10 22h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
  {
    label: '03',
    title: 'Harvesting',
    desc: 'Hand-picked at peak ripeness by expert farmers',
    icon: <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7"><path d="M16 4C12 4 8 8 8 14c0 4 2 7 4 9l-1 3h10l-1-3c2-2 4-5 4-9 0-6-4-10-8-10z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/><path d="M14 14l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    label: '04',
    title: 'Lab Testing',
    desc: 'Tested for purity, nutrition & safety compliance',
    icon: <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7"><path d="M12 4v8l-4 6v2h16v-2l-4-6V4" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/><path d="M10 4h12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><circle cx="16" cy="14" r="2" fill="white"/><path d="M14 20l2-4 2 4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    label: '05',
    title: 'Eco Packaging',
    desc: 'Packed in sustainable, biodegradable materials',
    icon: <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7"><rect x="6" y="8" width="20" height="18" rx="2" stroke="white" strokeWidth="1.8"/><path d="M6 14h20" stroke="white" strokeWidth="1.8"/><path d="M16 14v8" stroke="white" strokeWidth="1.5"/><path d="M12 6l4-2 4 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    label: '06',
    title: 'Delivered Fresh',
    desc: 'Straight from farm to your doorstep',
    icon: <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7"><rect x="4" y="16" width="24" height="10" rx="2" stroke="white" strokeWidth="1.8"/><path d="M10 16v-4a6 6 0 0112 0v4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><circle cx="10" cy="24" r="2" fill="white"/><circle cx="22" cy="24" r="2" fill="white"/></svg>,
  },
]

function LeafParticle({ className, delay }) {
  return (
    <div className={`absolute text-green-700/8 pointer-events-none ${className}`}
      style={{ animation: `leafFloat ${10 + Math.random() * 8}s ease-in-out ${delay}s infinite` }}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 6-2 9-7-1 3-1 6-1 6l2 1c.5-2 1-5 3-8 1-2-1-4-4-4z" />
      </svg>
    </div>
  )
}

export default function FarmTimeline() {
  const [visible, setVisible] = useState({})
  const sectionRef = useRef(null)
  const cardRefs = useRef([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.dataset.index)
          setVisible(prev => ({ ...prev, [idx]: true }))
        }
      })
    }, { threshold: 0.2 })

    cardRefs.current.forEach(ref => { if (ref) observer.observe(ref) })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const total = rect.height + rect.top - window.innerHeight
      const progress = Math.max(0, Math.min(1, -rect.top / total))
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMouseMove = (e) => {
    if (!sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height })
  }

  return (
    <section ref={sectionRef} onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F2] to-[#F0F7EE] py-16 lg:py-24">

      {/* Floating leaf particles */}
      <LeafParticle className="top-[8%] left-[5%]" delay={0} />
      <LeafParticle className="top-[20%] right-[8%]" delay={1.5} />
      <LeafParticle className="top-[45%] left-[3%]" delay={3} />
      <LeafParticle className="top-[60%] right-[5%]" delay={0.8} />
      <LeafParticle className="top-[80%] left-[8%]" delay={2.5} />
      <LeafParticle className="top-[35%] right-[12%]" delay={4} />

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-3 mb-3">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#2E7D32]"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 6-2 9-7-1 3-1 6-1 6l2 1c.5-2 1-5 3-8 1-2-1-4-4-4z" fill="currentColor"/></svg>
            <span className="text-micro font-semibold tracking-[0.15em] uppercase text-[#2E7D32]">Our Process</span>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#2E7D32] scale-x-[-1]"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 6-2 9-7-1 3-1 6-1 6l2 1c.5-2 1-5 3-8 1-2-1-4-4-4z" fill="currentColor"/></svg>
          </div>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-[#1B5E20] leading-[1.15]">
            From Farm to Table
          </h2>
          <p className="text-body-sm text-[#5A7A60] mt-2 max-w-lg mx-auto">
            Every step is carefully managed to bring you the freshest organic products.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Curved SVG connecting line (desktop) */}
          <svg className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none"
            viewBox="0 0 900 600" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#66BB6A" />
                <stop offset="100%" stopColor="#1B5E20" />
              </linearGradient>
            </defs>
            <path d="M450 0 C350 50, 550 100, 450 150 C350 200, 550 250, 450 300 C350 350, 550 400, 450 450 C350 500, 550 550, 450 600"
              stroke="#D7E8C8" strokeWidth="3" fill="none" />
            <path d="M450 0 C350 50, 550 100, 450 150 C350 200, 550 250, 450 300 C350 350, 550 400, 450 450 C350 500, 550 550, 450 600"
              stroke="url(#lineGrad)" strokeWidth="3" fill="none"
              strokeDasharray="1200" strokeDashoffset={1200 - scrollProgress * 1200}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
            <circle cx="450" cy={scrollProgress * 600} r="6" fill="#2E7D32" className="drop-shadow-lg"
              style={{ transition: 'cy 0.15s linear' }} />
          </svg>

          {/* Desktop: zig-zag layout */}
          <div className="hidden lg:grid grid-cols-2 gap-x-16 gap-y-10 relative">
            {STEPS.map((step, i) => {
              const isLeft = i % 2 === 0
              return (
                <div key={i} ref={el => cardRefs.current[i] = el} data-index={i}
                  className={`relative transition-all duration-700 ease-out ${isLeft ? 'col-start-1' : 'col-start-2'} ${visible[i] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.92]'}`}
                  style={{ transitionDelay: `${i * 150}ms` }}>
                  <div
                    className="group relative rounded-2xl bg-white/85 backdrop-blur-md p-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#D7E8C8]/60 transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(27,94,32,0.12)] hover:border-[#66BB6A]/40"
                    style={{
                      transform: `perspective(800px) rotateX(${(mousePos.y - 0.5) * 2}deg) rotateY(${(0.5 - mousePos.x) * (isLeft ? 2 : -2)}deg)`,
                      transition: 'transform 0.2s ease-out, box-shadow 0.3s, border-color 0.3s',
                    }}>
                    {/* Step number badge */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#2E7D32] text-white text-[11px] font-bold flex items-center justify-center shadow-md z-10">
                      {step.label}
                    </div>

                    <div className="flex items-start gap-4">
                      {/* Icon container */}
                      <div className="shrink-0 w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                        {step.icon}
                      </div>

                      <div className="min-w-0 flex-1 pt-1">
                        <h3 className="font-heading text-h4 font-bold text-[#1B5E20]">{step.title}</h3>
                        <p className="text-body-sm text-[#5A7A60] mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tablet: 3-col grid */}
          <div className="hidden sm:grid lg:hidden grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <div key={i} ref={el => cardRefs.current[i] = el} data-index={i}
                className={`transition-all duration-700 ease-out ${visible[i] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.92]'}`}
                style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="group rounded-2xl bg-white/85 backdrop-blur-md p-5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#D7E8C8]/60 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(27,94,32,0.12)] hover:border-[#66BB6A]/40">
                  <div className="relative inline-block mb-3">
                    <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center mx-auto shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#2E7D32] text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                      {step.label}
                    </div>
                  </div>
                  <h3 className="font-heading text-body font-bold text-[#1B5E20]">{step.title}</h3>
                  <p className="text-caption text-[#5A7A60] mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: vertical alternating */}
          <div className="sm:hidden relative">
            {/* Vertical line */}
            <div className="absolute left-[23px] top-2 bottom-2 w-[2px] bg-[#D7E8C8]" />
            <div className="absolute left-[23px] top-2 w-[2px] bg-gradient-to-b from-[#66BB6A] to-[#1B5E20] rounded-full"
              style={{ height: `${scrollProgress * 100}%`, transition: 'height 0.1s linear' }} />

            <div className="space-y-8">
              {STEPS.map((step, i) => {
                const isLeft = i % 2 === 0
                return (
                  <div key={i} ref={el => cardRefs.current[i] = el} data-index={i}
                    className={`flex items-start gap-4 transition-all duration-700 ease-out ${visible[i] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                    style={{ transitionDelay: `${i * 150}ms` }}>
                    {/* Icon + step number */}
                    <div className="relative shrink-0 z-10">
                      <div className="w-[46px] h-[46px] rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shadow-lg">
                        <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5 text-white">
                          {step.icon.props.children}
                        </svg>
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#2E7D32] text-white text-[8px] font-bold flex items-center justify-center shadow-md">
                        {step.label}
                      </div>
                    </div>
                    {/* Card */}
                    <div className="flex-1 rounded-2xl bg-white/85 backdrop-blur-md p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-[#D7E8C8]/60 transition-all duration-300 hover:shadow-[0_16px_40px_rgba(27,94,32,0.1)]">
                      <h3 className="font-heading text-caption font-bold text-[#1B5E20]">{step.title}</h3>
                      <p className="text-micro text-[#5A7A60] mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="relative block w-full h-[40px] sm:h-[60px]">
          <path d="M0 30C200 60 400 0 600 30S1000 60 1200 30V60H0V30Z" fill="white" />
        </svg>
      </div>

      <style>{`
        @keyframes leafFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
          25% { transform: translateY(-15px) rotate(8deg); opacity: 0.7; }
          75% { transform: translateY(8px) rotate(-5deg); opacity: 0.5; }
        }
        @media (prefers-reduced-motion: reduce) {
          .group, [class*="transition"] { transition: none !important; animation: none !important; }
        }
      `}</style>
    </section>
  )
}
