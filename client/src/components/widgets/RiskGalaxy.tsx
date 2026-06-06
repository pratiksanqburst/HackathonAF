import { useAppStore } from '../../store/useAppStore'
import { Shield, Scale, Zap, AlertTriangle } from 'lucide-react'

const riskConfig = {
  Low: {
    color: '#34d399',
    glow: 'rgba(52,211,153,0.2)',
    label: 'Conservative',
    icon: Shield,
    bar: '30%',
    description: 'Capital preservation priority. Low volatility, steady income.',
    allocation: [
      { name: 'Bonds', pct: 55, color: '#34d399' },
      { name: 'Dividend Stocks', pct: 25, color: '#6ee7b7' },
      { name: 'Cash & Equiv.', pct: 12, color: '#a7f3d0' },
      { name: 'Real Estate', pct: 8, color: '#d1fae5' },
    ],
  },
  Medium: {
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.2)',
    label: 'Balanced',
    icon: Scale,
    bar: '55%',
    description: 'Equal focus on growth and preservation. Diversified strategy.',
    allocation: [
      { name: 'US Equities', pct: 40, color: '#a78bfa' },
      { name: 'Int\'l Stocks', pct: 20, color: '#c4b5fd' },
      { name: 'Bonds', pct: 30, color: '#ddd6fe' },
      { name: 'Alternatives', pct: 10, color: '#ede9fe' },
    ],
  },
  High: {
    color: '#38bdf8',
    glow: 'rgba(56,189,248,0.2)',
    label: 'Aggressive',
    icon: Zap,
    bar: '85%',
    description: 'Maximum growth potential. High risk tolerance required.',
    allocation: [
      { name: 'Tech Stocks', pct: 45, color: '#38bdf8' },
      { name: 'Emerging Mkts', pct: 25, color: '#7dd3fc' },
      { name: 'Crypto/Alt', pct: 15, color: '#bae6fd' },
      { name: 'Growth ETFs', pct: 15, color: '#e0f2fe' },
    ],
  },
}

const RiskGalaxy = () => {
  const { portfolioData, loading, stressScenario } = useAppStore()
  const risk = portfolioData?.risk ?? 'Medium'
  const cfg = riskConfig[risk]

  return (
    <div className="glass-card" style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
            Risk Galaxy
          </h2>
          <p style={{ fontSize: 12, color: '#64748b' }}>Portfolio risk profile & allocation</p>
        </div>
        {!loading && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: `${cfg.glow}`,
            border: `1px solid ${cfg.color}40`,
            borderRadius: 8, padding: '6px 14px',
          }}>
            <cfg.icon size={15} color={cfg.color} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#475569', fontSize: 13 }}>Loading risk profile…</div>
        </div>
      ) : (
        <>
          {/* Risk meter */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>Low Risk</span>
              <span style={{ fontSize: 11, color: '#64748b' }}>High Risk</span>
            </div>
            <div style={{
              height: 8, background: 'rgba(99,179,237,0.1)',
              borderRadius: 4, overflow: 'hidden', position: 'relative',
            }}>
              <div style={{
                height: '100%',
                width: cfg.bar,
                background: `linear-gradient(90deg, #34d399, ${cfg.color})`,
                borderRadius: 4,
                boxShadow: `0 0 12px ${cfg.color}`,
                transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>{cfg.description}</p>
            {stressScenario && (
              <div style={{
                marginTop: 12,
                background: stressScenario === 'ai-boom' || stressScenario === 'rebalance' ? 'rgba(52,211,153,0.06)' : 'rgba(244,63,94,0.06)',
                border: `1px solid ${stressScenario === 'ai-boom' || stressScenario === 'rebalance' ? 'rgba(52,211,153,0.2)' : 'rgba(244,63,94,0.2)'}`,
                borderRadius: 8, padding: '8px 12px',
                display: 'flex', alignItems: 'center', gap: 8,
                animation: 'blink 2s infinite'
              }}>
                <AlertTriangle size={14} color={stressScenario === 'ai-boom' || stressScenario === 'rebalance' ? '#34d399' : '#f43f5e'} style={{ flexShrink: 0 }} />
                <span style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: stressScenario === 'ai-boom' || stressScenario === 'rebalance' ? '#34d399' : '#f43f5e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  fontFamily: 'Outfit'
                }}>
                  {stressScenario === 'ai-boom' || stressScenario === 'rebalance' ? 'Tactical Optimization Active' : 'Stressed Simulation Loaded'}
                </span>
              </div>
            )}
          </div>

          {/* Allocation breakdown */}
          <div style={{ display: 'grid', gap: 10 }}>
            {cfg.allocation.map((item) => (
              <div key={item.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{item.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: item.color }}>{item.pct}%</span>
                </div>
                <div style={{ height: 4, background: 'rgba(99,179,237,0.08)', borderRadius: 2 }}>
                  <div style={{
                    height: '100%', width: `${item.pct}%`,
                    background: item.color, borderRadius: 2,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default RiskGalaxy
