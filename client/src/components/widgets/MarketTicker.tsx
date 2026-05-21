import { useAppStore } from '../../store/useAppStore'
import { TrendingUp, TrendingDown } from 'lucide-react'

const MarketTicker = () => {
  const { indices } = useAppStore()

  if (!indices.length) return null

  // Duplicate for seamless infinite scroll
  const items = [...indices, ...indices, ...indices]

  return (
    <div style={{
      width: '100%',
      background: 'rgba(15,23,42,0.9)',
      borderBottom: '1px solid rgba(99,179,237,0.1)',
      borderTop: '1px solid rgba(99,179,237,0.1)',
      padding: '8px 0',
      overflow: 'hidden',
      display: 'flex',
      whiteSpace: 'nowrap',
      position: 'relative',
      marginBottom: 20
    }}>
      <div style={{
        display: 'flex',
        gap: 40,
        animation: 'ticker 20s linear infinite'
      }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{item.name}</span>
            <span style={{ fontSize: 13, color: '#e2e8f0' }}>
              {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: item.change >= 0 ? '#34d399' : '#f43f5e',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(item.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  )
}

export default MarketTicker
