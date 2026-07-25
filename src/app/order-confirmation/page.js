"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiCheckCircle, FiPackage } from "react-icons/fi";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <FiCheckCircle size={40} className="text-green-400" />
      </div>
      <h1 className="font-display text-4xl md:text-5xl mb-4">Order Placed!</h1>
      <p className="text-text-muted text-lg mb-2">Thank you for your order.</p>
      {orderNumber && (
        <p className="text-sm text-text-muted mb-8">
          Order Number: <span className="text-primary font-mono">{orderNumber}</span>
        </p>
      )}
      <p className="text-text-muted mb-8">You'll receive a confirmation email shortly.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/order-tracking" className="inline-flex items-center gap-2 bg-surface border border-border hover:bg-surface-light px-8 py-3 rounded transition-colors">
          <FiPackage /> Track Order
        </Link>
        <Link href="/shop" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmation() {
  return (
    <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
      <Suspense fallback={<div className="text-text-muted">Loading...</div>}>
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
