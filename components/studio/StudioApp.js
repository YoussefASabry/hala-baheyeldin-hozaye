'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { inToCm, MEDIUM_AR, primaryImage } from '@/lib/artworks-core'
import {
  Bi, BigButton, Screen, Thumb, Message, BusyOverlay, ConfirmModal, Spinner,
  TokenProvider, useStudioApi, uploadPhoto, formatPrice,
} from './ui'
import { PhotoStep, MediumStep, SizeStep, PriceStep, PositionStep } from './steps'
import Reorder from './Reorder'

export default function StudioApp({ token }) {
  return (
    <TokenProvider value={token}>
      <div className="st-root">
        <Studio />
      </div>
    </TokenProvider>
  )
}

function Studio() {
  const api = useStudioApi()
  const [artworks, setArtworks] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [screen, setScreen] = useState({ name: 'home' })
  const [flash, setFlash] = useState(null)

  const load = useCallback(async () => {
    setLoadError('')
    try {
      const { artworks } = await api('artworks')
      setArtworks(artworks)
      return artworks
    } catch (e) { setLoadError(e.message) }
  }, [api])
  useEffect(() => { load() }, [load])
  useEffect(() => { window.scrollTo(0, 0) }, [screen.name])

  const usedMediums = useMemo(() => (artworks || []).map((a) => a.medium), [artworks])
  const go = (name, extra = {}) => { setFlash(null); setScreen({ name, ...extra }) }

  if (!artworks) {
    return (
      <div className="st-center">
        {loadError ? (
          <div className="st-stack">
            <Message en={loadError} ar="تعذّر تحميل اللوحات" />
            <BigButton variant="primary" icon="🔄" en="Try again" ar="حاولي مرة أخرى" onClick={load} />
          </div>
        ) : (
          <><Spinner big /><Bi en="Loading paintings…" ar="جارٍ تحميل اللوحات…" className="st-bi-col" /></>
        )}
      </div>
    )
  }

  if (screen.name === 'add') {
    return <AddWizard artworks={artworks} usedMediums={usedMediums} onHome={() => go('home')}
      onDone={async (id) => { await load(); go('added', { id }) }} />
  }
  if (screen.name === 'added') {
    return (
      <Screen>
        <div className="st-done">
          <div className="st-done-icon" aria-hidden="true">🎉</div>
          <h1 className="st-title"><Bi en="Painting added!" ar="تمت إضافة اللوحة!" className="st-bi-col" /></h1>
          <p className="st-muted"><Bi en="It is now on the website." ar="أصبحت الآن على الموقع." className="st-bi-col" /></p>
        </div>
        <div className="st-stack">
          <BigButton variant="primary" icon="➕" en="Add another painting" ar="إضافة لوحة أخرى" onClick={() => go('add')} />
          <a className="st-btn" href={`/painting/${screen.id}`} target="_blank" rel="noopener noreferrer">
            <span className="st-btn-icon" aria-hidden="true">👀</span><Bi en="See it on the website" ar="مشاهدتها على الموقع" />
          </a>
          <BigButton icon="🏠" en="Back to start" ar="الرجوع للبداية" onClick={() => go('home')} />
        </div>
      </Screen>
    )
  }
  if (screen.name === 'pick') {
    return <EditPicker artworks={artworks} flash={flash} onBack={() => go('home')} onPick={(id) => go('menu', { id })} />
  }
  if (screen.name === 'menu' || screen.name === 'field') {
    const artwork = artworks.find((a) => a.id === screen.id)
    if (!artwork) return <EditPicker artworks={artworks} flash={flash} onBack={() => go('home')} onPick={(id) => go('menu', { id })} />
    if (screen.name === 'field') {
      return <EditField field={screen.field} artwork={artwork} artworks={artworks} usedMediums={usedMediums}
        onBack={() => go('menu', { id: artwork.id })}
        onSaved={async (msg) => {
          const list = await load()
          if (msg.deleted) { setScreen({ name: 'pick' }); setFlash(msg) }
          else { setScreen({ name: 'menu', id: artwork.id }); setFlash(list ? msg : { en: 'Saved, but the list could not refresh. Pull down to reload.', ar: 'تم الحفظ. أعيدي تحميل الصفحة.' }) }
        }} />
    }
    return <EditMenu artwork={artwork} index={artworks.indexOf(artwork)} flash={flash}
      onBack={() => go('pick')} onField={(field) => go('field', { id: artwork.id, field })} />
  }
  if (screen.name === 'reorder') {
    return <Reorder artworks={artworks} onBack={() => go('home')}
      onSaved={(list) => { setArtworks(list); go('home'); setFlash({ en: 'New order saved!', ar: 'تم حفظ الترتيب الجديد!' }) }} />
  }

  return (
    <Screen title={{ en: 'Your paintings', ar: 'لوحاتك' }}>
      <p className="st-welcome"><Bi en="What would you like to do?" ar="ماذا تريدين أن تفعلي؟" className="st-bi-col" /></p>
      {flash && <Message kind="success" en={flash.en} ar={flash.ar} />}
      <div className="st-stack st-home">
        <HomeCard icon="➕" en="Add a new painting" ar="إضافة لوحة جديدة" onClick={() => go('add')} accent />
        <HomeCard icon="✏️" en="Change a painting" ar="تعديل لوحة" sub={{ en: 'Photo, price, size…', ar: 'الصورة، السعر، المقاس…' }} onClick={() => go('pick')} disabled={!artworks.length} />
        <HomeCard icon="↕️" en="Change the order" ar="تغيير الترتيب" sub={{ en: 'Which painting comes first', ar: 'أي لوحة تظهر أولاً' }} onClick={() => go('reorder')} disabled={artworks.length < 2} />
      </div>
      <p className="st-count st-muted"><Bi en={`${artworks.length} paintings on the website`} ar={`${artworks.length} لوحة على الموقع`} /></p>
    </Screen>
  )
}

