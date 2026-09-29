export default function QnaSection({ items }) {
  if (!items || items.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: 40 }}>Questions &amp; answers coming soon.</p>
  }

  return (
    <div className="qna-list">
      {items.map((qa, i) => (
        <details className="qna-item" key={qa.id} open={i === 0}>
          <summary className="qna-summary">
            <span className="qna-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="qna-summary-text">
              {qa.question_ar && <span className="qna-q-ar" dir="rtl">{qa.question_ar}</span>}
              <span className="qna-q-en">{qa.question_en}</span>
            </span>
            <span className="qna-toggle-icon" aria-hidden="true" />
          </summary>
          <div className="qna-body">
            {qa.answer_ar && <p className="qna-a-ar" dir="rtl">{qa.answer_ar}</p>}
            {qa.answer_en && <p className="qna-a-en">{qa.answer_en}</p>}
          </div>
        </details>
      ))}
    </div>
  )
}
