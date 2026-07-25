"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

const categories = [
  {
    name: "Shirts",
    slug: "shirts",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
    description: "Premium cotton & linen shirts",
  },
  {
    name: "Polos",
    slug: "polos",
    image:
      "https://images.unsplash.com/photo-1594930328603-0e740a9d0a1a?w=600&q=80",
    description: "Classic & modern polo tees",
  },
  {
    name: "Casual Wear",
    slug: "casual-wear",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    description: "Everyday comfort essentials",
  },
  {
    name: "New Arrivals",
    slug: "new-arrivals",
    image:
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80",
    description: "Fresh drops every week",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function CategorySection() {
  return (
    <section className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-display text-foreground sm:text-4xl">
          Shop by Category
        </h2>
        <p className="mt-3 text-text-muted text-sm max-w-md mx-auto">
          Find your perfect fit across our curated collections
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {categories.map((cat) => (
          <motion.div key={cat.slug} variants={cardVariants}>
            <Link
              href={`/shop?category=${cat.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-lg"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url('${cat.image}')` }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-lg font-bold text-white mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-white/60 mb-3">{cat.description}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary group-hover:text-white transition-colors duration-200">
                  Shop Now <FiArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
