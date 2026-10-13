'use client'

import { useState } from 'react'
import { getBrowserSupabase } from '@/lib/supabase'

// /admin card: fetches Hala's no-login studio link so it can be copied or sent.
export default function StudioLinkCard() {
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const getLink = async () => {
    setBusy(true); setError(''); setCopied(false)
    try {
      const { data: { session } } = await getBrowserSupabase().auth.getSession()
      if (!session?.access_token) throw new Error('Please log in again.')
      const res = await fetch('/api/admin/studio-link', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: 'no-store',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not get the link.')
      setUrl(data.url)
    } catch (e) { setError(e.message) }
    setBusy(false)
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true) } catch { setError('Copy failed. Press and hold the link to copy it.') }
  }

  const message = `Your page for adding and changing your paintings (no password needed):\nصفحتك لإضافة وتعديل لوحاتك (بدون كلمة سر):\n${url}`

  return (
    <div className="admin-form-card" style={{ marginBottom: 24 }}>
      <h4 style={{ marginTop: 0 }}>Hala&apos;s studio link</h4>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 0 }}>
        A simple phone page where Hala can add, edit and reorder paintings without logging in.
        Anyone who has this link can edit paintings, so only send it to her.
      </p>
      {!url ? (
        <button className="btn btn-primary" onClick={getLink} disabled={busy}>
          {busy ? 'Getting link…' : 'Show studio link'}
        </button>
      ) : (
        <>
          <input readOnly value={url} onFocus={(e) => e.target.select()}
            style={{ width: '100%', fontSize: 13, padding: '8px 10px', marginBottom: 10, fontFamily: 'monospace' }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={copy}>{copied ? 'Copied ✓' : 'Copy link'}</button>
            <a className="btn btn-secondary" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>
            <a className="btn btn-secondary" href={url} target="_blank" rel="noopener noreferrer">Open it</a>
          </div>
        </>
      )}
      {error && <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 0 }}>{error}</p>}
    </div>
  )
}
