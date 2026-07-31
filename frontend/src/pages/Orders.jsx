import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { formatPrice } from '../lib/utils'
import { loadLastOrder } from '../lib/checkout'

const STATUS_BADGES = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

function OrderCard({ order }) {
  const status = order.status || 'pending'
  const method = order.paymentMethod || ''
  return (
    <div className="rounded-2xl border border-[#E5EDD8] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <p className="font-mono text-body-sm font-bold text-[#1B5E20]">{order.orderNumber || '—'}</p>
          <p className="text-caption text-[#8B9E7A] mt-0.5">
            {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' · '}{order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-micro font-semibold capitalize ${STATUS_BADGES[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
          {method === 'cod' && <span className="rounded-full bg-[#F4F9EF] px-2.5 py-1 text-micro font-semibold text-[#2E7D32]">COD</span>}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-[#E5EDD8] pt-3">
        <span className="text-body-sm text-[#8B9E7A]">Total</span>
        <span className="font-heading text-h4 font-bold text-[#2E7D32]">{formatPrice(order.total || 0)}</span>
      </div>
    </div>
  )
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const lastOrder = loadLastOrder()

  useEffect(() => {
    if (!user) { setLoading(false); return }
    api.getUserOrders()
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div className="min-h-screen bg-[#F8FAF5]">
      <div className="border-b border-[#E5EDD8] bg-white">
        <div className="mx-auto max-w-3xl px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2 text-caption text-[#8B9E7A]">
            <Link to="/" className="hover:text-[#2E7D32] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#1a1a1a] font-medium">My Orders</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <h1 className="font-heading text-h1 font-bold text-[#1a1a1a] mb-6">My Orders</h1>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#D7E8C8] border-t-[#2E7D32]" />
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">{orders.map(o => <OrderCard key={o._id} order={o} />)}</div>
        ) : (
          <div className="rounded-2xl border border-[#E5EDD8] bg-white p-8 text-center">
            {lastOrder?.orderNumber ? (
              <>
                <p className="font-mono text-body font-bold text-[#1B5E20] mb-1">{lastOrder.orderNumber}</p>
                <p className="text-body-sm text-[#8B9E7A] mb-2">Your most recent order was placed. {user ? 'Your order history will appear here once logged in.' : 'Log in to see your full order history.'}</p>
                <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-6 py-3 text-body-sm font-semibold text-white transition-all hover:bg-[#1B5E20]">Continue Shopping</Link>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F4F9EF]">
                  <svg className="h-8 w-8 text-[#8B9E7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-body font-semibold text-[#1a1a1a] mb-1">No orders yet</p>
                <p className="text-body-sm text-[#8B9E7A] mb-5">Your placed orders will appear here.</p>
                <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-6 py-3 text-body-sm font-semibold text-white transition-all hover:bg-[#1B5E20]">Browse Products</Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