function HomeCard({ icon, en, ar, sub, onClick, accent, disabled }) {
  return (
    <button type="button" className={`st-home-card${accent ? ' is-accent' : ''}`} onClick={onClick} disabled={disabled}>
      <span className="st-home-icon" aria-hidden="true">{icon}</span>
      <span className="st-home-text">
        <Bi en={en} ar={ar} className="st-bi-col" />
        {sub && <Bi en={sub.en} ar={sub.ar} className="st-bi-col st-muted st-small" />}
      </span>
    </button>
  )
}

/* ─── Add: one question per screen ─── */
const ADD_STEPS = [
  { en: 'Add the photo', ar: 'أضيفي صورة اللوحة' },
  { en: 'What is it painted with?', ar: 'ما خامة اللوحة؟' },
  { en: 'How big is it?', ar: 'ما مقاس اللوحة؟' },
  { en: 'What is the price?', ar: 'ما سعر اللوحة؟' },
  { en: 'Where should it appear?', ar: 'أين تظهر اللوحة؟' },
  { en: 'Check and save', ar: 'راجعي واحفظي' },
]

function AddWizard({ artworks, usedMediums, onHome, onDone }) {
  const api = useStudioApi()
  const [step, setStep] = useState(1)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [medium, setMedium] = useState('')
  const [size, setSize] = useState({ heightCm: '', widthCm: '' })
  const [price, setPrice] = useState('')
  const [position, setPosition] = useState(0)
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const [askLeave, setAskLeave] = useState(false)

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const valid = {
    1: !!file,
    2: medium.trim().length > 0,
    3: Number(size.heightCm) >= 1 && Number(size.widthCm) >= 1,
    4: Number(price) > 0,
    5: true,
    6: true,
  }[step]

  const back = () => {
    if (step > 1) { setError(''); setStep(step - 1) }
    else if (file) setAskLeave(true)
    else onHome()
  }

  const save = async () => {
    setError('')
    try {
      setBusy({ en: 'Uploading the photo…', ar: 'جارٍ رفع الصورة…' })
      const imagePath = await uploadPhoto(api, file)
      setBusy({ en: 'Saving…', ar: 'جارٍ الحفظ…' })
      const { id } = await api('artworks', {
        method: 'POST',
        body: { imagePath, medium: medium.trim(), length_cm: size.heightCm, width_cm: size.widthCm, price, position },
      })
      await onDone(id)
    } catch (e) {
      setError(e.message)
      setBusy(null)
    }
  }

  const next = step < 6
    ? <BigButton variant="primary" icon="➡️" en="Next" ar="التالي" onClick={() => setStep(step + 1)} disabled={!valid} />
    : <BigButton variant="primary" icon="✅" en="Save painting" ar="حفظ اللوحة" onClick={save} busy={!!busy} />

  return (
    <Screen step={step} total={6} title={ADD_STEPS[step - 1]} onBack={back}
      backLabel={step === 1 ? { en: 'Cancel', ar: 'إلغاء' } : undefined} footer={next}>
      {step === 1 && <PhotoStep previewUrl={previewUrl} onPick={(f) => { setFile(f); setPreviewUrl(URL.createObjectURL(f)) }} />}
      {step === 2 && <MediumStep value={medium} onChange={setMedium} usedMediums={usedMediums} />}
      {step === 3 && <SizeStep heightCm={size.heightCm} widthCm={size.widthCm} onChange={setSize} photoUrl={previewUrl} />}
      {step === 4 && <PriceStep value={price} onChange={setPrice} />}
      {step === 5 && <PositionStep others={artworks} position={position} onChange={setPosition} newThumbUrl={previewUrl} />}
      {step === 6 && (
        <div className="st-stack">
          <div className="st-photo-preview st-photo-preview-small"><img src={previewUrl} alt="" /></div>
          <ReviewRow icon="🎨" en="Medium" ar="الخامة" value={`${medium}${MEDIUM_AR[medium] ? ` · ${MEDIUM_AR[medium]}` : ''}`} onEdit={() => setStep(2)} />
          <ReviewRow icon="📏" en="Size" ar="المقاس" value={`↕ ${size.heightCm} × ↔ ${size.widthCm} cm`} onEdit={() => setStep(3)} />
          <ReviewRow icon="💰" en="Price" ar="السعر" value={formatPrice(price)} onEdit={() => setStep(4)} />
          <ReviewRow icon="🔢" en="Place" ar="الترتيب" value={`#${position + 1} / ${artworks.length + 1}`} onEdit={() => setStep(5)} />
          <Message en={error} ar={error && 'لم يتم الحفظ، حاولي مرة أخرى'} />
        </div>
      )}
      {busy && <BusyOverlay en={busy.en} ar={busy.ar} />}
      {askLeave && (
        <ConfirmModal icon="🗑️" en="Stop adding this painting?" ar="إلغاء إضافة هذه اللوحة؟"
          yes={{ en: 'Yes, stop', ar: 'نعم، إلغاء' }} no={{ en: 'No, continue', ar: 'لا، أكملي' }}
          onYes={onHome} onNo={() => setAskLeave(false)} />
      )}
    </Screen>
  )
}

