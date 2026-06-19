import { useAppStore } from '../../store/useAppStore'
import { Globe, TrendingUp, DollarSign, Briefcase } from 'lucide-react'

const MacroIndicators = () => {
  const { macro } = useAppStore()

  if (!macro) return null

  const items = [
    {
      name: 'US GDP Growth',
      value: `${macro.gdp > 0 ? '+' : ''}${macro.gdp}%`,
      sub: 'Annualized (Real)',
      icon: TrendingUp,
      color: '#34d399',
    },
    {
      name: 'US CPI Inflation',
      value: `${macro.inflation}%`,
      sub: 'Consumer Prices Y/Y',
      icon: Globe,
      color: '#a78bfa',
    },
    {
      name: 'US Unemployment',
      value: `${macro.unemployment}%`,
      sub: 'Labor Force Rate',
      icon: Briefcase,
      color: '#fbbf24',
    },
    {
      name: 'Fed Funds Rate',
      value: `${macro.fedRate}%`,
      sub: 'Target Benchmark Rate',
      icon: DollarSign,
      color: '#38bdf8',
    },
  ]

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Globe size={18} color="#38bdf8" />
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Global Macroeconomic Indicators
        </h3>
        <span style={{ fontSize: 10, color: '#64748b', background: '#F1F5F9', padding: '2px 8px', borderRadius: 12 }}>
          Live World Bank API
        </span>
      </div>
      
      <div className="grid-4col-auto">
        {items.map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} className="glass-card" style={{ padding: '16px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 80, height: 80,
                background: `radial-gradient(circle, ${item.color}15, transparent 70%)`,
                borderRadius: '50%', pointerEvents: 'none',
              }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{item.name}</span>
                <Icon size={14} color="#64748b" />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', fontFamily: 'Outfit, sans-serif' }}>
                  {item.value}
                </span>
                <span style={{ fontSize: 10, color: '#64748b' }}>
                  {item.sub}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MacroIndicators
