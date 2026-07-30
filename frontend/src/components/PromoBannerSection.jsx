import { Link } from 'react-router-dom'

const DEFAULT_PROMOS = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-14 h-14 sm:w-16 sm:h-16">
        <rect width="48" height="48" rx="12" fill="rgba(46,125,50,0.15)" />
        <path d="M14 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 18V12m0 0l-3 3m3-3l3 3" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="16" y="28" width="16" height="10" rx="2" stroke="#2E7D32" strokeWidth="1.5" />
        <path d="M20 28v-2a4 4 0 018 0v2" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="34" r="1.5" fill="#2E7D32" />
        <path d="M6 38h36" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
    badge: 'Free Delivery',
    title: 'FREE DELIVERY',
    subtitle: 'On Orders Above ₹499',
    body: 'Freshly Packed Every Day',
    cta: 'Shop Now',
    link: '/products',
    bg: 'from-[#E8F5E9] to-white',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-14 h-14 sm:w-16 sm:h-16">
        <rect width="48" height="48" rx="12" fill="rgba(46,125,50,0.12)" />
        <path d="M16 16h16l3 12H13l3-12z" stroke="#2E7D32" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M13 28h22l-1 6H14l-1-6z" stroke="#2E7D32" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="18" cy="36" r="2.5" stroke="#2E7D32" strokeWidth="1.5" />
        <circle cx="30" cy="36" r="2.5" stroke="#2E7D32" strokeWidth="1.5" />
        <path d="M28 20h-8" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M29 24h-10" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <text x="34" y="14" fontSize="7" fontWeight="bold" fill="#F5A623">30%</text>
      </svg>
    ),
    badge: 'Save Big',
    title: 'Save up to 30%',
    subtitle: 'Healthy Family Combos',
    body: 'Limited Time Offer',
    cta: 'Explore Combos',
    link: '/combos',
    bg: 'from-amber-50 to-white',
  },
]

export default function PromoBannerSection({ promos = [] }) {
  const items = promos.length >= 2 ? promos : DEFAULT_PROMOS

  return (
    <section className="py-6 sm:py-8 bg-[#FAFDF8]">
      <div className="section-container">
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {items.map((item, i) => (
            <Link key={i} to={item.link}
              className={`group relative rounded-2xl overflow-hidden bg-gradient-to-br ${item.bg} border border-[#D7E8C8] p-5 sm:p-6 flex items-center gap-4 sm:gap-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(46,125,50,0.12)]`}>
              {/* Icon */}
              <div className="shrink-0">{item.icon}</div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-full bg-[#2E7D32]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#2E7D32] uppercase tracking-wider mb-1.5">{item.badge}</span>
                <h3 className="font-heading text-h4 sm:text-h3 font-bold text-[#1B4332] leading-tight">{item.title}</h3>
                <p className="text-body-sm font-semibold text-[#2E7D32] mt-0.5">{item.subtitle}</p>
                <p className="text-caption text-[#5A7A60] mt-0.5">{item.body}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-micro font-bold text-[#2E7D32] transition-all group-hover:gap-1.5">
                  {item.cta}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
