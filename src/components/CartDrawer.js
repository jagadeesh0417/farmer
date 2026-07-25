"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer({ isOpen, onClose }) {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-surface border-l border-border z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Shopping Cart
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 text-text-muted hover:text-foreground transition-colors duration-200 rounded-full hover:bg-surface-light"
                aria-label="Close cart"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mb-4">
                    <FiX className="text-2xl text-text-dim" />
                  </div>
                  <p className="text-text-muted text-sm">Your cart is empty</p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="mt-4 text-sm text-primary hover:text-primary-light transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={`${item.id}-${item.size}-${index}`}
                    className="flex gap-3 pb-4 border-b border-border/50 last:border-0"
                  >
                    <div className="relative w-20 h-24 flex-shrink-0 rounded-md overflow-hidden bg-surface-light">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-text-dim mt-0.5">
                        Size: {item.size}
                      </p>
                      <p className="text-sm font-semibold text-primary mt-1">
                        {formatPrice(item.price)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 border border-border rounded-md">
                          <button
                            onClick={() =>
                              updateQuantity(index, item.quantity - 1)
                            }
                            className="p-1.5 text-text-muted hover:text-foreground transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus className="text-xs" />
                          </button>
                          <span className="w-7 text-center text-xs font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(index, item.quantity + 1)
                            }
                            className="p-1.5 text-text-muted hover:text-foreground transition-colors"
                            aria-label="Increase quantity"
                          >
                            <FiPlus className="text-xs" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(index)}
                          className="p-1.5 text-text-dim hover:text-red-400 transition-colors"
                          aria-label="Remove item"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Subtotal</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                <Link
                  href="/cart"
                  onClick={onClose}
                  className="block w-full text-center py-3 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all duration-200"
                >
                  View Cart
                </Link>

                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full text-center py-3 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-all duration-200"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
