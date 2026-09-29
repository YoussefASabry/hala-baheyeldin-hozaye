'use client'

import Link from 'next/link'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201006632331'

export default function WhatsAppBuyBox({ artwork }) {
  const label = artwork.title || artwork.medium || 'this painting'

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const shareData = { title: `${label} by Hala Baheyeldin Hozayen`, text: `Check out this painting by Hala Baheyeldin Hozayen`, url }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch (e) {}
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link copied!')
    }
  }

  const handleBuy = () => {
    const paintingUrl = typeof window !== 'undefined' ? window.location.href : ''
    const lines = [
      `Hi Hala, I'd like to buy this painting:`,
      ``,
      `*${label}*`,
      artwork.medium ? `${artwork.medium}` : '',
      artwork.size ? `Size: ${artwork.size}` : '',
      ``,
      `Price: EGP ${(artwork.price || 0).toLocaleString()}`,
      ``,
      paintingUrl,
    ].filter(Boolean).join('\n')

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const handleInquire = () => {
    const paintingUrl = typeof window !== 'undefined' ? window.location.href : ''
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(paintingUrl)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const renderButton = () => {
    if (artwork.status === 'sold') {
      return <button disabled className="btn btn-secondary" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Sold</button>
    }
    if (artwork.status === 'reserved') {
      return <button disabled className="btn btn-secondary" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Reserved</button>
    }
    return <button className="btn btn-whatsapp" onClick={handleBuy}>Buy via WhatsApp</button>
  }

  return (
    <div className="detail-actions">
      {renderButton()}
      <button onClick={handleInquire} className="btn btn-secondary">Inquire About This Artwork</button>
      <button onClick={handleShare} className="btn btn-secondary">Share</button>
      <Link href="/gallery" className="btn btn-secondary">Back to Gallery</Link>
    </div>
  )
}
