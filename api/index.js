import app from '../backend/app.js'
import { connectDB } from '../backend/lib/mongoose.js'

export default async function handler(req, res) {
  try {
    const conn = await connectDB()
    if (!conn) {
      const msg = !process.env.MONGODB_URI
        ? 'MONGODB_URI environment variable is not set in Vercel dashboard'
        : 'Database not connected. Check MONGODB_URI env var and Atlas IP whitelist (0.0.0.0/0).'
      res.status(503).json({ error: msg })
      return
    }
    app(req, res)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
