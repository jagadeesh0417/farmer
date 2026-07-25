"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import { FiFilter, FiGrid, FiList } from "react-icons/fi";

export default function ShopContent({ products, categories, initialCategory, initialSort }) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts] = useState(products);

  return (
    <div className="flex gap-8">
      <div className={`w-64 flex-shrink-0 ${showFilters ? "block" : "hidden"} lg:block`}>
        <FilterSidebar categories={categories} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 text-sm text-text-muted hover:text-foreground">
            <FiFilter /> Filters
          </button>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>Sort:</span>
            <select defaultValue={initialSort} onChange={(e) => { router.push(`?sort=${e.target.value}`); }} className="bg-surface border border-border rounded px-3 py-1.5 text-foreground text-sm">
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-text-muted">
            <p className="text-2xl mb-2">No products found</p>
            <p>Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
