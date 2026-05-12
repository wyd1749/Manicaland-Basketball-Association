import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { randomUUID } from "crypto"
import sharp from "sharp"



export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const type = formData.get('type') as string || 'news'
    const uploadDir = path.join(process.cwd(), "public", "images", type === 'team-logo' ? 'teams' : 'news')
    await fs.mkdir(uploadDir, { recursive: true })
    const file = formData.get('image') as File | null

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No image file' }, { status: 400 })
    }

    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Invalid image or too large (5MB max)' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const processed = await sharp(buffer)
      .resize(1280, 720, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 100 })
      .toBuffer()

    const prefix = type === 'team-logo' ? 'team' : 'news'
    const filename = `${prefix}-${Date.now()}-${randomUUID().slice(0,8)}.jpg`
    const filepath = path.join(uploadDir, filename)
    
    await fs.writeFile(filepath, processed)

const imagePath = `/images/${type === 'team-logo' ? 'teams' : 'news'}/${filename}`

    return NextResponse.json({ success: true, image: imagePath })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed: ' + (error as Error).message }, { status: 500 })
  }
}
