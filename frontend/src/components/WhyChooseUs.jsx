import { memo } from 'react'

const features = [
  { icon: '🌿', title: '100% Organic', desc: 'Certified organic products grown without chemicals or pesticides.' },
  { icon: '🚜', title: 'Farm Fresh', desc: 'Harvested at peak ripeness and delivered directly to your doorstep.' },
  { icon: '🔬', title: 'Lab Tested', desc: 'Every batch is tested for purity, nutrition, and safety.' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Carefully packed and delivered within 3-5 business days.' },
  { icon: '♻', title: 'Sustainable', desc: 'Eco-friendly farming practices that protect our planet.' },
  { icon: '❤️', title: 'Chemical Free', desc: 'No artificial additives, preservatives, or harmful chemicals.' },
]

function WhyChooseUs() {
  return (
    <section className="py-12 lg:py-16 bg-[#FAFDF8]">
      <div className="section-container">
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-micro font-semibold tracking-[0.12em] uppercase text-[#2E7D32]">Why Choose Us</span>
          <h2 className="mt-1 font-heading text-h2 font-bold text-[#1B4332]">Nature's Best, Delivered to You</h2>
          <p className="mt-2 text-body-sm text-[#5A7A60] max-w-lg mx-auto">We bring you the purest organic products straight from tribal farmlands.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {features.map((f, i) => (
            <div key={i}
              className="group rounded-2xl bg-white border border-[#D7E8C8] p-4 sm:p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(46,125,50,0.12)] hover:border-[#4CAF50]">
              <div className="text-2xl sm:text-3xl mb-2.5 sm:mb-3 transition-transform duration-300 group-hover:scale-110">
                {f.icon}
              </div>
              <h3 className="text-caption sm:text-body-sm font-bold text-[#1B4332] mb-1">{f.title}</h3>
              <p className="text-micro text-[#5A7A60] leading-snug hidden sm:block">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default memo(WhyChooseUs)
