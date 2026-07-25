"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] rounded-lg bg-surface-light flex items-center justify-center">
        <span className="text-text-dim text-sm">No images available</span>
      </div>
    );
  }

  const mainImage = images[selectedIndex];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-surface-light group cursor-zoom-in">
        <Image
          src={mainImage}
          alt="Product image"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-150"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-16 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                index === selectedIndex
                  ? "border-primary opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`Product thumbnail ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
