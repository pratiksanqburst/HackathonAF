import { useAppStore } from '../../store/useAppStore'
import { Shield, Coins, TrendingUp, Scale, Globe, RefreshCw, Rocket, Zap, AlertTriangle, Brain } from 'lucide-react'

const insightsByRisk: Record<string, { icon: React.ComponentType<any>; text: string }[]> = {
  Low: [
    { icon: Shield, text: 'Conservative bonds cushion volatility — drawdown limited to 4.2% in recent market stress.' },
    { icon: Coins, text: 'Dividend yield of 4.1% provides reliable income stream without liquidating positions.' },
    { icon: TrendingUp, text: 'Real estate allocation adds inflation hedge — up 8.3% YTD vs. CPI at 3.1%.' },
  ],
  Medium: [
    { icon: Scale, text: 'Portfolio demonstrates strong Sharpe ratio of 1.42 — superior risk-adjusted returns.' },
    { icon: Globe, text: 'International diversification has reduced correlation to US markets to 0.62.' },
    { icon: RefreshCw, text: 'Rebalancing opportunity: bonds slightly underweight. Consider shifting 3% from equities.' },
  ],
  High: [
    { icon: Rocket, text: 'Tech allocation outperformed S&P 500 by 18.7% YTD. Momentum remains strong.' },
    { icon: Zap, text: 'Emerging markets exposure adding alpha. EM positions up 24% in last 12 months.' },
    { icon: AlertTriangle, text: 'Volatility at 22.4% — within risk tolerance. Ensure emergency fund is separate.' },
  ],
}

const AIInsightCard = () => {
  const { portfolioData, loading, selectedPersona } = useAppStore()
  const risk = portfolioData?.risk ?? 'Medium'
  const insights = insightsByRisk[risk]
  const insight = portfolioData?.insight ?? ''

  const colorMap: Record<string, string> = {
    'young-investor': '#38bdf8',
    'family-planner': '#a78bfa',
    'retirement-client': '#34d399',
  }
  const color = colorMap[selectedPersona] ?? '#38bdf8'

  return (
    <div className="glass-card" style={{
      padding: '24px 28px',
      background: `linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.7))`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow orb */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 160, height: 160,
        background: `radial-gradient(circle, ${color}15, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${color}30, ${color}10)`,
          border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Brain size={18} color={color} />
        </div>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>
            AI Insight
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, color: '#64748b' }}>Live analysis • Updated now</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#475569', fontSize: 13 }}>Analyzing portfolio…</div>
        </div>
      ) : (
        <>
          {/* Main insight */}
          <div style={{
            background: `${color}0d`,
            border: `1px solid ${color}25`,
            borderRadius: 12, padding: '14px 16px',
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>
              "{insight}"
            </p>
          </div>

          {/* Bullet insights */}
          <div style={{ display: 'grid', gap: 10 }}>
            {insights.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '10px 14px',
                  background: 'rgba(15,23,42,0.4)',
                  border: '1px solid rgba(99,179,237,0.08)',
                  borderRadius: 10,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `${color}15`,
                  border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: color,
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  <item.icon size={13} />
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

export default AIInsightCard
