import { useAppStore } from '../../store/useAppStore'
import { Newspaper } from 'lucide-react'

const NewsCard = () => {
  const { news, loading } = useAppStore()

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
            Market Intelligence
          </h2>
          <p style={{ fontSize: 12, color: '#64748b' }}>Latest news impacting your portfolio</p>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16
        }}>
          {news.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noreferrer" style={{
              display: 'block',
              textDecoration: 'none',
              padding: '16px',
              background: 'rgba(15,23,42,0.4)',
              border: '1px solid rgba(99,179,237,0.1)',
              borderRadius: 12,
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99,179,237,0.06)'
              e.currentTarget.style.borderColor = 'rgba(99,179,237,0.3)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(15,23,42,0.4)'
              e.currentTarget.style.borderColor = 'rgba(99,179,237,0.1)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            >
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
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                {item.title}
              </h3>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.source}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default NewsCard
