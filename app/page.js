import Link from 'next/link'
import { getArtistProfile, getArtworks, getQna } from '@/lib/db'
import ContactCard from '@/components/ContactCard'
import MasonryGrid from '@/components/MasonryGrid'
import QnaSection from '@/components/QnaSection'
import { InstagramIcon, PhoneIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

const HERO_BTN_STYLE = {
  border: '1px solid rgba(255,255,255,0.6)',
  color: '#fff',
  background: 'rgba(255,255,255,0.08)',
  backdropFilter: 'blur(4px)',
}

export default async function HomePage() {
  const [profile, artworks, qna] = await Promise.all([
    getArtistProfile(),
    getArtworks(),
    getQna(),
  ])

  const preview = artworks.slice(0, 4)

  return (
    <>
      {/* HERO */}
      <section className="hero-v2">
        <div className="hero-v2-media">
          <img src="/assets/images/hero1.jpg" alt="" />
        </div>
        <div className="container hero-v2-content">
          <h1 className="hero-v2-title">{profile?.name || 'Hala Baheyeldin Hozayen'}</h1>
          <p className="hero-v2-sub">Visual Artist — <span className="hero-v2-sub-ar" dir="rtl">فنانة تشكيلية</span></p>
          <div className="hero-v2-cta">
            <a href="#collection" className="btn" style={HERO_BTN_STYLE}>View Collection</a>
            <a href="#qna" className="btn" style={HERO_BTN_STYLE}>Q &amp; A</a>
            <a href="#contacts" className="btn" style={{ ...HERO_BTN_STYLE, display: 'inline-flex', alignItems: 'center', gap: 8 }}><PhoneIcon size={14} /> Contact</a>
          </div>
        </div>
      </section>

      {/* COLLECTION PREVIEW */}
      <section id="collection" className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-kicker">Body of Work</span>
            <h2>The Collection</h2>
          </div>
          {preview.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: 60 }}>No paintings published yet — check back soon.</p>
          ) : (
            <div className="work-preview-wrap">
              <MasonryGrid artworks={artworks} className="work-preview-grid" />
              {artworks.length > 4 && (
                <div className="show-more-wrap">
                  <Link href="/gallery" className="btn btn-primary">Show More</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Q & A */}
      <section id="qna" className="section-dark">
        <div className="container">
          <div className="section-header">
            <span className="section-kicker">In Her Words</span>
            <h2>Questions &amp; Answers</h2>
          </div>
          <QnaSection items={qna} />
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-kicker">Get in Touch</span>
            <h2>Contacts</h2>
          </div>
          <div className="contact-strip">
            <ContactCard icon={<PhoneIcon />} label="Phone / WhatsApp" value={profile?.contact_phone || 'Not set'} type="phone" />
            <ContactCard icon={<InstagramIcon />} label="Instagram" value={profile?.instagram_url || 'Not set'} type="instagram" />
          </div>
        </div>
      </section>
    </>
  )
}
