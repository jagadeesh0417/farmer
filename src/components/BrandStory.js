"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

export default function BrandStory() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative aspect-[4/5] rounded-lg overflow-hidden bg-surface-light"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=800&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-white/60 text-xs font-mono">
              Harshad — Founder, ARHUU Outfits
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="space-y-6"
        >
          <p className="text-primary text-xs font-medium tracking-[0.2em] uppercase">
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-foreground leading-tight">
            Made for{" "}
            <span className="text-primary">Every Occasion</span>
          </h2>
          <p className="text-text-muted text-sm leading-relaxed">
            ARHUU was founded by Harshad in Railway Kodur, Andhra Pradesh with a vision
            to provide premium fashion that doesn&apos;t break the bank. Every piece is
            designed for the modern man who values style, comfort, and quality.
          </p>
          <p className="text-text-muted text-sm leading-relaxed">
            From sharp shirts to relaxed casual wear, each garment is crafted with
            attention to detail — because we believe you deserve to look your best
            every single day, without compromise.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-light transition-colors duration-200 group"
          >
            Know More About Us
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
