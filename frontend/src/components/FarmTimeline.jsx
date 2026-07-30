const STEPS = [
  { icon: '🌱', title: 'Seeds', desc: 'Heirloom, non-GMO seeds selected by tribal farmers' },
  { icon: '👨‍🌾', title: 'Organic Farming', desc: 'Grown naturally with compost, no chemicals' },
  { icon: '🌾', title: 'Harvesting', desc: 'Hand-picked at peak ripeness by expert farmers' },
  { icon: '🧪', title: 'Lab Testing', desc: 'Tested for purity, nutrition & safety compliance' },
  { icon: '📦', title: 'Eco Packaging', desc: 'Packed in sustainable, biodegradable materials' },
  { icon: '🚚', title: 'Delivered Fresh', desc: 'Straight from farm to your doorstep' },
]

export default function FarmTimeline() {
  return (
    <section className="py-10 lg:py-14 bg-white">
      <div className="section-container">
        <div className="text-center mb-8">
          <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Our Process</span>
          <h2 className="mt-1 text-h2 font-bold">From Farm to Table</h2>
          <p className="text-body-sm text-muted mt-1 max-w-xl mx-auto">Every step is carefully managed to bring you the freshest organic products.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 sm:gap-6">
          {STEPS.map((step, i) => (
            <div key={i} className="text-center relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] h-px border-t border-dashed border-green-200" />
              )}
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center text-caption font-bold mx-auto mb-3 relative z-10">{i + 1}</div>
              <span className="inline-block text-3xl mb-1">{step.icon}</span>
              <h3 className="text-caption font-bold text-ink mb-0.5">{step.title}</h3>
              <p className="text-micro text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
