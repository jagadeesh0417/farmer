import { memo } from 'react'

const steps = [
  { icon: '🌱', title: 'Seeds', subtitle: 'Heirloom, non-GMO seeds selected by tribal farmers' },
  { icon: '👨‍🌾', title: 'Organic Farming', subtitle: 'Grown naturally with compost, no chemicals' },
  { icon: '🌾', title: 'Harvesting', subtitle: 'Hand-picked at peak ripeness by expert farmers' },
  { icon: '🧪', title: 'Lab Testing', subtitle: 'Tested for purity, nutrition & safety compliance' },
  { icon: '📦', title: 'Eco Packaging', subtitle: 'Packed in sustainable, biodegradable materials' },
  { icon: '🚚', title: 'Delivered Fresh', subtitle: 'Straight from farm to your doorstep' },
]

function FarmTimeline() {
  return (
    <section className="py-12 lg:py-16 bg-[#FAFDF8] overflow-hidden">
      <div className="section-container">
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-micro font-semibold tracking-[0.12em] uppercase text-[#2E7D32]">Our Process</span>
          <h2 className="mt-1 font-heading text-h2 font-bold text-[#1B4332]">From Farm to Table</h2>
          <p className="mt-2 text-body-sm text-[#5A7A60] max-w-lg mx-auto">Every step is carefully managed to bring you the freshest organic products.</p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#C8E6C9] via-[#4CAF50] to-[#2E7D32]" />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {steps.map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group">
                {/* Step number */}
                <div className="absolute -top-2 -right-1 sm:-top-3 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#2E7D32] text-white text-micro font-bold flex items-center justify-center shadow-md z-10">
                  {i + 1}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-white border-2 border-[#D7E8C8] flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#4CAF50] group-hover:shadow-[0_8px_20px_rgba(76,175,80,0.2)]">
                  {s.icon}
                </div>

                {/* Title */}
                <h3 className="mt-2 sm:mt-3 text-caption sm:text-body-sm font-bold text-[#1B4332]">{s.title}</h3>
                <p className="text-micro text-[#5A7A60] leading-snug mt-0.5 hidden sm:block">{s.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default memo(FarmTimeline)
