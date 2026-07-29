import mongoose from 'mongoose'

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  thumbnail: String,
  thumbnailPublicId: String,
  videoUrl: { type: String, required: true },
  videoPublicId: String,
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Story', storySchema)
