import express from 'express'
import mongoose from 'mongoose'
import Story from '../models/Story.js'
import cloudinary from '../config/cloudinary.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { deleteFromCloudinary } from '../utils/cloudinary.js'
import { storySignatureLimiter, storyCreateLimiter } from '../middleware/rateLimit.js'

const router = express.Router()

const POPULATE_OPTS = 'name slug basePrice price images description variants'
const CLOUDINARY_HOST = 'res.cloudinary.com'
const MAX_TITLE = 120
const MAX_DESCRIPTION = 1000
const MAX_URL = 500
const MAX_PUBLIC_ID = 300

function clean(value, max) {
  return String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max)
}

function isValidVideoUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === CLOUDINARY_HOST && url.pathname.includes('/video/upload/')
  } catch { return false }
}

function isValidObjectId(value) {
  return mongoose.isValidObjectId(value)
}

// Public: get all active stories with populated product
router.get('/', async (req, res) => {
  try {
    const stories = await Story.find({ isActive: true }).populate('productId', POPULATE_OPTS).sort({ createdAt: -1 })
    res.json(stories)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: get all stories
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const stories = await Story.find().populate('productId', POPULATE_OPTS).sort({ createdAt: -1 })
    res.json(stories)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: signed upload params so the browser can upload video directly to Cloudinary.
// The API secret never leaves the server; Cloudinary verifies the signature.
router.post('/signature', protect, adminOnly, storySignatureLimiter, (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000)
    const folder = 'stories'
    const params = { timestamp, folder, resource_type: 'video' }
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET)
    res.json({
      signature,
      timestamp,
      folder,
      resourceType: 'video',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: create story — metadata only, no video binary ever reaches the server
router.post('/', protect, adminOnly, storyCreateLimiter, async (req, res) => {
  try {
    const errors = []
    const title = clean(req.body.title, MAX_TITLE)
    if (!title) errors.push('Title is required')
    const description = clean(req.body.description, MAX_DESCRIPTION)
    const videoUrl = clean(req.body.videoUrl, MAX_URL)
    if (!videoUrl) errors.push('Video URL is required')
    else if (!isValidVideoUrl(videoUrl)) errors.push('Video URL must be a valid Cloudinary video URL')
    const cloudinaryPublicId = clean(req.body.cloudinaryPublicId || req.body.videoPublicId, MAX_PUBLIC_ID)
    if (!cloudinaryPublicId) errors.push('Cloudinary public id is required')
    const productId = req.body.productId || req.body.product_id
    if (!isValidObjectId(productId)) errors.push('Tagged product is required')
    if (errors.length) return res.status(400).json({ error: errors.join('; ') })

    const thumbnail = clean(req.body.thumbnail, MAX_URL)
    const data = {
      title,
      description,
      videoUrl,
      cloudinaryPublicId,
      productId,
      productName: clean(req.body.productName, MAX_TITLE),
      duration: clean(req.body.duration, 16),
      isActive: req.body.isActive === undefined ? true : Boolean(req.body.isActive),
      videoPublicId: cloudinaryPublicId,
    }
    if (thumbnail) {
      data.thumbnail = thumbnail
      data.thumbnailPublicId = `${cloudinaryPublicId}.jpg`
    }
    const story = await (await Story.create(data)).populate('productId', POPULATE_OPTS)
    res.status(201).json(story)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: update story — metadata only
router.put('/:id', protect, adminOnly, storyCreateLimiter, async (req, res) => {
  try {
    const existing = await Story.findById(req.params.id)
    if (!existing) return res.status(404).json({ error: 'Story not found' })

    const errors = []
    const update = {}
    if ('title' in req.body) {
      update.title = clean(req.body.title, MAX_TITLE)
      if (!update.title) errors.push('Title is required')
    }
    if ('description' in req.body) update.description = clean(req.body.description, MAX_DESCRIPTION)
    if ('isActive' in req.body) update.isActive = Boolean(req.body.isActive)
    if ('productId' in req.body) {
      if (!isValidObjectId(req.body.productId)) errors.push('Invalid product id')
      else update.productId = req.body.productId
    }
    if ('productName' in req.body) update.productName = clean(req.body.productName, MAX_TITLE)
    if ('duration' in req.body) update.duration = clean(req.body.duration, 16)
    if ('thumbnail' in req.body) update.thumbnail = clean(req.body.thumbnail, MAX_URL)
    if ('videoUrl' in req.body || 'cloudinaryPublicId' in req.body || 'videoPublicId' in req.body) {
      const videoUrl = clean(req.body.videoUrl ?? existing.videoUrl, MAX_URL)
      const publicId = clean(req.body.cloudinaryPublicId || req.body.videoPublicId || existing.cloudinaryPublicId || existing.videoPublicId, MAX_PUBLIC_ID)
      if (!isValidVideoUrl(videoUrl)) errors.push('Video URL must be a valid Cloudinary video URL')
      if (!publicId) errors.push('Cloudinary public id is required')
      if (videoUrl !== existing.videoUrl) {
        const oldId = existing.cloudinaryPublicId || existing.videoPublicId
        if (oldId) await deleteFromCloudinary(oldId).catch(() => {})
        if (existing.thumbnailPublicId) await deleteFromCloudinary(existing.thumbnailPublicId).catch(() => {})
        if (!('thumbnail' in req.body)) {
          update.thumbnail = ''
          update.thumbnailPublicId = ''
        } else {
          update.thumbnailPublicId = `${publicId}.jpg`
        }
      } else {
        if ('thumbnail' in req.body && existing.thumbnailPublicId) update.thumbnailPublicId = `${publicId}.jpg`
      }
      update.videoUrl = videoUrl
      update.cloudinaryPublicId = publicId
      update.videoPublicId = publicId
    }
    if (errors.length) return res.status(400).json({ error: errors.join('; ') })

    const story = await Story.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).populate('productId', POPULATE_OPTS)
    res.json(story)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: delete story
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
    if (!story) return res.status(404).json({ error: 'Story not found' })
    if (story.thumbnailPublicId) await deleteFromCloudinary(story.thumbnailPublicId).catch(() => {})
    const videoId = story.cloudinaryPublicId || story.videoPublicId
    if (videoId) await deleteFromCloudinary(videoId).catch(() => {})
    await Story.findByIdAndDelete(req.params.id)
    res.json({ message: 'Story deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
