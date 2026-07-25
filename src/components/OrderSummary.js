"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export default function OrderSummary({ items, total }) {
  const shipping = total >= 999 ? 0 : 99;
  const grandTotal = total + shipping;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Order Summary</h3>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {items.map((item, index) => (
          <div
            key={`${item.id}-${item.size}-${index}`}
            className="flex gap-3 pb-3 border-b border-border/50 last:border-0"
          >
            <div className="relative w-14 h-16 flex-shrink-0 rounded-md overflow-hidden bg-surface-light">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground truncate">
                {item.name}
              </h4>
              <p className="text-xs text-text-dim">
                Size: {item.size} | Qty: {item.quantity}
              </p>
              <p className="text-sm font-semibold text-primary mt-0.5">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-sm text-text-muted text-center py-4">
          Your cart is empty
        </p>
      )}

      {items.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Subtotal</span>
            <span className="text-foreground font-medium">
              {formatPrice(total)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Shipping</span>
            <span className="text-foreground font-medium">
              {shipping === 0 ? (
                <span className="text-green-400">FREE</span>
              ) : (
                formatPrice(shipping)
              )}
            </span>
          </div>
          {shipping > 0 && (
            <p className="text-xs text-text-dim">
              Free shipping on orders above {formatPrice(999)}
            </p>
          )}
          <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
            <span className="text-base font-semibold text-foreground">
              Total
            </span>
            <span className="text-lg font-bold text-foreground">
              {formatPrice(grandTotal)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
