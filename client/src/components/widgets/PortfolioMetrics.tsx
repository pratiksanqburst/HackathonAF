import { useAppStore } from '../../store/useAppStore'

const PortfolioMetrics = () => {
  const { metrics, loading } = useAppStore()

  if (loading || !metrics) {
    return (
      <div className="glass-card" style={{ padding: '24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#475569', fontSize: 13 }}>Loading metrics...</div>
      </div>
    )
  }

  const statItems = [
    { label: 'Sharpe Ratio', value: metrics.sharpe.toFixed(2), tooltip: 'Risk-adjusted return', highlight: metrics.sharpe > 1.2 },
    { label: 'Alpha (vs S&P)', value: `+${metrics.alpha.toFixed(2)}%`, tooltip: 'Excess return', highlight: metrics.alpha > 0 },
    { label: 'Beta', value: metrics.beta.toFixed(2), tooltip: 'Market correlation', highlight: false },
    { label: 'Volatility', value: `${metrics.volatility.toFixed(1)}%`, tooltip: 'Annualized standard deviation', highlight: false },
    { label: 'Max Drawdown', value: `${metrics.maxDrawdown.toFixed(1)}%`, tooltip: 'Largest peak-to-trough drop', highlight: false },
    { label: 'YTD Return', value: `+${metrics.ytdReturn.toFixed(1)}%`, tooltip: 'Year-to-date performance', highlight: true },
  ]

  return (
    <div className="glass-card" style={{ padding: '24px', height: '100%' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
        Advanced Metrics
      </h2>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 24 }}>Risk & Performance analysis</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {statItems.map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(15,23,42,0.4)',
            border: '1px solid rgba(99,179,237,0.1)',
            borderRadius: 12,
            padding: '16px',
          }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              {stat.label}
              <span title={stat.tooltip} style={{ cursor: 'help', color: '#475569' }}>ⓘ</span>
            </div>
            <div style={{
              fontSize: 20,
              fontWeight: 800,
              fontFamily: 'Outfit, sans-serif',
              color: stat.highlight ? '#34d399' : '#f1f5f9'
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PortfolioMetrics
