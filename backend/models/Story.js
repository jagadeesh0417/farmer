import mongoose from 'mongoose'

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  thumbnail: String,
  thumbnailPublicId: String,
  videoUrl: String,
  videoPublicId: String,
  duration: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

storySchema.index({ order: 1 })

export default mongoose.model('Story', storySchema)
