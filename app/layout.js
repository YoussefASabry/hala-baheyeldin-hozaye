import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getArtistProfile } from '@/lib/db';

const TITLE = 'Hala Baheyeldin Hozayen — Original Oil Paintings';
const DESCRIPTION = 'Original oil paintings, acrylics and mixed media for sale — visual artist Hala Baheyeldin Hozayen.';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hala-hozayen.vercel.app'),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'Hala Baheyeldin Hozayen',
    type: 'website',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'Hala Baheyeldin Hozayen' }],
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/icon.png'],
  },
};

export default async function RootLayout({ children }) {
  const profile = await getArtistProfile().catch(() => null);

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <div className="wrapper">
          <Navbar />
          <div className="content-clip">
            <main>{children}</main>
            <Footer profile={profile} />
          </div>
        </div>
      </body>
    </html>
  );
}
