let _demoMode = import.meta.env.VITE_DEMO_MODE === 'true'
const API_URL = import.meta.env.VITE_API_URL || ''
const hasExplicitApi = API_URL && API_URL !== '/api'

export async function checkBackend() {
  if (hasExplicitApi) {
    _demoMode = false
    try {
      const res = await fetch(`${API_URL}/products?page=1&limit=1`, { signal: AbortSignal.timeout(4000) })
      if (!res.ok) console.error(`Backend at ${API_URL} returned ${res.status}`)
    } catch {
      console.error(`Backend at ${API_URL} is unreachable — check CORS and network`)
    }
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

export function isDemoMode() { return _demoMode }

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
