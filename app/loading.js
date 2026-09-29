export default function HomeLoading() {
  return (
    <>
      <div className="skeleton skeleton-hero" />
      <section className="section">
        <div className="container">
          <div className="skeleton-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
