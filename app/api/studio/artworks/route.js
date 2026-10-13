import { NextResponse } from 'next/server'
import { buildArtworkPayload, moveItem } from '@/lib/artworks-core'
import {
  rejectIfUnauthorized, getStudioDb, revalidateSite, jsonError,
  listArtworks, writeOrder, publicImageUrl, isValidImagePath,
} from '@/lib/studio-auth'

export const dynamic = 'force-dynamic'

class BadInput extends Error {}

function cleanMedium(v) {
  const s = typeof v === 'string' ? v.trim() : ''
  if (!s || s.length > 80) throw new BadInput('Please choose a medium.')
  return s
}
function cleanCm(v, label) {
  const n = Number(v)
  if (!Number.isFinite(n) || n < 1 || n > 1000) throw new BadInput(`${label} must be between 1 and 1000 cm.`)
  return +n.toFixed(1)
}
function cleanPrice(v) {
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0 || n > 100000000) throw new BadInput('Please enter a valid price.')
  return Math.round(n)
}
function cleanPosition(v, max) {
  const n = Number(v)
  if (!Number.isInteger(n)) throw new BadInput('Please choose a place.')
  return Math.max(0, Math.min(n, max))
}

function handle(e) {
  return jsonError(e, e instanceof BadInput ? 400 : 500)
}

async function setPrimaryImage(db, artworkId, path) {
  if (!isValidImagePath(path)) throw new BadInput('Photo upload failed. Please try again.')
  // "Change photo" replaces the main photo; any extra photos added from /admin stay.
  // Insert first so a failure never leaves the painting without a photo.
  const { data: added, error } = await db.from('artwork_images').insert({
    artwork_id: artworkId, url: publicImageUrl(db, path), is_primary: false, sort_order: 0,
  }).select('id').single()
  if (error) throw error
  const { error: delErr } = await db.from('artwork_images').delete().eq('artwork_id', artworkId).eq('is_primary', true)
  if (delErr) throw delErr
  const { error: setErr } = await db.from('artwork_images').update({ is_primary: true }).eq('id', added.id)
  if (setErr) throw setErr
}

export async function GET(request) {
  const denied = rejectIfUnauthorized(request)
  if (denied) return denied
  try {
    const db = getStudioDb()
    return NextResponse.json({ artworks: await listArtworks(db) })
  } catch (e) { return handle(e) }
}

// Create: { imagePath, medium, length_cm, width_cm, price, position }
export async function POST(request) {
  const denied = rejectIfUnauthorized(request)
  if (denied) return denied
  try {
    const body = await request.json()
    const db = getStudioDb()
    const current = await listArtworks(db)
    if (!isValidImagePath(body.imagePath)) throw new BadInput('Please add a photo first.')
    const position = cleanPosition(body.position, current.length)

    const payload = buildArtworkPayload({
      medium: cleanMedium(body.medium),
      length_cm: cleanCm(body.length_cm, 'Height'),
      width_cm: cleanCm(body.width_cm, 'Width'),
      price: cleanPrice(body.price),
      description: '',
      sort_order: position,
    }, current.length)

    const { error } = await db.from('artworks').insert(payload)
    if (error) throw error

    try {
      await setPrimaryImage(db, payload.id, body.imagePath)
    } catch (e) {
      await db.from('artworks').delete().eq('id', payload.id) // roll back the half-made painting
      throw e
    }

    const ids = current.map((a) => a.id)
    ids.splice(position, 0, payload.id)
    await writeOrder(db, ids)

    revalidateSite()
    return NextResponse.json({ id: payload.id })
  } catch (e) { return handle(e) }
}

// Edit one thing: { id, medium? | length_cm+width_cm? | price? | imagePath? | position? }
export async function PATCH(request) {
  const denied = rejectIfUnauthorized(request)
  if (denied) return denied
  try {
    const body = await request.json()
    const db = getStudioDb()
    const current = await listArtworks(db)
    const index = current.findIndex((a) => a.id === body.id)
    if (index === -1) throw new BadInput('This painting was not found. It may have been deleted.')

    const update = {}
    if (body.medium !== undefined) update.medium = cleanMedium(body.medium)
    if (body.length_cm !== undefined || body.width_cm !== undefined) {
      update.length_in = +(cleanCm(body.length_cm, 'Height') / 2.54).toFixed(2)
      update.width_in = +(cleanCm(body.width_cm, 'Width') / 2.54).toFixed(2)
    }
    if (body.price !== undefined) update.price = cleanPrice(body.price)

    if (Object.keys(update).length) {
      const { error } = await db.from('artworks').update(update).eq('id', body.id)
      if (error) throw error
    }
    if (body.imagePath !== undefined) await setPrimaryImage(db, body.id, body.imagePath)
    if (body.position !== undefined) {
      const ids = moveItem(current.map((a) => a.id), index, cleanPosition(body.position, current.length - 1))
      await writeOrder(db, ids)
    }

    revalidateSite()
    return NextResponse.json({ ok: true })
  } catch (e) { return handle(e) }
}

// Soft delete, same as /admin: sets deleted_at so it can be restored.
export async function DELETE(request) {
  const denied = rejectIfUnauthorized(request)
  if (denied) return denied
  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) throw new BadInput('Missing painting.')
    const db = getStudioDb()
    const { error } = await db.from('artworks').update({ deleted_at: new Date().toISOString() }).eq('id', id).is('deleted_at', null)
    if (error) throw error
    revalidateSite()
    return NextResponse.json({ ok: true })
  } catch (e) { return handle(e) }
}
