import { getArtworks } from '@/lib/db'
import GalleryClient from '@/components/GalleryClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Full Gallery — Hala Baheyeldin Hozayen',
  description: 'The complete collection of original paintings by Hala Baheyeldin Hozayen.',
}

export default async function GalleryPage() {
  const artworks = await getArtworks()

  return (
    <>
      <section className="gallery-hero">
        <div className="container">
          <h1>The Full Gallery</h1>
          <p style={{ opacity: 0.75, marginTop: 8 }}>{artworks.length} work{artworks.length === 1 ? '' : 's'}</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <GalleryClient artworks={artworks} />
        </div>
      </section>
    </>
  )
}
