"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-screen min-h-[600px] max-h-[900px] flex items-center justify-center overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y, opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center parallax-bg"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1602810319428-019690571b5b?w=1920&q=80')",
          }}
        />
      </motion.div>

      <div className="relative z-20 max-w-5xl mx-auto px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-primary text-sm sm:text-base font-medium tracking-[0.3em] uppercase mb-6"
        >
          ARHUU Outfits
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display text-foreground leading-tight tracking-tight"
        >
          PREMIUM FASHION
          <br />
          <span className="text-primary">FOR EVERY OCCASION</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 text-base sm:text-lg text-text-muted max-w-xl mx-auto"
        >
          Trendy Styles. Best Quality. ARHUU Outfits.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-lg font-semibold text-sm tracking-wider uppercase transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
          >
            Explore Collection
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <div className="w-6 h-10 border-2 border-border-light rounded-full flex justify-center">
          <motion.div
            className="w-1.5 h-3 bg-primary rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
