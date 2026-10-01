'use client'

import Link from 'next/link'
import Image from 'next/image'

const STATUS_LABELS = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
}

export default function ArtworkCard({ artwork }) {
  const status = artwork.status || 'available'
  const priceLabel = artwork.price ? `EGP ${(artwork.price || 0).toLocaleString()}` : ''
  const ratio = artwork.length_in && artwork.width_in ? `${artwork.width_in} / ${artwork.length_in}` : '4 / 5'
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
            <Image
              src={artwork.image}
              alt={label}
              fill
              sizes="(max-width: 560px) 33vw, (max-width: 1024px) 33vw, 25vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <span className="frame-card-noimg">{label}</span>
          )}
          {status !== 'available' && (
            <span className={`frame-card-status-tag ${status}`}>{STATUS_LABELS[status]}</span>
          )}
        </div>
      </div>
      <div className="frame-card-plaque">
        {artwork.title && <div className="frame-card-title">{artwork.title}</div>}
        <div className="frame-card-meta">
          {[artwork.medium, artwork.size_cm].filter(Boolean).join(' · ')}
        </div>
        <div className={`frame-card-price${status === 'sold' ? ' is-sold' : ''}`}>{priceLabel}</div>
      </div>
    </Link>
  )
}
