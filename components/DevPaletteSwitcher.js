'use client'

import { useEffect, useState } from 'react'

const PALETTES = [
  { id: '1', label: 'Seashell / French Blue', swatch: '#3E4B8E' },
  { id: '2', label: 'Honeydew / Tomato Jam', swatch: '#C93638' },
  { id: '3', label: 'Warm Ivory / Deep Teal', swatch: '#1B5B65' },
  { id: '4', label: 'Vanilla / Auburn', swatch: '#9E2A2B' },
  { id: '5', label: 'Mix: Ivory / Indigo / Yellow', swatch: '#262f59' },
  { id: '6', label: 'Mix: Honeydew / Pine / Auburn', swatch: '#0F2E23' },
]

const VERSIONS = [
  { id: '1', label: 'V1 · Alternating bands (shipped)' },
  { id: '2', label: 'V2 · Unified, no banding' },
  { id: '3', label: 'V3 · Bold ink, all-dark' },
]

export default function DevPaletteSwitcher() {
  const [palette, setPalette] = useState('1')
  const [version, setVersion] = useState('1')

  useEffect(() => {
    const p = window.localStorage.getItem('dev-palette') || '1'
    const v = window.localStorage.getItem('dev-version') || '1'
    setPalette(p)
    setVersion(v)
    document.documentElement.setAttribute('data-palette', p)
    document.documentElement.setAttribute('data-version', v)
  }, [])

  const choosePalette = (id) => {
    setPalette(id)
    document.documentElement.setAttribute('data-palette', id)
    window.localStorage.setItem('dev-palette', id)
  }

  const chooseVersion = (id) => {
    setVersion(id)
    document.documentElement.setAttribute('data-version', id)
    window.localStorage.setItem('dev-version', id)
  }

  if (process.env.NEXT_PUBLIC_ENABLE_PALETTE_SWITCHER !== 'true') return null

  return (
    <div className="dev-palette-switcher">
      <span className="label">Palette</span>
      {PALETTES.map((p) => (
        <button
          key={p.id}
          title={p.label}
          className={palette === p.id ? 'active' : ''}
          style={{ background: p.swatch }}
          onClick={() => choosePalette(p.id)}
        />
      ))}
      <span className="label" style={{ marginLeft: 8 }}>Version</span>
      <select
        value={version}
        onChange={(e) => chooseVersion(e.target.value)}
        style={{ fontSize: 10, padding: '3px 6px', borderRadius: 6, border: 'none' }}
      >
        {VERSIONS.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
      </select>
    </div>
  )
}
