"use client";

const sizes = ["S", "M", "L", "XL", "XXL"];

export default function SizeSelector({ selectedSize, onSelectSize }) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-3">
        Select Size
      </p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSelectSize(size)}
            className={`w-12 h-12 rounded-lg text-sm font-medium transition-all duration-200 border ${
              selectedSize === size
                ? "bg-primary/10 border-primary text-primary"
                : "bg-surface-light border-border text-text-muted hover:border-text-dim hover:text-foreground"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
