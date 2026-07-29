import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import categoryRoutes from './routes/categories.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/orders.js'
import couponRoutes from './routes/coupons.js'
import bannerRoutes from './routes/banners.js'
import farmerRoutes from './routes/farmers.js'
import bundleRoutes from './routes/bundles.js'
import settingsRoutes from './routes/settings.js'
import uploadRoutes from './routes/upload.js'
import seedRoutes from './routes/seed.js'
import bannerSettingRoutes from './routes/bannerSettings.js'
import generateImageRoutes from './routes/generateImage.js'
import qrCodeRoutes from './routes/qrcodes.js'

const app = express()

const allowed = [
  'https://farmer-umber.vercel.app',
  'http://localhost:5173',
]
const previewRe = /^https:\/\/[a-z0-9-]+-jagadeesh-s-projects2\.vercel\.app$/

app.use(cors({
  origin: (origin, cb) =>
    (!origin || allowed.includes(origin) || previewRe.test(origin))
      ? cb(null, true) : cb(new Error('Not allowed by CORS')),
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/banners', bannerRoutes)
app.use('/api/farmers', farmerRoutes)
app.use('/api/bundles', bundleRoutes)
app.use('/api/combos', bundleRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api', seedRoutes)
app.use('/api/generate-image', generateImageRoutes)
app.use('/api/qrcodes', qrCodeRoutes)
app.use('/api/banner-settings', bannerSettingRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

export default app
