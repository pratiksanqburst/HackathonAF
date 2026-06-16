import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { CheckCircle2, AlertTriangle, Sparkles, Sliders } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const formatValue = (v: number) =>
  v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(2)}M`
    : `$${(v / 1_000).toFixed(0)}K`

// Compound interest + monthly contributions projection helper
const projectYearly = (current: number, rate: number, monthlyCont: number, years: number) => {
  const data = [{ year: 'Today', value: current }]
  let balance = current
  const monthlyRate = rate / 100 / 12

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyRate) + monthlyCont
    }
    data.push({
      year: `Yr ${y}`,
      value: Math.round(balance),
    })
  }
  return data
}

const GoalSimulator = () => {
  const { portfolioData, selectedPersona } = useAppStore()
  const [compareMode, setCompareMode] = useState(false)
  const [years, setYears] = useState(10)
  const [advisorFeedback, setAdvisorFeedback] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Plan A Parameters
  const [growthRateA, setGrowthRateA] = useState(8)
  const [contA, setContA] = useState(500)

  // Plan B Parameters
  const [growthRateB, setGrowthRateB] = useState(10)
  const [contB, setContB] = useState(1000)

  const current = portfolioData?.current ?? 100000
  const goal = portfolioData?.goal ?? 500000

  // Calculate year-by-year projections
  const projDataA = projectYearly(current, growthRateA, contA, years)
  const projDataB = projectYearly(current, growthRateB, contB, years)

  const finalValA = projDataA[projDataA.length - 1].value
  const finalValB = projDataB[projDataB.length - 1].value

  const reachedA = finalValA >= goal
  const reachedB = finalValB >= goal

  // Format Recharts data
  const chartData = projDataA.map((d, index) => ({
    year: d.year,
    'Plan A': d.value,
    'Plan B': projDataB[index]?.value ?? d.value,
    'Target Goal': goal,
  }))

  const colorMap: Record<string, string> = {
    'young-investor': '#38bdf8',
    'family-planner': '#a78bfa',
    'retirement-client': '#34d399',
  }
  const themeColor = colorMap[selectedPersona] ?? '#38bdf8'

  return (
    <div className="glass-card" style={{ padding: '24px 28px' }}>
      {/* Header with selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Strategic Goal Simulator
          </h2>
          <p style={{ fontSize: 12, color: '#64748b' }}>Simulate and compare wealth pathways to target goals</p>
        </div>

        {/* Plan Mode Selector */}
        <div style={{ display: 'flex', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 3 }}>
          <button
            onClick={() => setCompareMode(false)}
            style={{
              background: !compareMode ? themeColor : 'transparent',
              border: 0, borderRadius: 6,
              color: !compareMode ? '#000' : '#94a3b8',
              fontSize: 11, fontWeight: 700,
              padding: '6px 12px', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Single Plan
          </button>
          <button
            onClick={() => setCompareMode(true)}
            style={{
              background: compareMode ? themeColor : 'transparent',
              border: 0, borderRadius: 6,
              color: compareMode ? '#000' : '#94a3b8',
              fontSize: 11, fontWeight: 700,
              padding: '6px 12px', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            What-If Comparison
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: compareMode ? '1fr 1fr' : '1fr', gap: 24 }}>
        
        {/* Left Side: Parameters Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Plan A Parameters */}
          <div style={{
            background: 'rgba(15,23,42,0.4)',
            border: '1px solid rgba(255,255,255,0.03)',
            borderRadius: 12, padding: 16,
          }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: themeColor, margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sliders size={14} />
              {compareMode ? 'PLAN A (Baseline)' : 'Plan Parameters'}
            </h3>

            {/* Growth Rate A */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Annual Growth Rate</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{growthRateA}% p.a.</span>
              </div>
              <input
                type="range"
                min={1} max={20} value={growthRateA}
                onChange={(e) => setGrowthRateA(Number(e.target.value))}
                style={{ width: '100%', height: 4, appearance: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: 2, outline: 'none' }}
              />
            </div>

            {/* Monthly Contribution A */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Monthly Contribution</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>${contA.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={0} max={5000} step={100} value={contA}
                onChange={(e) => setContA(Number(e.target.value))}
                style={{ width: '100%', height: 4, appearance: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: 2, outline: 'none' }}
              />
            </div>
          </div>

          {/* Plan B Parameters (Comparison) */}
          {compareMode && (
            <div style={{
              background: 'rgba(15,23,42,0.4)',
              border: '1px solid rgba(255,255,255,0.03)',
              borderRadius: 12, padding: 16,
            }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#f472b6', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} />
                PLAN B (Alternative)
              </h3>

              {/* Growth Rate B */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Annual Growth Rate</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{growthRateB}% p.a.</span>
                </div>
                <input
                  type="range"
                  min={1} max={20} value={growthRateB}
                  onChange={(e) => setGrowthRateB(Number(e.target.value))}
                  style={{ width: '100%', height: 4, appearance: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: 2, outline: 'none' }}
                />
              </div>

              {/* Monthly Contribution B */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Monthly Contribution</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>${contB.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0} max={5000} step={100} value={contB}
                  onChange={(e) => setContB(Number(e.target.value))}
                  style={{ width: '100%', height: 4, appearance: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: 2, outline: 'none' }}
                />
              </div>
            </div>
          )}

          {/* Shared Time Horizon */}
          <div style={{
            background: 'rgba(15,23,42,0.2)',
            border: '1px solid rgba(255,255,255,0.02)',
            borderRadius: 12, padding: '12px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>SIMULATION HORIZON</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: themeColor }}>{years} Years</span>
            </div>
            <input
              type="range"
              min={1} max={30} value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              style={{ width: '100%', height: 4, appearance: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: 2, outline: 'none' }}
            />
          </div>
        </div>

        {/* Right Side: Projections Chart or Summary Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'space-between' }}>
          
          {/* Comparison Line Chart */}
          <div style={{ height: compareMode ? 200 : 160, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => formatValue(v)} tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  labelStyle={{ color: '#64748b', fontSize: 10 }}
                  itemStyle={{ fontSize: 11 }}
                />
                <Line type="monotone" dataKey="Plan A" stroke={themeColor} strokeWidth={2.5} dot={false} name={compareMode ? 'Plan A' : 'Projected Wealth'} />
                {compareMode && (
                  <Line type="monotone" dataKey="Plan B" stroke="#f472b6" strokeWidth={2.5} dot={false} name="Plan B" />
                )}
                <Line type="monotone" dataKey="Target Goal" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={1.5} dot={false} name="Target Goal" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Plan Outputs grid */}
          <div style={{ display: 'grid', gridTemplateColumns: compareMode ? '1fr 1fr' : '1fr', gap: 12 }}>
            {/* Plan A Outputs */}
            <div style={{
              background: 'rgba(15,23,42,0.4)',
              border: reachedA ? '1px solid rgba(52,211,153,0.15)' : '1px solid rgba(251,191,36,0.15)',
              borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <span style={{ fontSize: 9, color: '#64748b', fontWeight: 600 }}>{compareMode ? 'PLAN A PROJECTED' : 'PROJECTED PORTFOLIO'}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: reachedA ? '#34d399' : '#fbbf24', fontFamily: 'Outfit' }}>
                {formatValue(finalValA)}
              </span>
              <span style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                {reachedA ? <CheckCircle2 size={12} color="#34d399" /> : <AlertTriangle size={12} color="#fbbf24" />}
                {reachedA ? 'Exceeds Goal' : 'Below Goal'}
              </span>
            </div>

            {/* Plan B Outputs */}
            {compareMode && (
              <div style={{
                background: 'rgba(15,23,42,0.4)',
                border: reachedB ? '1px solid rgba(52,211,153,0.15)' : '1px solid rgba(251,191,36,0.15)',
                borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <span style={{ fontSize: 9, color: '#64748b', fontWeight: 600 }}>PLAN B PROJECTED</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: reachedB ? '#34d399' : '#fbbf24', fontFamily: 'Outfit' }}>
                  {formatValue(finalValB)}
                </span>
                <span style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {reachedB ? <CheckCircle2 size={12} color="#34d399" /> : <AlertTriangle size={12} color="#fbbf24" />}
                  {reachedB ? 'Exceeds Goal' : 'Below Goal'}
                </span>
              </div>
            )}
          </div>

          {/* AI Advisor Panel */}
          <div style={{
            background: 'rgba(99, 179, 237, 0.03)',
            border: '1px solid rgba(99, 179, 237, 0.12)',
            borderRadius: 12,
            padding: 16,
            marginTop: 4,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: themeColor, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={13} /> AI Wealth Blueprint
              </span>
              <button
                onClick={async () => {
                  setIsAnalyzing(true)
                  try {
                    const res = await fetch('/api/copilot/goal-advisor', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        persona: selectedPersona,
                        current,
                        goal,
                        years,
                        planA: { growth: growthRateA, contribution: contA, reached: reachedA, finalValue: finalValA },
                        planB: { growth: growthRateB, contribution: contB, reached: reachedB, finalValue: finalValB },
                        hasPlanB: compareMode
                      }),
                    })
                    const data = await res.json()
                    setAdvisorFeedback(data.reply)
                  } catch {
                    setAdvisorFeedback('Connection failed. Ensure the backend server is running.')
                  } finally {
                    setIsAnalyzing(false)
                  }
                }}
                disabled={isAnalyzing}
                style={{
                  background: isAnalyzing ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${themeColor}, #a78bfa)`,
                  border: 0,
                  borderRadius: 6,
                  color: '#000',
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: '5px 12px',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {isAnalyzing ? 'Analyzing...' : 'Audit Pathways'}
              </button>
            </div>

            <p style={{
              fontSize: 12,
              color: '#cbd5e1',
              lineHeight: 1.5,
              margin: 0,
              fontStyle: advisorFeedback ? 'normal' : 'italic',
            }}>
              {advisorFeedback || 'Review plan parameters and click Audit to generate AI strategic advisory commentary on plan feasibility.'}
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default GoalSimulator
