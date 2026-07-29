import express from 'express'
import Story from '../models/Story.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { deleteFromCloudinary } from '../utils/cloudinary.js'

const router = express.Router()

const POPULATE_OPTS = 'name slug basePrice price images description variants'

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

// Admin: create story
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const story = await (await Story.create(req.body)).populate('productId', POPULATE_OPTS)
    res.status(201).json(story)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: update story
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const existing = await Story.findById(req.params.id)
    if (!existing) return res.status(404).json({ error: 'Story not found' })
    if (req.body.thumbnail && req.body.thumbnail !== existing.thumbnail && existing.thumbnailPublicId) {
      await deleteFromCloudinary(existing.thumbnailPublicId).catch(() => {})
    }
    if (req.body.videoUrl && req.body.videoUrl !== existing.videoUrl && existing.videoPublicId) {
      await deleteFromCloudinary(existing.videoPublicId).catch(() => {})
    }
    const story = await Story.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('productId', POPULATE_OPTS)
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
    if (story.videoPublicId) await deleteFromCloudinary(story.videoPublicId).catch(() => {})
    await Story.findByIdAndDelete(req.params.id)
    res.json({ message: 'Story deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
