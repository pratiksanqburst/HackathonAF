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

const Dashboard = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(56,189,248,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(167,139,250,0.05) 0%, transparent 60%), #020617',
      paddingBottom: '40px',
    }}>
      {/* Full-width ticker */}
      <MarketTicker />

      {/* Max width container */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <Navbar />
        
        <div style={{ marginTop: 24 }}>
          <MarketIndices />
        </div>

        <div style={{ marginTop: 20 }}>
          <MarketSectorHeatmap />
        </div>

        <MacroIndicators />

        <ClientSelection />

        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          marginTop: 20,
        }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <WealthTimeline />
            <HoldingsTable />
            <StockAlertRules />
            <AIInsightCard />
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <RiskGalaxy />
            <PortfolioMetrics />
            <MonteCarloChart />
          </div>
        </div>

        {/* Full width widgets below */}
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
          AF InsightSphere — AI-Powered Investment Intelligence · Not financial advice
        </div>
      </div>
    </div>
  )
}

export default Dashboard
