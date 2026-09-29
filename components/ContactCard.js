'use client'

export default function ContactCard({ icon, label, value, type }) {
  if (!value || value === 'Not set') {
    return (
      <div className="contact-item" style={{ cursor: 'default' }}>
        <span className="contact-icon">{icon}</span>
        <div className="contact-label">{label}</div>
        <div className="contact-value">{value}</div>
      </div>
    )
  }

  if (type === 'instagram' || type === 'tiktok') {
    const url = value.startsWith('http') ? value : `https://${value}`
    const handle = url.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '@').replace(/\/$/, '')
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="contact-item" style={{ textDecoration: 'none', cursor: 'pointer' }}>
        <span className="contact-icon">{icon}</span>
        <div className="contact-label">{label}</div>
        <div className="contact-value">{handle}</div>
      </a>
    )
  }

  if (type === 'phone') {
    const handleClick = () => {
      navigator.clipboard.writeText(value.replace(/[^+\d\s-]/g, ''))
    }
    return (
      <div className="contact-item" onClick={handleClick} style={{ cursor: 'copy' }}>
        <span className="contact-icon">{icon}</span>
        <div className="contact-label">{label}</div>
        <div className="contact-value">{value}</div>
      </div>
    )
  }

  return null
}
