import React from 'react'
import { Persona, PortfolioData, HoldingData, IndexData, NewsData, MetricsData, MonteCarloData } from '../../store/useAppStore'
import { Zap, TrendingUp, BarChart3, Activity, LineChart, TrendingDown, Brain, Sparkles, Layers } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'

export interface BrandingConfig {
  themeName: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  clientName: string
  logoPreset: string
  logoUrl?: string
  footerText: string
  fontFamily?: string
}

interface SlideTemplateProps {
  branding: BrandingConfig
  personaData: {
    persona: Persona
    portfolio: PortfolioData | null
    holdings: HoldingData[]
    metrics: MetricsData | null
    monteCarlo: MonteCarloData | null
  }
  notes?: string
  customTitle?: string
  customContent?: string
}

// Helper to get logo icon / image based on preset
export const SlideLogo: React.FC<{ branding: BrandingConfig }> = ({ branding }) => {
  // Custom uploaded logo (base64 or URL)
  if (branding.logoPreset === 'custom' && branding.logoUrl) {
    return <img src={branding.logoUrl} alt="Logo" style={{ height: 28, maxWidth: 140, objectFit: 'contain' }} />
  }

  // Fallback / Preset logos
  const text = branding.logoPreset === 'premium' ? 'ApexWealth' : 'Deckora'
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6,
        background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
      }}>
        {branding.logoPreset === 'premium' ? <Sparkles size={12} /> : <Layers size={12} />}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', color: branding.textColor }}>
        {text}
      </span>
    </div>
  )
}

// Slide Layout Shell
export const SlideShell: React.FC<{
  branding: BrandingConfig
  children: React.ReactNode
  showHeader?: boolean
  customContent?: string
}> = ({
  branding,
  children,
  showHeader = true,
  customContent,
}) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: branding.backgroundColor,
      color: branding.textColor,
      padding: '32px 48px 24px 48px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: `${branding.fontFamily || 'Outfit'}, sans-serif`,
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* Decorative top gradient accent */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 4,
        background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
      }} />

      {/* Header */}
      {showHeader && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: 12,
          marginBottom: 16,
        }}>
          <SlideLogo branding={branding} />
          <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500 }}>
            {branding.clientName ? `Prepared for: ${branding.clientName}` : 'Portfolio Proposal'}
          </span>
        </div>
      )}

      {/* Body Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {children}
      </div>

      {/* Advisor Commentary Box */}
      {customContent && customContent.trim() && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderLeft: `2.5px solid ${branding.primaryColor}`,
          borderRadius: '0 6px 6px 0',
          padding: '8px 14px',
          marginTop: 12,
          fontSize: 10,
          lineHeight: 1.4,
          color: 'rgba(255, 255, 255, 0.8)',
          fontStyle: 'italic',
        }}>
          <strong>Advisor Note:</strong> {customContent}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        paddingTop: 8,
        marginTop: 16,
        fontSize: 9,
        color: 'rgba(255, 255, 255, 0.3)',
      }}>
        <span>{branding.footerText || 'Confidential · For internal client use only'}</span>
        <span>Deckora Wealth Analytics</span>
      </div>
    </div>
  )
}

// 1. Cover Slide
export const CoverSlide: React.FC<SlideTemplateProps> = ({ branding, customTitle, customContent }) => {
  return (
    <SlideShell branding={branding} showHeader={false}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'relative',
        paddingLeft: 24,
      }}>
        {/* Large Decorative shape in background */}
        <div style={{
          position: 'absolute',
          right: -20,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${branding.primaryColor}20 0%, transparent 70%)`,
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }} />

        <div style={{ marginBottom: 40 }}>
          <SlideLogo branding={branding} />
        </div>

        <h1 style={{
          fontSize: 36,
          fontWeight: 800,
          margin: '0 0 12px 0',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          background: `linear-gradient(90deg, ${branding.textColor}, ${branding.primaryColor})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {customTitle || (branding.clientName ? `Strategic Wealth Presentation` : 'Investment Strategy & Review')}
        </h1>

        <p style={{
          fontSize: 16,
          color: 'rgba(255,255,255,0.7)',
          margin: '0 0 24px 0',
          fontWeight: 400,
        }}>
          {customContent || 'Custom Portfolio Analytics & Projected Outcomes'}
        </p>

        <div style={{
          width: 64,
          height: 3,
          background: branding.primaryColor,
          borderRadius: 2,
          marginBottom: 40,
        }} />

        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{branding.clientName || 'Valued Partner'}</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
      </div>
    </SlideShell>
  )
}

