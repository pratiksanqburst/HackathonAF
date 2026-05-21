import { useAppStore } from '../../store/useAppStore'

const MarketIndices = () => {
  const { indices } = useAppStore()

  if (!indices.length) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
      marginBottom: 24
    }}>
      {indices.slice(0, 4).map((item, i) => (
        <div key={i} className="glass-card" style={{ padding: '16px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 80, height: 80,
            background: `radial-gradient(circle, ${item.color}20, transparent 70%)`,
            borderRadius: '50%', pointerEvents: 'none',
          }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{item.name}</span>
            <span style={{ fontSize: 11, color: '#64748b' }}>{item.symbol}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', fontFamily: 'Outfit, sans-serif' }}>
              {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: item.change >= 0 ? '#34d399' : '#f43f5e',
              background: item.change >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(244,63,94,0.1)',
              padding: '2px 6px', borderRadius: 4
            }}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MarketIndices
