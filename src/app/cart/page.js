"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag } from "react-icons/fi";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto text-center">
        <FiShoppingBag size={64} className="mx-auto mb-6 text-text-muted" />
        <h1 className="font-display text-4xl mb-4">Your Cart is Empty</h1>
        <p className="text-text-muted mb-8">Looks like you haven't added anything yet.</p>
        <Link href="/shop" className="inline-block bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
      <h1 className="font-display text-4xl md:text-5xl mb-10">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}`} className="flex gap-4 bg-surface border border-border rounded-lg p-4">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-surface-light rounded flex-shrink-0 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{item.name}</h3>
                <p className="text-sm text-text-muted">Size: {item.size}</p>
                <p className="text-primary font-medium mt-1">{item.price.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <button onClick={() => removeFromCart(item.id, item.size)} className="text-text-muted hover:text-red-400 transition-colors">
                  <FiTrash2 size={18} />
                </button>
                <div className="flex items-center border border-border rounded">
                  <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="px-3 py-1 hover:bg-surface-light transition-colors text-sm"><FiMinus size={14} /></button>
                  <span className="px-3 py-1 border-x border-border text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="px-3 py-1 hover:bg-surface-light transition-colors text-sm"><FiPlus size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-surface border border-border rounded-lg p-6 h-fit sticky top-28">
          <h3 className="text-lg font-medium mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Subtotal</span>
              <span>{cartTotal.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Shipping</span>
              <span className="text-green-400">Free</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-medium text-lg">
              <span>Total</span>
              <span>{cartTotal.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</span>
            </div>
          </div>
          <Link href="/checkout" className="mt-6 block w-full bg-primary hover:bg-primary-hover text-white text-center py-3 rounded transition-colors">
            Proceed to Checkout
          </Link>
          <Link href="/shop" className="mt-3 flex items-center justify-center gap-2 text-text-muted hover:text-foreground text-sm transition-colors">
            <FiArrowLeft size={14} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
