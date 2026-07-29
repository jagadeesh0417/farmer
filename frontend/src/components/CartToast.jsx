import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice, getImageUrl } from '../lib/utils'

let toastId = 0
let addToastFn = null

export function showCartToast({ productName, productImage, price, quantity, slug, isUpdate }) {
  if (addToastFn) addToastFn({ id: ++toastId, productName, productImage, price, quantity, slug, isUpdate })
}

export default function CartToastContainer() {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  addToastFn = useCallback((toast) => {
    setToasts(prev => [...prev, toast])
    timers.current[toast.id] = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
      delete timers.current[toast.id]
    }, 3000)
  }, [])

  useEffect(() => {
    return () => { Object.values(timers.current).forEach(clearTimeout) }
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    if (timers.current[id]) { clearTimeout(timers.current[id]); delete timers.current[id] }
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className="pointer-events-auto animate-slideInRight bg-white rounded-xl shadow-2xl border border-border p-3 flex items-center gap-3"
          style={{ animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {t.productImage && (
            <img src={getImageUrl(t.productImage)} alt="" className="h-12 w-12 rounded-lg object-cover bg-[#F0E6D3] shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-semibold text-ink truncate">{t.productName}</p>
            <p className="text-caption text-green-600 font-semibold">
              {t.isUpdate ? '✓ Quantity Updated' : '✓ Added to Cart'}
            </p>
            {t.price && <p className="text-caption text-muted">{formatPrice(t.price)} {t.quantity > 1 ? `×${t.quantity}` : ''}</p>}
          </div>
          <button onClick={() => removeToast(t.id)} className="text-muted hover:text-ink text-lg leading-none shrink-0">&times;</button>
        </div>
      ))}
    </div>
  )
}
