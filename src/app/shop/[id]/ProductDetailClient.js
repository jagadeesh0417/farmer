"use client";
import { useState } from "react";
import ImageGallery from "@/components/ImageGallery";
import SizeSelector from "@/components/SizeSelector";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { FiShoppingCart, FiTruck, FiRefreshCw, FiShield } from "react-icons/fi";

export default function ProductDetailClient({ product, relatedProducts }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      quantity,
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
      <div>
        <ImageGallery images={product.images} />
      </div>
      <div className="space-y-6">
        <div>
          <span className="text-xs tracking-widest uppercase text-primary">{product.category}</span>
          <h1 className="font-display text-4xl md:text-5xl mt-2">{product.name}</h1>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-3xl font-semibold">{product.price.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</span>
            {product.compareAt && (
              <span className="text-xl text-text-muted line-through">{product.compareAt.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</span>
            )}
          </div>
        </div>

        <p className="text-text-muted leading-relaxed">{product.description}</p>

        <div>
          <h3 className="text-sm font-medium mb-3">Select Size</h3>
          <SizeSelector sizes={product.sizes} selectedSize={selectedSize} onSelectSize={setSelectedSize} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center border border-border rounded">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-surface-light transition-colors">-</button>
            <span className="px-4 py-2 border-x border-border">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-surface-light transition-colors">+</button>
          </div>
        </div>

        <button onClick={handleAddToCart} className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded font-medium flex items-center justify-center gap-2 transition-all hover:gap-3">
          <FiShoppingCart size={20} /> Add to Cart
        </button>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center text-text-muted text-sm">
            <FiTruck className="mx-auto mb-2" size={20} />
            <span>Free Shipping</span>
          </div>
          <div className="text-center text-text-muted text-sm">
            <FiRefreshCw className="mx-auto mb-2" size={20} />
            <span>Easy Returns</span>
          </div>
          <div className="text-center text-text-muted text-sm">
            <FiShield className="mx-auto mb-2" size={20} />
            <span>Secure Payment</span>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="md:col-span-2 mt-16">
          <h2 className="font-display text-3xl mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
