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

export interface PortfolioHolding {
  symbol: string
  name: string
  shares: number
  avgCost: number
  value: number
  allocation: number
  pnlPct: number
  assetClass: string
}

export interface Client {
  id: string
  name: string
  email: string
  contact: string
  address: string
  company: string
  age: number
  persona: Persona
  current: number
  goal: number
  sharpe: number
  volatility: number
  logo: string | null
  portfolioHoldings: PortfolioHolding[] | null
  isImported?: boolean
  createdAt?: string
}

export type AppPage = 'home' | 'clients' | 'deck-builder' | 'analytics' | 'templates' | 'activity'

export interface RecentDeck {
  id: string
  name: string
  client: string
  type: string
  status: 'Completed' | 'In Review' | 'Draft'
  modified: string
}

export interface UpcomingReview {
  id: string
  initials: string
  name: string
  type: string
  date: string
  time: string
  color: string
}

export interface ActivityLog {
  id: string
  type: string
  title: string
  description: string
  user: string
  timestamp: string
  metadata?: any
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
  currentView: 'dashboard' | 'deck-builder'   // legacy — keep for backward compat
  currentPage: AppPage
  setCurrentPage: (page: AppPage) => void
  recentDecks: RecentDeck[]
  upcomingReviews: UpcomingReview[]
  
  // Base states for stress recovery
  basePortfolioData: PortfolioData | null
  baseHoldings: HoldingData[]
  baseMetrics: MetricsData | null
  baseMonteCarlo: MonteCarloData | null
  stressScenario: 'tech-selloff' | 'market-crash' | 'ai-boom' | 'rebalance' | null
  setStressScenario: (scenario: 'tech-selloff' | 'market-crash' | 'ai-boom' | 'rebalance' | null) => void

  // Deck Builder Wizard states
  deckBuilderStep: 'start' | 'creation-mode' | 'template-selection' | 'template-config' | 'client-selection' | 'generating' | 'workspace'
  setDeckBuilderStep: (step: 'start' | 'creation-mode' | 'template-selection' | 'template-config' | 'client-selection' | 'generating' | 'workspace') => void
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
  
  setView: (view: 'dashboard' | 'deck-builder') => void  // legacy compat
  setPersona: (persona: Persona) => void
  fetchDashboardData: (persona: Persona) => Promise<void>

  // Client Management
  clients: Client[]
  selectedClient: Client | null
  clientsLoading: boolean
  clientsError: string | null
  setClients: (clients: Client[]) => void
  selectClient: (client: Client | null) => void
  importClientsFromCSV: (csvText: string) => void
  fetchClients: () => Promise<void>
  addClient: (data: Partial<Client>) => Promise<Client>
  updateClient: (id: string, data: Partial<Client>) => Promise<Client>
  deleteClient: (id: string) => Promise<void>
  uploadClientLogo: (id: string, file: File) => Promise<string>
  uploadClientPortfolio: (id: string, file: File) => Promise<PortfolioHolding[]>

  // Activity Logging
  activities: ActivityLog[]
  activitiesLoading: boolean
  activitiesError: string | null
  fetchActivities: () => Promise<void>
  logActivity: (type: string, title: string, description: string, metadata?: any) => Promise<void>
}

const getStoredUser = (): User | null => {
  try {
    const val = localStorage.getItem('af_user')
    return val ? JSON.parse(val) : null
  } catch {
    return null
  }
}