// 2. Metrics Slide
export const MetricsSlide: React.FC<SlideTemplateProps> = ({ branding, personaData, customTitle, customContent }) => {
  const m = personaData.metrics
  if (!m) return <SlideShell branding={branding}><div>Loading metrics...</div></SlideShell>

  const items = [
    { label: 'Sharpe Ratio', value: m.sharpe, desc: 'Risk-adjusted return', icon: Zap },
    { label: 'Alpha', value: `${m.alpha}%`, desc: 'Excess return vs benchmark', icon: TrendingUp },
    { label: 'Beta', value: m.beta, desc: 'Market sensitivity', icon: BarChart3 },
    { label: 'Volatility', value: `${m.volatility}%`, desc: 'Annualized price spread', icon: Activity },
    { label: 'YTD Return', value: `${m.ytdReturn}%`, desc: 'Calendar year performance', icon: LineChart },
    { label: 'Max Drawdown', value: `${m.maxDrawdown}%`, desc: 'Peak-to-trough risk', icon: TrendingDown },
  ]

  return (
    <SlideShell branding={branding} customContent={customContent}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px 0', color: branding.primaryColor }}>
        {customTitle || 'Portfolio Performance & Risk Metrics'}
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        flex: 1,
        alignContent: 'center',
      }}>
        {items.map((item, idx) => {
          const IconComp = item.icon
          return (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxSizing: 'border-box',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${branding.primaryColor}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: branding.primaryColor,
                flexShrink: 0,
              }}>
                <IconComp size={16} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '2px 0 0 0' }}>{item.value}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{item.desc}</div>
              </div>
            </div>
          )
        })}
      </div>
    </SlideShell>
  )
}

