// Portfolio Analytics — Deckora AI Platform
import React from 'react'
import MarketIndices from '../components/widgets/MarketIndices'
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
import {
  TrendingUp,
  Activity,
  Brain,
  Zap,
  RefreshCw,
  AlertTriangle,
  Rocket,
  BarChart2,
  Layers,
  Shield,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

// ── Section header component ───────────────────────────────────────────────
const SectionLabel: React.FC<{
  icon: React.ReactNode
  title: string
  subtitle?: string
  tag?: string
  tagColor?: string
  action?: React.ReactNode
}> = ({ icon, title, subtitle, tag, tagColor = '#2563EB', action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: `linear-gradient(135deg,${tagColor}18,${tagColor}0d)`,
        border: `1px solid ${tagColor}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: tagColor, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.015em' }}>
            {title}
          </span>
          {tag && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: tagColor,
              background: `${tagColor}14`, border: `1px solid ${tagColor}28`,
              borderRadius: 20, padding: '2px 8px', letterSpacing: '0.03em',
            }}>{tag}</span>
          )}
        </div>
        {subtitle && (
          <p style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 1, fontWeight: 500 }}>{subtitle}</p>
        )}
      </div>
    </div>
    {action}
  </div>
)

// ── Divider ────────────────────────────────────────────────────────────────
const Divider: React.FC<{ label?: string }> = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '32px 0 28px 0' }}>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#E8EDF5,transparent)' }} />
    {label && (
      <span style={{
        fontSize: 10, fontWeight: 700, color: '#CBD5E1',
        letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>{label}</span>
    )}
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,#E8EDF5)' }} />
  </div>
)

// ── Main Page ──────────────────────────────────────────────────────────────
const Dashboard = () => {
  return (
    <div style={{ animation: 'fadeIn 0.35s ease', fontFamily: "'Inter', sans-serif", paddingBottom: 56 }}>

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>Decora</span>
            <ChevronRight size={12} color="#CBD5E1" />
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 700 }}>Portfolio Analytics</span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 7 }}>
            Portfolio Analytics
          </h1>
          <p style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500, letterSpacing: '-0.01em' }}>
            Live market data&nbsp;&middot;&nbsp;Risk intelligence&nbsp;&middot;&nbsp;AI-powered advisor decision support
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 16px',
          background: '#FFFFFF', border: '1px solid #E8EDF5',
          borderRadius: 12, boxShadow: '0 1px 4px rgba(15,23,42,0.05)', marginTop: 4,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#10B981', boxShadow: '0 0 6px rgba(16,185,129,0.6)',
            animation: 'blink 2s infinite',
          }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981', letterSpacing: '0.02em' }}>LIVE</span>
          <div style={{ width: 1, height: 14, background: '#E8EDF5' }} />
          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>NYSE&nbsp;&middot;&nbsp;Realtime</span>
        </div>
      </div>

      {/* ── SECTION 2: Client Overview ───────────────────────────────────── */}
      <SectionLabel
        icon={<BarChart2 size={15} />}
        title="Client Portfolio Overview"
        subtitle="Select a client profile to load live portfolio holdings and metrics"
        tagColor="#2563EB"
      />
      <ClientSelection />

      <Divider label="Risk & Performance Analysis" />

      {/* ── SECTION 3: Deep Analytics Grid ──────────────────────────────── */}
      <SectionLabel
        icon={<Layers size={15} />}
        title="Deep Analytics"
        subtitle="Wealth trajectory, holdings breakdown, risk topology and probability forecasting"
        tag="REAL-TIME"
        tagColor="#7C3AED"
        action={
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Shield size={12} /> Fiduciary-grade data
          </div>
        }
      />

      <div className="grid-2col" style={{ marginTop: 4 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <WealthTimeline />
          <HoldingsTable />
          <StockAlertRules />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <RiskGalaxy />
          <PortfolioMetrics />
          <MonteCarloChart />
        </div>
      </div>

      <Divider label="AI Intelligence Layer" />

      {/* ── SECTION 4: AI Advisory ───────────────────────────────────────── */}
      <SectionLabel
        icon={<Brain size={15} />}
        title="AI Advisory Intelligence"
        subtitle="Gemini-powered insights, scenario narratives and client-ready talking points"
        tag="AI"
        tagColor="#7C3AED"
      />
      <AIInsightCard />

      <Divider label="Goal Engine & Market Context" />

      {/* ── SECTION 5: Goal Simulator ────────────────────────────────────── */}
      <SectionLabel
        icon={<Rocket size={15} />}
        title="Goal Simulator"
        subtitle="Monte Carlo probability engine for long-term financial goal planning"
        tagColor="#D97706"
      />
      <GoalSimulator />

      {/* ── SECTION 6: News ──────────────────────────────────────────────── */}
      <div style={{ marginTop: 28 }}>
        <SectionLabel
          icon={<Sparkles size={15} />}
          title="Market Intelligence Feed"
          subtitle="Curated news with AI-relevance scoring for current portfolio holdings"
          tagColor="#2563EB"
        />
        <NewsCard />
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div style={{
        marginTop: 48, padding: '16px 0',
        borderTop: '1px solid #F1F5F9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 500 }}>
          Decora Platform&nbsp;&middot;&nbsp;AI-Powered Wealth Presentation
        </span>
        <span style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 500 }}>
          Not financial advice&nbsp;&middot;&nbsp;For licensed advisor use only
        </span>
      </div>
    </div>
  )
}

export default Dashboard
