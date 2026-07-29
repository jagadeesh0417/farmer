import express from 'express'
import QRCode from '../models/QRCode.js'
import Farmer from '../models/Farmer.js'
import { protect, adminOnly } from '../middleware/auth.js'
import QRCodeLib from 'qrcode'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const qrs = await QRCode.find().populate('farmer', 'name slug images').sort({ createdAt: -1 })
    res.json(qrs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { farmerId, label } = req.body
    if (!farmerId) return res.status(400).json({ error: 'farmerId is required' })
    const farmer = await Farmer.findById(farmerId)
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' })
    const code = uuidv4().slice(0, 8).toUpperCase()
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/qr/${code}`
    const qrImage = await QRCodeLib.toDataURL(url)
    const qr = await QRCode.create({ farmer: farmerId, code, label: label || '', url, qrImage })
    const populated = await QRCode.findById(qr._id).populate('farmer', 'name slug images')
    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:code/lookup', async (req, res) => {
  try {
    const qr = await QRCode.findOne({ code: req.params.code, isActive: true }).populate('farmer', 'slug name')
    if (!qr) return res.status(404).json({ error: 'Invalid or expired code' })
    if (!qr.farmer) return res.status(404).json({ error: 'Farmer not found' })
    res.json({ slug: qr.farmer.slug, name: qr.farmer.name, code: qr.code })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/:code/scan', async (req, res) => {
  try {
    await QRCode.findOneAndUpdate({ code: req.params.code }, { $inc: { scanCount: 1 } })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { label, isActive, farmerId } = req.body
    const update = {}
    if (label !== undefined) update.label = label
    if (isActive !== undefined) update.isActive = isActive
    if (farmerId) {
      const farmer = await Farmer.findById(farmerId)
      if (!farmer) return res.status(404).json({ error: 'Farmer not found' })
      update.farmer = farmerId
    }
    if (Object.keys(update).length === 0) return res.status(400).json({ error: 'Nothing to update' })
    const qr = await QRCode.findByIdAndUpdate(req.params.id, update, { new: true }).populate('farmer', 'name slug images')
    if (!qr) return res.status(404).json({ error: 'QR code not found' })
    res.json(qr)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const qr = await QRCode.findByIdAndDelete(req.params.id)
    if (!qr) return res.status(404).json({ error: 'QR code not found' })
    res.json({ message: 'QR code deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
