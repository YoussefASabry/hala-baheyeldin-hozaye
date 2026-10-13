'use client'

import { createContext, useContext, useCallback } from 'react'
import { getBrowserSupabase } from '@/lib/supabase'
import { primaryImage } from '@/lib/artworks-core'

/* ─── Bilingual label: English and Arabic, equal size, side by side ─── */
export function Bi({ en, ar, className = '' }) {
  return (
    <span className={`st-bi ${className}`}>
      <span className="st-en" lang="en">{en}</span>
      <span className="st-ar" lang="ar" dir="rtl">{ar}</span>
    </span>
  )
}

export function Spinner({ big }) {
  return <span className={`st-spinner${big ? ' st-spinner-big' : ''}`} aria-hidden="true" />
}

export function BigButton({ icon, en, ar, onClick, variant = 'default', disabled, busy, type = 'button' }) {
  return (
    <button type={type} className={`st-btn st-btn-${variant}`} onClick={onClick} disabled={disabled || busy}>
      {busy ? <Spinner /> : icon && <span className="st-btn-icon" aria-hidden="true">{icon}</span>}
      <Bi en={en} ar={ar} />
    </button>
  )
}

export function Message({ kind = 'error', en, ar }) {
  if (!en && !ar) return null
  return (
    <div className={`st-msg st-msg-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <span aria-hidden="true">{kind === 'error' ? '⚠️' : '✅'}</span>
      <Bi en={en} ar={ar} />
    </div>
  )
}

// Full-screen "please wait" cover while something is saving.
export function BusyOverlay({ en = 'Saving…', ar = 'جارٍ الحفظ…' }) {
  return (
    <div className="st-overlay" role="status" aria-live="polite">
      <div className="st-overlay-box">
        <Spinner big />
        <Bi en={en} ar={ar} className="st-bi-col" />
        <p className="st-overlay-hint"><Bi en="Please don't close the page" ar="من فضلك لا تغلقي الصفحة" className="st-bi-col" /></p>
      </div>
    </div>
  )
}

export function ConfirmModal({ icon = '❓', en, ar, yes, no, danger, onYes, onNo }) {
  return (
    <div className="st-overlay" role="dialog" aria-modal="true">
      <div className="st-overlay-box">
        <div className="st-modal-icon" aria-hidden="true">{icon}</div>
        <h2 className="st-modal-title"><Bi en={en} ar={ar} className="st-bi-col" /></h2>
        <div className="st-stack">
          <BigButton variant={danger ? 'danger' : 'primary'} en={yes.en} ar={yes.ar} icon={yes.icon} onClick={onYes} />
          <BigButton en={no.en} ar={no.ar} icon={no.icon} onClick={onNo} />
        </div>
      </div>
    </div>
  )
}

/* ─── Screen frame: back button, title, optional step progress ─── */
export function Screen({ title, onBack, backLabel, step, total, children, footer }) {
  return (
    <div className="st-screen">
      <header className="st-header">
        {onBack && (
          <button type="button" className="st-back" onClick={onBack}>
            <span aria-hidden="true">←</span>
            <Bi en={backLabel?.en || 'Back'} ar={backLabel?.ar || 'رجوع'} />
          </button>
        )}
        {step && (
          <div className="st-progress" aria-label={`Step ${step} of ${total}`}>
            <div className="st-progress-text"><Bi en={`Step ${step} of ${total}`} ar={`خطوة ${step} من ${total}`} /></div>
            <div className="st-progress-bar"><div style={{ width: `${(step / total) * 100}%` }} /></div>
          </div>
        )}
        {title && <h1 className="st-title"><Bi en={title.en} ar={title.ar} className="st-bi-col" /></h1>}
      </header>
      <div className="st-body">{children}</div>
      {footer && <footer className="st-footer">{footer}</footer>}
    </div>
  )
}

export function Thumb({ artwork, className = '' }) {
  const img = primaryImage(artwork)
  return img
    ? <img className={`st-thumb ${className}`} src={img.url} alt="" loading="lazy" decoding="async" />
    : <span className={`st-thumb st-thumb-empty ${className}`} aria-hidden="true">🖼️</span>
}

export function formatPrice(p) {
  return p ? `${Number(p).toLocaleString('en-US')} EGP` : '—'
}

/* ─── API access (token travels in a header, never in the API URL) ─── */
const TokenContext = createContext('')
export const TokenProvider = TokenContext.Provider

export function useStudioApi() {
  const token = useContext(TokenContext)
  return useCallback(async (path, { method = 'GET', body } = {}) => {
    let res
    try {
      res = await fetch(`/api/studio/${path}`, {
        method,
        headers: { 'x-studio-token': token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
        cache: 'no-store',
      })
    } catch {
      throw new Error('No internet connection. Please check and try again.')
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
    return data
  }, [token])
}

/* ─── Photos: shrink on the phone, then upload straight to storage ─── */
const MAX_SIDE = 2400

export async function compressImage(file) {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close?.()
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.88))
    if (blob) return { blob, ext: 'jpg', type: 'image/jpeg' }
  } catch { /* fall through: upload the original */ }
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  return { blob: file, ext, type: file.type || 'image/jpeg' }
}

export async function uploadPhoto(api, file) {
  const { blob, ext, type } = await compressImage(file)
  const { path, token } = await api('upload-url', { method: 'POST', body: { ext } })
  const supabase = getBrowserSupabase()
  if (!supabase) throw new Error('Photo upload is not available right now.')
  const { error } = await supabase.storage.from('artworks').uploadToSignedUrl(path, token, blob, { contentType: type })
  if (error) throw new Error('The photo could not be uploaded. Please try again.')
  return path
}
