import { createHash, randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import sharp from 'sharp'
import * as exifr from 'exifr'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const MAX_BYTES = 25 * 1024 * 1024

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const evidenceItemId = formData.get('evidence_item_id')

  if (!(file instanceof File) || typeof evidenceItemId !== 'string') {
    return NextResponse.json(
      { error: 'file and evidence_item_id are required' },
      { status: 400 }
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large' }, { status: 413 })
  }

  // RLS scopes evidence_items to the signed-in user through the tenancy
  // chain, so this also verifies ownership before we accept the upload.
  const { data: evidenceItem, error: evidenceError } = await supabase
    .from('evidence_items')
    .select('id')
    .eq('id', evidenceItemId)
    .maybeSingle()

  if (evidenceError || !evidenceItem) {
    return NextResponse.json({ error: 'Evidence item not found' }, { status: 404 })
  }

  const originalBuffer = Buffer.from(await file.arrayBuffer())
  const sha256 = createHash('sha256').update(originalBuffer).digest('hex')

  let exifData: Record<string, unknown> | undefined
  try {
    exifData = await exifr.parse(originalBuffer, { gps: true, tiff: true, exif: true })
  } catch {
    exifData = undefined
  }

  const exifTakenAt =
    (exifData?.DateTimeOriginal as Date | undefined) ??
    (exifData?.CreateDate as Date | undefined) ??
    null
  const exifGpsLat = (exifData?.latitude as number | undefined) ?? null
  const exifGpsLng = (exifData?.longitude as number | undefined) ?? null

  const webBuffer = await sharp(originalBuffer)
    .rotate() // apply EXIF orientation before stripping metadata
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer()

  const photoId = randomUUID()
  const extension = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const basePath = `${user.id}/${evidenceItemId}/${photoId}`
  const originalKey = `${basePath}/original.${extension}`
  const webKey = `${basePath}/web.jpg`

  const { error: originalUploadError } = await supabase.storage
    .from('photos')
    .upload(originalKey, originalBuffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (originalUploadError) {
    return NextResponse.json({ error: originalUploadError.message }, { status: 500 })
  }

  const { error: webUploadError } = await supabase.storage
    .from('photos')
    .upload(webKey, webBuffer, {
      contentType: 'image/jpeg',
      upsert: false,
    })

  if (webUploadError) {
    return NextResponse.json({ error: webUploadError.message }, { status: 500 })
  }

  const { data: photo, error: insertError } = await supabase
    .from('photos')
    .insert({
      id: photoId,
      evidence_item_id: evidenceItemId,
      storage_key: basePath,
      sha256,
      exif_taken_at: exifTakenAt,
      exif_gps_lat: exifGpsLat,
      exif_gps_lng: exifGpsLng,
      bytes: originalBuffer.byteLength,
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ photo })
}
