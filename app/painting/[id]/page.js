import Link from 'next/link'
import { getArtworkById } from '@/lib/db'
import { notFound } from 'next/navigation'
import ImageSlideshow from '@/components/ImageSlideshow'
import WhatsAppBuyBox from '@/components/WhatsAppBuyBox'

export const revalidate = 60

const STATUS_LABELS = { available: 'AVAILABLE', reserved: 'RESERVED', sold: 'SOLD' }

export async function generateMetadata({ params }) {
  const { id } = await params
  const artwork = await getArtworkById(id)
  if (!artwork) return {}
  const absoluteImage = artwork.image || ''
  const label = artwork.title || artwork.medium || 'Original Painting'
  const title = `${label} by Hala Baheyeldin Hozayen`
  const description = artwork.description || `${artwork.medium || 'Original painting'} by Hala Baheyeldin Hozayen. EGP ${(artwork.price || 0).toLocaleString()}`
  return {
    title: `${label} — Hala Baheyeldin Hozayen`,
    description,
    alternates: { canonical: `/painting/${id}` },
    openGraph: {
      title,
      description,
      url: `/painting/${id}`,
      siteName: 'Hala Baheyeldin Hozayen',
      images: absoluteImage ? [{ url: absoluteImage, secureUrl: absoluteImage, width: 1200, height: 630, alt: label }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: absoluteImage ? [absoluteImage] : [],
    },
  }
}

export default async function PaintingPage({ params }) {
  const { id } = await params
  const artwork = await getArtworkById(id)
  if (!artwork) notFound()
  const label = artwork.title || artwork.medium || 'Untitled'

  return (
    <main className="main-content">
      <section className="section" style={{ padding: '32px 0 16px' }}>
        <div className="container">
          <div style={{ marginBottom: 16 }}>
            <Link href="/gallery" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>&larr; Back to Gallery</Link>
          </div>

          <div className="painting-detail">
            <div className="painting-detail-image">
              {artwork.image ? (
                <ImageSlideshow images={artwork.images} title={artwork.title} />
              ) : (
                <div style={{ width: '100%', padding: '80px 0', background: 'var(--bg)', textAlign: 'center', color: 'var(--ink-soft)', borderRadius: 2, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>No Image Available</div>
              )}
            </div>

            <div className="painting-detail-info">
              <div className="detail-price-row">
                <span className="detail-price">{artwork.price ? `EGP ${(artwork.price || 0).toLocaleString()}` : ''}</span>
                <span className={`detail-badge ${artwork.status === 'available' ? '' : artwork.status}`}>{STATUS_LABELS[artwork.status] || 'AVAILABLE'}</span>
              </div>
              <h1 className="detail-title">{label}</h1>
              {artwork.medium && artwork.medium !== label && <p className="detail-subtitle">{artwork.medium}</p>}
              {artwork.size_cm && <p className="detail-dimensions">{artwork.size_cm} {artwork.size && <span className="detail-inches">| {artwork.size}</span>}</p>}
              {artwork.description && (
                <div className="detail-description">
                  {artwork.description.split('\n').filter(Boolean).map((p, i) => (<p key={i}>{p}</p>))}
                </div>
              )}
              <WhatsAppBuyBox artwork={artwork} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
