import express from 'express'
import mongoose from 'mongoose'
import SiteSetting from '../models/SiteSetting.js'
import Product from '../models/Product.js'
import Bundle from '../models/Bundle.js'
import Category from '../models/Category.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

const PRODUCT_SECTION_KEYS = [
  'groceries', 'bestSellers', 'newArrivals', 'trending', 'healthConcern',
  'millets', 'lentilsBeans', 'honey', 'spices',
]
const BUNDLE_SECTION_KEYS = ['superSaverCombos', 'combos']
const SECTION_KEYS = [...PRODUCT_SECTION_KEYS, ...BUNDLE_SECTION_KEYS]

const SECTION_LIMITS = {
  groceries: 12,
  bestSellers: 12,
  newArrivals: 8,
  trending: 8,
  millets: 10,
  lentilsBeans: 10,
  honey: 10,
  spices: 10,
}

const CATEGORY_ALIASES = {
  millets: ['millets'],
  lentilsBeans: ['lentils-beans', 'lentils', 'beans'],
  honey: ['honey', 'natural-sweeteners'],
  spices: ['spices', 'spices-seasonings', 'spices-seasoning'],
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function ensureHomeSections(settings) {
  let changed = false
  if (!settings.homeSections || typeof settings.homeSections !== 'object') {
    settings.homeSections = {}
  }
  for (const key of SECTION_KEYS) {
    if (!Array.isArray(settings.homeSections[key])) {
      settings.homeSections[key] = []
      changed = true
    }
  }
  if (changed) await settings.save().catch(() => {})
  return settings
}

async function autoFillSection(key) {
  const baseQuery = { isActive: { $ne: false } }
  const limit = SECTION_LIMITS[key] || 10

  if (key === 'bestSellers') {
    return Product.find({ ...baseQuery, isFeatured: true }).sort({ createdAt: -1 }).limit(limit)
  }
  if (key === 'newArrivals' || key === 'trending') {
    return Product.find(baseQuery).sort({ createdAt: -1 }).limit(limit)
  }
  if (key === 'groceries') {
    return Product.find(baseQuery).sort({ createdAt: -1 }).limit(limit)
  }
  if (key === 'healthConcern') return []

  const aliases = CATEGORY_ALIASES[key]
  if (aliases && aliases.length) {
    const cats = await Category.find({ slug: { $in: aliases }, isActive: { $ne: false } })
    const catIds = cats.map(c => c._id)
    const catNames = cats.map(c => new RegExp(escapeRegExp(c.name), 'i'))
    const or = []
    if (catIds.length) or.push({ category: { $in: catIds } })
    if (catNames.length) or.push({ categoryName: { $in: catNames } })
    if (!or.length) return []
    return Product.find({ ...baseQuery, $or: or }).sort({ createdAt: -1 }).limit(limit)
  }

  return []
}

async function autoFillBundles(key) {
  const bundles = await Bundle.find({ isActive: { $ne: false } }).sort({ createdAt: -1 })
  if (key === 'superSaverCombos') {
    return bundles.filter(b => b.comboType === 'super_saver' || b.isSuperSaver)
  }
  return bundles.filter(b => (b.comboType || 'normal') !== 'super_saver' && !b.isSuperSaver)
}

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
    await ensureHomeSections(settings)
    res.json(settings)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/home', async (req, res) => {
  try {
    let settings = await SiteSetting.findOne()
    if (!settings) settings = await SiteSetting.create({})
    await ensureHomeSections(settings)
    const hs = settings.homeSections || {}
    const result = {}
    const staleIds = {}

    for (const key of SECTION_KEYS) {
      const rawIds = hs[key] || []
      const ids = rawIds.filter(id => id && mongoose.isValidObjectId(id))
      if (ids.length === 0) {
        result[key] = BUNDLE_SECTION_KEYS.includes(key)
          ? await autoFillBundles(key)
          : await autoFillSection(key)
        continue
      }

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
    await ensureHomeSections(settings)
    await settings.save()
    res.json(settings)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
