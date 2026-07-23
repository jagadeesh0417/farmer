import 'dotenv/config'
import app from './app.js'
import { connectDB } from './lib/mongoose.js'

const PORT = process.env.PORT || 5000

async function start() {
  try {
    const conn = await connectDB()
    if (!conn) {
      console.error('Failed to connect to MongoDB. Exiting.')
      process.exit(1)
    }
    console.log('MongoDB connected successfully')
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Server startup failed:', err)
    process.exit(1)
  }
}

start()
