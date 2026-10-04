import Link from 'next/link'

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Collection', href: '/#collection' },
  { label: 'About', href: '/#about' },
  { label: 'Full Gallery', href: '/gallery' },
]

export default function Footer({ profile }) {
  const name = profile?.name || 'Hala Baheyeldin Hozayen'

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-name">{name}</div>
          <p>Original Oil Paintings &amp; Fine Art</p>
        </div>

        <nav className="footer-links">
          {LINKS.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        </nav>
      </div>
      <div className="container">
        <p className="footer-copyright">&copy; {new Date().getFullYear()} {name}. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
