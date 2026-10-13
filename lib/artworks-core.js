// Shared artwork rules used by both /admin (browser, logged-in session) and
// /studio (server routes, secret link). Keep this file free of any Supabase
// client so it runs in either place.

export const DEFAULT_MEDIUMS = ['Oil on canvas', 'Acrylic on canvas', 'Mixed media', 'Watercolor', 'Charcoal', 'Pastel', 'Ink']

// Arabic names for the studio's big medium cards. Mediums not listed here
// (custom ones already in the data) just show their English name.
export const MEDIUM_AR = {
  'Oil on canvas': 'زيت على قماش',
  'Acrylic on canvas': 'أكريليك على قماش',
  'Mixed media': 'خامات مختلطة',
  'Watercolor': 'ألوان مائية',
  'Charcoal': 'فحم',
  'Pastel': 'باستيل',
  'Ink': 'حبر',
}

export function mediumOptions(usedMediums = []) {
  return Array.from(new Set([...DEFAULT_MEDIUMS, ...usedMediums.filter(Boolean)])).sort()
}

// DB stores inches; the UI works in cm. length = vertical side (height),
// width = horizontal side — same as ArtworkCard's aspect ratio.
export function cmToIn(cm) {
  return cm ? +(cm / 2.54).toFixed(2) : null
}

export function inToCm(inches) {
  return inches ? +(inches * 2.54).toFixed(1) : null
}

export function newId() {
  return crypto.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

// Same payload the admin form has always saved.
export function buildArtworkPayload(form, fallbackSortOrder) {
  return {
    id: form.id || newId(),
    title: form.title || '',
    year: form.year || '',
    medium: form.medium,
    length_in: cmToIn(form.length_cm),
    width_in: cmToIn(form.width_cm),
    description: form.description,
    price: form.price || 0,
    status: form.status || 'available',
    is_published: form.is_published !== undefined ? form.is_published : true,
    sort_order: form.sort_order ?? fallbackSortOrder,
  }
}

export function imageFilePath(ext) {
  const clean = String(ext || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'jpg'
  return `artwork_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${clean}`
}

export function moveItem(list, from, to) {
  if (from === to || from < 0 || from >= list.length) return list
  const next = [...list]
  const [moved] = next.splice(from, 1)
  next.splice(Math.max(0, Math.min(to, next.length)), 0, moved)
  return next
}

export function primaryImage(artwork) {
  const imgs = artwork?.artwork_images || []
  return imgs.find((i) => i.is_primary) || imgs[0] || null
}
