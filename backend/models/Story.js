import mongoose from 'mongoose'

const storySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000 },
  thumbnail: String,
  thumbnailPublicId: String,
  videoUrl: { type: String, required: true, maxlength: 500 },
  videoPublicId: String,
  cloudinaryPublicId: String,
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  duration: { type: String, maxlength: 16 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

storySchema.pre('validate', function (next) {
  if (this.cloudinaryPublicId && !this.videoPublicId) this.videoPublicId = this.cloudinaryPublicId
  else if (this.videoPublicId && !this.cloudinaryPublicId) this.cloudinaryPublicId = this.videoPublicId
  next()
})

export default mongoose.model('Story', storySchema)
