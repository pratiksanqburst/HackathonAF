import { SlideItem } from '../store/useAppStore'

export type SlideItemType = SlideItem['type']

export interface TemplateSlideOutline {
  type: SlideItemType
  title: string
  desc: string
}

export interface PresetTemplateData {
  id: string
  name: string
  description: string
  category: 'performance' | 'planning' | 'risk' | 'strategy'
  icon: string
  color: string
  secondaryColor: string
  slidesCount: number
  badge?: string
  tags: string[]
  themeName: string
  backgroundColor: string
  textColor: string
  primaryColor: string
  fontFamily: string
  slides: TemplateSlideOutline[]
}

export const SHARED_PRESET_TEMPLATES: PresetTemplateData[] = [
  {
    id: 'quarterly-review',
    name: 'Quarterly Review',
    description: 'Comprehensive quarterly portfolio performance review with benchmark comparisons and forward outlook.',
    category: 'performance',
    icon: '📊',
    color: '#2563EB',
    secondaryColor: '#60a5fa',
    slidesCount: 6,
    badge: 'Most Used',
    tags: ['Reporting Period', 'Portfolio Holdings', 'Benchmark', 'Meeting Objective'],
    themeName: 'Quarterly Review (Blue)',
    backgroundColor: '#1e40af',
    textColor: '#ffffff',
    primaryColor: '#38bdf8',
    fontFamily: 'Outfit',
    slides: [
      { type: 'cover',      title: 'Q1 2026 Portfolio Strategy Overview',        desc: 'Executive summary and period objectives for the quarterly review.' },
      { type: 'metrics',    title: 'Portfolio Performance vs Benchmark',           desc: 'Risk-adjusted returns, Sharpe ratio, alpha, and benchmark deviation.' },
      { type: 'holdings',   title: 'Top Holdings & Asset Allocation',              desc: 'Sector breakdown, top 5 positions, and concentration analysis.' },
      { type: 'risk',       title: 'Risk & Volatility Assessment',                  desc: 'Volatility metrics, max drawdown, and correlation heatmap.' },
      { type: 'timeline',   title: 'Forward Look & Rebalancing Strategy',          desc: 'Q2 rebalancing plan, target asset allocation, and tactical shifts.' },
      { type: 'insights',   title: 'Key Takeaways & Advisor Recommendations',      desc: 'Actionable next steps, portfolio optimisation, and client action items.' },
    ],
  },
  {
    id: 'portfolio-performance',
    name: 'Portfolio Performance',
    description: 'Deep-dive performance attribution analysis with asset class breakdown and risk-adjusted returns.',
    category: 'performance',
    icon: '📈',
    color: '#10B981',
    secondaryColor: '#34d399',
    slidesCount: 5,
    tags: ['Period', 'Asset Allocation', 'Benchmark', 'Key Metrics'],
    themeName: 'Performance (Emerald)',
    backgroundColor: '#065f46',
    textColor: '#ffffff',
    primaryColor: '#10b981',
    fontFamily: 'Outfit',
    slides: [
      { type: 'cover',      title: 'Portfolio Performance Review',                 desc: 'Cover slide with advisor branding and performance period.' },
      { type: 'metrics',    title: 'Risk-Adjusted Performance Attribution',        desc: 'Alpha, beta, Sharpe ratio, and annualised return comparison.' },
      { type: 'holdings',   title: 'Asset Class Performance Breakdown',            desc: 'Equity, Fixed Income, Alternatives – contribution by class.' },
      { type: 'risk',       title: 'Risk Metrics & Stress Testing',                desc: 'VaR, max drawdown, correlation, and scenario stress outcomes.' },
      { type: 'insights',   title: 'Portfolio Optimisation Recommendations',       desc: 'Rebalancing triggers, sector rotation ideas, and advisor next steps.' },
    ],
  },
  {
    id: 'retirement-planning',
    name: 'Retirement Planning',
    description: 'Long-term retirement income strategy with projected scenarios, Social Security optimisation, and drawdown modelling.',
    category: 'planning',
    icon: '🕐',
    color: '#F59E0B',
    secondaryColor: '#FCD34D',
    slidesCount: 6,
    tags: ['Target Date', 'Income Goals', 'Risk Tolerance', 'Current Assets'],
    themeName: 'Retirement Sunset',
    backgroundColor: '#0F172A',
    textColor: '#F8FAFC',
    primaryColor: '#F59E0B',
    fontFamily: 'Outfit',
    slides: [
      { type: 'cover',      title: 'Retirement Income Strategy Plan',              desc: 'Retirement horizon, income targets, and legacy planning objectives.' },
      { type: 'metrics',    title: 'Current Retirement Preparedness Score',        desc: 'Sharpe ratio relative to income targets and shortfall analysis.' },
      { type: 'risk',       title: 'Defensive Positioning & Risk Mitigation',      desc: 'Income protection, insurance coverage, and capital preservation.' },
      { type: 'timeline',   title: 'Accumulation & Drawdown Roadmap',              desc: 'Phase 1 accumulation, Phase 2 drawdown with Retirement Annuity.' },
      { type: 'montecarlo', title: 'Monte Carlo Success Probability',              desc: 'Simulation of retirement success rates across market scenarios.' },
      { type: 'insights',   title: 'Advisor Recommendations & Next Steps',         desc: 'Actionable steps across Retirement Solutions and Insurance pillars.' },
    ],
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    description: 'Portfolio risk profiling with stress testing, correlation analysis, and recommended adjustments.',
    category: 'risk',
    icon: '🛡',
    color: '#EF4444',
    secondaryColor: '#FCA5A5',
    slidesCount: 5,
    tags: ['Risk Profile', 'Portfolio Holdings', 'Market Scenarios', 'Time Horizon'],
    themeName: 'Risk (Red)',
    backgroundColor: '#1e3a5f',
    textColor: '#ffffff',
    primaryColor: '#EF4444',
    fontFamily: 'Inter',
    slides: [
      { type: 'cover',      title: 'Portfolio Risk & Stress Test Report',          desc: 'Risk profiling introduction and key risk appetite parameters.' },
      { type: 'metrics',    title: 'Risk Metrics Dashboard',                       desc: 'VaR, beta, standard deviation, and Sortino ratio overview.' },
      { type: 'risk',       title: 'Stress Testing & Scenario Analysis',           desc: '2008 GFC, 2020 COVID, and 2022 rate-hike scenario simulations.' },
      { type: 'holdings',   title: 'Position-Level Risk Contribution',             desc: 'Concentration risk, correlation heatmap, and position sizing.' },
      { type: 'insights',   title: 'Risk Reduction & Hedging Recommendations',    desc: 'Insurance wrappers, tactical hedges, and defensive rebalancing.' },
    ],
  },
  {
    id: 'investment-recommendation',
    name: 'Investment Recommendation',
    description: 'Actionable investment recommendations with rationale, expected returns, and implementation roadmap.',
    category: 'strategy',
    icon: '💼',
    color: '#7C3AED',
    secondaryColor: '#a78bfa',
    slidesCount: 5,
    tags: ['Investment Goals', 'Capital Available', 'Sectors', 'Timeline'],
    themeName: 'Investment (Indigo)',
    backgroundColor: '#0c1445',
    textColor: '#ffffff',
    primaryColor: '#6366f1',
    fontFamily: 'Inter',
    slides: [
      { type: 'cover',      title: 'Investment Strategy Recommendation',           desc: 'Client context, mandate summary, and capital deployment overview.' },
      { type: 'metrics',    title: 'Expected Return & Risk-Reward Analysis',       desc: 'Projected returns, Sharpe ratio targets, and asset class yields.' },
      { type: 'holdings',   title: 'Recommended Portfolio Construction',           desc: 'Sector weights, instrument picks, and conviction levels.' },
      { type: 'timeline',   title: 'Implementation Roadmap',                       desc: 'Phased entry strategy, rebalancing schedule, and fee considerations.' },
      { type: 'insights',   title: 'Rationale & Key Assumptions',                  desc: 'Macro thesis, key risks to the recommendation, and monitoring plan.' },
    ],
  },
  {
    id: 'two-pot-advisory',
    name: 'Two-Pot Retirement Advisory',
    description: 'Personalised South Africa Two-Pot retirement system warning from Kabelo Mokgosi. Explains the pot split, the true cost of early withdrawal (the 4.6× Rule), and actionable next steps.',
    category: 'planning',
    icon: '🏛',
    color: '#10B981',
    secondaryColor: '#F59E0B',
    slidesCount: 6,
    badge: 'New · SA Regulation',
    tags: ['Two-Pot', 'South Africa', 'Retirement', 'Tax Warning'],
    themeName: 'Two-Pot Advisory (Navy/Emerald)',
    backgroundColor: '#0F172A',
    textColor: '#F8FAFC',
    primaryColor: '#10B981',
    fontFamily: 'Inter',
    slides: [
      { type: 'cover',   title: 'Two-Pot Retirement System — Client Advisory',   desc: 'Cover with advisory context.' },
      { type: 'custom',  title: 'How Your Retirement Money Is Now Split',         desc: 'Tranche A (33% Savings Pot) vs Tranche B (67% Retirement Pot).' },
      { type: 'custom',  title: 'Why Withdrawing Early Is A Costly Mistake',      desc: 'R30,000 withdrawal: tax hit, net received, invisible future loss.' },
      { type: 'custom',  title: 'The True Cost — Visualised',                     desc: 'Bar chart: R140,000 lost vs R0 if withdrawn. The 4.6× Rule.' },
      { type: 'custom',  title: 'Your Retirement Goals & Our Plan',               desc: 'Three advisor goals: comfort, emergency protection, compound growth.' },
      { type: 'insights',title: 'What We Recommend You Do Now',                   desc: 'Four next steps: no withdrawal, emergency fund, contribution review, meeting.' },
    ],
  },
]
