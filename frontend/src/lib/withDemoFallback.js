// Demo mode is ONLY active in local development (Vite DEV mode).
// In production builds (import.meta.env.PROD), isDemoMode() ALWAYS returns false.
let _demoMode = import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true'

export async function checkBackend() {
  if (!import.meta.env.DEV) {
    _demoMode = false
    return
  }
  const apiUrl = import.meta.env.VITE_API_URL || '/api'
  if (apiUrl && apiUrl !== '/api') {
    _demoMode = false
    return
  }
  try {
    const res = await fetch(`/api/products?page=1&limit=1`, { signal: AbortSignal.timeout(4000) })
    const ct = res.headers.get('content-type') || ''
    _demoMode = !res.ok || !ct.includes('json')
  } catch {
    _demoMode = true
  }
}

export function isDemoMode() { return import.meta.env.DEV && _demoMode }

export function withDemoFallback(realData, demoData) {
  if (_demoMode && (!realData || (Array.isArray(realData) && realData.length === 0))) {
    return demoData
  }
  return realData
}

export function withDemoCategoriesFallback(realData, demoData) {
  if (_demoMode && (!realData || (Array.isArray(realData) && realData.length === 0))) {
    return demoData
  }
  return realData
}