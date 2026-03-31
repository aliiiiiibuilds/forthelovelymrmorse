import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const token = await getTokenFromCookies()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'chat'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Images only (jpg, png, gif, webp)' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Max file size is 5MB' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Check if Cloudinary is configured
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const url = await uploadImage(buffer, folder, file.type)
      return NextResponse.json({ url })
    }

    // Fallback to base64 for local development
    const base64 = buffer.toString('base64')
    const url = `data:${file.type};base64,${base64}`
    return NextResponse.json({ url })

  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