function ReviewRow({ icon, en, ar, value, onEdit }) {
  return (
    <div className="st-review-row">
      <span className="st-review-icon" aria-hidden="true">{icon}</span>
      <span className="st-review-text">
        <Bi en={en} ar={ar} className="st-small st-muted" />
        <span className="st-review-value" dir="auto">{value}</span>
      </span>
      <button type="button" className="st-review-edit" onClick={onEdit}><Bi en="Change" ar="تغيير" className="st-bi-col" /></button>
    </div>
  )
}

/* ─── Edit: pick a painting ─── */
function EditPicker({ artworks, flash, onBack, onPick }) {
  return (
    <Screen title={{ en: 'Which painting?', ar: 'أي لوحة؟' }} onBack={onBack}>
      {flash && <Message kind="success" en={flash.en} ar={flash.ar} />}
      <p className="st-hint"><span aria-hidden="true">👆</span><Bi en="Tap the painting you want to change" ar="اضغطي على اللوحة التي تريدين تعديلها" className="st-bi-col" /></p>
      <div className="st-pick-grid">
        {artworks.map((a, i) => (
          <button key={a.id} type="button" className="st-pick" onClick={() => onPick(a.id)}>
            <Thumb artwork={a} />
            <span className="st-pick-num">{i + 1}</span>
            <span className="st-pick-price">{formatPrice(a.price)}</span>
          </button>
        ))}
      </div>
    </Screen>
  )
}

