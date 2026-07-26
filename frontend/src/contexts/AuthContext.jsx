import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  function storeSession(token, userData) {
    localStorage.setItem('haifarmer_token', token)
    localStorage.setItem('haifarmer_user', JSON.stringify(userData))
    setUser(userData)
    setProfile(userData)
  }

  function clearSession() {
    localStorage.removeItem('haifarmer_token')
    localStorage.removeItem('haifarmer_user')
    setUser(null)
    setProfile(null)
  }

  useEffect(() => {
    const token = localStorage.getItem('haifarmer_token')
    if (!token) { setLoading(false); return }
    api.getMe().then(data => {
      if (data?.user) { setUser(data.user); setProfile(data.user) }
    }).catch(() => {
      clearSession()
    }).finally(() => setLoading(false))
  }, [])

  async function signIn(email, password) {
    const data = await api.login({ email, password })
    if (data.user?.role !== 'customer' && data.user?.role !== 'admin') {
      throw new Error('Access denied')
    }
    storeSession(data.token, data.user)
    return data
  }

  async function signUp(email, password, { fullName, phone } = {}) {
    const data = await api.signup({ email, password, fullName, phone })
    storeSession(data.token, data.user)
    return data
  }

  async function signOut() {
    clearSession()
  }

  async function fetchProfile() {
    try {
      const data = await api.getMe()
      if (data?.user) { setProfile(data.user); setUser(data.user) }
    } catch { /* ignore */ }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}