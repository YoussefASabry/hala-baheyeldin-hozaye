'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getBrowserSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { InstagramIcon } from '@/components/icons';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Collection', href: '/#collection' },
  { label: 'About', href: '/#about' },
  { label: 'Full Gallery', href: '/gallery' },
  { label: 'Contact', href: '/#contacts' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [artistName, setArtistName] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [closeStyle, setCloseStyle] = useState(null);
  const toggleRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const rect = toggleRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCloseStyle({ top: rect.top + rect.height / 2 - 18, left: rect.left + rect.width / 2 - 18 });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [open]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    getBrowserSupabase()?.from('artist_profile').select('name, instagram_url').maybeSingle().then(({ data }) => {
      if (data?.name) setArtistName(data.name);
      if (data?.instagram_url) setInstagramUrl(data.instagram_url);
    });
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleNavClick = (e, href) => {
    if (href.startsWith('/#') && pathname === '/') {
      const id = href.slice(2);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setOpen(false);
  };

  return (
    <>
      <nav className="site-nav">
        <div className="container site-nav-inner">
          <Link href="/" className="site-logo">
            <span className="site-logo-name">{artistName || 'Hala Baheyeldin Hozayen'}</span>
          </Link>

          <div className="site-nav-actions">
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="nav-instagram-btn" aria-label="Instagram">
                <InstagramIcon size={18} />
              </a>
            )}
            <button ref={toggleRef} className={`nav-drawer-toggle${open ? ' open' : ''}`} onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'}>
              <span className="hamburger"><span /><span /><span /></span>
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </nav>

      <div className={`nav-drawer${open ? ' open' : ''}`}>
        <div className="nav-drawer-backdrop" onClick={() => setOpen(false)} />
        <button className="nav-drawer-close" style={closeStyle || undefined} onClick={() => setOpen(false)} aria-label="Close menu">&times;</button>
        <div className="nav-drawer-panel">
          <span className="nav-drawer-kicker">Menu</span>
          <ul className="nav-drawer-links">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={(e) => handleNavClick(e, item.href)}>{item.label}</a>
              </li>
            ))}
          </ul>
          <div className="nav-drawer-foot">Original Oil Paintings & Fine Art</div>
        </div>
      </div>
    </>
  );
}