function EditMenu({ artwork, index, flash, onBack, onField }) {
  const img = primaryImage(artwork)
  const h = inToCm(artwork.length_in)
  const w = inToCm(artwork.width_in)
  return (
    <Screen title={{ en: `Painting number ${index + 1}`, ar: `اللوحة رقم ${index + 1}` }} onBack={onBack}
      backLabel={{ en: 'All paintings', ar: 'كل اللوحات' }}>
      {flash && <Message kind="success" en={flash.en} ar={flash.ar} />}
      <div className="st-photo-preview st-photo-preview-small">{img ? <img src={img.url} alt="" /> : <span>🖼️</span>}</div>
      <p className="st-hint"><Bi en="What do you want to change?" ar="ماذا تريدين أن تغيري؟" className="st-bi-col" /></p>
      <div className="st-stack">
        <MenuButton icon="🖼️" en="Change photo" ar="تغيير الصورة" onClick={() => onField('photo')} />
        <MenuButton icon="🎨" en="Change medium" ar="تغيير الخامة" value={artwork.medium} onClick={() => onField('medium')} />
        <MenuButton icon="📏" en="Change size" ar="تغيير المقاس" value={h && w ? `${h} × ${w} cm` : '—'} onClick={() => onField('size')} />
        <MenuButton icon="💰" en="Change price" ar="تغيير السعر" value={formatPrice(artwork.price)} onClick={() => onField('price')} />
        <MenuButton icon="🔢" en="Change its place" ar="تغيير مكانها" value={`#${index + 1}`} onClick={() => onField('position')} />
        <MenuButton icon="🗑️" en="Delete painting" ar="حذف اللوحة" danger onClick={() => onField('delete')} />
      </div>
    </Screen>
  )
  function MenuButton({ icon, en, ar, value, danger, onClick }) {
    return (
      <button type="button" className={`st-menu-btn${danger ? ' is-danger' : ''}`} onClick={onClick}>
        <span className="st-btn-icon" aria-hidden="true">{icon}</span>
        <span className="st-menu-text">
          <Bi en={en} ar={ar} />
          {value && <span className="st-menu-value" dir="auto">{value}</span>}
        </span>
        <span className="st-menu-chev" aria-hidden="true">›</span>
      </button>
    )
  }
}

/* ─── Edit one field, reusing the add-flow screens ─── */
const FIELD_TITLES = {
  photo: { en: 'Change photo', ar: 'تغيير الصورة' },
  medium: { en: 'Change medium', ar: 'تغيير الخامة' },
  size: { en: 'Change size', ar: 'تغيير المقاس' },
  price: { en: 'Change price', ar: 'تغيير السعر' },
  position: { en: 'Change its place', ar: 'تغيير مكانها' },
  delete: { en: 'Delete painting', ar: 'حذف اللوحة' },
}

