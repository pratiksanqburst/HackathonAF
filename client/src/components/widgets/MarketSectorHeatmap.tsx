import { useState, useEffect } from 'react'
import { Activity, TrendingUp, TrendingDown } from 'lucide-react'

interface SectorData {
  name: string
  change: number
  color: string
}

const MarketSectorHeatmap = () => {
  const [sectors, setSectors] = useState<SectorData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const res = await fetch('/api/market/sectors')
        const data = await res.json()
        setSectors(data)
      } catch (err) {
        console.error('Failed to fetch sector data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSectors()
  }, [])

  return (
    <div className="glass-card" style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} style={{ color: '#38bdf8' }} />
            Sector Performance Heatmap
          </h2>
          <p style={{ fontSize: 12, color: '#64748b' }}>Real-time daily percentage changes across major industry sectors</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, minHeight: 130 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse" style={{
              background: 'rgba(15,23,42,0.4)',
              border: '1px solid rgba(255,255,255,0.03)',
              borderRadius: 10,
              height: 60,
            }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {sectors.map((sector) => {
            const isPositive = sector.change >= 0
            const bgColor = isPositive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)'
            const borderColor = isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
            const textColor = isPositive ? '#34d399' : '#f87171'

            return (
              <div
                key={sector.name}
                style={{
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: 64,
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = isPositive
                    ? '0 4px 12px rgba(16, 185, 129, 0.15)'
                    : '0 4px 12px rgba(239, 68, 68, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sector.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: textColor, fontFamily: 'Outfit, sans-serif' }}>
                    {isPositive ? '+' : ''}{sector.change.toFixed(2)}%
                  </span>
                  {isPositive ? (
                    <TrendingUp size={14} color="#34d399" />
                  ) : (
                    <TrendingDown size={14} color="#f87171" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MarketSectorHeatmap
