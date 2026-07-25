"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-surface-light">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          loading="lazy"
        />

        <div
          className={`absolute inset-0 bg-primary/20 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-white text-sm font-semibold tracking-wider uppercase bg-background/80 px-5 py-2.5 rounded-md backdrop-blur-sm">
            Quick View
          </span>
        </div>

        {product.category && (
          <span className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-text-muted text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded">
            {product.category}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors duration-200">
          {product.name}
        </h3>
        <p className="text-sm font-semibold text-primary">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