// 3. Holdings Slide
export const HoldingsSlide: React.FC<SlideTemplateProps> = ({ branding, personaData, customTitle, customContent }) => {
  const h = personaData.holdings
  const totalValue = h.reduce((sum, item) => sum + item.value, 0)
  
  const chartData = h.map(item => ({
    name: item.symbol,
    value: item.value
  }))

  const COLORS = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#f43f5e', '#818cf8']

  return (
    <SlideShell branding={branding} customContent={customContent}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px 0', color: branding.primaryColor }}>
        {customTitle || 'Current Asset Holdings'}
      </h2>
      <div style={{ display: 'flex', gap: 20, flex: 1, alignItems: 'center', minHeight: 0 }}>
        {/* Left Side: Donut Chart */}
        <div style={{ flex: 1, height: '170px', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 10 }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Total Value</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>${totalValue.toLocaleString()}</div>
          </div>
        </div>

        {/* Right Side: Compact Legend/Table */}
        <div style={{ flex: 1.4, overflowY: 'auto', maxHeight: '180px', paddingRight: 4 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <th style={{ padding: '4px 6px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Asset</th>
                <th style={{ padding: '4px 6px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textAlign: 'right' }}>Weight</th>
                <th style={{ padding: '4px 6px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textAlign: 'right' }}>Value</th>
                <th style={{ padding: '4px 6px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textAlign: 'right' }}>Gain/Loss</th>
              </tr>
            </thead>
            <tbody>
              {h.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[idx % COLORS.length], flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: 10 }}>{row.symbol}</span>
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 90 }}>{row.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', color: '#fff' }}>{((row.value / totalValue) * 100).toFixed(1)}%</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 600, color: '#fff' }}>${row.value.toLocaleString()}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 600, color: row.pnlPct >= 0 ? '#34d399' : '#f87171' }}>
                    {row.pnlPct >= 0 ? '+' : ''}{row.pnlPct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SlideShell>
  )
}

// 4. Risk & Allocation Slide
export const RiskSlide: React.FC<SlideTemplateProps> = ({ branding, personaData, customTitle, customContent }) => {
  const p = personaData.portfolio
  
  // Custom allocation details based on persona
  const allocations = personaData.persona === 'young-investor' 
    ? [
        { asset: 'US Equities (Tech focus)', pct: 60, color: branding.primaryColor },
        { asset: 'Int\'l Equities (Growth)', pct: 20, color: branding.secondaryColor },
        { asset: 'Alternatives / Crypto', pct: 15, color: '#a78bfa' },
        { asset: 'Cash / Liquid Bonds', pct: 5, color: '#94a3b8' },
      ]
    : personaData.persona === 'family-planner'
    ? [
        { asset: 'US Equities (Core & Div)', pct: 40, color: branding.primaryColor },
        { asset: 'Int\'l Stocks', pct: 20, color: branding.secondaryColor },
        { asset: 'Fixed Income (Bonds)', pct: 30, color: '#a78bfa' },
        { asset: 'Alternatives (Real Estate)', pct: 10, color: '#94a3b8' },
      ]
    : [
        { asset: 'US Defensive Stocks', pct: 30, color: branding.primaryColor },
        { asset: 'High-Yield Dividend Funds', pct: 20, color: branding.secondaryColor },
        { asset: 'Long-Term Treasury Bonds', pct: 40, color: '#a78bfa' },
        { asset: 'Cash Reserves', pct: 10, color: '#94a3b8' },
      ]

  return (
    <SlideShell branding={branding}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px 0', color: branding.primaryColor }}>
        {customTitle || 'Risk Profile & Asset Allocation'}
      </h2>
      <div style={{ display: 'flex', gap: 32, alignItems: 'center', flex: 1 }}>
        {/* Left Side: Summary text */}
        <div style={{ flex: 1 }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderLeft: `3px solid ${branding.primaryColor}`,
            padding: '16px 20px',
            borderRadius: '0 8px 8px 0',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Branded Risk Level</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>
              {p?.risk || 'Balanced'} Allocation
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
              {customContent || `This strategy is structured to prioritize long-term capital efficiency matching the active ${p?.risk?.toLowerCase() || 'balanced'} risk profile guidelines.`}
            </p>
          </div>
        </div>

        {/* Right Side: Allocation bars */}
        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>STRATEGIC TARGETS</div>
          {allocations.map((item, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{item.asset}</span>
                <span style={{ fontWeight: 700, color: branding.primaryColor }}>{item.pct}%</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  )
}

// 5. Wealth Timeline Slide
export const TimelineSlide: React.FC<SlideTemplateProps> = ({ branding, personaData, customTitle, customContent }) => {
  const p = personaData.portfolio
  if (!p) return <SlideShell branding={branding}><div>Loading timeline...</div></SlideShell>

  return (
    <SlideShell branding={branding} customContent={customContent}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px 0', color: branding.primaryColor }}>
        {customTitle || 'Historical Wealth Growth'}
      </h2>
      <div style={{ display: 'flex', gap: 20, flex: 1, alignItems: 'center', minHeight: 0 }}>
        {/* Statistics list */}
        <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>INITIAL PORTFOLIO VALUE</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              ${p.wealthData[0]?.value.toLocaleString() || '0'}
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>As of {p.wealthData[0]?.year}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>CURRENT PORTFOLIO VALUE</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: branding.primaryColor, marginTop: 2 }}>
              ${p.current.toLocaleString()}
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>As of {p.wealthData[p.wealthData.length - 1]?.year || '2025'}</div>
          </div>
        </div>

        {/* Growth Area Chart */}
        <div style={{ flex: 1.6, height: '170px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={p.wealthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="slideTimelineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={branding.primaryColor} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={branding.primaryColor} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} tickLine={false} tickFormatter={(v) => `$${(v / 1000)}k`} />
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 10 }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
              />
              <Area type="monotone" dataKey="value" stroke={branding.primaryColor} strokeWidth={2} fillOpacity={1} fill="url(#slideTimelineGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SlideShell>
  )
}

// 6. Monte Carlo Slide
export const MonteCarloSlide: React.FC<SlideTemplateProps> = ({ branding, personaData, customTitle, customContent }) => {
  const mc = personaData.monteCarlo
  if (!mc) return <SlideShell branding={branding}><div>Loading Monte Carlo...</div></SlideShell>

  // Estimate some path endpoints for the presentation summary table
  const pData = mc.chartData
  const lastRow = pData[pData.length - 1] || {}

  return (
    <SlideShell branding={branding} customContent={customContent}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px 0', color: branding.primaryColor }}>
        {customTitle || 'Monte Carlo Simulation & Target Success'}
      </h2>
      <div style={{ display: 'flex', gap: 24, flex: 1, alignItems: 'center' }}>
        {/* Simulation Summary */}
        <div style={{ flex: 1.1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 12,
            padding: '16px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PROBABILITY OF MEETING GOAL</div>
            <div style={{
              fontSize: 36,
              fontWeight: 800,
              color: mc.probability >= 70 ? '#34d399' : '#fbbf24',
              margin: '8px 0',
            }}>
              {mc.probability}%
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
              Current: ${mc.current.toLocaleString()} ➜ Target: ${mc.goal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Path Statistics Table */}
        <div style={{ flex: 1.4 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: 8 }}>PROJECTED SCENARIOS (10 YEARS)</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '6px 8px', color: 'rgba(255,255,255,0.4)' }}>Path</th>
                <th style={{ padding: '6px 8px', color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>Ending Portfolio Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>Optimistic (95th Percentile)</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: '#34d399' }}>
                  ${(lastRow.best || 0).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>Median Scenario (50th Percentile)</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: branding.primaryColor }}>
                  ${(lastRow.median || 0).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>Conservative Scenario (25th Percentile)</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>
                  ${(lastRow.conservative || 0).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>Pessimistic Scenario (5th Percentile)</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: '#f87171' }}>
                  ${(lastRow.pessimistic || 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </SlideShell>
  )
}

// 7. AI Insights Slide
export const InsightsSlide: React.FC<SlideTemplateProps> = ({ branding, personaData, customTitle, customContent }) => {
  const p = personaData.portfolio
  return (
    <SlideShell branding={branding}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px 0', color: branding.primaryColor }}>
        {customTitle || 'AI-Powered Investment Analysis'}
      </h2>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 12,
          padding: '24px',
          boxSizing: 'border-box',
          position: 'relative',
        }}>
          {/* Accent light decoration */}
          <div style={{
            position: 'absolute',
            top: 10, left: 10,
            fontSize: 24, opacity: 0.15,
            color: branding.primaryColor
          }}>
            “
          </div>
          
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Brain size={14} color={branding.primaryColor} /> Executive Summary
          </h3>
          <p style={{
            fontSize: 12,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.8)',
            margin: 0,
            fontStyle: 'italic',
          }}>
            {customContent || p?.insight || 'Analysis loading...'}
          </p>
        </div>
      </div>
    </SlideShell>
  )
}

// 8. Custom Slide
export const CustomTextSlide: React.FC<SlideTemplateProps> = ({ branding, customTitle, customContent }) => {
  // Parse content lines for bullets
  const lines = customContent ? customContent.split('\n').filter(l => l.trim()) : []

  return (
    <SlideShell branding={branding}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px 0', color: branding.primaryColor }}>
        {customTitle || 'Market Summary & Review'}
      </h2>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: '0 8px' }}>
        {lines.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lines.map((line, idx) => (
              <li key={idx} style={{
                fontSize: 12,
                lineHeight: 1.5,
                color: 'rgba(255, 255, 255, 0.85)',
              }}>
                {line.startsWith('-') || line.startsWith('•') ? line.substring(1).trim() : line}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            Add bullet points or custom remarks in the slide editor.
          </p>
        )}
      </div>
    </SlideShell>
  )
}
