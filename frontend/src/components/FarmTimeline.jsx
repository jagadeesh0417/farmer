import { useEffect, useRef, useState, useCallback } from 'react'

const STEPS = [
  {
    label: '01',
    title: 'Seed Selection',
    desc: 'We carefully select premium-quality seeds from trusted farms.',
    icon: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="46" stroke="#D7E8C8" strokeWidth="1" strokeDasharray="3 4" opacity="0.5"/>
        <ellipse cx="50" cy="72" rx="22" ry="8" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="1.5"/>
        <path d="M50 64 C44 50 42 44 48 34" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round"/>
        <path d="M48 34 C44 28 44 24 50 20 C56 24 56 28 52 34" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M48 34 C42 30 38 26 40 20" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M52 34 C58 30 62 26 60 20" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="40" cy="18" r="2" fill="#2E7D32" opacity="0.3"/>
        <circle cx="60" cy="18" r="2" fill="#2E7D32" opacity="0.3"/>
        <circle cx="30" cy="38" r="1.5" fill="#2E7D32" opacity="0.2"/>
        <circle cx="70" cy="38" r="1.5" fill="#2E7D32" opacity="0.2"/>
      </svg>
    ),
  },
  {
    label: '02',
    title: 'Organic Farming',
    desc: 'Grown naturally with traditional methods, free from chemicals.',
    icon: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="46" stroke="#D7E8C8" strokeWidth="1" strokeDasharray="3 4" opacity="0.5"/>
        <path d="M50 18 C34 18 24 32 24 44 C24 52 28 58 32 62 L28 70 L44 70 L42 62 C46 64 54 64 58 62 L56 70 L72 70 L68 62 C72 58 76 52 76 44 C76 32 66 18 50 18Z" stroke="#2E7D32" strokeWidth="2" fill="#E8F5E9" fillOpacity="0.4"/>
        <path d="M50 32 L50 52" stroke="#2E7D32" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M40 42 L50 32 L60 42" stroke="#2E7D32" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M42 58 L50 52 L58 58" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="36" cy="26" r="2.5" fill="#4CAF50" opacity="0.4"/>
        <circle cx="64" cy="26" r="2.5" fill="#4CAF50" opacity="0.4"/>
        <circle cx="30" cy="48" r="2" fill="#2E7D32" opacity="0.2"/>
        <circle cx="70" cy="48" r="2" fill="#2E7D32" opacity="0.2"/>
      </svg>
    ),
  },
  {
    label: '03',
    title: 'Natural Irrigation',
    desc: 'Pure water sourced from natural springs and rainwater harvesting.',
    icon: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="46" stroke="#D7E8C8" strokeWidth="1" strokeDasharray="3 4" opacity="0.5"/>
        <path d="M50 18 C38 30 26 40 26 52 C26 64 36 74 50 74 C64 74 74 64 74 52 C74 40 62 30 50 18Z" stroke="#2E7D32" strokeWidth="2" fill="#E3F2FD" fillOpacity="0.25"/>
        <path d="M50 30 L50 60" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
        <path d="M38 42 L50 30 L62 42" stroke="#4CAF50" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M32 60 C38 66 62 66 68 60" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3"/>
        <circle cx="42" cy="40" r="3" fill="#4CAF50" opacity="0.35"/>
        <circle cx="58" cy="40" r="3" fill="#4CAF50" opacity="0.35"/>
        <circle cx="50" cy="68" r="2.5" fill="#2E7D32" opacity="0.25"/>
      </svg>
    ),
  },
  {
    label: '04',
    title: 'Harvesting',
    desc: 'Hand-picked at peak ripeness by our expert farming community.',
    icon: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="46" stroke="#D7E8C8" strokeWidth="1" strokeDasharray="3 4" opacity="0.5"/>
        <path d="M44 20 C38 28 34 38 34 44 C34 48 36 52 40 54 L38 60 L50 60 L48 54 C52 52 54 48 54 44 C54 38 50 28 44 20Z" stroke="#2E7D32" strokeWidth="2" fill="#E8F5E9" fillOpacity="0.4"/>
        <path d="M56 20 C50 28 46 38 46 44 C46 48 48 52 52 54 L50 60 L62 60 L60 54 C64 52 66 48 66 44 C66 38 62 28 56 20Z" stroke="#2E7D32" strokeWidth="2" fill="#E8F5E9" fillOpacity="0.4"/>
        <path d="M44 44 C42 46 42 50 44 52" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M56 44 C58 46 58 50 56 52" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="38" y1="64" x2="62" y2="64" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="36" y1="68" x2="64" y2="68" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="40" y1="72" x2="60" y2="72" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="34" cy="36" r="2" fill="#4CAF50" opacity="0.3"/>
        <circle cx="66" cy="36" r="2" fill="#4CAF50" opacity="0.3"/>
      </svg>
    ),
  },
  {
    label: '05',
    title: 'Quality Inspection',
    desc: 'Rigorously tested for purity, nutrition, and safety compliance.',
    icon: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="46" stroke="#D7E8C8" strokeWidth="1" strokeDasharray="3 4" opacity="0.5"/>
        <circle cx="40" cy="44" r="18" stroke="#2E7D32" strokeWidth="2"/>
        <line x1="52" y1="56" x2="66" y2="70" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M34 44 C36 38 42 34 48 36" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M38 50 C40 54 46 56 50 52" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="62" cy="66" r="2" fill="#2E7D32" opacity="0.4"/>
        <circle cx="66" cy="62" r="2" fill="#2E7D32" opacity="0.4"/>
        <circle cx="34" cy="46" r="1.5" fill="#2E7D32" opacity="0.2"/>
        <circle cx="46" cy="38" r="1.5" fill="#2E7D32" opacity="0.2"/>
      </svg>
    ),
  },
  {
    label: '06',
    title: 'Hygienic Packaging',
    desc: 'Packed in sustainable, biodegradable materials for freshness.',
    icon: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="46" stroke="#D7E8C8" strokeWidth="1" strokeDasharray="3 4" opacity="0.5"/>
        <rect x="30" y="36" width="40" height="38" rx="3" stroke="#2E7D32" strokeWidth="2" fill="#E8F5E9" fillOpacity="0.3"/>
        <line x1="30" y1="46" x2="70" y2="46" stroke="#2E7D32" strokeWidth="1.5"/>
        <path d="M42 28 L50 22 L58 28" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="50" y1="22" x2="50" y2="36" stroke="#2E7D32" strokeWidth="1.5"/>
        <path d="M40 56 L48 64 L60 52" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M36 62 C36 58 38 56 42 56" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="34" cy="34" r="2" fill="#2E7D32" opacity="0.25"/>
        <circle cx="66" cy="34" r="2" fill="#2E7D32" opacity="0.25"/>
      </svg>
    ),
  },
  {
    label: '07',
    title: 'Fresh Delivery',
    desc: 'Straight from our farms to your doorstep with utmost care.',
    icon: (
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="46" stroke="#D7E8C8" strokeWidth="1" strokeDasharray="3 4" opacity="0.5"/>
        <rect x="18" y="54" width="46" height="22" rx="3" stroke="#2E7D32" strokeWidth="2" fill="#E8F5E9" fillOpacity="0.3"/>
        <path d="M64 54 L82 54 L82 72 L64 72 L64 54Z" stroke="#2E7D32" strokeWidth="2" fill="#E8F5E9" fillOpacity="0.3"/>
        <line x1="64" y1="60" x2="76" y2="60" stroke="#2E7D32" strokeWidth="1.5"/>
        <line x1="64" y1="66" x2="76" y2="66" stroke="#2E7D32" strokeWidth="1.5"/>
        <circle cx="28" cy="76" r="5" stroke="#2E7D32" strokeWidth="2"/>
        <circle cx="28" cy="76" r="2" fill="#2E7D32"/>
        <circle cx="60" cy="76" r="5" stroke="#2E7D32" strokeWidth="2"/>
        <circle cx="60" cy="76" r="2" fill="#2E7D32"/>
        <circle cx="36" cy="48" r="4" fill="#4CAF50" opacity="0.4"/>
        <circle cx="52" cy="44" r="3" fill="#4CAF50" opacity="0.3"/>
        <circle cx="44" cy="52" r="2.5" fill="#4CAF50" opacity="0.35"/>
        <path d="M36 48 C38 52 42 54 44 52" stroke="#2E7D32" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
  },
]

