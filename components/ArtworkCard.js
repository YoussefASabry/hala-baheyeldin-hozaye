'use client'

import Link from 'next/link'

const STATUS_LABELS = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
}

export default function ArtworkCard({ artwork }) {
  const status = artwork.status || 'available'
  const priceLabel = artwork.price ? `EGP ${(artwork.price || 0).toLocaleString()}` : ''
  const ratio = artwork.length_in && artwork.width_in ? `${artwork.length_in} / ${artwork.width_in}` : '4 / 5'
  const label = artwork.title || artwork.medium || 'Untitled'

  return (
    <Link href={`/painting/${artwork.id}`} className="frame-card">
      <div className="frame-card-mat">
        <span className="frame-card-corner tl" />
        <span className="frame-card-corner tr" />
        <span className="frame-card-corner bl" />
        <span className="frame-card-corner br" />
        <div className="frame-card-img" style={{ aspectRatio: ratio }}>
          {artwork.image ? (
            <img src={artwork.image} alt={label} />
          ) : (
            <span className="frame-card-noimg">{label}</span>
          )}
          {status !== 'available' && (
            <span className={`frame-card-status-tag ${status}`}>{STATUS_LABELS[status]}</span>
          )}
        </div>
      </div>
      <div className="frame-card-plaque">
        <div className="frame-card-title">{label}</div>
        <div className="frame-card-meta">
          {[artwork.medium, artwork.size_cm].filter(Boolean).join(' · ')}
        </div>
        <div className={`frame-card-price${status === 'sold' ? ' is-sold' : ''}`}>{priceLabel}</div>
      </div>
    </Link>
  )
}
