import express from 'express'
import BannerSetting from '../models/BannerSetting.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { deleteFromCloudinary } from '../utils/cloudinary.js'

const router = express.Router()

// Public: get all enabled banners
router.get('/', async (req, res) => {
  try {
    const banners = await BannerSetting.find({ enabled: true }).sort({ order: 1 })
    const map = {}
    banners.forEach(b => { map[b.bannerKey] = b })
    res.json(map)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: get all banners (including disabled)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const banners = await BannerSetting.find().sort({ order: 1 })
    res.json(banners)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: get single banner
router.get('/:key', async (req, res) => {
  try {
    const banner = await BannerSetting.findOne({ bannerKey: req.params.key })
    if (!banner) return res.status(404).json({ error: 'Banner not found' })
    res.json(banner)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: create or update banner by key
router.put('/:key', protect, adminOnly, async (req, res) => {
  try {
    const { image, cloudinaryPublicId, desktopImage, desktopPublicId, mobileImage, mobilePublicId, buttonLink, enabled, sectionName, order } = req.body
    const existing = await BannerSetting.findOne({ bannerKey: req.params.key })

    // If legacy image changed, delete old Cloudinary image
    if (existing && image && image !== existing.image && existing.cloudinaryPublicId) {
      await deleteFromCloudinary(existing.cloudinaryPublicId).catch(() => {})
    }
    // If desktop image changed, delete old Cloudinary image
    if (existing && desktopImage && desktopImage !== existing.desktopImage && existing.desktopPublicId) {
      await deleteFromCloudinary(existing.desktopPublicId).catch(() => {})
    }
    // If mobile image changed, delete old Cloudinary image
    if (existing && mobileImage && mobileImage !== existing.mobileImage && existing.mobilePublicId) {
      await deleteFromCloudinary(existing.mobilePublicId).catch(() => {})
    }

    const banner = await BannerSetting.findOneAndUpdate(
      { bannerKey: req.params.key },
      { $set: { image, cloudinaryPublicId, desktopImage, desktopPublicId, mobileImage, mobilePublicId, buttonLink, sectionName, order, enabled: enabled ?? true } },
      { upsert: true, new: true }
    )
    res.json(banner)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: delete banner
router.delete('/:key', protect, adminOnly, async (req, res) => {
  try {
    const banner = await BannerSetting.findOne({ bannerKey: req.params.key })
    if (!banner) return res.status(404).json({ error: 'Banner not found' })
    if (banner.cloudinaryPublicId) await deleteFromCloudinary(banner.cloudinaryPublicId).catch(() => {})
    if (banner.desktopPublicId) await deleteFromCloudinary(banner.desktopPublicId).catch(() => {})
    if (banner.mobilePublicId) await deleteFromCloudinary(banner.mobilePublicId).catch(() => {})
    await BannerSetting.deleteOne({ bannerKey: req.params.key })
    res.json({ message: 'Banner deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
