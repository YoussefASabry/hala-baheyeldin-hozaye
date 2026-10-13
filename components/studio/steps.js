'use client'

import { useRef, useState, useEffect } from 'react'
import { MEDIUM_AR, mediumOptions } from '@/lib/artworks-core'
import { Bi, Thumb } from './ui'

/* ─── 1. Photo ─── */
export function PhotoStep({ previewUrl, onPick }) {
  const cameraRef = useRef(null)
  const galleryRef = useRef(null)
  const pick = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onPick(file)
  }
  return (
    <div className="st-stack">
      {previewUrl ? (
        <div className="st-photo-preview"><img src={previewUrl} alt="" /></div>
      ) : (
        <button type="button" className="st-photo-empty" onClick={() => galleryRef.current?.click()}>
          <span className="st-photo-empty-icon" aria-hidden="true">🖼️</span>
          <Bi en="No photo yet" ar="لا توجد صورة بعد" className="st-bi-col" />
        </button>
      )}
      <button type="button" className="st-btn st-btn-primary" onClick={() => galleryRef.current?.click()}>
        <span className="st-btn-icon" aria-hidden="true">🖼️</span>
        <Bi en={previewUrl ? 'Choose another photo' : 'Choose from gallery'} ar={previewUrl ? 'اختيار صورة أخرى' : 'اختيار من الصور'} />
      </button>
      <button type="button" className="st-btn" onClick={() => cameraRef.current?.click()}>
        <span className="st-btn-icon" aria-hidden="true">📷</span>
        <Bi en="Take a photo now" ar="تصوير الآن" />
      </button>
      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={pick} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={pick} />
    </div>
  )
}

/* ─── 2. Medium ─── */
export function MediumStep({ value, onChange, usedMediums = [] }) {
  const options = mediumOptions(usedMediums)
  const isCustom = value !== '' && value != null && !options.includes(value)
  const [other, setOther] = useState(isCustom)
  const inputRef = useRef(null)
  useEffect(() => { if (other) inputRef.current?.focus() }, [other])

  return (
    <div className="st-stack">
      <div className="st-choice-grid">
        {options.map((m) => (
          <button key={m} type="button" className={`st-choice${!other && value === m ? ' is-selected' : ''}`}
            onClick={() => { setOther(false); onChange(m) }} aria-pressed={!other && value === m}>
            {!other && value === m && <span className="st-check" aria-hidden="true">✓</span>}
            <Bi en={m} ar={MEDIUM_AR[m] || ''} className="st-bi-col" />
          </button>
        ))}
        <button type="button" className={`st-choice${other ? ' is-selected' : ''}`} aria-pressed={other}
          onClick={() => { setOther(true); if (!isCustom) onChange('') }}>
          {other && <span className="st-check" aria-hidden="true">✓</span>}
          <Bi en="Other…" ar="أخرى…" className="st-bi-col" />
        </button>
      </div>
      {other && (
        <label className="st-field">
          <Bi en="Write the medium" ar="اكتبي الخامة" />
          <input ref={inputRef} className="st-input" value={isCustom ? value : ''} maxLength={80}
            onChange={(e) => onChange(e.target.value)} placeholder="e.g. Oil on wood" />
        </label>
      )}
    </div>
  )
}

