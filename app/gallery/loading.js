export default function GalleryLoading() {
  return (
    <>
      <section className="gallery-hero">
        <div className="container">
          <div className="skeleton skeleton-line" style={{ width: 220, height: 34 }} />
        </div>
      </section>
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="skeleton-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
