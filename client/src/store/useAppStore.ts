import { create } from 'zustand'

export type Persona = 'young-investor' | 'family-planner' | 'retirement-client'

export interface WealthPoint {
  year: string
  value: number
}

export interface PortfolioData {
  wealthData: WealthPoint[]
  insight: string
  risk: 'Low' | 'Medium' | 'High'
  goal: number
  current: number
}

export interface IndexData {
  symbol: string
  name: string
  color: string
  price: number
  change: number
}

export interface HoldingData {
  symbol: string
  name: string
  shares: number
  avgCost: number
  price: number
  value: number
  pnlPct: number
  change: number
}

export interface NewsData {
  title: string
  source: string
  time: string
  url: string
  category: string
}

export interface MetricsData {
  sharpe: number
  alpha: number
  beta: number
  volatility: number
  maxDrawdown: number
  ytdReturn: number
}

export interface MonteCarloData {
  chartData: any[]
  probability: number
  paths: string[]
  current: number
  goal: number
}

export interface MacroData {
  gdp: number
  inflation: number
  unemployment: number
  fedRate: number
}

export interface User {
  name: string
  email: string
  avatar: string
  role: 'Advisor' | 'Client' | 'Admin'
}

export interface SlideItem {
  id: string
  type: 'cover' | 'metrics' | 'holdings' | 'risk' | 'timeline' | 'montecarlo' | 'insights' | 'custom'
  title?: string
  content?: string
  notes?: string
}

interface AppState {
  selectedPersona: Persona
  portfolioData: PortfolioData | null
  indices: IndexData[]
  holdings: HoldingData[]
  news: NewsData[]
  metrics: MetricsData | null
  monteCarlo: MonteCarloData | null
  macro: MacroData | null
  loading: boolean
  currentView: 'dashboard' | 'deck-builder'
  
  // Base states for stress recovery
  basePortfolioData: PortfolioData | null
  baseHoldings: HoldingData[]
  baseMetrics: MetricsData | null
  baseMonteCarlo: MonteCarloData | null
  stressScenario: 'tech-selloff' | 'market-crash' | 'ai-boom' | 'rebalance' | null
  setStressScenario: (scenario: 'tech-selloff' | 'market-crash' | 'ai-boom' | 'rebalance' | null) => void

  // Deck Builder Wizard states
  deckBuilderStep: 'start' | 'template-selection' | 'client-selection' | 'generating' | 'workspace'
  setDeckBuilderStep: (step: 'start' | 'template-selection' | 'client-selection' | 'generating' | 'workspace') => void
  selectedTemplate: string | null
  setSelectedTemplate: (template: string | null) => void
  templateMode: 'fixed' | 'custom'
  setTemplateMode: (mode: 'fixed' | 'custom') => void
  resetDeckForTemplate: (mode: 'fixed' | 'custom') => void

  // Presentation slides state
  deck: SlideItem[]
  selectedSlideId: string
  setSelectedSlideId: (id: string) => void
  setDeck: (deck: SlideItem[]) => void
  addSlide: (type: SlideItem['type']) => void
  deleteSlide: (id: string) => void
  moveSlide: (index: number, direction: 'up' | 'down') => void
  updateSlideNotes: (notes: string) => void
  updateCustomSlideContent: (field: 'title' | 'content', value: string) => void
  updateSpecificSlideContent: (type: SlideItem['type'], field: 'title' | 'content', value: string) => void

  user: User | null
  isLoggedIn: boolean
  login: (user: User) => void
  logout: () => void
  
  setView: (view: 'dashboard' | 'deck-builder') => void
  setPersona: (persona: Persona) => void
  fetchDashboardData: (persona: Persona) => Promise<void>
}

