const FEATURES = [
  { icon: '🌿', title: '100% Organic', desc: 'Certified organic products grown without chemicals or pesticides.' },
  { icon: '🚜', title: 'Farm Fresh', desc: 'Harvested at peak ripeness and delivered directly to your doorstep.' },
  { icon: '🔬', title: 'Lab Tested', desc: 'Every batch is tested for purity, nutrition, and safety.' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Carefully packed and delivered within 3-5 business days.' },
  { icon: '♻', title: 'Sustainable', desc: 'Eco-friendly farming practices that protect our planet.' },
  { icon: '❤️', title: 'Chemical Free', desc: 'No artificial additives, preservatives, or harmful chemicals.' },
]

export default function WhyChooseUs() {
  return (
    <section className="py-10 lg:py-14 bg-white">
      <div className="section-container">
        <div className="text-center mb-8">
          <span className="text-micro font-semibold tracking-[0.12em] uppercase text-green-600">Why Choose Us</span>
          <h2 className="mt-1 text-h2 font-bold">Nature's Best, Delivered to You</h2>
          <p className="text-body-sm text-muted mt-1 max-w-xl mx-auto">We bring you the purest organic products straight from tribal farmlands.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className="rounded-xl border border-border bg-off-white p-4 sm:p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-green-200">
              <span className="inline-block text-2xl sm:text-3xl mb-2">{f.icon}</span>
              <h3 className="text-caption font-bold text-ink mb-1">{f.title}</h3>
              <p className="text-micro text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
