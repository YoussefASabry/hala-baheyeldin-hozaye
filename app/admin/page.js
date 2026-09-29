'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabase'
import { getAdminClient } from '@/lib/admin-client'

const TABS = ['Artworks', 'Profile', 'Q & A']

export default function AdminPage() {
  const [tab, setTab] = useState('Artworks')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = getBrowserSupabase()
    if (supabase) await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <main className="main-content" style={{ paddingTop: 100 }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
          <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
          <button onClick={handleLogout} style={{ padding: '6px 16px', border: '1px solid var(--ink-soft)', borderRadius: 4, background: 'transparent', color: 'var(--ink-soft)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Log Out</button>
        </div>

        {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{error}</div>}
        {success && <div style={{ background: '#f0fdf4', color: '#166534', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{success}</div>}

        <div style={{ display: 'flex', gap: 8, marginBottom: 30, flexWrap: 'wrap', borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }}
              style={{ padding: '8px 20px', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 13, background: tab === t ? 'var(--accent)' : 'transparent', color: tab === t ? '#fff' : 'var(--ink-soft)' }}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Artworks' && <ArtworksManager setError={setError} setSuccess={setSuccess} />}
        {tab === 'Profile' && <ProfileManager setError={setError} setSuccess={setSuccess} />}
        {tab === 'Q & A' && <QnaManager setError={setError} setSuccess={setSuccess} />}
      </div>
    </main>
  )
}

const arrowMini = {
  border: 'none', background: 'transparent', cursor: 'pointer',
  fontSize: 9, padding: '1px 3px', color: 'var(--ink-soft)',
}

const STATUS_OPTIONS = ['available', 'reserved', 'sold']
const DEFAULT_MEDIUMS = ['Oil on canvas', 'Acrylic on canvas', 'Mixed media', 'Watercolor', 'Charcoal', 'Pastel', 'Ink']

/* ─── Artworks (flat, admin-orderable, no collections) ─── */
function ArtworksManager({ setError, setSuccess }) {
  const [items, setItems] = useState([])
  const [edit, setEdit] = useState(null)
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const dragSrc = useRef(null)

  const load = async () => {
    try {
      const supabase = await getAdminClient()
      const { data, error } = await supabase.from('artworks').select('*, artwork_images(*)').is('deleted_at', null).order('sort_order', { ascending: true })
      if (error) throw error
      setItems(data || [])
      setDirty(false)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const usedMediums = Array.from(new Set(items.map((a) => a.medium).filter(Boolean))).sort()

  const handleDragStart = (e, index) => {
    dragSrc.current = index
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', '')
  }
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const handleDrop = (e, targetIndex) => {
    e.preventDefault()
    const src = dragSrc.current
    dragSrc.current = null
    if (src === null || src === targetIndex) return
    setItems((prev) => {
      const next = [...prev]
      const [moved] = next.splice(src, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
    setDirty(true)
  }

  const arrowUp = (idx) => {
    if (idx <= 0) return
    setItems((prev) => { const n = [...prev]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n })
    setDirty(true)
  }
  const arrowDown = (idx) => {
    if (idx >= items.length - 1) return
    setItems((prev) => { const n = [...prev]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n })
    setDirty(true)
  }

  const saveOrder = async () => {
    setBusy(true)
    try {
      const supabase = await getAdminClient()
      await Promise.all(items.map((item, i) => supabase.from('artworks').update({ sort_order: i }).eq('id', item.id)))
      setSuccess('Order saved!')
      setDirty(false)
    } catch (e) { setError(e.message) }
    setBusy(false)
  }

  const handleSave = async (form) => {
    setBusy(true); setError(''); setSuccess('')
    try {
      const supabase = await getAdminClient()
      const artworkId = form.id || (crypto.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16) }))
      const payload = {
        id: artworkId, title: form.title || '', year: form.year || '', medium: form.medium,
        length_in: form.length_in || null, width_in: form.width_in || null,
        description: form.description, price: form.price || 0,
        status: form.status || 'available',
        is_published: form.is_published !== undefined ? form.is_published : true,
        sort_order: form.sort_order ?? items.length,
      }
      const { error } = await supabase.from('artworks').upsert(payload)
      if (error) throw error

      if (form.files && form.files.length > 0) {
        const { count } = await supabase.from('artwork_images').select('*', { count: 'exact', head: true }).eq('artwork_id', artworkId)
        for (let i = 0; i < form.files.length; i++) {
          const file = form.files[i]
          const ext = file.name.split('.').pop()
          const filePath = `artwork_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`
          const { error: uploadErr } = await supabase.storage.from('artworks').upload(filePath, file, { contentType: file.type })
          if (uploadErr) throw uploadErr
          const { data: { publicUrl } } = supabase.storage.from('artworks').getPublicUrl(filePath)
          const { error: insertErr } = await supabase.from('artwork_images').insert({
            artwork_id: artworkId, url: publicUrl, is_primary: (count + i) === 0, sort_order: count + i,
          })
          if (insertErr) throw insertErr
        }
      }
      setSuccess('Saved'); setEdit(null); load()
    } catch (e) { setError(e.message) }
    setBusy(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Soft-delete this artwork?')) return
    setBusy(true)
    try {
      const supabase = await getAdminClient()
      const { error } = await supabase.from('artworks').update({ deleted_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
      setSuccess('Deleted'); load()
    } catch (e) { setError(e.message) }
    setBusy(false)
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'artworks-export.json'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => setEdit({})} disabled={busy}>+ New Artwork</button>
        <button className="btn btn-secondary" onClick={handleExport}>Export JSON</button>
        {dirty && (
          <button className="btn btn-primary" onClick={saveOrder} disabled={busy}>{busy ? 'Saving...' : 'Save Order'}</button>
        )}
        {dirty && <span style={{ fontSize: 12, color: 'var(--ink-soft)', alignSelf: 'center' }}>Unsaved changes</span>}
      </div>

      {edit && <ArtworkForm item={edit} usedMediums={usedMediums} onSave={handleSave} onCancel={() => setEdit(null)} busy={busy} />}

      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: 70 }}>#</th><th>Image</th><th>Medium</th><th>Size (in)</th><th>Status</th><th>Price</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 12, fontSize: 12, color: 'var(--ink-soft)', fontStyle: 'italic' }}>No artworks yet.</td></tr>
            )}
            {items.map((a, i) => (
              <tr key={a.id} draggable={!busy}
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, i)}
                style={{ cursor: 'grab' }}
              >
                <td style={{ whiteSpace: 'nowrap' }}>
                  <span style={{ cursor: 'grab', fontSize: 14, color: 'var(--ink-soft)', marginRight: 4 }}>&#x22EE;</span>
                  <button disabled={busy} onClick={() => arrowUp(i)} style={arrowMini}>&#9650;</button>
                  <button disabled={busy} onClick={() => arrowDown(i)} style={arrowMini}>&#9660;</button>
                </td>
                <td>{a.artwork_images?.[0]?.url ? <img src={a.artwork_images[0].url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} /> : '—'}</td>
                <td style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{a.medium || '—'}</td>
                <td style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{a.length_in && a.width_in ? `${a.length_in} × ${a.width_in}` : '—'}</td>
                <td>{a.status}</td>
                <td>EGP {(a.price || 0).toLocaleString()}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 12px', marginRight: 6 }} onClick={() => setEdit(a)}>Edit</button>
                  <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 12px', background: 'var(--accent-strong)', color: '#fff' }} onClick={() => handleDelete(a.id)} disabled={busy}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ArtworkForm({ item, usedMediums, onSave, onCancel, busy }) {
  const [form, setForm] = useState({
    id: item.id || null, title: item.title || '',
    year: item.year || '', medium: item.medium || '',
    length_in: item.length_in || '', width_in: item.width_in || '',
    description: item.description || '', price: item.price || '',
    status: item.status || 'available',
    is_published: item.is_published !== undefined ? item.is_published : true,
    sort_order: item.sort_order, files: null,
  })
  const [existingImages, setExistingImages] = useState(item.artwork_images || [])
  const [imageBusy, setImageBusy] = useState(false)
  const [customMedium, setCustomMedium] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const mediumOptions = Array.from(new Set([...DEFAULT_MEDIUMS, ...usedMediums])).sort()

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Delete this image?')) return
    setImageBusy(true)
    try {
      const supabase = await getAdminClient()
      await supabase.from('artwork_images').delete().eq('id', imageId)
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (e) { alert(e.message) }
    setImageBusy(false)
  }

  const handleSetPrimary = async (imageId) => {
    if (!form.id) return
    setImageBusy(true)
    try {
      const supabase = await getAdminClient()
      await supabase.from('artwork_images').update({ is_primary: false }).eq('artwork_id', form.id)
      await supabase.from('artwork_images').update({ is_primary: true }).eq('id', imageId)
      setExistingImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === imageId })))
    } catch (e) { alert(e.message) }
    setImageBusy(false)
  }

  return (
    <div className="admin-form-card">
      <h4>{form.id ? 'Edit Artwork' : 'New Artwork'}</h4>
      <div className="admin-form-grid">
        <div className="admin-field">
          <label>Medium</label>
          {!customMedium ? (
            <select
              value={form.medium}
              onChange={(e) => {
                if (e.target.value === '__custom__') { setCustomMedium(true); setForm({ ...form, medium: '' }) }
                else setForm({ ...form, medium: e.target.value })
              }}
            >
              <option value="">Select medium</option>
              {mediumOptions.map((m) => <option key={m} value={m}>{m}</option>)}
              <option value="__custom__">+ Add new medium…</option>
            </select>
          ) : (
            <input autoFocus placeholder="New medium name" value={form.medium} onChange={set('medium')} onBlur={() => { if (!form.medium) setCustomMedium(false) }} />
          )}
        </div>
        <div className="admin-field">
          <label>Status</label>
          <select value={form.status} onChange={set('status')}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div className="admin-field">
          <label>Length (in)</label>
          <input placeholder="0" type="number" value={form.length_in} onChange={set('length_in')} />
        </div>
        <div className="admin-field">
          <label>Width (in)</label>
          <input placeholder="0" type="number" value={form.width_in} onChange={set('width_in')} />
        </div>
        <div className="admin-field">
          <label>Price (EGP)</label>
          <input placeholder="0" type="number" value={form.price} onChange={set('price')} />
        </div>
        <div className="admin-checkboxes">
          <label><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Published</label>
        </div>
        <div className="admin-field full">
          <label>Images — select multiple</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setForm({ ...form, files: e.target.files })} />
        </div>
      </div>
      <div className="admin-field" style={{ marginTop: 12 }}>
        <label>Description</label>
        <textarea placeholder="Describe the artwork..." value={form.description} onChange={set('description')} />
      </div>

      {existingImages.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Images ({existingImages.length})</p>
          <div className="admin-image-grid">
            {existingImages.map((img) => (
              <div key={img.id} className="admin-image-thumb">
                <img src={img.url} alt="" style={{ border: img.is_primary ? '2px solid var(--accent)' : '2px solid transparent' }} />
                {img.is_primary && <span style={{ position: 'absolute', top: 2, left: 2, fontSize: 9, background: 'var(--accent)', color: '#fff', padding: '1px 5px', borderRadius: 3 }}>PRIMARY</span>}
                <div style={{ position: 'absolute', bottom: 2, right: 2, display: 'flex', gap: 2 }}>
                  {!img.is_primary && <button onClick={() => handleSetPrimary(img.id)} disabled={imageBusy} style={{ fontSize: 10, padding: '2px 5px', border: 'none', borderRadius: 3, background: 'var(--ink)', color: '#fff', cursor: 'pointer' }}>P</button>}
                  <button onClick={() => handleDeleteImage(img.id)} disabled={imageBusy} style={{ fontSize: 10, padding: '2px 5px', border: 'none', borderRadius: 3, background: 'var(--accent-strong)', color: '#fff', cursor: 'pointer' }}>X</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button className="btn btn-primary" onClick={() => onSave(form)} disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

/* ─── Profile ─── */
function ProfileManager({ setError, setSuccess }) {
  const [form, setForm] = useState({ name: '', contact_email: '', contact_phone: '', whatsapp_number: '', instagram_url: '', tiktok_url: '' })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const supabase = await getAdminClient()
        const { data, error } = await supabase.from('artist_profile').select('*').maybeSingle()
        if (error) throw error
        if (data) setForm((prev) => ({ ...prev, ...data }))
      } catch (e) { /* profile may not exist yet */ }
    })()
  }, [])

  const handleSave = async () => {
    setBusy(true); setError(''); setSuccess('')
    try {
      const supabase = await getAdminClient()
      const { data: existing } = await supabase.from('artist_profile').select('id').maybeSingle()
      if (existing) {
        const { error } = await supabase.from('artist_profile').update(form).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('artist_profile').insert(form)
        if (error) throw error
      }
      setSuccess('Profile updated')
    } catch (e) { setError(e.message) }
    setBusy(false)
  }

  return (
    <div className="admin-form-card" style={{ maxWidth: 700 }}>
      <h4>Profile</h4>
      <div className="admin-form-grid">
        <div className="admin-field full">
          <label>Name</label>
          <input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="admin-field">
          <label>Contact Email</label>
          <input placeholder="email@example.com" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
        </div>
        <div className="admin-field">
          <label>Contact Phone</label>
          <input placeholder="+20 100 000 0000" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
        </div>
        <div className="admin-field">
          <label>WhatsApp Number (intl, no +)</label>
          <input placeholder="201006632331" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} />
        </div>
        <div className="admin-field">
          <label>Instagram URL</label>
          <input placeholder="https://instagram.com/..." value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} />
        </div>
        <div className="admin-field">
          <label>TikTok URL</label>
          <input placeholder="https://tiktok.com/..." value={form.tiktok_url} onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })} />
        </div>
      </div>
      <button className="btn btn-primary" onClick={handleSave} disabled={busy} style={{ marginTop: 16 }}>{busy ? 'Saving...' : 'Save Profile'}</button>
    </div>
  )
}

