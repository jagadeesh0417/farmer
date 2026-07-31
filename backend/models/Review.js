import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  image: String,
  imagePublicId: String,
  designation: { type: String, trim: true, maxlength: 100 },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  product: { type: String, trim: true, maxlength: 150 },
  reviewDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['published', 'draft'], default: 'draft' },
  displayOrder: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
}, { timestamps: true })

reviewSchema.index({ displayOrder: 1 })
reviewSchema.index({ status: 1, displayOrder: 1 })

export default mongoose.model('Review', reviewSchema)
