"use client";

import { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "./ProductCard";

export default function ProductCarousel({ products, title }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState);
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, []);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="w-full">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display text-foreground">{title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="p-2 rounded-full border border-border text-text-muted hover:text-foreground hover:border-foreground transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll left"
            >
              <FiChevronLeft className="text-lg" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="p-2 rounded-full border border-border text-text-muted hover:text-foreground hover:border-foreground transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll right"
            >
              <FiChevronRight className="text-lg" />
            </button>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[220px] sm:w-[250px] snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
