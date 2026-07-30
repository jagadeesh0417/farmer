import { Link } from 'react-router-dom'

const DEFAULT_BANNERS = [
  { title: 'Buy 2 Get 1 Free', subtitle: 'on all Spices & Seasonings', body: 'Stock up your kitchen with wild-harvested forest spices at unbeatable value.', cta: 'Shop Spices', link: '/products?category=spices', imageFirst: true },
  { title: 'Premium Millets', subtitle: 'Traditional Grains Collection', body: 'Gluten-free, protein-rich millets straight from tribal farms. Nature\'s original superfood.', cta: 'Explore Millets', link: '/products?category=millets', imageFirst: false },
  { title: 'Cold Pressed Oils', subtitle: 'Wood-Pressed & Chemical-Free', body: 'Traditional cold-pressed oils made the authentic way. No heat, no chemicals, pure goodness.', cta: 'Shop Oils', link: '/products?category=oils', imageFirst: true },
  { title: 'Immunity Boosters', subtitle: 'Natural Wellness Collection', body: 'Turmeric, honey, herbal teas and more — nature\'s best remedies for everyday wellness.', cta: 'Explore', link: '/products', imageFirst: false },
]

export default function MidPageBanner({ banners = [] }) {
  const items = banners.length > 0 ? banners : DEFAULT_BANNERS

  return (
    <section className="py-8 lg:py-12 bg-[#FAFDF8]">
      <div className="section-container space-y-6 sm:space-y-8">
        {items.slice(0, 4).map((banner, i) => (
          <Link key={i} to={banner.link}
            className={`group flex flex-col ${banner.imageFirst ? 'md:flex-row' : 'md:flex-row-reverse'} items-stretch gap-0 rounded-2xl overflow-hidden bg-white border border-[#D7E8C8] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(46,125,50,0.1)]`}>
            {/* Image side */}
            <div className="relative w-full md:w-[45%] aspect-[16/9] md:aspect-auto md:min-h-[260px] bg-gradient-to-br from-[#E8F5E9] to-[#F4F9EF] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl sm:text-7xl opacity-20 select-none">
                  {i === 0 && '🌶'}
                  {i === 1 && '🌾'}
                  {i === 2 && '🫒'}
                  {i === 3 && '🍯'}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
            </div>

            {/* Text side */}
            <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <span className="inline-flex self-start rounded-full bg-[#2E7D32]/10 px-3 py-1 text-[10px] font-bold text-[#2E7D32] uppercase tracking-wider mb-2">
                {i === 0 && 'Limited Offer'}
                {i === 1 && 'Superfood'}
                {i === 2 && 'Premium'}
                {i === 3 && 'Wellness'}
              </span>
              <h3 className="font-heading text-h3 sm:text-h2 font-bold text-[#1B4332]">{banner.title}</h3>
              <p className="text-body-sm font-semibold text-[#2E7D32] mt-1">{banner.subtitle}</p>
              <p className="text-body-sm text-[#5A7A60] mt-2 max-w-md leading-relaxed">{banner.body}</p>
              <span className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-[#2E7D32] px-5 py-2 text-caption font-bold text-white shadow-md transition-all group-hover:bg-[#1B5E20] group-hover:shadow-lg">
                {banner.cta}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
