import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import sharp from "sharp"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const type = formData.get('type') as string || 'news'
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
    const folder = type === 'team-logo' ? 'teams' : 'news'
    const filename = `${prefix}-${Date.now()}-${randomUUID().slice(0,8)}.jpg`
    const storagePath = `${folder}/${filename}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('manicaland basketball association storage') // your bucket name
      .upload(storagePath, processed, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    // Get public URL
    const { data } = supabase.storage
      .from('manicaland basketball association storage')
      .getPublicUrl(storagePath)

    return NextResponse.json({ success: true, image: data.publicUrl })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed: ' + (error as Error).message }, { status: 500 })
  }
}