/* ─── Q & A (bilingual, admin-orderable) ─── */
function QnaManager({ setError, setSuccess }) {
  const [items, setItems] = useState([])
  const [edit, setEdit] = useState(null)
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const dragSrc = useRef(null)

  const load = async () => {
    try {
      const supabase = await getAdminClient()
      const { data, error } = await supabase.from('qna').select('*').order('sort_order', { ascending: true })
      if (error) throw error
      setItems(data || [])
      setDirty(false)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const handleDragStart = (e, index) => {
    dragSrc.current = index
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', '')
  }
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const handleDrop = (e, targetIndex) => {
    e.preventDefault()
    const src = dragSrc.current
    dragSrc.current = null
    if (src === null || src === targetIndex) return
    setItems((prev) => {
      const next = [...prev]
      const [moved] = next.splice(src, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
    setDirty(true)
  }

  const arrowUp = (idx) => {
    if (idx <= 0) return
    setItems((prev) => { const n = [...prev]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n })
    setDirty(true)
  }
  const arrowDown = (idx) => {
    if (idx >= items.length - 1) return
    setItems((prev) => { const n = [...prev]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n })
    setDirty(true)
  }

  const saveOrder = async () => {
    setBusy(true)
    try {
      const supabase = await getAdminClient()
      await Promise.all(items.map((item, i) => supabase.from('qna').update({ sort_order: i }).eq('id', item.id)))
      setSuccess('Order saved!')
      setDirty(false)
    } catch (e) { setError(e.message) }
    setBusy(false)
  }

  const handleSave = async (form) => {
    setBusy(true); setError(''); setSuccess('')
    try {
      const supabase = await getAdminClient()
      if (form.id) {
        const { error } = await supabase.from('qna').update(form).eq('id', form.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('qna').insert({ ...form, sort_order: items.length })
        if (error) throw error
      }
      setSuccess('Saved'); setEdit(null); load()
    } catch (e) { setError(e.message) }
    setBusy(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this Q&A?')) return
    try {
      const supabase = await getAdminClient()
      const { error } = await supabase.from('qna').delete().eq('id', id)
      if (error) throw error
      setSuccess('Deleted'); load()
    } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={() => setEdit({})}>+ New Q &amp; A</button>
        {dirty && (
          <>
            <button className="btn btn-primary" onClick={saveOrder} disabled={busy}>{busy ? 'Saving...' : 'Save Order'}</button>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Unsaved changes</span>
          </>
        )}
      </div>
      {edit && <QnaForm item={edit} onSave={handleSave} onCancel={() => setEdit(null)} busy={busy} />}
      {items.map((qa, i) => (
        <div key={qa.id} className="admin-list-item" draggable={!busy}
          onDragStart={(e) => handleDragStart(e, i)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, i)}
          style={{ cursor: 'grab' }}
        >
          <div className="admin-list-item-info" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ cursor: 'grab', fontSize: 16, color: 'var(--ink-soft)' }}>&#x22EE;</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <button disabled={busy} onClick={() => arrowUp(i)} style={arrowMini}>&#9650;</button>
              <button disabled={busy} onClick={() => arrowDown(i)} style={arrowMini}>&#9660;</button>
            </div>
            <div>
              <strong>{qa.question_en}</strong>
              {qa.question_ar && <span style={{ fontSize: 12, color: 'var(--ink-soft)', marginLeft: 8 }} dir="rtl">{qa.question_ar}</span>}
            </div>
          </div>
          <div className="admin-list-item-actions">
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '2px 10px' }} onClick={() => setEdit(qa)}>Edit</button>
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '2px 10px', background: 'var(--accent-strong)', color: '#fff' }} onClick={() => handleDelete(qa.id)}>Del</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function QnaForm({ item, onSave, onCancel, busy }) {
  const [form, setForm] = useState({
    id: item.id || null,
    question_en: item.question_en || '', answer_en: item.answer_en || '',
    question_ar: item.question_ar || '', answer_ar: item.answer_ar || '',
  })

  return (
    <div className="admin-form-card">
      <h4>{form.id ? 'Edit Q & A' : 'New Q & A'}</h4>
      <div className="admin-form-grid">
        <div className="admin-field full">
          <label>Question (English)</label>
          <input value={form.question_en} onChange={(e) => setForm({ ...form, question_en: e.target.value })} />
        </div>
        <div className="admin-field full">
          <label>Answer (English)</label>
          <textarea value={form.answer_en} onChange={(e) => setForm({ ...form, answer_en: e.target.value })} />
        </div>
        <div className="admin-field full">
          <label>Question (Arabic)</label>
          <input dir="rtl" value={form.question_ar} onChange={(e) => setForm({ ...form, question_ar: e.target.value })} />
        </div>
        <div className="admin-field full">
          <label>Answer (Arabic)</label>
          <textarea dir="rtl" value={form.answer_ar} onChange={(e) => setForm({ ...form, answer_ar: e.target.value })} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button className="btn btn-primary" onClick={() => onSave(form)} disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
