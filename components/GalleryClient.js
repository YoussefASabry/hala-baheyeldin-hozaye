'use client'

import { useEffect, useMemo, useState } from 'react'
import MasonryGrid from './MasonryGrid'

const SORTS = {
  default: { label: 'Sort: Default order', cmp: null },
  price_asc: { label: 'Price: Low to High', cmp: (a, b) => (a.price || 0) - (b.price || 0) },
  price_desc: { label: 'Price: High to Low', cmp: (a, b) => (b.price || 0) - (a.price || 0) },
  size_asc: { label: 'Size: Small to Large', cmp: (a, b) => areaOf(a) - areaOf(b) },
  size_desc: { label: 'Size: Large to Small', cmp: (a, b) => areaOf(b) - areaOf(a) },
}

function areaOf(a) {
  return (a.length_in || 0) * (a.width_in || 0)
}

export default function GalleryClient({ artworks }) {
  const mediums = useMemo(() => {
    const set = new Set(artworks.map((a) => a.medium).filter(Boolean))
    return Array.from(set).sort()
  }, [artworks])

  const [sort, setSort] = useState('default')
  const [activeMediums, setActiveMediums] = useState(() => new Set())
  const [comfortable, setComfortable] = useState(false)

  useEffect(() => {
    if (window.innerWidth <= 560) setComfortable(true)
  }, [])

  const toggleMedium = (m) => {
    setActiveMediums((prev) => {
      const next = new Set(prev)
      if (next.has(m)) next.delete(m); else next.add(m)
      return next
    })
  }

  const filtered = useMemo(() => {
    let list = artworks
    if (activeMediums.size > 0) list = list.filter((a) => activeMediums.has(a.medium))
    const cmp = SORTS[sort].cmp
    if (cmp) list = [...list].sort(cmp)
    return list
  }, [artworks, sort, activeMediums])

  return (
    <>
      <div className="gallery-toolbar">
        <div className="gallery-filters">
          {mediums.map((m) => (
            <label className="filter-checkbox" key={m}>
              <input type="checkbox" checked={activeMediums.has(m)} onChange={() => toggleMedium(m)} />
              {m}
            </label>
          ))}
        </div>
        <div className="gallery-sort">
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(SORTS).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
          </select>
        </div>
        <div className="gallery-view-toggle">
          <button
            type="button"
            className={!comfortable ? 'active' : ''}
            aria-label="Compact grid"
            title="Compact grid"
            onClick={() => setComfortable(false)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" /><rect x="9" y="1" width="6" height="6" /><rect x="1" y="9" width="6" height="6" /><rect x="9" y="9" width="6" height="6" /></svg>
          </button>
          <button
            type="button"
            className={comfortable ? 'active' : ''}
            aria-label="Large grid"
            title="Large grid"
            onClick={() => setComfortable(true)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6.5" height="14" /><rect x="8.5" y="1" width="6.5" height="14" /></svg>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="gallery-empty">No paintings match those filters.</div>
      ) : (
        <MasonryGrid
          artworks={filtered}
          desktopCols={comfortable ? 2 : 4}
          tabletCols={comfortable ? 2 : 3}
          mobileCols={comfortable ? 2 : 3}
        />
      )}
    </>
  )
}
