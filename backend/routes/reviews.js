import express from 'express'
import Review from '../models/Review.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { deleteFromCloudinary } from '../utils/cloudinary.js'

const router = express.Router()

// Strip HTML/script content to prevent XSS before storing
function sanitizeInput(value) {
  if (typeof value !== 'string') return value
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<(?:[^>'"\s]|"[^"]*"|'[^']*')*>/g, ' ')
    .replace(/on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// Public: get published reviews, sorted by display order
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'published' })
      .sort({ displayOrder: 1, reviewDate: -1 })
      .select('-__v')
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: get all reviews (including drafts)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ displayOrder: 1, reviewDate: -1 })
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: create review
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, text, rating } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'Customer name is required' })
    if (!text?.trim()) return res.status(400).json({ error: 'Review text is required' })
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5' })
    }
    const maxOrder = await Review.findOne().sort({ displayOrder: -1 }).select('displayOrder')
    const review = await Review.create({
      ...req.body,
      name: sanitizeInput(String(name)).slice(0, 100),
      designation: sanitizeInput(req.body.designation).slice(0, 100),
      text: sanitizeInput(String(text)).slice(0, 2000),
      product: sanitizeInput(req.body.product).slice(0, 150),
      rating: Math.min(5, Math.max(1, Math.round(rating))),
      displayOrder: req.body.displayOrder ?? (maxOrder ? maxOrder.displayOrder + 1 : 0),
    })
    res.status(201).json(review)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: update review
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const existing = await Review.findById(req.params.id)
    if (!existing) return res.status(404).json({ error: 'Review not found' })
    if (req.body.image && req.body.image !== existing.image && existing.imagePublicId) {
      await deleteFromCloudinary(existing.imagePublicId).catch(() => {})
    }
    const updates = { ...req.body }
    if ('name' in updates) updates.name = sanitizeInput(String(updates.name)).slice(0, 100)
    if ('designation' in updates) updates.designation = sanitizeInput(updates.designation).slice(0, 100)
    if ('text' in updates) updates.text = sanitizeInput(String(updates.text)).slice(0, 2000)
    if ('product' in updates) updates.product = sanitizeInput(updates.product).slice(0, 150)
    if ('rating' in updates) updates.rating = Math.min(5, Math.max(1, Math.round(Number(updates.rating) || 5)))
    if (!updates.name?.trim()) return res.status(400).json({ error: 'Customer name is required' })
    if (!updates.text?.trim() && !existing.text) return res.status(400).json({ error: 'Review text is required' })
    const review = await Review.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    res.json(review)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: reorder reviews (drag-and-drop)
router.patch('/reorder', protect, adminOnly, async (req, res) => {
  try {
    const { orders } = req.body
    if (!Array.isArray(orders)) return res.status(400).json({ error: 'orders must be an array' })
    for (const { id, displayOrder } of orders) {
      await Review.findByIdAndUpdate(id, { displayOrder })
    }
    const reviews = await Review.find().sort({ displayOrder: 1, reviewDate: -1 })
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: delete review
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Review not found' })
    if (review.imagePublicId) await deleteFromCloudinary(review.imagePublicId).catch(() => {})
    await Review.findByIdAndDelete(req.params.id)
    res.json({ message: 'Review deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