function EditField({ field, artwork, artworks, usedMediums, onBack, onSaved }) {
  const api = useStudioApi()
  const index = artworks.indexOf(artwork)
  const currentUrl = primaryImage(artwork)?.url || ''
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(currentUrl)
  const [medium, setMedium] = useState(artwork.medium || '')
  const [size, setSize] = useState({ heightCm: String(inToCm(artwork.length_in) || ''), widthCm: String(inToCm(artwork.width_in) || '') })
  const [price, setPrice] = useState(artwork.price ? String(artwork.price) : '')
  const [position, setPosition] = useState(index)
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => () => { if (file && previewUrl) URL.revokeObjectURL(previewUrl) }, [file, previewUrl])

  const others = artworks.filter((a) => a.id !== artwork.id)
  const valid = {
    photo: !!file,
    medium: medium.trim().length > 0 && medium !== artwork.medium,
    size: Number(size.heightCm) >= 1 && Number(size.widthCm) >= 1,
    price: Number(price) > 0,
    position: position !== index,
    delete: true,
  }[field]

  const run = async (label, fn, msg) => {
    setError(''); setBusy(label || { en: 'Saving…', ar: 'جارٍ الحفظ…' })
    try { await fn(); await onSaved(msg) } catch (e) { setError(e.message); setBusy(null) }
  }
  const patch = (body) => api('artworks', { method: 'PATCH', body: { id: artwork.id, ...body } })
  const savedMsg = { en: 'Saved! The website is updated.', ar: 'تم الحفظ! تم تحديث الموقع.' }

  const save = () => {
    if (field === 'photo') return run({ en: 'Uploading the photo…', ar: 'جارٍ رفع الصورة…' }, async () => patch({ imagePath: await uploadPhoto(api, file) }), savedMsg)
    if (field === 'medium') return run(null, () => patch({ medium: medium.trim() }), savedMsg)
    if (field === 'size') return run(null, () => patch({ length_cm: size.heightCm, width_cm: size.widthCm }), savedMsg)
    if (field === 'price') return run(null, () => patch({ price }), savedMsg)
    if (field === 'position') return run(null, () => patch({ position }), savedMsg)
  }
  const remove = () => run({ en: 'Deleting…', ar: 'جارٍ الحذف…' },
    () => api(`artworks?id=${encodeURIComponent(artwork.id)}`, { method: 'DELETE' }),
    { en: 'Painting deleted.', ar: 'تم حذف اللوحة.', deleted: true })

  if (field === 'delete') {
    return (
      <Screen title={FIELD_TITLES.delete} onBack={onBack}>
        <div className="st-photo-preview st-photo-preview-small">{currentUrl ? <img src={currentUrl} alt="" /> : <span>🖼️</span>}</div>
        <div className="st-msg st-msg-error st-msg-big">
          <span aria-hidden="true">⚠️</span>
          <Bi en="This painting will be removed from the website." ar="ستُحذف هذه اللوحة من الموقع." className="st-bi-col" />
        </div>
        <Message en={error} ar={error && 'لم يتم الحذف، حاولي مرة أخرى'} />
        <div className="st-stack">
          <BigButton variant="danger" icon="🗑️" en="Yes, delete it" ar="نعم، احذفيها" onClick={remove} busy={!!busy} />
          <BigButton icon="↩️" en="No, keep it" ar="لا، اتركيها" onClick={onBack} disabled={!!busy} />
        </div>
        {busy && <BusyOverlay en={busy.en} ar={busy.ar} />}
      </Screen>
    )
  }

  return (
    <Screen title={FIELD_TITLES[field]} onBack={onBack}
      footer={<BigButton variant="primary" icon="💾" en="Save" ar="حفظ" onClick={save} disabled={!valid} busy={!!busy} />}>
      <Message en={error} ar={error && 'لم يتم الحفظ، حاولي مرة أخرى'} />
      {field === 'photo' && <PhotoStep previewUrl={previewUrl} onPick={(f) => { setFile(f); setPreviewUrl(URL.createObjectURL(f)) }} />}
      {field === 'medium' && <MediumStep value={medium} onChange={setMedium} usedMediums={usedMediums} />}
      {field === 'size' && <SizeStep heightCm={size.heightCm} widthCm={size.widthCm} onChange={setSize} photoUrl={currentUrl} />}
      {field === 'price' && <PriceStep value={price} onChange={setPrice} />}
      {field === 'position' && (
        <PositionStep others={others} position={position} onChange={setPosition} newThumbUrl={currentUrl}
          newLabel={{ en: 'This painting', ar: 'هذه اللوحة' }} />
      )}
      {busy && <BusyOverlay en={busy.en} ar={busy.ar} />}
    </Screen>
  )
}
