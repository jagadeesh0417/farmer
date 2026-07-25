import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const EMAIL = process.env.ADMIN_EMAIL || 'haifarmer@gmail.com'
const PASSWORD = process.env.ADMIN_PASS || 'Farmer1234'
const NAME = 'HAiFarmer Admin'

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI)
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false, collection: 'users' }))
  const hash = await bcrypt.hash(PASSWORD, 10)
  const doc = await User.findOneAndUpdate(
    { email: EMAIL },
    { $set: { email: EMAIL, password: hash, name: NAME, role: 'admin', isActive: true, fullName: NAME } },
    { upsert: true, new: true }
  )
  console.log('Admin ready:', doc.email)
  await mongoose.disconnect()
}

createAdmin().catch(err => { console.error(err); process.exit(1) })
