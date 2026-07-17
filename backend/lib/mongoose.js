import mongoose from 'mongoose'

function getDbName(uri) {
  if (!uri) return null
  const srvMatch = uri.match(/^mongodb\+srv:\/\/[^/]+\/([^?]*)/)
  const stdMatch = uri.match(/^mongodb:\/\/[^/]+\/([^?]*)/)
  const pathDb = (srvMatch && srvMatch[1]) || (stdMatch && stdMatch[1])
  if (pathDb) return null
  return 'haifarmer'
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
  const uri = process.env.MONGODB_URI
  const dbName = getDbName(uri)
  const opts = { serverSelectionTimeoutMS: 10000, bufferCommands: false }
  if (dbName) opts.dbName = dbName
  cached.promise = mongoose.connect(uri, opts).then(conn => {
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
