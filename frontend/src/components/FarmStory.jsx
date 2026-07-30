import { memo } from 'react'
import { Link } from 'react-router-dom'

const FARMER_IMAGE = 'https://res.cloudinary.com/drp7pfa2w/image/upload/f_auto,q_auto,w_800/haifarmer/farmer-story'

function FarmStory() {
  return (
    <section className="py-12 lg:py-16 bg-white overflow-hidden">
      <div className="section-container">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden relative">
              <img src={FARMER_IMAGE} alt="Tribal farmer harvesting"
                className="w-full aspect-[4/5] object-cover object-center"
                loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/40 to-transparent" />
            </div>
            {/* Badge overlay */}
            <div className="absolute -bottom-4 -right-4 bg-[#2E7D32] rounded-2xl p-4 sm:p-5 shadow-xl hidden sm:block">
              <p className="text-h3 font-bold text-white">50+</p>
              <p className="text-caption text-white/80">Tribal Communities</p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-5 sm:space-y-6">
            <div>
              <span className="text-micro font-semibold tracking-[0.12em] uppercase text-[#2E7D32]">Our Story</span>
              <h2 className="mt-1 font-heading text-h2 font-bold text-[#1B4332]">From Their Fields to Your Table</h2>
            </div>

            <div className="space-y-3 text-body-sm text-[#5A7A60] leading-relaxed">
              <p>
                Our farmers grow every crop naturally without harmful chemicals, using traditional methods passed down through generations. Nestled in the heart of tribal regions, they nurture the soil with organic compost and harvest with respect for nature.
              </p>
              <p>
                We partner directly with these communities, ensuring fair prices and sustainable livelihoods. Every product you buy supports a farmer's family and preserves ancient agricultural wisdom.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/about"
                className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-6 py-2.5 text-caption font-bold text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5">
                Learn More About Us
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/farmers"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#D7E8C8] px-6 py-2.5 text-caption font-bold text-[#2E7D32] transition-all hover:bg-[#F4F9EF] hover:border-[#4CAF50]">
                Meet Our Farmers
              </Link>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { value: '500+', label: 'Farmers' },
                { value: '12K+', label: 'Acres Organic' },
                { value: '50+', label: 'Products' },
              ].map((s, i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-[#F4F9EF] border border-[#D7E8C8]">
                  <p className="font-heading text-h4 font-bold text-[#2E7D32]">{s.value}</p>
                  <p className="text-micro text-[#5A7A60]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default memo(FarmStory)
