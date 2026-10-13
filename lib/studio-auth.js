// Server-only helpers for the no-login "studio" link (/studio/<STUDIO_TOKEN>).
// Whoever holds the link can edit artworks — rotate STUDIO_TOKEN to revoke it.
import { timingSafeEqual } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export function isValidStudioToken(token) {
  const expected = process.env.STUDIO_TOKEN || ''
  if (expected.length < 24 || typeof token !== 'string') return false
  const a = Buffer.from(token)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

// Returns an error response if the request isn't carrying the studio token.
export function rejectIfUnauthorized(request) {
  if (!isValidStudioToken(request.headers.get('x-studio-token'))) {
    return NextResponse.json({ error: 'This link is not valid.' }, { status: 401 })
  }
  return null
}

// Studio writes need the service role (there is no logged-in user). Never
// fall back to the anon key here.
export function getStudioDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Server is missing SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, { auth: { persistSession: false } })
}

export function revalidateSite() {
  revalidatePath('/')
  revalidatePath('/gallery')
  revalidatePath('/painting/[id]', 'page')
}

export function jsonError(e, status = 500) {
  return NextResponse.json({ error: e?.message || String(e) }, { status })
}

export async function listArtworks(db) {
  const { data, error } = await db
    .from('artworks')
    .select('id, medium, length_in, width_in, price, status, sort_order, artwork_images(id, url, is_primary, sort_order)')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
}

// Write sort_order 0..n-1 for the given id order (same as admin's saveOrder).
export async function writeOrder(db, ids) {
  const results = await Promise.all(ids.map((id, i) => db.from('artworks').update({ sort_order: i }).eq('id', id)))
  const failed = results.find((r) => r.error)
  if (failed) throw failed.error
}

export function publicImageUrl(db, path) {
  return db.storage.from('artworks').getPublicUrl(path).data.publicUrl
}

// Only accept storage paths this app generates (see imageFilePath).
export function isValidImagePath(path) {
  return typeof path === 'string' && /^artwork_\d+_[a-z0-9]{1,8}\.[a-z0-9]{1,5}$/.test(path)
}
