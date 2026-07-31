import express from 'express'
import mongoose from 'mongoose'
import SiteSetting from '../models/SiteSetting.js'
import Product from '../models/Product.js'
import Bundle from '../models/Bundle.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

const PRODUCT_SECTION_KEYS = [
  'groceries', 'bestSellers', 'newArrivals', 'trending', 'healthConcern',
  'millets', 'lentilsBeans', 'honey', 'spices',
]
const BUNDLE_SECTION_KEYS = ['superSaverCombos', 'combos']
const SECTION_KEYS = [...PRODUCT_SECTION_KEYS, ...BUNDLE_SECTION_KEYS]

function orderByIds(items, ids) {
  const index = {}
  ids.forEach((id, i) => { index[String(id)] = i })
  return items.slice().sort((a, b) => {
    const ia = index[String(a._id)]
    const ib = index[String(b._id)]
    return (ia === undefined ? 1e9 : ia) - (ib === undefined ? 1e9 : ib)
  })
}

router.get('/', async (req, res) => {
  try {
    let settings = await SiteSetting.findOne()
    if (!settings) settings = await SiteSetting.create({})
    res.json(settings)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/home', async (req, res) => {
  try {
    let settings = await SiteSetting.findOne()
    if (!settings) settings = await SiteSetting.create({})
    const hs = settings.homeSections || {}
    const result = {}
    const staleIds = {}

    for (const key of SECTION_KEYS) {
      const rawIds = hs[key] || []
      const ids = rawIds.filter(id => id && mongoose.isValidObjectId(id))
      if (ids.length === 0) { result[key] = []; continue }

      let docs = []
      if (BUNDLE_SECTION_KEYS.includes(key)) {
        docs = await Bundle.find({ _id: { $in: ids }, isActive: { $ne: false } })
      } else {
        docs = await Product.find({ _id: { $in: ids }, isActive: { $ne: false } })
      }
      const found = new Set(docs.map(d => String(d._id)))
      const missing = ids.filter(id => !found.has(String(id)))
      if (missing.length) staleIds[key] = missing

      result[key] = orderByIds(docs, ids)
    }

    if (Object.keys(staleIds).length) {
      const next = { ...hs }
      for (const [key, missing] of Object.entries(staleIds)) {
        next[key] = (hs[key] || []).filter(id => !missing.includes(id))
      }
      settings.homeSections = next
      await settings.save().catch(() => {})
    }

    res.json({ homeSections: result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/', protect, adminOnly, async (req, res) => {
  try {
    let settings = await SiteSetting.findOne()
    if (!settings) settings = new SiteSetting()
    Object.assign(settings, req.body)
    await settings.save()
    res.json(settings)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
