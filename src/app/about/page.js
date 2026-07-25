import Link from "next/link";
import { FiStar } from "react-icons/fi";

export default function About() {
  return (
    <div className="pt-24 pb-20">
      <div className="relative h-[50vh] bg-gradient-to-b from-surface to-background flex items-center justify-center">
        <div className="text-center px-4">
          <FiStar size={48} className="text-primary mx-auto mb-4" />
          <h1 className="font-display text-5xl md:text-7xl">Our Story</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 space-y-8">
        <section>
          <h2 className="font-display text-3xl mb-4">Made for Every Occasion</h2>
          <p className="text-text-muted leading-relaxed text-lg">
            ARHUU Outfits was born from a simple belief: every man deserves to look his best, every day. 
            Founded by Harshad in Railway Kodur, Andhra Pradesh, ARHUU is a premium menswear brand that 
            bridges the gap between casual comfort and formal sophistication.
          </p>
        </section>
        <section>
          <h2 className="font-display text-3xl mb-4">The Founder</h2>
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-xl font-medium">Harshad</h3>
            <p className="text-text-muted mt-2 leading-relaxed">
              What started as a passion for fashion has grown into a brand that represents quality, 
              style, and affordability. Harshad&apos;s vision is to make premium fashion accessible to 
              every man, with designs that transition seamlessly from work to weekend.
            </p>
          </div>
        </section>
        <section>
          <h2 className="font-display text-3xl mb-4">Why ARHUU?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Premium Quality", desc: "Carefully selected fabrics and meticulous craftsmanship in every piece." },
              { title: "Trendy Designs", desc: "Contemporary styles that keep you ahead of the fashion curve." },
              { title: "Perfect Fit", desc: "Designed for the modern Indian man, with sizes that fit just right." },
            ].map((item) => (
              <div key={item.title} className="bg-surface border border-border rounded-lg p-6 text-center">
                <h3 className="font-medium mb-2">{item.title}</h3>
                <p className="text-text-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="text-center pt-8">
          <Link href="/shop" className="inline-block bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded transition-colors">
            Explore Our Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
