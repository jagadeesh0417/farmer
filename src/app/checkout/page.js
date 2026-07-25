"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import ShippingForm from "@/components/ShippingForm";
import OrderSummary from "@/components/OrderSummary";
import toast from "react-hot-toast";
import { FiCreditCard, FiSmartphone, FiDollarSign } from "react-icons/fi";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState("shipping");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shippingInfo, setShippingInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push("/cart");
    }
  }, [mounted, items, router]);

  if (!mounted || items.length === 0) return null;

  const handleShippingSubmit = (data) => {
    setShippingInfo(data);
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        ...shippingInfo,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, size: i.size, quantity: i.quantity })),
        subtotal: cartTotal,
        shipping: 0,
        total: cartTotal,
        paymentMethod,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const order = await res.json();

      if (paymentMethod === "cod") {
        clearCart();
        router.push(`/order-confirmation?orderNumber=${order.orderNumber}`);
        return;
      }

      // Payment gateway integration placeholder
      const paymentRes = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cartTotal, paymentMethod }),
      });
      const paymentData = await paymentRes.json();

      if (paymentData.success) {
        clearCart();
        router.push(`/order-confirmation?orderNumber=${order.orderNumber}`);
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
      <h1 className="font-display text-4xl md:text-5xl mb-10">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          {/* Progress Steps */}
          <div className="flex items-center gap-4 text-sm">
            <div className={`flex items-center gap-2 ${step === "shipping" ? "text-primary" : "text-text-muted"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "shipping" ? "bg-primary text-white" : "bg-surface-light text-text-muted"}`}>1</div>
              <span>Shipping</span>
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className={`flex items-center gap-2 ${step === "payment" ? "text-primary" : "text-text-muted"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "payment" ? "bg-primary text-white" : "bg-surface-light text-text-muted"}`}>2</div>
              <span>Payment</span>
            </div>
          </div>

          {step === "shipping" && <ShippingForm onSubmit={handleShippingSubmit} />}

          {step === "payment" && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: "cod", label: "Cash on Delivery", icon: FiDollarSign, desc: "Pay when you receive" },
                  { value: "card", label: "Credit/Debit Card", icon: FiCreditCard, desc: "Secure card payment" },
                  { value: "upi", label: "UPI", icon: FiSmartphone, desc: "Google Pay, PhonePe, Paytm" },
                ].map((method) => (
                  <button key={method.value} onClick={() => setPaymentMethod(method.value)} className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-colors text-left ${paymentMethod === method.value ? "border-primary bg-primary/5" : "border-border hover:border-border-light"}`}>
                    <method.icon size={24} className={paymentMethod === method.value ? "text-primary" : "text-text-muted"} />
                    <div>
                      <p className="font-medium">{method.label}</p>
                      <p className="text-sm text-text-muted">{method.desc}</p>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.value ? "border-primary" : "border-border-light"}`}>
                      {paymentMethod === method.value && <div className="w-3 h-3 rounded-full bg-primary" />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep("shipping")} className="px-6 py-3 border border-border rounded hover:bg-surface-light transition-colors">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded transition-colors disabled:opacity-50">
                  {loading ? "Processing..." : `Place Order — ${cartTotal.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <OrderSummary items={items} total={cartTotal} />
        </div>
      </div>
    </div>
  );
}
