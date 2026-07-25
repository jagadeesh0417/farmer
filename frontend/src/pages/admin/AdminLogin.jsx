import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'
import { isDemoMode } from '../../lib/withDemoFallback'
const ADMIN_EMAIL = 'haifarmer@gmail.com'
const ADMIN_PASS = 'Haifarner1234'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('All fields required')

    if (isDemoMode()) {
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
        return toast.error('Invalid credentials — use haifarmer@gmail.com / Haifarner1234')
      }
      const demoUser = { _id: 'demo-admin', email, fullName: 'Admin (Demo)', role: 'admin' }
      const demoToken = 'demo-token-haifarmer-' + Date.now()
      localStorage.setItem('adminSession', JSON.stringify({ token: demoToken, user: demoUser }))
      toast.success('Welcome Admin!')
      navigate('/admin')
      return
    }

    setLoading(true)
    try {
      const data = await api.login({ email, password })
      if (data.user?.role !== 'admin') {
        toast.error('Admin access required')
        return
      }
      localStorage.setItem('adminSession', JSON.stringify({ token: data.token, user: data.user }))
      toast.success('Welcome Admin!')
      navigate('/admin')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    const demoUser = { _id: 'demo-admin', email: ADMIN_EMAIL, fullName: 'Admin (Demo)', role: 'admin' }
    const demoToken = 'demo-token-haifarmer-' + Date.now()
    localStorage.setItem('adminSession', JSON.stringify({ token: demoToken, user: demoUser }))
    toast.success('Welcome Admin!')
    navigate('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-sm text-slate-500 mt-1">HAiFarmer Admin Panel</p>
          {isDemoMode() && (
            <span className="inline-block mt-2 rounded-full bg-amber-100 px-3 py-0.5 text-[11px] font-semibold text-amber-700">Demo Mode</span>
          )}
        </div>
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" />
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 transition disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {isDemoMode() && (
            <button type="button" onClick={handleDemoLogin} className="w-full rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100 transition">
              Quick Demo Login
            </button>
          )}
        </form>
        {isDemoMode() && (
          <p className="text-center text-[11px] text-slate-400 mt-4">Backend server is not running. Admin operates in offline demo mode.</p>
        )}
      </div>
    </div>
  )
}
