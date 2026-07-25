"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";

const categories = [
  "Shirts",
  "Polos",
  "Casual Wear",
  "Formal",
  "Ethnic",
  "New Arrivals",
];

const sizes = ["S", "M", "L", "XL", "XXL"];

const colors = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#ffffff" },
  { name: "Navy", hex: "#1a2744" },
  { name: "Gray", hex: "#6b7280" },
  { name: "Blue", hex: "#0066FF" },
  { name: "Green", hex: "#059669" },
];

export default function FilterSidebar({ onClose }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  };

  const handleApply = () => {
    const filters = {
      categories: selectedCategories,
      sizes: selectedSizes,
      colors: selectedColors,
      priceRange,
    };
    console.log("Applied filters:", filters);
  };

  const handleClear = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 5000]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-foreground transition-colors"
            aria-label="Close filters"
          >
            <FiX className="text-lg" />
          </button>
        )}
      </div>

      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="w-4 h-4 rounded border-border bg-surface-light text-primary focus:ring-primary/30 focus:ring-offset-0 cursor-pointer accent-primary"
              />
              <span className="text-sm text-text-muted group-hover:text-foreground transition-colors duration-200">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Size</h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`w-10 h-10 rounded-lg text-xs font-medium border transition-all duration-200 ${
                selectedSizes.includes(size)
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-surface-light border-border text-text-muted hover:border-text-dim"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">
          Price Range
        </h4>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], Number(e.target.value)])
            }
            className="w-full h-1.5 rounded-full appearance-none bg-surface-lighter cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex items-center justify-between text-xs text-text-dim">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Color</h4>
        <div className="flex flex-wrap gap-2.5">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              title={color.name}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                selectedColors.includes(color.name)
                  ? "border-primary scale-110"
                  : "border-border hover:border-text-dim"
              }`}
              style={{
                backgroundColor: color.hex,
                ...(color.name === "White" ? { borderColor: "#333" } : {}),
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleApply}
          className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg transition-all duration-200"
        >
          Apply
        </button>
        <button
          onClick={handleClear}
          className="flex-1 py-2.5 border border-border hover:border-text-dim text-text-muted hover:text-foreground text-sm font-medium rounded-lg transition-all duration-200"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