const getStoredUser = (): User | null => {
  try {
    const val = localStorage.getItem('af_user')
    return val ? JSON.parse(val) : null
  } catch {
    return null
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  selectedPersona: 'young-investor',
  portfolioData: null,
  indices: [],
  holdings: [],
  news: [],
  metrics: null,
  monteCarlo: null,
  macro: null,
  loading: false,
  currentView: 'dashboard',

  // Stress state default
  basePortfolioData: null,
  baseHoldings: [],
  baseMetrics: null,
  baseMonteCarlo: null,
  stressScenario: null,

  // Slide Deck Defaults
  deckBuilderStep: 'start',
  setDeckBuilderStep: (step) => set({ deckBuilderStep: step }),
  selectedTemplate: null,
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  templateMode: 'fixed',
  setTemplateMode: (mode) => set({ templateMode: mode }),
  resetDeckForTemplate: (mode) => {
    if (mode === 'custom') {
      const id = Math.random().toString(36).substring(2, 11)
      set({
        templateMode: 'custom',
        deck: [{ id, type: 'cover', notes: 'Welcome the client and set the presentation tone.' }],
        selectedSlideId: id,
      })
    } else {
      set({
        templateMode: 'fixed',
        deck: [
          { id: '1', type: 'cover', notes: 'Welcome the client and set the presentation tone.' },
          { id: '2', type: 'metrics', notes: 'Highlight key performance stats and Sharpe ratios.' },
          { id: '3', type: 'holdings', notes: 'Review specific holdings and active market value.' },
          { id: '4', type: 'risk', notes: 'Explain how target asset weights align to risk profile.' },
          { id: '5', type: 'timeline', notes: 'Show compounding portfolio growth.' },
          { id: '6', type: 'montecarlo', notes: 'Provide probability distribution of retirement goal.' },
          { id: '7', type: 'insights', notes: 'Review AI-generated suggestions.' }
        ],
        selectedSlideId: '1',
      })
    }
  },

  deck: [
    { id: '1', type: 'cover', notes: 'Welcome the client and set the presentation tone.' },
    { id: '2', type: 'metrics', notes: 'Highlight key performance stats and Sharpe ratios.' },
    { id: '3', type: 'holdings', notes: 'Review specific holdings and active market value.' },
    { id: '4', type: 'risk', notes: 'Explain how target asset weights align to risk profile.' },
    { id: '5', type: 'timeline', notes: 'Show compounding portfolio growth.' },
    { id: '6', type: 'montecarlo', notes: 'Provide probability distribution of retirement goal.' },
    { id: '7', type: 'insights', notes: 'Review AI-generated suggestions.' }
  ],
  selectedSlideId: '1',

  setSelectedSlideId: (id) => set({ selectedSlideId: id }),
  setDeck: (deck) => set({ deck }),

  addSlide: (type) => {
    const id = Math.random().toString(36).substring(2, 11)
    const newSlide: SlideItem = {
      id,
      type,
      title: type === 'custom' ? 'Custom Market Outlook' : '',
      content: type === 'custom' ? '• Inflation is cooling down, signaling potential Fed cuts\n• Rebalancing bonds slightly higher to capture yield curves\n• Standard equity allocations remain bullish' : '',
      notes: '',
    }
    set(state => ({ deck: [...state.deck, newSlide], selectedSlideId: id }))
  },

  deleteSlide: (id) => {
    set(state => {
      if (state.deck.length <= 1) return {}
      const idx = state.deck.findIndex((s) => s.id === id)
      const newDeck = state.deck.filter((s) => s.id !== id)
      let nextSelected = state.selectedSlideId
      if (state.selectedSlideId === id) {
        const nextSelectIdx = idx === 0 ? 0 : idx - 1
        nextSelected = newDeck[nextSelectIdx].id
      }
      return { deck: newDeck, selectedSlideId: nextSelected }
    })
  },

  moveSlide: (index, direction) => {
    set(state => {
      if (direction === 'up' && index === 0) return {}
      if (direction === 'down' && index === state.deck.length - 1) return {}

      const newDeck = [...state.deck]
      const targetIdx = direction === 'up' ? index - 1 : index + 1
      const temp = newDeck[index]
      newDeck[index] = newDeck[targetIdx]
      newDeck[targetIdx] = temp

      return { deck: newDeck }
    })
  },

  updateSlideNotes: (notes) => {
    set(state => ({
      deck: state.deck.map((s) => (s.id === state.selectedSlideId ? { ...s, notes } : s))
    }))
  },

  updateCustomSlideContent: (field, value) => {
    set(state => ({
      deck: state.deck.map((s) =>
        s.id === state.selectedSlideId
          ? { ...s, [field === 'title' ? 'title' : 'content']: value }
          : s
      )
    }))
  },

  updateSpecificSlideContent: (type, field, value) => {
    set(state => ({
      deck: state.deck.map((s) =>
        s.type === type
          ? { ...s, [field === 'title' ? 'title' : 'content']: value }
          : s
      )
    }))
  },

  setStressScenario: (scenario) => {
    const { basePortfolioData, baseHoldings, baseMetrics, baseMonteCarlo } = get()
    if (!basePortfolioData) return

    if (!scenario) {
      // Restore default base values
      set({
        stressScenario: null,
        portfolioData: basePortfolioData,
        holdings: baseHoldings,
        metrics: baseMetrics,
        monteCarlo: baseMonteCarlo,
      })
      return
    }

    let stressedPortfolio = { ...basePortfolioData }
    let stressedHoldings = baseHoldings.map(h => ({ ...h }))
    let stressedMetrics = { ...baseMetrics } as MetricsData
    let stressedMC = { ...baseMonteCarlo } as MonteCarloData

    if (scenario === 'tech-selloff') {
      stressedHoldings = baseHoldings.map(h => {
        let price = h.price
        let change = h.change
        if (['NVDA', 'META', 'TSLA', 'AMZN', 'COIN'].includes(h.symbol)) {
          price = h.price * 0.62
          change = -12.45
        } else {
          price = h.price * 1.025
          change = 0.85
        }
        const value = price * h.shares
        const cost = h.avgCost * h.shares
        const pnlPct = ((value - cost) / cost) * 100
        return { ...h, price: +price.toFixed(2), value: +value.toFixed(2), pnlPct: +pnlPct.toFixed(2), change: +change.toFixed(2) }
      })

      const totalVal = stressedHoldings.reduce((sum, h) => sum + h.value, 0)
      stressedPortfolio.current = Math.round(totalVal)
      stressedPortfolio.insight = `CRITICAL ALERT: Tech sector corrections of 38% simulated. Portfolio valuations adjusted. Max Drawdown expanded by 12% to ${Math.abs(baseMetrics!.maxDrawdown - 12).toFixed(1)}%. Volatility surged to ${+(baseMetrics!.volatility * 1.35).toFixed(1)}%. We recommend taking profit on tech gains and rotating into defensive yield-paying equities.`

      stressedMetrics = {
        sharpe: +(baseMetrics!.sharpe * 0.65).toFixed(2),
        alpha: +(baseMetrics!.alpha - 8.2).toFixed(2),
        beta: +(baseMetrics!.beta * 1.15).toFixed(2),
        volatility: +(baseMetrics!.volatility * 1.35).toFixed(1),
        maxDrawdown: +(baseMetrics!.maxDrawdown - 12.0).toFixed(1),
        ytdReturn: +(baseMetrics!.ytdReturn - 15.2).toFixed(1)
      }

      stressedMC = {
        ...baseMonteCarlo!,
        probability: Math.max(15, baseMonteCarlo!.probability - 25),
        chartData: baseMonteCarlo!.chartData.map(d => ({
          ...d,
          best: Math.round(d.best * 0.88),
          optimistic: Math.round(d.optimistic * 0.84),
          median: Math.round(d.median * 0.78),
          conservative: Math.round(d.conservative * 0.72),
          pessimistic: Math.round(d.pessimistic * 0.68)
        }))
      }
    } else if (scenario === 'market-crash') {
      stressedHoldings = baseHoldings.map(h => {
        let price = h.price
        let change = h.change
        if (['NVDA', 'META', 'TSLA', 'AMZN', 'COIN', 'VTI', 'SCHD', 'AAPL'].includes(h.symbol)) {
          price = h.price * 0.65
          change = -23.40
        } else {
          price = h.price * 0.86
          change = -6.15
        }
        const value = price * h.shares
        const cost = h.avgCost * h.shares
        const pnlPct = ((value - cost) / cost) * 100
        return { ...h, price: +price.toFixed(2), value: +value.toFixed(2), pnlPct: +pnlPct.toFixed(2), change: +change.toFixed(2) }
      })

      const totalVal = stressedHoldings.reduce((sum, h) => sum + h.value, 0)
      stressedPortfolio.current = Math.round(totalVal)
      stressedPortfolio.insight = `SYSTEM RISK WARNING: Simulated 2008 systemic crisis loaded. Global asset liquidations active. Equities dropped 35% on average. Sharpe ratio fell to ${+(baseMetrics!.sharpe * 0.25).toFixed(2)}. Volatility spikes to ${+(baseMetrics!.volatility * 1.85).toFixed(1)}%. Tactical bond shields protect the downside.`

      stressedMetrics = {
        sharpe: +(baseMetrics!.sharpe * 0.25).toFixed(2),
        alpha: +(baseMetrics!.alpha - 15.8).toFixed(2),
        beta: +(baseMetrics!.beta * 1.38).toFixed(2),
        volatility: +(baseMetrics!.volatility * 1.85).toFixed(1),
        maxDrawdown: +(baseMetrics!.maxDrawdown * 2.3).toFixed(1),
        ytdReturn: +(baseMetrics!.ytdReturn - 26.5).toFixed(1)
      }

      stressedMC = {
        ...baseMonteCarlo!,
        probability: 22,
        chartData: baseMonteCarlo!.chartData.map(d => ({
          ...d,
          best: Math.round(d.best * 0.72),
          optimistic: Math.round(d.optimistic * 0.68),
          median: Math.round(d.median * 0.58),
          conservative: Math.round(d.conservative * 0.48),
          pessimistic: Math.round(d.pessimistic * 0.42)
        }))
      }
    } else if (scenario === 'ai-boom') {
      stressedHoldings = baseHoldings.map(h => {
        let price = h.price
        let change = h.change
        if (['NVDA', 'META', 'TSLA', 'AMZN', 'AAPL'].includes(h.symbol)) {
          price = h.price * 1.42
          change = 18.25
        } else {
          price = h.price * 1.05
          change = 2.10
        }
        const value = price * h.shares
        const cost = h.avgCost * h.shares
        const pnlPct = ((value - cost) / cost) * 100
        return { ...h, price: +price.toFixed(2), value: +value.toFixed(2), pnlPct: +pnlPct.toFixed(2), change: +change.toFixed(2) }
      })

      const totalVal = stressedHoldings.reduce((sum, h) => sum + h.value, 0)
      stressedPortfolio.current = Math.round(totalVal)
      stressedPortfolio.insight = `AI SUPER-CYCLE SURGE: Generative AI productivity boom active. Strategic tech overweights surging. Alpha benchmark outperformance increased by 9.4%. Monte Carlo goal probability reaches ${Math.min(99, baseMonteCarlo!.probability + 12)}%. Expansion rates remain positive.`

      stressedMetrics = {
        sharpe: +(baseMetrics!.sharpe * 1.42).toFixed(2),
        alpha: +(baseMetrics!.alpha + 9.4).toFixed(2),
        beta: +(baseMetrics!.beta * 0.94).toFixed(2),
        volatility: +(baseMetrics!.volatility * 0.88).toFixed(1),
        maxDrawdown: +(baseMetrics!.maxDrawdown * 0.68).toFixed(1),
        ytdReturn: +(baseMetrics!.ytdReturn + 21.4).toFixed(1)
      }

      stressedMC = {
        ...baseMonteCarlo!,
        probability: Math.min(99, baseMonteCarlo!.probability + 12),
        chartData: baseMonteCarlo!.chartData.map(d => ({
          ...d,
          best: Math.round(d.best * 1.25),
          optimistic: Math.round(d.optimistic * 1.22),
          median: Math.round(d.median * 1.18),
          conservative: Math.round(d.conservative * 1.12),
          pessimistic: Math.round(d.pessimistic * 1.08)
        }))
      }
    } else if (scenario === 'rebalance') {
      stressedHoldings = baseHoldings.map(h => {
        let price = h.price
        let change = h.change
        const value = price * h.shares
        const cost = h.avgCost * h.shares
        const pnlPct = ((value - cost) / cost) * 100
        return { ...h, price: +price.toFixed(2), value: +value.toFixed(2), pnlPct: +pnlPct.toFixed(2), change: +change.toFixed(2) }
      })

      stressedPortfolio.insight = `PORTFOLIO RISK OPTIMIZED: Strategic rebalancing executed. Reallocated 5% high-beta tech into intermediate fixed-income bonds. Volatility drops to ${+(baseMetrics!.volatility * 0.84).toFixed(1)}% and Sharpe Ratio optimized by 14% to ${+(baseMetrics!.sharpe * 1.14).toFixed(2)}.`

      stressedMetrics = {
        sharpe: +(baseMetrics!.sharpe * 1.14).toFixed(2),
        alpha: +(baseMetrics!.alpha + 0.4).toFixed(2),
        beta: +(baseMetrics!.beta * 0.84).toFixed(2),
        volatility: +(baseMetrics!.volatility * 0.84).toFixed(1),
        maxDrawdown: +(baseMetrics!.maxDrawdown * 0.78).toFixed(1),
        ytdReturn: +(baseMetrics!.ytdReturn + 0.8).toFixed(1)
      }

      stressedMC = {
        ...baseMonteCarlo!,
        probability: Math.min(99, baseMonteCarlo!.probability + 8),
        chartData: baseMonteCarlo!.chartData.map(d => ({
          ...d,
          median: Math.round(d.median * 1.04),
          conservative: Math.round(d.conservative * 1.08),
        }))
      }
    }

    set({
      stressScenario: scenario,
      portfolioData: stressedPortfolio,
      holdings: stressedHoldings,
      metrics: stressedMetrics,
      monteCarlo: stressedMC,
    })
  },
  
  user: getStoredUser(),
  isLoggedIn: !!getStoredUser(),
  
  login: (user) => {
    localStorage.setItem('af_user', JSON.stringify(user))
    set({ user, isLoggedIn: true })
  },
  
  logout: () => {
    localStorage.removeItem('af_user')
    set({ user: null, isLoggedIn: false })
  },

  setView: (view) => set({ currentView: view }),

  setPersona: (persona) => {
    set({ selectedPersona: persona })
    get().fetchDashboardData(persona)
  },

  fetchDashboardData: async (persona) => {
    set({ loading: true })
    try {
      const [
        portfolioRes,
        indicesRes,
        holdingsRes,
        newsRes,
        metricsRes,
        monteCarloRes,
        macroRes
      ] = await Promise.all([
        fetch(`/api/portfolio/${persona}`).then(r => r.json()),
        fetch('/api/market/indices').then(r => r.json()),
        fetch(`/api/portfolio/holdings/${persona}`).then(r => r.json()),
        fetch('/api/market/news').then(r => r.json()),
        fetch(`/api/portfolio/metrics/${persona}`).then(r => r.json()),
        fetch(`/api/simulation/montecarlo?persona=${persona}`).then(r => r.json()),
        fetch('/api/market/macro').then(r => r.json()).catch(() => ({ gdp: 2.89, inflation: 4.12, unemployment: 3.64, fedRate: 5.33 }))
      ])

      set({
        portfolioData: portfolioRes,
        basePortfolioData: portfolioRes,
        indices: indicesRes,
        holdings: holdingsRes,
        baseHoldings: holdingsRes,
        news: newsRes,
        metrics: metricsRes,
        baseMetrics: metricsRes,
        monteCarlo: monteCarloRes,
        baseMonteCarlo: monteCarloRes,
        macro: macroRes,
        loading: false,
        stressScenario: null // reset stress when fetching new persona data
      })
    } catch (err) {
      console.error('Failed to fetch dashboard data', err)
      set({ loading: false })
    }
  }
}))
