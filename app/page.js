import Link from 'next/link'
import Image from 'next/image'
import { getArtistProfile, getArtworks, getQna } from '@/lib/db'
import ContactCard from '@/components/ContactCard'
import MasonryGrid from '@/components/MasonryGrid'
import QnaSection from '@/components/QnaSection'
import { InstagramIcon, PhoneIcon, WhatsAppIcon } from '@/components/icons'

export const revalidate = 60

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
          <Image
            src="/assets/images/hero1.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 35%' }}
          />
        </div>
        <div className="container hero-v2-content">
          <h1 className="hero-v2-title">{profile?.name || 'Hala Baheyeldin Hozayen'}</h1>
          <p className="hero-v2-sub">Visual Artist — <span className="hero-v2-sub-ar" dir="rtl">فنانة تشكيلية</span></p>
          <div className="hero-v2-cta">
            <a href="#collection" className="btn" style={HERO_BTN_STYLE}>View Collection</a>
            <a href="#about" className="btn" style={HERO_BTN_STYLE}>About</a>
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

      {/* ABOUT ME */}
      <section id="about" className="section-dark">
        <div className="container">
          <div className="section-header">
            <h2>About Me</h2>
          </div>
          <div className="about-layout">
            <div className="about-qna">
              <QnaSection items={qna} />
            </div>
            <div className="about-portrait">
              <div className="portrait-frame">
                <div className="portrait-frame-img-wrap">
                  <Image
                    src="/assets/images/hala.jpg"
                    alt={profile?.name || 'Hala Hozayen'}
                    fill
                    sizes="(max-width: 860px) 280px, 320px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
              <div className="portrait-caption">
                <p className="portrait-name" dir="rtl">هالة حزين</p>
                <p className="portrait-role" dir="rtl">
                  فنانة تشكيلية بجروب{' '}
                  {profile?.group_url ? (
                    <a href={profile.group_url} target="_blank" rel="noopener noreferrer" className="portrait-group-link">نون للفنون</a>
                  ) : (
                    <span>نون للفنون</span>
                  )}
                </p>
              </div>
            </div>
          </div>
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
            <ContactCard icon={<PhoneIcon />} label="Call" value={profile?.contact_phone || 'Not set'} type="call" />
            <ContactCard icon={<WhatsAppIcon />} label="WhatsApp" value={profile?.whatsapp_number || 'Not set'} type="whatsapp" />
            <ContactCard icon={<InstagramIcon />} label="Instagram" value={profile?.instagram_url || 'Not set'} type="instagram" />
          </div>
        </div>
      </section>
    </>
  )
}
