import mongoose from 'mongoose'

const bannerSettingSchema = new mongoose.Schema({
  bannerKey: { type: String, required: true, unique: true },
  sectionName: { type: String, required: true },
  title: String,
  subtitle: String,
  buttonText: String,
  buttonLink: String,
  image: String,
  cloudinaryPublicId: String,
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

bannerSettingSchema.index({ bannerKey: 1 })

export default mongoose.model('BannerSetting', bannerSettingSchema)
