import { NextResponse } from 'next/server'
import { imageFilePath } from '@/lib/artworks-core'
import { rejectIfUnauthorized, getStudioDb, jsonError } from '@/lib/studio-auth'

export const dynamic = 'force-dynamic'

// Hands the phone a one-time signed URL so the photo goes straight to
// Supabase Storage (skips Vercel's request-size limit).
export async function POST(request) {
  const denied = rejectIfUnauthorized(request)
  if (denied) return denied
  try {
    const { ext } = await request.json().catch(() => ({}))
    const path = imageFilePath(['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg')
    const db = getStudioDb()
    const { data, error } = await db.storage.from('artworks').createSignedUploadUrl(path)
    if (error) throw error
    return NextResponse.json({ path: data.path, token: data.token })
  } catch (e) { return jsonError(e) }
}
