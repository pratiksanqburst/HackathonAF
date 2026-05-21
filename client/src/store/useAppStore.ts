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
        indices: indicesRes,
        holdings: holdingsRes,
        news: newsRes,
        metrics: metricsRes,
        monteCarlo: monteCarloRes,
        macro: macroRes,
        loading: false
      })
    } catch (err) {
      console.error('Failed to fetch dashboard data', err)
      set({ loading: false })
    }
  }
}))