/* ─── 3. Size (cm) — the frame reshapes as she types ─── */
export function SizeStep({ heightCm, widthCm, onChange, photoUrl }) {
  const [photoRatio, setPhotoRatio] = useState(null)
  const h = Number(heightCm) || 0
  const w = Number(widthCm) || 0
  const ratio = h > 0 && w > 0 ? Math.min(2.5, Math.max(0.4, w / h)) : 0.8
  const looksSwapped = photoRatio && h > 0 && w > 0 && (photoRatio > 1.1) !== (w / h > 1.1) && Math.abs(photoRatio - w / h) > 0.25

  const num = (v) => v.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 6)
  const toLatin = (v) => v.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٫,]/g, '.')

  return (
    <div className="st-stack">
      <div className="st-size">
        <div className="st-size-frame-wrap">
          <div className="st-size-frame" style={{ aspectRatio: `${ratio}` }}>
            {photoUrl && <img src={photoUrl} alt="" onLoad={(e) => setPhotoRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)} />}
          </div>
          <div className="st-arrow st-arrow-v" aria-hidden="true"><span>▲</span><i /><span>▼</span></div>
          <div className="st-arrow st-arrow-h" aria-hidden="true"><span>◀</span><i /><span>▶</span></div>
        </div>

        <label className="st-field st-field-height">
          <span className="st-dim-tag"><span aria-hidden="true">↕</span> <Bi en="Height" ar="الطول" className="st-bi-col" /></span>
          <span className="st-input-unit">
            <input className="st-input st-input-num" inputMode="decimal" value={heightCm}
              onChange={(e) => onChange({ heightCm: num(toLatin(e.target.value)), widthCm })} placeholder="0" aria-label="Height in cm" />
            <span>cm</span>
          </span>
        </label>
        <label className="st-field st-field-width">
          <span className="st-dim-tag"><span aria-hidden="true">↔</span> <Bi en="Width" ar="العرض" /></span>
          <span className="st-input-unit">
            <input className="st-input st-input-num" inputMode="decimal" value={widthCm}
              onChange={(e) => onChange({ heightCm, widthCm: num(toLatin(e.target.value)) })} placeholder="0" aria-label="Width in cm" />
            <span>cm</span>
          </span>
        </label>
      </div>

      {looksSwapped && (
        <div className="st-msg st-msg-warn" role="status">
          <span aria-hidden="true">🤔</span>
          <Bi en="The shape doesn't match the photo. Swapped?" ar="الشكل لا يطابق الصورة. هل انعكسا؟" className="st-bi-col" />
        </div>
      )}
      {(h > 0 || w > 0) && (
        <button type="button" className="st-btn st-btn-small" onClick={() => onChange({ heightCm: widthCm, widthCm: heightCm })}>
          <span className="st-btn-icon" aria-hidden="true">⇄</span>
          <Bi en="Swap height & width" ar="تبديل الطول والعرض" />
        </button>
      )}
    </div>
  )
}

/* ─── 4. Price ─── */
export function PriceStep({ value, onChange }) {
  const toLatin = (v) => v.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
  return (
    <div className="st-stack">
      <label className="st-field">
        <span className="st-input-unit st-input-unit-big">
          <input className="st-input st-input-num st-input-big" inputMode="numeric" autoFocus value={value}
            onChange={(e) => onChange(toLatin(e.target.value).replace(/\D/g, '').slice(0, 9))} placeholder="0" aria-label="Price in EGP" />
          <Bi en="EGP" ar="جنيه" className="st-bi-col" />
        </span>
      </label>
      {Number(value) > 0 && <p className="st-price-echo">{Number(value).toLocaleString('en-US')} EGP</p>}
    </div>
  )
}

/* ─── 5. Position — she sees the final order with her painting in it ─── */
export function PositionStep({ others, position, onChange, newThumbUrl, newLabel = { en: 'Your new painting', ar: 'لوحتك الجديدة' } }) {
  const rows = []
  others.forEach((a, i) => {
    if (i === position) rows.push({ isNew: true })
    rows.push({ artwork: a, after: i + 1 })
  })
  if (position >= others.length) rows.push({ isNew: true })

  return (
    <div className="st-stack">
      <button type="button" className={`st-btn${position === 0 ? ' st-btn-primary' : ''}`} onClick={() => onChange(0)}>
        <span className="st-btn-icon" aria-hidden="true">⬆️</span>
        <Bi en="Put it first" ar="ضعيها في الأول" />
      </button>
      <ol className="st-order-list">
        {rows.map((r, idx) => r.isNew ? (
          <li key="new" className="st-order-row is-new" aria-current="true">
            <span className="st-order-num">{idx + 1}</span>
            {newThumbUrl ? <img className="st-thumb" src={newThumbUrl} alt="" /> : <span className="st-thumb st-thumb-empty">🖼️</span>}
            <Bi en={newLabel.en} ar={newLabel.ar} className="st-bi-col" />
            <span className="st-order-star" aria-hidden="true">★</span>
          </li>
        ) : (
          <li key={r.artwork.id}>
            <button type="button" className="st-order-row" onClick={() => onChange(r.after)}>
              <span className="st-order-num">{idx + 1}</span>
              <Thumb artwork={r.artwork} />
              <Bi en="Tap: put it after this" ar="اضغطي: ضعيها بعد هذه" className="st-bi-col st-muted" />
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
