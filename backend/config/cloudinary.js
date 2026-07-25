import { v2 as cloudinary } from 'cloudinary'

const missing = []
if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME')
if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY')
if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET')
if (missing.length > 0) {
  console.error('CLOUDINARY CONFIG ERROR — missing env vars:', missing.join(', '))
  console.error('Image uploads will fail. Set them in Render dashboard and redeploy.')
} else {
  console.log('Cloudinary configured:', process.env.CLOUDINARY_CLOUD_NAME)
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary
