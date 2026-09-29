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

export default function DevPaletteSwitcher() {
  const [palette, setPalette] = useState('1')

  useEffect(() => {
    const p = window.localStorage.getItem('dev-palette') || '1'
    setPalette(p)
    document.documentElement.setAttribute('data-palette', p)
  }, [])

  const choosePalette = (id) => {
    setPalette(id)
    document.documentElement.setAttribute('data-palette', id)
    window.localStorage.setItem('dev-palette', id)
  }

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
    </div>
  )
}
