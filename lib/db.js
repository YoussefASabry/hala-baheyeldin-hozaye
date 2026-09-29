import { getServiceSupabase, isSupabaseConfigured } from './supabase'
import { MOCK_PROFILE, MOCK_ARTWORKS, MOCK_QNA } from './mockData'

function getDb() {
  const s = getServiceSupabase()
  if (!s) throw new Error('Supabase not configured')
  return s
}

export async function getArtistProfile() {
  if (!isSupabaseConfigured()) return MOCK_PROFILE
  const { data } = await getDb().from('artist_profile').select('*').maybeSingle()
  return data || MOCK_PROFILE
}

export async function getArtworks() {
  if (!isSupabaseConfigured()) return MOCK_ARTWORKS.map(withSize)
  const { data } = await getDb()
    .from('artworks')
    .select('*, artwork_images(*)')
    .is('deleted_at', null)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
  return (data || []).map(formatArtwork)
}

export async function getArtworkById(id) {
  if (!isSupabaseConfigured()) {
    const found = MOCK_ARTWORKS.find((a) => a.id === id)
    return found ? withSize(found) : null
  }
  const { data } = await getDb()
    .from('artworks')
    .select('*, artwork_images(*)')
    .is('deleted_at', null)
    .eq('is_published', true)
    .eq('id', id)
    .maybeSingle()
  return data ? formatArtwork(data) : null
}

export async function getQna() {
  if (!isSupabaseConfigured()) return MOCK_QNA
  const { data } = await getDb().from('qna').select('*').order('sort_order', { ascending: true })
  return data || []
}

function inToCm(inches) {
  return inches ? +(inches * 2.54).toFixed(1) : null
}

function round1(n) {
  return n == null ? null : +(+n).toFixed(1)
}

function withSize(artwork) {
  const hasSize = artwork.length_in != null && artwork.width_in != null
  return {
    ...artwork,
    size: hasSize ? `${round1(artwork.length_in)} × ${round1(artwork.width_in)} in` : null,
    size_cm: hasSize ? `${inToCm(artwork.length_in)} × ${inToCm(artwork.width_in)} cm` : null,
  }
}

function formatArtwork(row) {
  const primary = (row.artwork_images || []).find((img) => img.is_primary) || (row.artwork_images || [])[0]
  const hasSize = row.length_in != null && row.width_in != null
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    medium: row.medium,
    length_in: row.length_in,
    width_in: row.width_in,
    size: hasSize ? `${round1(row.length_in)} × ${round1(row.width_in)} in` : null,
    size_cm: hasSize ? `${inToCm(row.length_in)} × ${inToCm(row.width_in)} cm` : null,
    description: row.description,
    price: row.price,
    status: row.status || 'available',
    sold: row.status === 'sold',
    published: row.is_published,
    image: primary ? primary.url : null,
    images: (row.artwork_images || []).map((img) => img.url),
    sort_order: row.sort_order,
  }
}
