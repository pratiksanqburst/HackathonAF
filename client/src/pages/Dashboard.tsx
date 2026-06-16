import Navbar from '../components/layout/Navbar'
import MarketTicker from '../components/widgets/MarketTicker'
import MarketIndices from '../components/widgets/MarketIndices'
import MacroIndicators from '../components/widgets/MacroIndicators'
import ClientSelection from '../components/widgets/ClientSelection'
import WealthTimeline from '../components/widgets/WealthTimeline'
import AIInsightCard from '../components/widgets/AIInsightCard'
import GoalSimulator from '../components/widgets/GoalSimulator'
import RiskGalaxy from '../components/widgets/RiskGalaxy'
import HoldingsTable from '../components/widgets/HoldingsTable'
import PortfolioMetrics from '../components/widgets/PortfolioMetrics'
import MonteCarloChart from '../components/widgets/MonteCarloChart'
import NewsCard from '../components/widgets/NewsCard'
import MarketSectorHeatmap from '../components/widgets/MarketSectorHeatmap'
import StockAlertRules from '../components/widgets/StockAlertRules'
import { useAppStore } from '../store/useAppStore'

const Dashboard = () => {
  const { stressScenario, setStressScenario } = useAppStore()

  const scenarioNames: Record<string, string> = {
    'tech-selloff': 'Tech Sector Correction (-38% Tech assets)',
    'market-crash': '2008 Financial Crisis (-35% Equities standard)',
    'ai-boom': 'AI Super-Cycle Surge (+42% Tech assets)',
    'rebalance': 'Tactical Asset Rebalancing Executed',
  }

  const isPositive = stressScenario === 'ai-boom' || stressScenario === 'rebalance'
  const accentColor = isPositive ? '#10b981' : '#ef4444'
  const textColor = isPositive ? '#a7f3d0' : '#fca5a5'
  const bgGlow = isPositive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)'
  const borderStyle = isPositive ? '1px dashed rgba(16, 185, 129, 0.4)' : '1px dashed rgba(239, 68, 68, 0.4)'
  const shadowGlow = isPositive ? '0 0 20px rgba(16, 185, 129, 0.15)' : '0 0 20px rgba(239, 68, 68, 0.15)'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(56,189,248,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(167,139,250,0.05) 0%, transparent 60%), #020617',
      paddingBottom: '40px',
    }}>
      {/* Full-width ticker */}
      <MarketTicker />

      {/* Responsive page container */}
      <div className="page-container">
        <Navbar />

        {/* Stress Scenario Banner */}
        {stressScenario && (
          <div style={{
            background: bgGlow,
            backdropFilter: 'blur(12px)',
            border: borderStyle,
            borderRadius: 16,
            padding: '12px 20px',
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            boxShadow: shadowGlow,
            transition: 'all 0.3s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: accentColor, boxShadow: `0 0 8px ${accentColor}`,
                animation: 'blink 1.2s infinite', flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: textColor, letterSpacing: '0.02em', fontFamily: 'Outfit' }}>
                SIMULATION RUNNING: {scenarioNames[stressScenario]} Shock Factors Loaded
              </span>
            </div>
            <button
              onClick={() => setStressScenario(null)}
              style={{
                background: isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `1px solid ${accentColor}`,
                borderRadius: 8, color: textColor,
                fontSize: 11, fontWeight: 700,
                padding: '5px 12px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Outfit',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accentColor; e.currentTarget.style.color = '#000' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = textColor }}
            >
              Reset to Live Market
            </button>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <MarketIndices />
        </div>

        <div style={{ marginTop: 20 }}>
          <MarketSectorHeatmap />
        </div>

        <MacroIndicators />
        <ClientSelection />

        {/* Main Responsive 2-col Grid */}
        <div className="grid-2col" style={{ marginTop: 20 }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <WealthTimeline />
            <HoldingsTable />
            <StockAlertRules />
          </div>
          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <RiskGalaxy />
            <PortfolioMetrics />
            <MonteCarloChart />
          </div>
        </div>

        {/* Full-width below */}
        <div style={{ marginTop: 20 }}>
          <AIInsightCard />
        </div>
        <div style={{ marginTop: 20 }}>
          <GoalSimulator />
        </div>
        <div style={{ marginTop: 20 }}>
          <NewsCard />
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 40, textAlign: 'center',
          fontSize: 11, color: '#334155',
          borderTop: '1px solid rgba(99,179,237,0.06)',
          paddingTop: 16,
        }}>
          Deckora — AI-Powered Deck Storytelling · Not financial advice
        </div>
      </div>
    </div>
  )
}

export default Dashboard
