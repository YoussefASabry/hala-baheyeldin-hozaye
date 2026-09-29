export default function PaintingLoading() {
  return (
    <main className="main-content">
      <section className="section" style={{ padding: '32px 0 16px' }}>
        <div className="container">
          <div className="painting-detail">
            <div className="skeleton" style={{ width: '100%', aspectRatio: '4/3', borderRadius: 12 }} />
            <div className="painting-detail-info">
              <div className="skeleton skeleton-line" style={{ width: 120, height: 20 }} />
              <div className="skeleton skeleton-line" style={{ width: '70%', height: 36 }} />
              <div className="skeleton skeleton-line" style={{ width: '40%' }} />
              <div className="skeleton skeleton-line" style={{ width: '100%' }} />
              <div className="skeleton skeleton-line" style={{ width: '100%' }} />
              <div className="skeleton skeleton-line" style={{ width: '85%' }} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
