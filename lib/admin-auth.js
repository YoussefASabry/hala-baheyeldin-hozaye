import { NextResponse } from 'next/server'
import { getAuthenticatedSupabase } from './supabase'

export async function getAuthSupabase(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  return getAuthenticatedSupabase(token)
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
