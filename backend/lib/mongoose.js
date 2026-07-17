import mongoose from 'mongoose'

function ensureDbName(uri) {
  if (!uri) return uri
  const srvMatch = uri.match(/^mongodb\+srv:\/\/[^/]+\/([^?]*)/)
  const stdMatch = uri.match(/^mongodb:\/\/[^/]+\/([^?]*)/)
  if ((srvMatch && srvMatch[1]) || (stdMatch && stdMatch[1])) return uri
  const qIdx = uri.indexOf('?')
  if (qIdx === -1) return uri + '/haifarmer'
  return uri.slice(0, qIdx) + '/haifarmer' + uri.slice(qIdx)
}

let cached = global._mongooseCache
if (!cached) cached = global._mongooseCache = { conn: null, error: null, promise: null }

export async function connectDB() {
  if (cached.conn) return cached.conn
  if (cached.promise) return cached.promise
  if (!process.env.MONGODB_URI) {
    cached.error = 'MONGODB_URI environment variable is not set'
    return null
  }
  const uri = ensureDbName(process.env.MONGODB_URI)
  cached.promise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    bufferCommands: false,
  }).then(conn => {
    cached.conn = conn
    cached.error = null
    return conn
  }).catch(err => {
    cached.conn = null
    cached.error = err.message
    cached.promise = null
    return null
  })
  return cached.promise
}

export async function ensureDB() {
  if (cached.conn) return cached
  try { await connectDB() } catch {}
  return cached
}
