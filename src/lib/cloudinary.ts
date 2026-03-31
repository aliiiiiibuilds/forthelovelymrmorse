import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(
  buffer: Buffer,
  folder: string,
  mimetype: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `vault-platform/${folder}`,
        resource_type: 'image',
        // Auto-optimize: compress, convert to webp where possible
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1200, crop: 'limit' }, // max 1200px wide
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'))
        resolve(result.secure_url)
      }
    )
    uploadStream.end(buffer)
  })
}

export async function deleteImage(url: string): Promise<void> {
  try {
    // Extract public_id from URL
    const parts = url.split('/')
    const filename = parts[parts.length - 1].split('.')[0]
    const folder = parts[parts.length - 2]
    const publicId = `vault-platform/${folder}/${filename}`
    await cloudinary.uploader.destroy(publicId)
  } catch {
    // Non-fatal - image might already be gone
  }
}
