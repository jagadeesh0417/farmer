import 'dotenv/config'
import { connectDB } from './lib/mongoose.js'
import User from './models/User.js'
import SiteSetting from './models/SiteSetting.js'

const seed = async () => {
  await connectDB()

  const adminExists = await User.findOne({ role: 'admin' })
  if (adminExists) {
    adminExists.email = 'kakinadahomefoods@gmail.com'
    adminExists.password = 'admin123'
    adminExists.fullName = 'HAiFarmer Admin'
    await adminExists.save()
    console.log('Admin credentials updated: kakinadahomefoods@gmail.com / admin123')
  } else {
    await User.create({
      email: 'kakinadahomefoods@gmail.com',
      password: 'admin123',
      fullName: 'HAiFarmer Admin',
      role: 'admin',
    })
    console.log('Admin user created: kakinadahomefoods@gmail.com / admin123')
  }

  const settingsExists = await SiteSetting.findOne()
  if (!settingsExists) {
    await SiteSetting.create({})
    console.log('Default settings created')
  } else {
    console.log('Settings already exist')
  }

  console.log('Seed complete')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
