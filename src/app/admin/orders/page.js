"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Fragment } from "react";
import { FiChevronDown, FiChevronUp, FiPackage } from "react-icons/fi";

const statusFlow = ["placed", "confirmed", "shipped", "delivered"];

const statusColors = {
  placed: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  shipped: "bg-purple-500/20 text-purple-400",
  delivered: "bg-green-500/20 text-green-400",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const parseItems = (items) => {
    try {
      return JSON.parse(items);
    } catch {
      return [];
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch {
      toast.error("Failed to update order");
    }
  };

  const nextStatus = (current) => {
    const idx = statusFlow.indexOf(current);
    return idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
  };

  const prevStatus = (current) => {
    const idx = statusFlow.indexOf(current);
    return idx > 0 ? statusFlow[idx - 1] : null;
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div>
      <h1 className="text-3xl font-display mb-8">Orders</h1>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-light">
            <tr>
              <th className="text-left p-4 text-text-muted font-medium w-8"></th>
              <th className="text-left p-4 text-text-muted font-medium">Order #</th>
              <th className="text-left p-4 text-text-muted font-medium">Customer</th>
              <th className="text-left p-4 text-text-muted font-medium">Status</th>
              <th className="text-left p-4 text-text-muted font-medium">Payment</th>
              <th className="text-left p-4 text-text-muted font-medium">Total</th>
              <th className="text-left p-4 text-text-muted font-medium">Date</th>
              <th className="text-right p-4 text-text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-text-muted">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-text-muted">No orders yet</td></tr>
            ) : orders.map((order) => {
              const isExpanded = expandedId === order.id;
              const next = nextStatus(order.orderStatus);
              const prev = prevStatus(order.orderStatus);
              return (
                <Fragment key={order.id}>
                  <tr className="border-t border-border hover:bg-surface-light/50 transition-colors cursor-pointer" onClick={() => toggleExpand(order.id)}>
                    <td className="p-4 text-text-muted">
                      {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </td>
                    <td className="p-4 font-mono text-xs">{order.orderNumber}</td>
                    <td className="p-4">{order.customerName}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${statusColors[order.orderStatus] || "bg-gray-500/20 text-gray-400"}`}>{order.orderStatus}</span>
                    </td>
                    <td className="p-4">
                      <span className={order.paymentStatus === "paid" || order.paymentStatus === "completed" ? "text-green-400" : "text-yellow-400"}>{order.paymentStatus}</span>
                    </td>
                    <td className="p-4">₹{order.total.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-text-muted text-xs">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {prev && (
                          <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, prev); }} className="px-2 py-1 text-xs rounded bg-surface-lighter hover:bg-surface-lighter/70 text-text-muted transition-colors">{prev}</button>
                        )}
                        {next && (
                          <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, next); }} className="px-2 py-1 text-xs rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors">{next}</button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${order.id}-detail`} className="bg-surface-light/30">
                      <td colSpan={8} className="p-6">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-sm font-medium mb-3">Customer Details</h4>
                            <div className="space-y-1.5 text-sm text-text-muted">
                              <p><span className="text-foreground">Name:</span> {order.customerName}</p>
                              <p><span className="text-foreground">Email:</span> {order.customerEmail}</p>
                              <p><span className="text-foreground">Phone:</span> {order.customerPhone}</p>
                            </div>
                            <h4 className="text-sm font-medium mt-5 mb-3">Shipping Address</h4>
                            <div className="space-y-1.5 text-sm text-text-muted">
                              <p>{order.shippingAddress}</p>
                              <p>{order.city}, {order.state} - {order.pincode}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-3">Order Items</h4>
                            <div className="space-y-3">
                              {parseItems(order.items).map((item, i) => (
                                <div key={i} className="flex items-center gap-4 bg-surface-lighter/50 rounded-lg p-3">
                                  {item.image && (
                                    <img src={item.image} alt="" className="w-12 h-12 rounded object-cover" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{item.name}</p>
                                    <p className="text-xs text-text-muted">Qty: {item.quantity} × ₹{item.price?.toLocaleString("en-IN")} | Size: {item.size}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 text-sm space-y-1 text-text-muted">
                              <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString("en-IN")}</span></div>
                              <div className="flex justify-between"><span>Shipping</span><span>₹{order.shipping?.toLocaleString("en-IN")}</span></div>
                              <div className="flex justify-between font-medium text-foreground border-t border-border pt-1 mt-1"><span>Total</span><span>₹{order.total.toLocaleString("en-IN")}</span></div>
                            </div>
                            <p className="text-xs text-text-muted mt-3">Payment: {order.paymentMethod}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
