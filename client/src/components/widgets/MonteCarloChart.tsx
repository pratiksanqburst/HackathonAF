import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useAppStore } from '../../store/useAppStore'

const formatValue = (v: number) =>
  v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(2)}M`
    : `$${(v / 1_000).toFixed(0)}K`

const MonteCarloChart = () => {
  const { monteCarlo, loading, selectedPersona } = useAppStore()

  if (loading || !monteCarlo) {
    return (
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#475569', fontSize: 13 }}>Running simulations...</div>
      </div>
    )
  }

  const { chartData, probability, goal } = monteCarlo

  const colorMap: Record<string, string> = {
    'young-investor': '#38bdf8',
    'family-planner': '#a78bfa',
    'retirement-client': '#34d399',
  }
  const color = colorMap[selectedPersona] ?? '#38bdf8'

  return (
    <div className="glass-card" style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
            Monte Carlo Simulation
          </h2>
          <p style={{ fontSize: 12, color: '#64748b' }}>1,000 simulated paths to target goal</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 24, fontWeight: 800,
            color: probability >= 80 ? '#34d399' : probability >= 50 ? '#fbbf24' : '#f43f5e',
            fontFamily: 'Outfit, sans-serif'
          }}>
            {probability}%
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Probability of Success</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="mcGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.06)" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => formatValue(v)} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={60} />
          <Tooltip 
            contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10 }}
            itemStyle={{ fontSize: 12, color: '#334155' }}
            labelStyle={{ color: '#64748B', marginBottom: 4 }}
            formatter={(value: number) => formatValue(value)}
          />
          <Area type="monotone" dataKey="best" stroke="rgba(148,163,184,0.4)" fill="none" strokeWidth={1} />
          <Area type="monotone" dataKey="optimistic" stroke="rgba(148,163,184,0.6)" fill="none" strokeWidth={1} />
          <Area type="monotone" dataKey="median" stroke={color} strokeWidth={3} fill="url(#mcGradient)" />
          <Area type="monotone" dataKey="conservative" stroke="rgba(148,163,184,0.6)" fill="none" strokeWidth={1} />
          <Area type="monotone" dataKey="pessimistic" stroke="rgba(148,163,184,0.4)" fill="none" strokeWidth={1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MonteCarloChart
