import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [products, orders, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const totalRevenue = await prisma.order.aggregate({ _sum: { total: true } });
  const pendingOrders = await prisma.order.count({ where: { orderStatus: "placed" } });

  return (
    <div>
      <h1 className="text-3xl font-display mb-8">Dashboard</h1>
      <div className="grid grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Products", value: products, color: "text-blue-400" },
          { label: "Total Orders", value: orders, color: "text-green-400" },
          { label: "Pending Orders", value: pendingOrders, color: "text-yellow-400" },
          { label: "Revenue", value: (totalRevenue._sum.total || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }), color: "text-purple-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded-lg p-6">
            <p className="text-text-muted text-sm">{stat.label}</p>
            <p className={`text-3xl font-semibold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      <h2 className="text-xl font-medium mb-4">Recent Orders</h2>
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-light">
            <tr>
              <th className="text-left p-4 text-text-muted font-medium">Order</th>
              <th className="text-left p-4 text-text-muted font-medium">Customer</th>
              <th className="text-left p-4 text-text-muted font-medium">Status</th>
              <th className="text-left p-4 text-text-muted font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-t border-border">
                <td className="p-4 font-mono text-xs">{order.orderNumber}</td>
                <td className="p-4">{order.customerName}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.orderStatus === "delivered" ? "bg-green-500/20 text-green-400" :
                    order.orderStatus === "shipped" ? "bg-blue-500/20 text-blue-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>{order.orderStatus}</span>
                </td>
                <td className="p-4">{order.total.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
