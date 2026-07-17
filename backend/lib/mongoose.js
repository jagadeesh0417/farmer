import mongoose from 'mongoose'

let cached = global._mongooseCache
if (!cached) cached = global._mongooseCache = { conn: null, error: null, promise: null }

export async function connectDB() {
  if (cached.conn) return cached.conn
  if (cached.promise) return cached.promise
  if (!process.env.MONGODB_URI) {
    cached.error = 'MONGODB_URI environment variable is not set'
    return null
  }
  cached.promise = mongoose.connect(process.env.MONGODB_URI, {
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
