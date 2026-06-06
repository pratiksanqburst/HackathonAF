import { useAppStore } from '../../store/useAppStore'

const PortfolioMetrics = () => {
  const { metrics, loading, stressScenario } = useAppStore()

  if (loading || !metrics) {
    return (
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#475569', fontSize: 13 }}>Loading metrics...</div>
      </div>
    )
  }

  // Helper to determine text colors dynamically
  const getSharpeColor = (val: number) => {
    if (val >= 1.2) return '#34d399' // green
    if (val <= 0.6) return '#f43f5e' // red
    return '#fbbf24' // amber
  }

  const getPnlColor = (val: number) => {
    return val >= 0 ? '#34d399' : '#f43f5e'
  }

  const getVolColor = (val: number) => {
    return val > 22 ? '#f43f5e' : val > 15 ? '#fbbf24' : '#cbd5e1'
  }

  const getDrawdownColor = (val: number) => {
    return Math.abs(val) > 20 ? '#f43f5e' : '#cbd5e1'
  }

  const statItems = [
    { 
      label: 'Sharpe Ratio', 
      value: metrics.sharpe.toFixed(2), 
      tooltip: 'Risk-adjusted return', 
      color: getSharpeColor(metrics.sharpe)
    },
    { 
      label: 'Alpha (vs S&P)', 
      value: metrics.alpha >= 0 ? `+${metrics.alpha.toFixed(2)}%` : `${metrics.alpha.toFixed(2)}%`, 
      tooltip: 'Excess return benchmark outperformance', 
      color: getPnlColor(metrics.alpha)
    },
    { 
      label: 'Beta', 
      value: metrics.beta.toFixed(2), 
      tooltip: 'Market correlation volatility factor', 
      color: metrics.beta > 1.2 ? '#fbbf24' : '#cbd5e1'
    },
    { 
      label: 'Volatility', 
      value: `${metrics.volatility.toFixed(1)}%`, 
      tooltip: 'Annualized standard deviation', 
      color: getVolColor(metrics.volatility)
    },
    { 
      label: 'Max Drawdown', 
      value: `${metrics.maxDrawdown.toFixed(1)}%`, 
      tooltip: 'Largest peak-to-trough drops', 
      color: getDrawdownColor(metrics.maxDrawdown)
    },
    { 
      label: 'YTD Return', 
      value: metrics.ytdReturn >= 0 ? `+${metrics.ytdReturn.toFixed(1)}%` : `${metrics.ytdReturn.toFixed(1)}%`, 
      tooltip: 'Year-to-date performance yield', 
      color: getPnlColor(metrics.ytdReturn)
    },
  ]

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>
          Advanced Metrics
        </h2>
        {stressScenario && (
          <span style={{
            fontSize: 9,
            fontWeight: 800,
            color: stressScenario === 'ai-boom' || stressScenario === 'rebalance' ? '#34d399' : '#f43f5e',
            background: stressScenario === 'ai-boom' || stressScenario === 'rebalance' ? 'rgba(52,211,153,0.1)' : 'rgba(244,63,94,0.1)',
            border: `1px solid ${stressScenario === 'ai-boom' || stressScenario === 'rebalance' ? '#34d399' : '#f43f5e'}`,
            borderRadius: 6,
            padding: '3px 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Stressed
          </span>
        )}
      </div>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 24 }}>Risk & Performance analysis</p>

      <div className="grid-stats">
        {statItems.map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(15,23,42,0.4)',
            border: '1px solid rgba(255, 255, 255, 0.03)',
            borderRadius: 12,
            padding: '16px',
            transition: 'all 0.3s ease',
          }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              {stat.label}
              <span title={stat.tooltip} style={{ cursor: 'help', color: '#475569' }}>ⓘ</span>
            </div>
            <div style={{
              fontSize: 20,
              fontWeight: 800,
              fontFamily: 'Outfit, sans-serif',
              color: stat.color
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
