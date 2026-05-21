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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15,23,42,0.95)',
        border: '1px solid rgba(56,189,248,0.3)',
        borderRadius: 10,
        padding: '10px 16px',
        backdropFilter: 'blur(12px)',
      }}>
        <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#38bdf8', fontWeight: 700, fontSize: 16 }}>
          {formatValue(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

const WealthTimeline = () => {
  const { portfolioData, loading, selectedPersona } = useAppStore()

  const colorMap: Record<string, string> = {
    'young-investor': '#38bdf8',
    'family-planner': '#a78bfa',
    'retirement-client': '#34d399',
  }
  const color = colorMap[selectedPersona] ?? '#38bdf8'

  const data = portfolioData?.wealthData ?? []
  const latest = data[data.length - 1]?.value ?? 0
  const first = data[0]?.value ?? 0
  const growthPct = first > 0 ? (((latest - first) / first) * 100).toFixed(1) : '0'

  return (
    <div className="glass-card" style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Wealth Timeline
          </h2>
          <p style={{ fontSize: 12, color: '#64748b' }}>Portfolio growth over time</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: color, fontFamily: 'Outfit, sans-serif' }}>
            {formatValue(latest)}
          </div>
          <div style={{
            fontSize: 12, fontWeight: 600,
            color: '#34d399',
            display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 2,
          }}>
            <span>▲</span>
            <span>+{growthPct}% all-time</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#475569', fontSize: 13 }}>Loading portfolio data…</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.06)" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fill: '#475569', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatValue(v)}
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              fill="url(#wealthGradient)"
              dot={{ fill: color, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default WealthTimeline
