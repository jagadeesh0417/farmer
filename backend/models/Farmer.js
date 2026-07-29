import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  slug: { type: String, unique: true },
  village: String,
  district: String,
  state: String,
  products: [String],
  certifications: [String],
  quantity: String,
  availability: String,
  pickupDetails: String,
  images: [String],
  cloudinaryPublicIds: [String],
  qrImage: String,
  qrPublicId: String,
  bio: String,
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true })

farmerSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = uuidv4()
  }
  next()
})

farmerSchema.index({ name: 'text', phone: 'text', village: 'text' })

export default mongoose.model('Farmer', farmerSchema)
