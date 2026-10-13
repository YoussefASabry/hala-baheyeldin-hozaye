import { NextResponse } from 'next/server'
import { rejectIfUnauthorized, getStudioDb, jsonError, listArtworks, writeOrder, revalidateSite } from '@/lib/studio-auth'

export const dynamic = 'force-dynamic'

// { ids: [...] } — the full new order, first to last.
export async function POST(request) {
  const denied = rejectIfUnauthorized(request)
  if (denied) return denied
  try {
    const { ids } = await request.json()
    const db = getStudioDb()
    const current = (await listArtworks(db)).map((a) => a.id)
    const same = Array.isArray(ids) && ids.length === current.length && new Set(ids).size === ids.length && ids.every((id) => current.includes(id))
    if (!same) return NextResponse.json({ error: 'The paintings changed while you were working. Please reload and try again.' }, { status: 409 })
    await writeOrder(db, ids)
    revalidateSite()
    return NextResponse.json({ ok: true })
  } catch (e) { return jsonError(e) }
}
