'use client'

import { useRef, useState } from 'react'
import { moveItem } from '@/lib/artworks-core'
import { Bi, BigButton, Screen, Thumb, Message, BusyOverlay, ConfirmModal, useStudioApi } from './ui'

// Touch-friendly version of /admin's drag/arrow/number ordering. HTML5
// draggable doesn't fire on phones, so dragging uses pointer events.
export default function Reorder({ artworks, onBack, onSaved }) {
  const api = useStudioApi()
  const [list, setList] = useState(artworks)
  const [dragId, setDragId] = useState(null)
  const [moving, setMoving] = useState(null) // { index, value }
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [askLeave, setAskLeave] = useState(false)
  const rowRefs = useRef({})
  const dirty = list.some((a, i) => a.id !== artworks[i]?.id)

  const startDrag = (e, id) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragId(id)
  }
  const onDragMove = (e) => {
    if (!dragId) return
    const y = e.clientY
    if (y < 90) window.scrollBy(0, -14)
    else if (y > window.innerHeight - 90) window.scrollBy(0, 14)
    setList((prev) => {
      const from = prev.findIndex((a) => a.id === dragId)
      let to = prev.length - 1
      for (let i = 0; i < prev.length; i++) {
        const el = rowRefs.current[prev[i].id]
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (y < r.top + r.height / 2) { to = i > from ? i - 1 : i; break }
      }
      return to === from ? prev : moveItem(prev, from, to)
    })
  }
  const endDrag = () => setDragId(null)

  const nudge = (i, d) => setList((prev) => moveItem(prev, i, i + d))

  const applyMove = () => {
    const n = parseInt(String(moving.value).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)), 10)
    if (n >= 1 && n <= list.length) setList((prev) => moveItem(prev, moving.index, n - 1))
    setMoving(null)
  }

  const save = async () => {
    setSaving(true); setError('')
    try {
      await api('reorder', { method: 'POST', body: { ids: list.map((a) => a.id) } })
      onSaved(list)
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  return (
    <Screen
      title={{ en: 'Change the order', ar: 'تغيير الترتيب' }}
      onBack={() => (dirty ? setAskLeave(true) : onBack())}
      footer={dirty && (
        <div className="st-stack">
          <BigButton variant="primary" icon="💾" en="Save this order" ar="حفظ الترتيب" onClick={save} busy={saving} />
          <BigButton variant="ghost" icon="↩️" en="Undo changes" ar="إلغاء التغييرات" onClick={() => setList(artworks)} disabled={saving} />
        </div>
      )}
    >
      <div className="st-hint">
        <span aria-hidden="true">👆</span>
        <Bi en="Hold ☰ and drag up or down. Or tap the number to type a new place."
          ar="اضغطي على ☰ واسحبي لأعلى أو لأسفل. أو اضغطي على الرقم لكتابة مكان جديد." className="st-bi-col" />
      </div>
      <Message en={error} ar={error && 'لم يتم الحفظ، حاولي مرة أخرى'} />

      <ol className={`st-order-list${dragId ? ' is-dragging' : ''}`}>
        {list.map((a, i) => (
          <li key={a.id} ref={(el) => { rowRefs.current[a.id] = el }}
            className={`st-order-row st-reorder-row${dragId === a.id ? ' is-lifted' : ''}`}>
            <button type="button" className="st-order-num st-order-num-btn" onClick={() => setMoving({ index: i, value: String(i + 1) })}
              aria-label={`Position ${i + 1}. Tap to type a new position`}>
              {i + 1}
            </button>
            <Thumb artwork={a} />
            <span className="st-arrows">
              <button type="button" onClick={() => nudge(i, -1)} disabled={i === 0} aria-label="Move up">▲</button>
              <button type="button" onClick={() => nudge(i, 1)} disabled={i === list.length - 1} aria-label="Move down">▼</button>
            </span>
            <span className="st-grip" role="button" aria-label="Drag to move"
              onPointerDown={(e) => startDrag(e, a.id)} onPointerMove={onDragMove}
              onPointerUp={endDrag} onPointerCancel={endDrag}>☰</span>
          </li>
        ))}
      </ol>

      {moving && (
        <div className="st-overlay" role="dialog" aria-modal="true">
          <form className="st-overlay-box" onSubmit={(e) => { e.preventDefault(); applyMove() }}>
            <Thumb artwork={list[moving.index]} className="st-thumb-big" />
            <h2 className="st-modal-title"><Bi en="Move to place number" ar="انقليها إلى المكان رقم" className="st-bi-col" /></h2>
            <input className="st-input st-input-num st-input-big" inputMode="numeric" autoFocus value={moving.value}
              onChange={(e) => setMoving({ ...moving, value: e.target.value.slice(0, 4) })} aria-label="New position" />
            <p className="st-muted"><Bi en={`From 1 to ${list.length}`} ar={`من 1 إلى ${list.length}`} /></p>
            <div className="st-stack">
              <BigButton type="submit" variant="primary" icon="✅" en="Move" ar="انقلي" />
              <BigButton en="Cancel" ar="إلغاء" onClick={() => setMoving(null)} />
            </div>
          </form>
        </div>
      )}

      {askLeave && (
        <ConfirmModal icon="💾" en="Leave without saving the new order?" ar="الخروج بدون حفظ الترتيب الجديد؟"
          yes={{ en: 'Leave, don’t save', ar: 'خروج بدون حفظ' }} no={{ en: 'Stay here', ar: 'البقاء هنا' }}
          onYes={onBack} onNo={() => setAskLeave(false)} />
      )}
      {saving && <BusyOverlay />}
    </Screen>
  )
}
