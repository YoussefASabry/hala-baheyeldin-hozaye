import { NextResponse } from 'next/server'
import { getStudioDb, jsonError } from '@/lib/studio-auth'

export const dynamic = 'force-dynamic'

// Lets /admin/setup check an invite without the browser reading admin_invites
// (that table is closed to the public once supabase-rls-lockdown.sql runs).
export async function POST(request) {
  try {
    const { token } = await request.json().catch(() => ({}))
    if (typeof token !== 'string' || token.length < 16 || token.length > 128) {
      return NextResponse.json({ valid: false })
    }
    const { data, error } = await getStudioDb()
      .from('admin_invites')
      .select('expires_at')
      .eq('token', token)
      .is('used_at', null)
      .maybeSingle()
    if (error) throw error
    const valid = !!data && !(data.expires_at && new Date(data.expires_at) < new Date())
    return NextResponse.json({ valid })
  } catch (e) { return jsonError(e) }
}
