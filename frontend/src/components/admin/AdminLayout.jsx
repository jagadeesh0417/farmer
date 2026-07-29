import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { api } from '../../lib/api'
import { isDemoMode } from '../../lib/withDemoFallback'

const API_URL = import.meta.env.VITE_API_URL || ''
const hasExplicitApi = API_URL && API_URL !== '/api'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/banners', label: 'Banners', icon: '🖼️' },
  { to: '/admin/categories', label: 'Categories', icon: '📁' },
  { to: '/admin/orders', label: 'Orders', icon: '🛒' },
  { to: '/admin/coupons', label: 'Coupons', icon: '🎟️' },
  { to: '/admin/bundles', label: 'Combos', icon: '📦' },
  { to: '/admin/farmers', label: 'Farmers', icon: '👨‍🌾' },
  { to: '/admin/qrcodes', label: 'QR Codes', icon: '📱' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession')
    if (!adminSession) {
      navigate('/admin/login', { replace: true })
      return
    }

    if (isDemoMode() && !hasExplicitApi) {
      setVerifying(false)
      return
    }

    api.getAdminMe().then(() => {
      setVerifying(false)
    }).catch(() => {
      localStorage.removeItem('adminSession')
      toast.error('Session expired — please login again')
      navigate('/admin/login', { replace: true })
    })
  }, [navigate])

  if (verifying && (!isDemoMode() || hasExplicitApi)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Verifying session...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('adminSession')
    toast.success('Logged out')
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 z-50 h-full w-56 bg-slate-900 text-white shadow-xl md:block hidden overflow-y-auto">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 flex-shrink-0">
              <svg viewBox="0 0 32 32" fill="none" className="h-5 w-5 text-white">
                <path d="M16 4C12 4 8 8 8 14c0 8 8 14 8 14s8-6 8-14c0-6-4-10-8-10z" fill="currentColor" opacity="0.9"/>
                <path d="M16 8c-2 0-4 3-4 6 0 4 4 8 4 8s4-4 4-8c0-3-2-6-4-6z" fill="currentColor" opacity="0.6"/>
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold tracking-wide block leading-tight">HAiFarmer</span>
              <span className="text-[10px] text-slate-400 block leading-tight">Admin Panel</span>
            </div>
          </div>
        </div>
        <nav className="p-2 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => {
                if (window.innerWidth < 768) {
                  document.querySelector('aside')?.classList.add('hidden')
                }
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >{item.icon} {item.label}</NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition w-full py-2">
            🚪 Logout
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg flex items-stretch overflow-x-auto hide-scrollbar px-1 py-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 min-w-[64px] px-2 py-1.5 text-[11px] font-semibold rounded-lg transition shrink-0 ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'
              }`
            }
          ><span className="text-base">{item.icon}</span><span className="whitespace-nowrap">{item.label}</span></NavLink>
        ))}
        <button onClick={handleLogout} className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] px-2 py-1.5 text-[11px] font-semibold text-red-400 hover:bg-red-50 rounded-lg transition shrink-0">
          <span className="text-base">🚪</span>
          <span className="whitespace-nowrap">Logout</span>
        </button>
      </div>

      <main className="flex-1 md:ml-56 pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
