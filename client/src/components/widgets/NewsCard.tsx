import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { Newspaper, Sparkles, Loader2 } from 'lucide-react'

const NewsCard = () => {
  const { news, loading, selectedPersona, holdings } = useAppStore()
  const [analyzingIndex, setAnalyzingIndex] = useState<number | null>(null)
  const [analyses, setAnalyses] = useState<Record<number, string>>({})

  const handleAnalyzeNews = async (e: React.MouseEvent, index: number, title: string, source: string, category: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (analyzingIndex !== null) return

    setAnalyzingIndex(index)
    try {
      const res = await fetch('/api/copilot/news-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: title,
          source,
          category,
          persona: selectedPersona,
          holdings
        }),
      })
      const data = await res.json()
      setAnalyses(prev => ({ ...prev, [index]: data.reply }))
    } catch {
      setAnalyses(prev => ({ ...prev, [index]: 'Could not generate portfolio impact analysis.' }))
    } finally {
      setAnalyzingIndex(null)
    }
  }

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
            Market Intelligence
          </h2>
          <p style={{ fontSize: 12, color: '#64748b' }}>Latest news impacting your portfolio</p>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#F1F5F9',
          border: '1px solid #E2E8F0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#38bdf8',
        }}>
          <Newspaper size={16} />
        </div>
      </div>

      {loading ? (
        <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#475569', fontSize: 13 }}>Fetching news...</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16
        }}>
          {news.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '18px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F1F5F9'
              e.currentTarget.style.borderColor = '#CBD5E1'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F8FAFC'
              e.currentTarget.style.borderColor = '#E2E8F0'
            }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#38bdf8',
                    background: 'rgba(56,189,248,0.1)',
                    padding: '2px 8px',
                    borderRadius: 10,
                    textTransform: 'uppercase'
                  }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{item.time}</span>
                </div>
                <a href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                    {item.title}
                  </h3>
                </a>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>{item.source}</div>
              </div>

              {/* AI analysis result / button */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 12 }}>
                {analyses[i] ? (
                  <div style={{
                    background: 'rgba(167, 139, 250, 0.04)',
                    border: '1px solid rgba(167, 139, 250, 0.12)',
                    borderRadius: 8,
                    padding: '10px 12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9.5, fontWeight: 700, color: '#a78bfa', marginBottom: 4 }}>
                      <Sparkles size={11} /> PORTFOLIO IMPACT ANALYSIS
                    </div>
                    <p style={{ fontSize: 11.5, color: '#334155', lineHeight: 1.5, margin: 0 }}>
                      {analyses[i]}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleAnalyzeNews(e, i, item.title, item.source, item.category)}
                    disabled={analyzingIndex !== null}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(167, 139, 250, 0.1)',
                      border: '1px solid rgba(167, 139, 250, 0.3)',
                      borderRadius: 8,
                      color: '#c084fc',
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: '6px 12px',
                      cursor: analyzingIndex !== null ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (analyzingIndex === null) e.currentTarget.style.background = 'rgba(167, 139, 250, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      if (analyzingIndex === null) e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)'
                    }}
                  >
                    {analyzingIndex === i ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} /> Analyze Portfolio Impact
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NewsCard
