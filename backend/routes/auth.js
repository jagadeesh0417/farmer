import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
}

router.post('/signup', async (req, res) => {
  try {
    const { email, phone, password, fullName } = req.body
    if (!password) return res.status(400).json({ error: 'Password is required' })
    if (!email && !phone) return res.status(400).json({ error: 'Email or phone is required' })
    const existing = await User.findOne({ $or: [{ email }, { phone }] })
    if (existing) return res.status(400).json({ error: 'User already exists' })
    const user = await User.create({ email, phone, password, fullName })
    const token = generateToken(user._id)
    res.status(201).json({ token, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body
    console.error('DIAG_LOGIN_BODY', { email, hasPassword: !!password, pwLen: password?.length })
    if (!password) return res.status(400).json({ error: 'AUTH_NO_PW: Password is required' })
    console.error('DIAG_DB_NAME', mongoose.connection.name, mongoose.connection.host)
    const user = await User.findOne({ $or: [{ email }, { phone }] }).select('+password')
    if (!user) return res.status(401).json({ error: 'AUTH_NO_USER: Invalid credentials' })
    console.error('DIAG_USER_FOUND', { id: user._id, role: user.role, isActive: user.isActive, hasPassword: !!user.password, pwStoredLen: user.password?.length })
    if (user.password) {
      const startsWith = user.password.substring(0, 4)
      console.error('DIAG_HASH_PREFIX', startsWith, 'hashLen', user.password.length)
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) return res.status(401).json({ error: 'AUTH_BAD_PW: Invalid credentials' })
    if (!user.isActive) return res.status(403).json({ error: 'AUTH_INACTIVE: Account is disabled' })
    user.lastLogin = new Date()
    await user.save()
    const token = generateToken(user._id)
    res.json({ token, user })
  } catch (err) {
    console.error('DIAG_LOGIN_THROW', err)
    res.status(500).json({ error: 'AUTH_THROW: ' + err.message })
  }
})

router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user })
})

router.get('/admin/me', protect, adminOnly, async (req, res) => {
  res.json({ user: req.user })
})

router.post('/diag-test-pw', async (req, res) => {
  try {
    const { testPassword } = req.body
    const adminUser = await User.findOne({ role: 'admin' }).select('+password')
    if (!adminUser) return res.json({ userExists: false })
    const hash = adminUser.password
    const bcryptCompare = await bcrypt.compare(testPassword || 'admin123', hash)
    res.json({ userExists: true, hashLen: hash?.length, hashPrefix: hash?.substring(0, 7), bcryptCompare, testPwLen: testPassword?.length || 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/diag', async (req, res) => {
  try {
    const dbName = mongoose.connection.name
    const dbHost = mongoose.connection.host
    const adminCount = await User.countDocuments({ role: 'admin' })
    const adminUser = await User.findOne({ role: 'admin' }).select('+password')
    let hashInfo = null
    if (adminUser) {
      hashInfo = {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive,
        hasPassword: !!adminUser.password,
        hashLen: adminUser.password ? adminUser.password.length : 0,
        hashPrefix: adminUser.password ? adminUser.password.substring(0, 7) : null,
      }
    }
    let collectionNames = []
    try { const cols = await mongoose.connection.db.listCollections().toArray(); collectionNames = cols.map(c => c.name) } catch {}
    res.json({ dbName, dbHost, adminCount, hashInfo, collections: collectionNames })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, phone, addresses } = req.body
    const user = await User.findById(req.user._id)
    if (fullName) user.fullName = fullName
    if (phone) user.phone = phone
    if (addresses) user.addresses = addresses
    await user.save()
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
