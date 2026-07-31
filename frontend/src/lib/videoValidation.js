export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024
export const COMPRESS_THRESHOLD = 25 * 1024 * 1024

export function validateVideoFile(file) {
  if (!file) return { ok: false, error: 'No file selected' }
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) return { ok: false, error: 'Only .mp4, .mov, .webm files allowed' }
  if (file.size > MAX_VIDEO_SIZE) return { ok: false, error: 'Max file size is 100MB' }
  return { ok: true }
}

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** i
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}

export function formatEta(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return ''
  if (seconds < 60) return `${Math.ceil(seconds)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s}s`
}

export function formatDuration(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}