const getInitialPage = (): AppPage => {
  if (typeof window === 'undefined') return 'home'
  const hash = window.location.hash || '#home'
  const pagePart = hash.split('?')[0].replace('#', '')
  const validPages: AppPage[] = ['home', 'clients', 'deck-builder', 'analytics', 'templates', 'activity']
  return validPages.includes(pagePart as AppPage) ? (pagePart as AppPage) : 'home'
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
  currentPage: getInitialPage(),
  setCurrentPage: (page) => {
    // Sync with hash
    if (page === 'clients') {
      const selected = get().selectedClient
      if (selected) {
        window.location.hash = `clients?id=${selected.id}`
      } else {
        window.location.hash = 'clients'
      }
    } else {
      window.location.hash = page
    }
    set({ currentPage: page })
  },
  recentDecks: [
    { id: 'rd-1', name: 'Q1 2026 Portfolio Review', client: 'Margaret Chen', type: 'Quarterly Review', status: 'Completed', modified: '2h ago' },
    { id: 'rd-2', name: 'Risk Assessment — Meridian Growth', client: 'Robert Harrington', type: 'Risk Assessment', status: 'In Review', modified: 'Yesterday' },
    { id: 'rd-3', name: 'Retirement Planning Strategy', client: 'Patricia Sullivan', type: 'Retirement', status: 'Draft', modified: '3 days ago' },
    { id: 'rd-4', name: 'Investment Recommendations 2026', client: 'James Okonkwo', type: 'Investment', status: 'Completed', modified: '1 week ago' },
    { id: 'rd-5', name: 'Portfolio Performance — Q1', client: 'Sarah Kowalski', type: 'Performance', status: 'Completed', modified: '2 weeks ago' }
  ],
  upcomingReviews: [
    { id: 'ur-1', initials: 'MC', name: 'Margaret Chen', type: 'Quarterly Strategy', date: 'Jun 12', time: '10:00 AM', color: '#2563EB' },
    { id: 'ur-2', initials: 'RH', name: 'Robert Harrington', type: 'Portfolio Review', date: 'Jun 14', time: '2:30 PM', color: '#2563EB' },
    { id: 'ur-3', initials: 'PS', name: 'Patricia Sullivan', type: 'Onboarding Meeting', date: 'Jun 17', time: '11:00 AM', color: '#2563EB' },
    { id: 'ur-4', initials: 'JO', name: 'James Okonkwo', type: 'Annual Review', date: 'Jun 19', time: '3:00 PM', color: '#2563EB' }
  ],

  // Client Management Defaults
  clients: [],
  clientsLoading: false,
  clientsError: null,
  selectedClient: null,
  setClients: (clients) => set({ clients }),
  selectClient: (client) => {
    set({ selectedClient: client })
    if (client) {
      get().setPersona(client.persona)
      if (get().currentPage === 'clients') {
        window.location.hash = `clients?id=${client.id}`
      }
    } else {
      if (get().currentPage === 'clients' && window.location.hash.includes('?id=')) {
        window.location.hash = 'clients'
      }
    }
  },

  fetchClients: async () => {
    set({ clientsLoading: true, clientsError: null })
    try {
      const res = await fetch('/api/clients')
      if (!res.ok) throw new Error('Failed to fetch clients')
      const data = await res.json()
      set({ clients: data, clientsLoading: false })
    } catch (err: any) {
      set({ clientsLoading: false, clientsError: err.message })
    }
  },

  // Activity Logging Defaults
  activities: [],
  activitiesLoading: false,
  activitiesError: null,
  fetchActivities: async () => {
    set({ activitiesLoading: true, activitiesError: null })
    try {
      const res = await fetch('/api/activity')
      if (!res.ok) throw new Error('Failed to fetch activity logs')
      const data = await res.json()
      set({ activities: data, activitiesLoading: false })
    } catch (err: any) {
      set({ activitiesLoading: false, activitiesError: err.message })
    }
  },
  logActivity: async (type, title, description, metadata = {}) => {
    try {
      const res = await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, description, metadata }),
      })
      if (!res.ok) throw new Error('Failed to log activity')
      const newAct = await res.json()
      set(state => ({ activities: [newAct, ...state.activities] }))
    } catch (err: any) {
      console.error('Failed to log activity:', err.message)
    }
  },

  addClient: async (data) => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to create client')
    }
    const newClient = await res.json()
    set(state => ({ clients: [...state.clients, newClient] }))
    return newClient
  },

  updateClient: async (id, data) => {
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update client')
    }
    const updated = await res.json()
    set(state => ({ clients: state.clients.map(c => c.id === id ? updated : c) }))
    return updated
  },

  deleteClient: async (id) => {
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to delete client')
    }
    set(state => ({ clients: state.clients.filter(c => c.id !== id) }))
  },

  uploadClientLogo: async (id, file) => {
    const form = new FormData()
    form.append('logo', file)
    const res = await fetch(`/api/clients/${id}/logo`, { method: 'POST', body: form })
    if (!res.ok) throw new Error('Logo upload failed')
    const { logoUrl, client: updated } = await res.json()
    set(state => ({ clients: state.clients.map(c => c.id === id ? updated : c) }))
    return logoUrl
  },

  uploadClientPortfolio: async (id, file) => {
    const form = new FormData()
    form.append('portfolio', file)
    const res = await fetch(`/api/clients/${id}/portfolio`, { method: 'POST', body: form })
    if (!res.ok) throw new Error('Portfolio upload failed')
    const { holdings, client: updated } = await res.json()
    set(state => ({ clients: state.clients.map(c => c.id === id ? updated : c) }))
    return holdings
  },

  importClientsFromCSV: (csvText) => {
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length <= 1) return
    
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
    const nameIdx = headers.indexOf('name')
    const ageIdx = headers.indexOf('age')
    const personaIdx = headers.indexOf('persona')
    const currentIdx = headers.findIndex(h => h.includes('current') || h.includes('portfolio') || h.includes('assets'))
    const goalIdx = headers.indexOf('goal')
    const sharpeIdx = headers.indexOf('sharpe')
    const volatilityIdx = headers.indexOf('volatility')
    
    const parsedClients: Client[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim())
      if (parts.length < 3) continue
      
      const name = nameIdx !== -1 ? parts[nameIdx] : `Client #${i}`
      const age = ageIdx !== -1 ? parseInt(parts[ageIdx], 10) || 40 : 40
      
      let rawPersona = personaIdx !== -1 ? parts[personaIdx].toLowerCase() : 'family-planner'
      let persona: Persona = 'family-planner'
      if (rawPersona.includes('young') || rawPersona.includes('growth') || rawPersona.includes('aggressive') || rawPersona.includes('early')) {
        persona = 'young-investor'
      } else if (rawPersona.includes('retire') || rawPersona.includes('conservative') || rawPersona.includes('late')) {
        persona = 'retirement-client'
      }
      
      const currentVal = currentIdx !== -1 ? parseFloat(parts[currentIdx].replace(/[^0-9.]/g, '')) || 250000 : 250000
      const goalVal = goalIdx !== -1 ? parseFloat(parts[goalIdx].replace(/[^0-9.]/g, '')) || 500000 : 500000
      const sharpeVal = sharpeIdx !== -1 ? parseFloat(parts[sharpeIdx]) || 1.4 : 1.4
      const volatilityVal = volatilityIdx !== -1 ? parseFloat(parts[volatilityIdx]) || 12.0 : 12.0
      
      parsedClients.push({
        id: `imported-${Date.now()}-${i}`,
        name,
        email: '',
        contact: '',
        address: '',
        company: '',
        age,
        persona,
        current: currentVal,
        goal: goalVal,
        sharpe: sharpeVal,
        volatility: volatilityVal,
        logo: null,
        portfolioHoldings: null,
        isImported: true
      })
    }
    
    if (parsedClients.length > 0) {
      set(state => ({
        clients: [...state.clients, ...parsedClients]
      }))
    }
  },

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
    const client = get().selectedClient
    const mcQuery = client
      ? `&current=${client.current}&goal=${client.goal}&volatility=${client.volatility}&ytdReturn=${client.persona === 'young-investor' ? 31.7 : client.persona === 'family-planner' ? 14.3 : 6.2}`
      : ''
    try {
      let [
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
        fetch(`/api/simulation/montecarlo?persona=${persona}${mcQuery}`).then(r => r.json()),
        fetch('/api/market/macro').then(r => r.json()).catch(() => ({ gdp: 2.89, inflation: 4.12, unemployment: 3.64, fedRate: 5.33 }))
      ])

      if (client && client.persona === persona) {
        portfolioRes.current = client.current
        portfolioRes.goal = client.goal
        metricsRes.volatility = client.volatility
        metricsRes.sharpe = client.sharpe
        portfolioRes.insight = `Alexander Forbes Engage client profile loaded: ${client.name}. Current Assets: $${client.current.toLocaleString()}, Target Goal: $${client.goal.toLocaleString()} (${client.persona === 'retirement-client' ? 'Retirement Solutions' : client.persona === 'family-planner' ? 'Education/Family Goal' : 'Compounding Accumulation'}).`
        
        if (client.portfolioHoldings && client.portfolioHoldings.length > 0) {
          holdingsRes = client.portfolioHoldings.map((h: any) => ({
            symbol: h.symbol,
            name: h.name,
            shares: h.shares,
            avgCost: h.avgCost,
            price: h.price || h.avgCost * (1 + (h.pnlPct || 0) / 100),
            value: h.value || (h.shares * (h.price || h.avgCost * (1 + (h.pnlPct || 0) / 100))),
            pnlPct: h.pnlPct || 0,
            change: h.change || 0
          }))
        }
      }

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
        stressScenario: null
      })
    } catch (err) {
      console.error('Failed to fetch dashboard data', err)
      set({ loading: false })
    }
  }
}))
