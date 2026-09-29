'use client'

import { useEffect, useMemo, useState } from 'react'
import ArtworkCard from './ArtworkCard'

function useColumnCount(desktop, tablet, mobile) {
  const [cols, setCols] = useState(desktop)
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth
      if (w <= 560) setCols(mobile)
      else if (w <= 1024) setCols(tablet)
      else setCols(desktop)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [desktop, tablet, mobile])
  return cols
}

export default function MasonryGrid({ artworks, desktopCols = 4, tabletCols = 3, mobileCols = 3, className = '' }) {
  const colCount = useColumnCount(desktopCols, tabletCols, mobileCols)

  // Deterministic left-to-right, top-to-bottom fill: item i always goes to
  // column i % colCount, so each new "row" starts at the leftmost column
  // again — columns still end up different heights (real masonry), but the
  // reading order is never scrambled.
  const columns = useMemo(() => {
    const buckets = Array.from({ length: colCount }, () => [])
    artworks.forEach((a, i) => buckets[i % colCount].push(a))
    return buckets
  }, [artworks, colCount])

  return (
    <div className={`masonry-row ${className}`}>
      {columns.map((col, i) => (
        <div className="masonry-col" key={i}>
          {col.map((a) => <ArtworkCard key={a.id} artwork={a} />)}
        </div>
      ))}
    </div>
  )
}
