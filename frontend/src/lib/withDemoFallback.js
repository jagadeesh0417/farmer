let _demoMode = import.meta.env.VITE_DEMO_MODE === 'true'

export async function checkBackend() {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || '/api'
    const res = await fetch(`${apiUrl}/products?page=1&limit=1`, { signal: AbortSignal.timeout(4000) })
    _demoMode = !res.ok
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
