"use client";
import { useState } from "react";
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiSearch } from "react-icons/fi";

const steps = [
  { key: "placed", label: "Order Placed", icon: FiPackage },
  { key: "confirmed", label: "Confirmed", icon: FiCheckCircle },
  { key: "shipped", label: "Shipped", icon: FiTruck },
  { key: "delivered", label: "Delivered", icon: FiCheckCircle },
];

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/tracking?orderNumber=${orderNumber}&email=${email}`);
      const data = await res.json();
      if (res.ok) setOrder(data);
      else setError(data.error);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? steps.findIndex(s => s.key === order.orderStatus) : -1;

  return (
    <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto">
      <h1 className="font-display text-4xl md:text-5xl mb-6">Track Order</h1>
      <form onSubmit={handleSearch} className="flex gap-3 mb-10">
        <input type="text" placeholder="Order Number" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="flex-1 bg-surface border border-border rounded px-4 py-3 text-foreground placeholder-text-dim focus:outline-none focus:border-primary" required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-surface border border-border rounded px-4 py-3 text-foreground placeholder-text-dim focus:outline-none focus:border-primary" required />
        <button type="submit" disabled={loading} className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded transition-colors disabled:opacity-50">
          <FiSearch size={20} />
        </button>
      </form>

      {error && <p className="text-red-400 text-center mb-4">{error}</p>}

      {order && (
        <div className="bg-surface border border-border rounded-lg p-8">
          <div className="mb-6">
            <p className="text-sm text-text-muted">Order #{order.orderNumber}</p>
            <p className="text-2xl font-medium mt-1">{order.customerName}</p>
            <p className="text-text-muted">{order.total.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</p>
          </div>
          <div className="relative">
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              const isActive = i <= currentStepIndex;
              const isLast = i === steps.length - 1;
              return (
                <div key={step.key} className="flex items-start gap-4 pb-8 relative">
                  {!isLast && <div className={`absolute left-[15px] top-10 w-0.5 h-full -z-10 ${isActive ? "bg-primary" : "bg-border"}`} />}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? "bg-primary text-white" : "bg-surface-light text-text-muted"}`}>
                    <StepIcon size={16} />
                  </div>
                  <div className="pt-1">
                    <p className={`font-medium ${isActive ? "text-foreground" : "text-text-muted"}`}>{step.label}</p>
                    {isActive && i === currentStepIndex && <p className="text-sm text-primary">Current</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