const DECORATIVES = [
  { type: 'leaf', className: 'top-[6%] left-[4%] w-6 h-6', delay: 0 },
  { type: 'leaf', className: 'top-[18%] right-[6%] w-5 h-5', delay: 1.2 },
  { type: 'circle', className: 'top-[35%] left-[8%] w-3 h-3', delay: 0.5 },
  { type: 'leaf', className: 'top-[50%] right-[4%] w-7 h-7', delay: 2.8 },
  { type: 'circle', className: 'top-[65%] left-[5%] w-4 h-4', delay: 1.8 },
  { type: 'leaf', className: 'top-[80%] right-[8%] w-5 h-5', delay: 3.5 },
  { type: 'circle', className: 'top-[92%] left-[10%] w-3 h-3', delay: 0.9 },
  { type: 'leaf', className: 'top-[40%] left-[92%] w-4 h-4', delay: 2.2 },
]

function DecorativeLeaf({ className, delay }) {
  return (
    <div className={`absolute pointer-events-none text-[#2E7D32]/10 ${className}`}
      style={{ animation: `leafFloat ${12 + Math.random() * 6}s ease-in-out ${delay}s infinite` }}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 6-2 9-7-1 3-1 6-1 6l2 1c.5-2 1-5 3-8 1-2-1-4-4-4z"/>
      </svg>
    </div>
  )
}

