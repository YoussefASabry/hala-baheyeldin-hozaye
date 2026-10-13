import { NextResponse } from 'next/server'
import { getAdminUser, getStudioToken, jsonError } from '@/lib/studio-auth'

export const dynamic = 'force-dynamic'

// Logged-in admins only: returns Hala's no-login studio link.
export async function GET(request) {
  try {
    const user = await getAdminUser(request)
    if (!user) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 })
    const token = getStudioToken()
    if (!token) return NextResponse.json({ error: 'Server is missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    const origin = new URL(request.url).origin
    return NextResponse.json({ url: `${origin}/studio/${token}` }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) { return jsonError(e) }
}
