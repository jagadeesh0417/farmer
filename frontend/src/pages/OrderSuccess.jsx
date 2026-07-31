import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { formatPrice } from '../lib/utils'
import { api } from '../lib/api'
import CheckoutProgress from '../components/checkout/CheckoutProgress'
import { loadLastOrder } from '../lib/checkout'

export default function OrderSuccess() {
  const { settings } = useSiteSettings()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('id')
  const [order, setOrder] = useState(() => loadLastOrder())
  const [orderNumber, setOrderNumber] = useState(order?.orderNumber || '')

  useEffect(() => {
    if (orderId) {
      api.getOrder(orderId)
        .then(data => {
          if (data?.orderNumber) {
            setOrder(prev => ({ ...(prev || {}), ...data }))
            setOrderNumber(data.orderNumber)
          }
        })
        .catch(() => {})
    }
  }, [orderId])

  const paymentLabel = order?.clientPaymentMethod || order?.paymentMethod || ''
  const paymentDisplay = paymentLabel === 'cod' ? 'Cash on Delivery'
    : paymentLabel === 'whatsapp' ? 'WhatsApp Order'
    : paymentLabel === 'upi' ? 'UPI'
    : paymentLabel === 'card' ? 'Card'
    : paymentLabel ? 'Paid Online' : 'Order Placed'

  const downloadInvoice = () => {
    const o = order || {}
    const date = new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    const sa = o.shippingAddress || {}
    const shipAddr = [sa.addressLine1, sa.addressLine2, sa.city, sa.state, sa.pincode].filter(Boolean).join(', ')
    const serverItems = Array.isArray(o.items) ? o.items : []
    const rows = serverItems.map(i => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${i.name || ''}${i.variantName ? ` (${i.variantName})` : ''}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">×${i.quantity || 1}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatPrice(i.price || 0)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatPrice((i.price || 0) * (i.quantity || 1))}</td>
      </tr>`).join('')
    const subtotal = o.subtotal ?? 0
    const shipping = o.shippingCost ?? 0
    const couponDiscount = o.couponDiscount ?? 0
    const total = o.total ?? 0
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Invoice ${o.orderNumber || ''}</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:24px auto;color:#111;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2E7D32;padding-bottom:16px;">
    <div>
      <h1 style="margin:0;font-size:22px;color:#2E7D32;">${settings?.storeName || 'HAiFarmer'}</h1>
      <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">${settings?.tagline || ''}</p>
    </div>
    <div style="text-align:right;font-size:13px;">
      <strong>INVOICE</strong><br>Order: ${o.orderNumber || '-'}<br>Date: ${date}<br>Status: Confirmed
    </div>
  </div>
  <div style="font-size:13px;color:#6b7280;padding:12px 0;border-bottom:1px solid #e5e7eb;">
    <strong style="color:#111;">Deliver to:</strong><br>${o.guestInfo?.name || ''}<br>${o.guestInfo?.phone || ''}<br>${shipAddr}<br>India
  </div>
  <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;">
    <thead><tr style="background:#F4F9EF;color:#2E7D32;text-align:left;">
      <th style="padding:10px;">Item</th><th style="padding:10px;text-align:center;">Qty</th><th style="padding:10px;text-align:right;">Price</th><th style="padding:10px;text-align:right;">Total</th>
    </tr></thead>
    <tbody>${rows}
      <tr><td colspan="3" style="padding:10px;text-align:right;color:#6b7280;">Subtotal</td><td style="padding:10px;text-align:right;">${formatPrice(subtotal)}</td></tr>
      ${couponDiscount > 0 ? `<tr><td colspan="3" style="padding:10px;text-align:right;color:#6b7280;">Coupon (${o.couponCode || ''})</td><td style="padding:10px;text-align:right;color:#2E7D32;">-${formatPrice(couponDiscount)}</td></tr>` : ''}
      <tr><td colspan="3" style="padding:10px;text-align:right;color:#6b7280;">Shipping</td><td style="padding:10px;text-align:right;">${shipping === 0 ? 'FREE' : formatPrice(shipping)}</td></tr>
      <tr><td colspan="3" style="padding:10px;text-align:right;font-weight:bold;">TOTAL</td><td style="padding:10px;text-align:right;font-weight:bold;color:#2E7D32;">${formatPrice(total)}</td></tr>
    </tbody>
  </table>
  <p style="margin-top:24px;font-size:12px;color:#9ca3af;text-align:center;">Thank you for supporting tribal farmers. ${settings?.phone ? `Questions? Call ${settings.phone}` : ''}</p>
</body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${o.orderNumber || 'hai-farmer'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <CheckoutProgress current={5} />
        <div className="rounded-[28px] border border-[#E5EDD8] bg-white p-6 sm:p-8 text-center shadow-[0_20px_60px_rgba(46,125,50,0.12)] drawer-item">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F5E9] shadow-lg shadow-[#2E7D32]/10">
            <svg className="h-10 w-10 text-[#2E7D32]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-heading text-h1 font-bold text-[#1a1a1a] mb-1">Order Placed Successfully</h1>
          <p className="text-body-sm text-[#8B9E7A] mb-5">Thank you for your order{order?.guestInfo?.name ? `, ${order.guestInfo.name.split(' ')[0]}` : ''}. We'll confirm shortly.</p>

          {orderNumber && (
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-[#F4F9EF] border border-[#C8E0B0] px-4 py-2">
              <span className="text-caption font-semibold text-[#8B9E7A]">Order Number</span>
              <span className="font-mono text-body-sm font-bold text-[#1B5E20]">{orderNumber}</span>
            </div>
          )}

          <div className="space-y-2.5 mb-6 rounded-2xl bg-[#F8FAF5] p-4 text-left text-body-sm">
            <div className="flex items-center gap-2.5">
              <svg className="h-4 w-4 shrink-0 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h4" />
              </svg>
              <span className="text-[#1a1a1a] font-medium">{settings?.deliveryEtaText || 'Estimated delivery in 2–4 business days'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <svg className="h-4 w-4 shrink-0 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h2m4 0h2m-9 4V9a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2zm11-6h2v5h-2" />
              </svg>
              <span className="text-[#1a1a1a] font-medium">{order?.items?.length ?? 0} item{(order?.items?.length ?? 0) !== 1 ? 's' : ''} · <span className="text-[#2E7D32]">{order?.total != null ? formatPrice(order.total) : ''}</span>{order?.total != null ? ' · ' : ''}{paymentDisplay}</span>
            </div>
            {order?.guestInfo?.phone && (
              <p className="text-caption text-[#8B9E7A]">Delivery updates will be sent to <span className="font-semibold text-[#1a1a1a]">{order.guestInfo.phone}</span></p>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            {order?.items?.length > 0 && (
              <button onClick={downloadInvoice}
                className="w-full rounded-full border-2 border-[#D7E8C8] bg-white py-3.5 text-body-sm font-semibold text-[#2E7D32] transition-all hover:bg-[#F4F9EF] hover:border-[#4CAF50] flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                Download Invoice
              </button>
            )}
            <Link to="/orders"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#D7E8C8] bg-white px-8 py-3.5 text-body-sm font-semibold text-[#2E7D32] transition-all hover:bg-[#F4F9EF] hover:border-[#4CAF50]">
              View Orders
            </Link>
            <Link to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2E7D32] px-8 py-3.5 text-body-sm font-semibold text-white transition-all hover:bg-[#1B5E20] hover:-translate-y-0.5 shadow-lg shadow-[#2E7D32]/20">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