function DecorativeCircle({ className, delay }) {
  return (
    <div className={`absolute pointer-events-none rounded-full bg-[#4CAF50]/10 ${className}`}
      style={{ animation: `circlePulse ${8 + Math.random() * 4}s ease-in-out ${delay}s infinite` }} />
  )
}

export default function FarmTimeline() {
  const [visibleCards, setVisibleCards] = useState({})
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const cardRefs = useRef([])
  const connectorSvgRef = useRef(null)
  const pathRefs = useRef([])
  const dotRefs = useRef([])

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHeaderVisible(true) },
      { threshold: 0.25 }
    )
    if (headerRef.current) observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleCards(prev => ({ ...prev, [entry.target.dataset.index]: true }))
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )
    cardRefs.current.forEach(ref => { if (ref) observer.observe(ref) })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const total = rect.height + rect.top - window.innerHeight
      setScrollProgress(Math.max(0, Math.min(1, -rect.top / total)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const updateConnectors = useCallback(() => {
    const svg = connectorSvgRef.current
    if (!svg || !isDesktop) return
    const svgRect = svg.getBoundingClientRect()

    for (let i = 0; i < STEPS.length - 1; i++) {
      const card1 = cardRefs.current[i]
      const card2 = cardRefs.current[i + 1]
      const bgPath = pathRefs.current[i * 2]
      const fgPath = pathRefs.current[i * 2 + 1]
      if (!card1 || !card2 || !bgPath || !fgPath) continue

      const r1 = card1.getBoundingClientRect()
      const r2 = card2.getBoundingClientRect()

      const x1 = r1.left + r1.width / 2 - svgRect.left
      const y1 = r1.bottom - svgRect.top
      const x2 = r2.left + r2.width / 2 - svgRect.left
      const y2 = r2.top - svgRect.top

      const dy = Math.abs(y2 - y1) * 0.45
      const d = `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`

      bgPath.setAttribute('d', d)
      fgPath.setAttribute('d', d)
    }

    for (let i = 0; i < STEPS.length; i++) {
      const dot = dotRefs.current[i]
      const card = cardRefs.current[i]
      if (!dot || !card) continue
      const rect = card.getBoundingClientRect()
      dot.setAttribute('cx', rect.left + rect.width / 2 - svgRect.left)
      dot.setAttribute('cy', rect.bottom - svgRect.top)
    }
  }, [isDesktop])

  useEffect(() => {
    updateConnectors()
    window.addEventListener('resize', updateConnectors)
    return () => window.removeEventListener('resize', updateConnectors)
  }, [updateConnectors])

  return (
    <section ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F2] to-[#F7F9F4] py-12 lg:py-16">

      {/* Decorative floating elements */}
      {DECORATIVES.map((d, i) =>
        d.type === 'leaf'
          ? <DecorativeLeaf key={i} className={d.className} delay={d.delay} />
          : <DecorativeCircle key={i} className={d.className} delay={d.delay} />
      )}

      {/* Subtle background leaf pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232E7D32' fill-opacity='0.15'%3E%3Cpath d='M30 8L26 18h8z'/%3E%3Cpath d='M30 38L26 48h8z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef}
           className={`text-center mb-8 lg:mb-10 transition-all duration-1000 ease-out ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#2E7D32] bg-[#E8F5E9] px-3 py-1 rounded-full mb-2">
            Our Process
          </span>
          <h2 className="font-heading text-[clamp(1.4rem,3vw,2.4rem)] font-bold text-[#1B1B1B] leading-[1.1] tracking-tight">
            From Farm to Table
          </h2>
          <p className="max-w-2xl mx-auto mt-2 text-[13px] sm:text-sm text-[#666666] leading-relaxed">
            Every step is carefully managed to bring you the freshest organic products with uncompromising quality.
          </p>
        </div>

        {/* Timeline area */}
        <div className="relative">
          {/* Desktop curved connector SVG */}
          {isDesktop && (
            <svg ref={connectorSvgRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              style={{ overflow: 'visible' }}>
              {STEPS.slice(0, -1).map((_, i) => (
                <g key={i}>
                  <path ref={el => pathRefs.current[i * 2] = el}
                    stroke="#D7E8C8" strokeWidth="1.5" strokeDasharray="4 6" fill="none"
                    strokeLinecap="round" opacity="0.6" />
                  <path ref={el => pathRefs.current[i * 2 + 1] = el}
                    stroke="#4CAF50" strokeWidth="1.5" strokeDasharray="4 6" fill="none"
                    strokeLinecap="round"
                    style={{
                      strokeDashoffset: 2000 * (1 - scrollProgress),
                      strokeDasharray: 2000,
                      transition: 'stroke-dashoffset 0.1s linear',
                    }} />
                </g>
              ))}
              {STEPS.map((_, i) => (
                  <circle key={`dot-${i}`}
                    ref={el => dotRefs.current[i] = el}
                    r="3" fill="#2E7D32" stroke="white" strokeWidth="1.5"
                  className="transition-opacity duration-500"
                  style={{ opacity: visibleCards[i] ? 1 : 0 }} />
              ))}
            </svg>
          )}

          {/* Cards grid */}
          <div className="relative z-10 grid lg:grid-cols-2 gap-x-8 gap-y-8 lg:gap-x-12 lg:gap-y-12">
            {STEPS.map((step, i) => {
              const isLeft = i % 2 === 0
              return (
                <div key={i}
                  ref={el => cardRefs.current[i] = el}
                  data-index={i}
                  className={`transition-all duration-800 ease-out
                    ${isLeft ? 'lg:col-start-1' : 'lg:col-start-2'}
                    ${visibleCards[i] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.95]'}`}
                  style={{ transitionDelay: `${i * 80}ms` }}>
                  <div
                    className="group relative rounded-[16px] bg-white/85 backdrop-blur-md p-4 sm:p-5 lg:p-5
                      shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-[#D7E8C8]/70
                      transition-all duration-400
                      hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(46,125,50,0.1)]
                      hover:border-[#2E7D32]/40">
                    {/* Illustration */}
                    <div className="relative mb-3">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto lg:mx-0">
                        {step.icon}
                      </div>
                      <div className="absolute inset-0 rounded-full bg-[#2E7D32]/0 transition-all duration-500 group-hover:bg-[#2E7D32]/5 group-hover:scale-110"
                        style={{ filter: 'blur(8px)' }} />
                    </div>

                    {/* Step number */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-bold text-[#2E7D32] tracking-[0.08em] bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                        {step.label}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-[#D7E8C8] to-transparent" />
                    </div>

                    {/* Title */}
                    <h3 className="font-heading text-base sm:text-lg font-bold text-[#1B1B1B] leading-tight mb-1
                      transition-colors duration-300 group-hover:text-[#2E7D32]">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[12px] sm:text-[13px] text-[#666666] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg viewBox="0 0 1200 48" preserveAspectRatio="none" className="relative block w-full h-[16px] sm:h-[24px]">
          <path d="M0 24C200 48 400 0 600 24S1000 48 1200 24V48H0V24Z" fill="white" />
        </svg>
      </div>

      <style>{`
        @keyframes leafFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          25% { transform: translateY(-12px) rotate(6deg); opacity: 0.6; }
          75% { transform: translateY(6px) rotate(-4deg); opacity: 0.4; }
        }
        @keyframes circlePulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
        .duration-400 { transition-duration: 400ms; }
        .duration-800 { transition-duration: 800ms; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  )
}
