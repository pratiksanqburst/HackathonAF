require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// ─── QBurst LLM Gateway Setup (OpenAI-compatible) ────────────────────────────
const GATEWAY_URL  = process.env.QBURST_GATEWAY_URL || 'https://llmgateway.qburst.build/v1'
const GATEWAY_KEY  = process.env.QBURST_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

const gatewayEnabled = GATEWAY_KEY && GATEWAY_KEY.length > 10

if (gatewayEnabled) {
  console.log(`✅ QBurst LLM Gateway enabled — model: ${GEMINI_MODEL}`)
} else {
  console.log('⚠️  QBURST_API_KEY not set — copilot running in mock mode.')
}

const SYSTEM_PROMPT = `You are an elite AI financial advisor copilot for "AF Engage" by Alexander Forbes. Recommend solutions from three pillars: Retirement Solutions (RA, Living Annuity, Guaranteed Annuity), Investment Management (Unit Trust - Equity/Debt/Hybrid), Insurance & Risk (Life Insurance, Disability Insurance, Income Protection). Match recommendations to client life stage: Early Career (RA + Unit Trust Equity + Income Protection), Mid Career (Unit Trust Hybrid + Life/Disability Insurance), Pre-Retirement (capital consolidation), Retirement (Living Annuity + Guaranteed Annuity). Be premium, professional, and concise — max 4 sentences or 3 bullet points. No markdown headers or bold.`

async function askGemini(prompt, options = {}) {
  if (!gatewayEnabled) return null
  try {
    const selectedModel = options.model === 'pro' ? 'gemini-2.0-pro' : (options.model === 'flash' ? 'gemini-2.0-flash' : GEMINI_MODEL)
    const activeSystemPrompt = options.systemPrompt || SYSTEM_PROMPT
    const activeTemperature = typeof options.temperature === 'number' ? options.temperature : 0.7

    const response = await fetch(`${GATEWAY_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_KEY}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        temperature: activeTemperature,
        max_tokens: 512,
        messages: [
          { role: 'system', content: activeSystemPrompt },
          { role: 'user',   content: prompt },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error(`Gateway error ${response.status}:`, errText)
      return null
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content?.trim() ?? null
  } catch (err) {
    console.error('QBurst Gateway request failed:', err.message)
    return null
  }
}


// ─── Lazy-load yahoo-finance2 ────────────────────────────────────────────────
let yf = null
async function getYF() {
  if (!yf) yf = (await import('yahoo-finance2')).default
  return yf
}

// ─── Fallback data ────────────────────────────────────────────────────────────
const FALLBACK_INDICES = [
  { symbol: '^GSPC',  name: 'S&P 500',    price: 5308.13, change: 0.48,  color: '#38bdf8' },
  { symbol: '^IXIC',  name: 'NASDAQ',     price: 16742.39, change: 0.61, color: '#a78bfa' },
  { symbol: '^DJI',   name: 'Dow Jones',  price: 38868.04, change: 0.20, color: '#34d399' },
  { symbol: 'BTC-USD',name: 'Bitcoin',    price: 67412.50, change: 1.84, color: '#fbbf24' },
]

const FALLBACK_NEWS = [
  { title: 'Fed Signals Rate Cut Possible in Q3 as Inflation Cools', source: 'Reuters', time: '2h ago', url: 'https://www.reuters.com/markets/', category: 'Macro' },
  { title: 'NVIDIA Surges 6% After Record AI Chip Demand Forecast', source: 'Bloomberg', time: '3h ago', url: 'https://www.bloomberg.com/technology', category: 'Tech' },
  { title: 'S&P 500 Hits New All-Time High on Strong Jobs Report', source: 'CNBC', time: '4h ago', url: 'https://www.cnbc.com/finance/', category: 'Markets' },
  { title: 'Bitcoin Breaks $67K as ETF Inflows Hit Monthly Record', source: 'CoinDesk', time: '5h ago', url: 'https://www.coindesk.com/markets/', category: 'Crypto' },
  { title: 'Apple Launches AI-Powered Features Across All Devices', source: 'WSJ', time: '6h ago', url: 'https://www.wsj.com/tech', category: 'Tech' },
  { title: 'Emerging Markets Outperform as Dollar Weakens', source: 'FT', time: '8h ago', url: 'https://www.ft.com/global-economy', category: 'Global' },
]

const FALLBACK_SECTORS = [
  { name: 'Technology',    change: +2.41, color: '#38bdf8' },
  { name: 'Healthcare',    change: +0.87, color: '#34d399' },
  { name: 'Financials',    change: +1.12, color: '#a78bfa' },
  { name: 'Energy',        change: -0.54, color: '#fbbf24' },
  { name: 'Consumer Disc', change: +0.63, color: '#f472b6' },
  { name: 'Industrials',   change: +0.29, color: '#60a5fa' },
  { name: 'Real Estate',   change: -0.31, color: '#fb923c' },
  { name: 'Utilities',     change: +0.18, color: '#4ade80' },
]

const PORTFOLIO_HOLDINGS = {
  'young-investor': [
    { symbol: 'NVDA', name: 'NVIDIA Corp',       shares: 25,  avgCost: 420.00 },
    { symbol: 'META', name: 'Meta Platforms',    shares: 18,  avgCost: 355.00 },
    { symbol: 'TSLA', name: 'Tesla Inc',         shares: 30,  avgCost: 215.00 },
    { symbol: 'AMZN', name: 'Amazon.com',        shares: 22,  avgCost: 178.00 },
    { symbol: 'COIN', name: 'Coinbase Global',   shares: 40,  avgCost: 145.00 },
  ],
  'family-planner': [
    { symbol: 'VTI',  name: 'Vanguard Total Mkt ETF', shares: 80,  avgCost: 220.00 },
    { symbol: 'BND',  name: 'Vanguard Bond ETF',      shares: 120, avgCost: 73.00  },
    { symbol: 'SCHD', name: 'Schwab Dividend ETF',    shares: 95,  avgCost: 76.00  },
    { symbol: 'VNQ',  name: 'Vanguard Real Estate',   shares: 50,  avgCost: 88.00  },
    { symbol: 'AAPL', name: 'Apple Inc',              shares: 35,  avgCost: 165.00 },
  ],
  'retirement-client': [
    { symbol: 'JNJ',  name: 'Johnson & Johnson', shares: 60,  avgCost: 150.00 },
    { symbol: 'PG',   name: 'Procter & Gamble',  shares: 55,  avgCost: 142.00 },
    { symbol: 'KO',   name: 'Coca-Cola Co',      shares: 100, avgCost: 58.00  },
    { symbol: 'TLT',  name: 'iShares 20Y Bond',  shares: 80,  avgCost: 92.00  },
    { symbol: 'SCHD', name: 'Schwab Dividend ETF',shares: 150, avgCost: 74.00  },
  ],
}

const PORTFOLIO_METRICS = {
  'young-investor':    { sharpe: 1.84, alpha: 8.42, beta: 1.62, volatility: 22.4, maxDrawdown: -18.3, ytdReturn: 31.7 },
  'family-planner':    { sharpe: 1.42, alpha: 3.21, beta: 0.88, volatility: 11.2, maxDrawdown: -8.4,  ytdReturn: 14.3 },
  'retirement-client': { sharpe: 1.08, alpha: 1.74, beta: 0.54, volatility: 6.8,  maxDrawdown: -4.9,  ytdReturn: 6.2  },
}

const PORTFOLIO_GOALS = {
  'young-investor':    { current: 195000,  goal: 500000  },
  'family-planner':    { current: 285000,  goal: 600000  },
  'retirement-client': { current: 1140000, goal: 1500000 },
}

// ─── Monte Carlo simulation ───────────────────────────────────────────────────
function runMonteCarlo(current, goal, annualReturn, volatility, years, paths = 200) {
  const dt = 1 / 12
  const mu = annualReturn / 100
  const sigma = volatility / 100
  const months = years * 12

  const results = []
  let successCount = 0

  for (let p = 0; p < paths; p++) {
    let value = current
    const path = [value]
    for (let m = 0; m < months; m++) {
      const z = boxMullerRandom()
      value *= Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z)
      if (m % 12 === 11) path.push(Math.round(value))
    }
    if (value >= goal) successCount++
    results.push(path)
  }

  // Pick 5 representative paths: p5, p25, p50, p75, p95
  results.sort((a, b) => a[a.length - 1] - b[b.length - 1])
  const pick = (pct) => results[Math.floor(pct * (results.length - 1))]

  const years_arr = Array.from({ length: years + 1 }, (_, i) => String(new Date().getFullYear() + i))
  const paths5 = ['pessimistic', 'conservative', 'median', 'optimistic', 'best']
  const selectedPaths = [pick(0.05), pick(0.25), pick(0.50), pick(0.75), pick(0.95)]

  const chartData = years_arr.map((yr, i) => {
    const row = { year: yr }
    selectedPaths.forEach((path, pi) => { row[paths5[pi]] = path[i] ?? path[path.length - 1] })
    return row
  })

  return {
    chartData,
    probability: Math.round((successCount / paths) * 100),
    paths: paths5,
  }
}

let spareRandom = null
function boxMullerRandom() {
  if (spareRandom !== null) { const s = spareRandom; spareRandom = null; return s }
  const u = Math.random(), v = Math.random()
  const mag = Math.sqrt(-2 * Math.log(u))
  spareRandom = mag * Math.cos(2 * Math.PI * v)
  return mag * Math.sin(2 * Math.PI * v)
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

// GET /api/market/indices
app.get('/api/market/indices', async (req, res) => {
  try {
    const yahoo = await getYF()
    const symbols = ['^GSPC', '^IXIC', '^DJI', 'BTC-USD']
    const names   = ['S&P 500', 'NASDAQ', 'Dow Jones', 'Bitcoin']
    const colors  = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24']

    const quotes = await Promise.all(
      symbols.map(s => yahoo.quote(s).catch(() => null))
    )

    const data = quotes.map((q, i) => ({
      symbol: symbols[i],
      name:   names[i],
      color:  colors[i],
      price:  q?.regularMarketPrice   ?? FALLBACK_INDICES[i].price,
      change: q?.regularMarketChangePercent ?? FALLBACK_INDICES[i].change,
    }))

    res.json(data)
  } catch {
    res.json(FALLBACK_INDICES)
  }
})

// GET /api/market/quote/:symbol
app.get('/api/market/quote/:symbol', async (req, res) => {
  try {
    const yahoo = await getYF()
    const q = await yahoo.quote(req.params.symbol)
    res.json({
      symbol: q.symbol,
      price:  q.regularMarketPrice,
      change: q.regularMarketChange,
      changePct: q.regularMarketChangePercent,
      volume: q.regularMarketVolume,
      marketCap: q.marketCap,
    })
  } catch (e) {
    res.status(500).json({ error: 'Quote unavailable', detail: e.message })
  }
})

// GET /api/market/news
app.get('/api/market/news', async (req, res) => {
  try {
    const yahoo = await getYF()
    const result = await yahoo.search('stock market', { newsCount: 6, quotesCount: 0 })
    const news = (result.news || []).slice(0, 6).map((n, i) => ({
      title:    n.title,
      source:   n.publisher,
      time:     timeSince(new Date(n.providerPublishTime * 1000)),
      url:      n.link,
      category: ['Macro', 'Tech', 'Markets', 'Crypto', 'Global', 'Earnings'][i % 6],
    }))
    res.json(news.length ? news : FALLBACK_NEWS)
  } catch {
    res.json(FALLBACK_NEWS)
  }
})

// GET /api/market/sectors
app.get('/api/market/sectors', async (req, res) => {
  try {
    const yahoo = await getYF()
    const etfs = ['XLK','XLV','XLF','XLE','XLY','XLI','XLRE','XLU']
    const names = ['Technology','Healthcare','Financials','Energy','Consumer Disc','Industrials','Real Estate','Utilities']
    const colors = ['#38bdf8','#34d399','#a78bfa','#fbbf24','#f472b6','#60a5fa','#fb923c','#4ade80']
    const quotes = await Promise.all(etfs.map(s => yahoo.quote(s).catch(() => null)))
    const data = quotes.map((q, i) => ({
      name:   names[i],
      change: q?.regularMarketChangePercent ?? FALLBACK_SECTORS[i].change,
      color:  colors[i],
    }))
    res.json(data)
  } catch {
    res.json(FALLBACK_SECTORS)
  }
})

// GET /api/market/macro
app.get('/api/market/macro', async (req, res) => {
  try {
    const urls = {
      gdp: 'http://api.worldbank.org/v2/country/us/indicator/NY.GDP.MKTP.KD.ZG?format=json&date=2023',
      inflation: 'http://api.worldbank.org/v2/country/us/indicator/FP.CPI.TOTL.ZG?format=json&date=2023',
      unemployment: 'http://api.worldbank.org/v2/country/us/indicator/SL.UEM.TOTL.ZS?format=json&date=2023',
    }

    const [gdpRes, infRes, uneRes] = await Promise.all([
      fetch(urls.gdp).then(r => r.json()).catch(() => null),
      fetch(urls.inflation).then(r => r.json()).catch(() => null),
      fetch(urls.unemployment).then(r => r.json()).catch(() => null),
    ])

    const getVal = (resObj) => {
      try {
        return resObj[1][0].value
      } catch {
        return null
      }
    }

    const gdpVal = getVal(gdpRes)
    const infVal = getVal(infRes)
    const uneVal = getVal(uneRes)

    res.json({
      gdp: gdpVal ? +gdpVal.toFixed(2) : 2.89,
      inflation: infVal ? +infVal.toFixed(2) : 4.12,
      unemployment: uneVal ? +uneVal.toFixed(2) : 3.64,
      fedRate: 5.33,
    })
  } catch {
    res.json({
      gdp: 2.89,
      inflation: 4.12,
      unemployment: 3.64,
      fedRate: 5.33,
    })
  }
})

// GET /api/portfolio/holdings/:persona
app.get('/api/portfolio/holdings/:persona', async (req, res) => {
  const holdings = PORTFOLIO_HOLDINGS[req.params.persona] || PORTFOLIO_HOLDINGS['young-investor']
  try {
    const yahoo = await getYF()
    const quotes = await Promise.all(
      holdings.map(h => yahoo.quote(h.symbol).catch(() => null))
    )
    const data = holdings.map((h, i) => {
      const q = quotes[i]
      const price = q?.regularMarketPrice ?? (h.avgCost * (1 + (Math.random() * 0.4 - 0.1)))
      const value = price * h.shares
      const cost  = h.avgCost * h.shares
      const pnl   = ((value - cost) / cost) * 100
      return {
        symbol:  h.symbol,
        name:    h.name,
        shares:  h.shares,
        avgCost: h.avgCost,
        price:   +price.toFixed(2),
        value:   +value.toFixed(2),
        pnlPct:  +pnl.toFixed(2),
        change:  q?.regularMarketChangePercent ?? +(Math.random() * 4 - 1.5).toFixed(2),
      }
    })
    res.json(data)
  } catch {
    const data = holdings.map(h => {
      const price = h.avgCost * (1 + (Math.random() * 0.3))
      const value = price * h.shares
      const cost  = h.avgCost * h.shares
      return {
        symbol: h.symbol, name: h.name, shares: h.shares, avgCost: h.avgCost,
        price: +price.toFixed(2), value: +value.toFixed(2),
        pnlPct: +(((value - cost) / cost) * 100).toFixed(2),
        change: +(Math.random() * 4 - 1.5).toFixed(2),
      }
    })
    res.json(data)
  }
})

// GET /api/portfolio/metrics/:persona
app.get('/api/portfolio/metrics/:persona', (req, res) => {
  const metrics = PORTFOLIO_METRICS[req.params.persona] || PORTFOLIO_METRICS['young-investor']
  res.json(metrics)
})

// GET /api/portfolio/:persona  (existing route — keep working)
app.get('/api/portfolio/:persona', (req, res) => {
  const portfolios = {
    'young-investor': {
      wealthData: [
        { year: '2020', value: 15000 }, { year: '2021', value: 28000 },
        { year: '2022', value: 42000 }, { year: '2023', value: 71000 },
        { year: '2024', value: 118000 }, { year: '2025', value: 195000 },
      ],
      insight: 'Your aggressive growth strategy is paying off. Tech and emerging market allocations have outperformed benchmarks by 12.4% YTD.',
      risk: 'High', goal: 500000, current: 195000,
    },
    'family-planner': {
      wealthData: [
        { year: '2020', value: 120000 }, { year: '2021', value: 155000 },
        { year: '2022', value: 140000 }, { year: '2023', value: 180000 },
        { year: '2024', value: 230000 }, { year: '2025', value: 285000 },
      ],
      insight: 'Balanced allocation is protecting against volatility. College fund is on track for 2031. Consider rebalancing bonds to 35%.',
      risk: 'Medium', goal: 600000, current: 285000,
    },
    'retirement-client': {
      wealthData: [
        { year: '2020', value: 850000 }, { year: '2021', value: 920000 },
        { year: '2022', value: 870000 }, { year: '2023', value: 960000 },
        { year: '2024', value: 1050000 }, { year: '2025', value: 1140000 },
      ],
      insight: 'Conservative portfolio preserving wealth with 6.2% annual return. Dividend yield covers 78% of projected retirement expenses.',
      risk: 'Low', goal: 1500000, current: 1140000,
    },
  }
  res.json(portfolios[req.params.persona] || portfolios['young-investor'])
})

// GET /api/simulation/montecarlo
app.get('/api/simulation/montecarlo', (req, res) => {
  const { persona = 'young-investor', years = 10, current, goal, ytdReturn, volatility } = req.query
  const g = PORTFOLIO_GOALS[persona] || PORTFOLIO_GOALS['young-investor']
  const m = PORTFOLIO_METRICS[persona] || PORTFOLIO_METRICS['young-investor']
  
  const targetCurrent = current ? Number(current) : g.current
  const targetGoal = goal ? Number(goal) : g.goal
  const targetVolatility = volatility ? Number(volatility) : m.volatility
  const targetReturn = ytdReturn ? Number(ytdReturn) : m.ytdReturn
  
  const result = runMonteCarlo(targetCurrent, targetGoal, targetReturn * 0.7, targetVolatility, Number(years))
  res.json({ ...result, current: targetCurrent, goal: targetGoal })
})

// POST /api/copilot/generate-commentary  ─── Real Gemini + mock fallback
app.post('/api/copilot/generate-commentary', async (req, res) => {
  const { slideType, persona, metrics, holdings, clientName, customPrompt, options } = req.body
  const client = clientName || 'Valued Partner'

  // ── Build a rich, data-aware prompt ───────────────────────────────────────
  const metricsCtx = metrics
    ? `Sharpe: ${metrics.sharpe}, Alpha: ${metrics.alpha}%, Beta: ${metrics.beta}, Volatility: ${metrics.volatility}%, Max Drawdown: ${metrics.maxDrawdown}%, YTD Return: ${metrics.ytdReturn}%`
    : 'metrics not available'

  const holdingsCtx = holdings && holdings.length > 0
    ? holdings.slice(0, 5).map(h => `${h.symbol} (${h.shares} shares @ $${h.price})`).join(', ')
    : 'holdings not available'

  const personaCtx = {
    'young-investor': 'a young aggressive growth investor with high risk tolerance, heavy tech allocation',
    'family-planner': 'a family planner with balanced 60/40 portfolio saving for college education goals',
    'retirement-client': 'a retirement-focused client prioritising income, capital preservation, and dividend yield',
  }[persona] || 'a wealth management client'

  const slidePrompts = {
    cover:       `Write a compelling 1-sentence executive summary for a wealth strategy presentation cover slide prepared for ${client}. Ground it in Alexander Forbes' core pillars: Retirement Solutions, Investment Management, and Insurance & Protection. Make it sound premium, professional, and forward-looking.`,
    metrics:     `Analyze these portfolio metrics for ${client} (${personaCtx}): ${metricsCtx}. Write 3 concise bullet points. Focus on how these metrics align with their life stage, and suggest rebalancing into specific Alexander Forbes Unit Trusts (Equity, Debt, or Hybrid) depending on their current returns and risk.`,
    holdings:    `Write 2-3 concise bullet points on the investment thesis behind these key holdings for ${client}: ${holdingsCtx}. Explain why these positions make sense for their profile (${personaCtx}) and how structuring these holdings inside an Alexander Forbes Retirement Annuity (RA) or Living Annuity (LA) would optimize tax efficiency.`,
    risk:        `Write 2-3 bullet points on the risk management strategy for ${client} (${personaCtx}) based on metrics: ${metricsCtx}. Explain how to hedge these risks using Alexander Forbes Insurance & Risk products (such as Income Protection or Disability Insurance) alongside tactical asset allocation.`,
    timeline:    `Write 2-3 bullet points on the wealth growth trajectory and compounding strategy for ${client} (${personaCtx}). Reference their long-term timeline and recommend structured contributions to a Retirement Annuity (RA) that transitions to a Living Annuity (LA) in their later years.`,
    montecarlo:  `Write 2-3 bullet points interpreting Monte Carlo simulation results for ${client} (${personaCtx}). Key metrics: ${metricsCtx}. Explain probability of goal success clearly, and advise if they should increase contributions to their Retirement Annuity (RA) to boost their probability of success.`,
    insights:    `Write 3-4 strategic advisory bullet points for ${client} (${personaCtx}) based on holdings (${holdingsCtx}) and metrics (${metricsCtx}). Focus on actionable next steps across the 3 Alexander Forbes pillars (Retirement Solutions, Investment Management, Insurance & Protection), such as rebalancing to a Unit Trust - Hybrid fund or covering protection gaps.`,
    custom:      customPrompt
      ? `Write 3 concise bullet points for a slide based on this user instruction: "${customPrompt}". Tailor it specifically for ${client} (${personaCtx}) and align it with Alexander Forbes financial solutions. Holdings: ${holdingsCtx}.`
      : `Write 3 bullet points of general market outlook and investment advice for a wealth management presentation for ${client}, focusing on the importance of active management via Alexander Forbes Unit Trust solutions.`,
  }

  const prompt = slidePrompts[slideType] || slidePrompts.custom

  // ── Try Gemini first, fall back to mock ───────────────────────────────────
  const aiDraft = await askGemini(prompt, options)

  if (aiDraft) {
    return res.json({ draft: aiDraft, source: 'gemini' })
  }

  // Mock fallback (Alexander Forbes product aligned)
  const mockDrafts = {
    cover:      `Alexander Forbes - AF Engage Investment Strategy Report prepared for ${client}. Grounded in our Core pillars: Retirement Solutions, Investment Management, and Insurance & Risk.`,
    metrics:    metrics
      ? `The portfolio metrics indicate alignment with targeted returns. Recommend optimizing allocations by adding to our Unit Trust - Equity or Unit Trust - Debt funds depending on current yield targets.`
      : `Portfolio risk-adjusted returns demonstrate sustained outperformance over benchmark models.`,
    holdings:   holdings?.length > 0
      ? `Key positions represent robust defensive components. Aligning these holdings with a Retirement Annuity (RA) structure yields optimal tax efficiency.`
      : `Current holdings show a well-diversified mix optimised for yield and targeted asset allocation.`,
    risk:       `Volatility has been systematically hedged. Consider wrapping with an Insurance & Risk product such as Income Protection or Disability Insurance to guard the active income path.`,
    timeline:   `Compounding projections confirm a steady trajectory towards pre-retirement phases. Wealth transition will leverage a Living Annuity (LA) strategy to sustain drawdowns.`,
    montecarlo: `Monte Carlo outcomes yield high probability of target success. Sustained contributions to the client's Retirement Annuity (RA) remain the recommended pathway.`,
    insights:   `Strategic advice: 1. Optimize tax efficiency via Retirement Annuity (RA) contributions. 2. Address protection gaps with Life Insurance (Death Cover). 3. Allocate to Unit Trust - Hybrid to capture balanced yield.`,
  }
  res.json({ draft: mockDrafts[slideType] || mockDrafts.insights, source: 'mock' })
})

// POST /api/copilot/generate-deck ─── Real Gemini + mock bulk generator
app.post('/api/copilot/generate-deck', async (req, res) => {
  const { deck = [], persona, metrics, holdings, clientName, options } = req.body
  const client = clientName || 'Valued Partner'
  logActivity('deck_generate', 'Investment Slide Deck Generated', `Generated a ${deck.length}-slide wealth strategy presentation theme for ${client}.`, { clientName: client })

  const metricsCtx = metrics
    ? `Sharpe: ${metrics.sharpe}, Alpha: ${metrics.alpha}%, Beta: ${metrics.beta}, Volatility: ${metrics.volatility}%, Max Drawdown: ${metrics.maxDrawdown}%, YTD Return: ${metrics.ytdReturn}%`
    : 'metrics not available'

  const holdingsCtx = holdings && holdings.length > 0
    ? holdings.slice(0, 5).map(h => `${h.symbol} (${h.allocation}%, P&L: ${h.pnlPct}%)`).join(', ')
    : 'holdings not available'

  const personaCtx = {
    'young-investor': 'a young aggressive growth investor with high risk tolerance, heavy tech allocation',
    'family-planner': 'a family planner with balanced 60/40 portfolio saving for college education goals',
    'retirement-client': 'a retirement-focused client prioritising income, capital preservation, and dividend yield',
  }[persona] || 'a wealth management client'

  const slidePrompts = {
    cover:       `Write a compelling 1-sentence executive summary for a wealth strategy presentation cover slide prepared for ${client}. Ground it in Alexander Forbes' core pillars: Retirement Solutions, Investment Management, and Insurance & Protection. Make it sound premium, professional, and forward-looking.`,
    metrics:     `Analyze these portfolio metrics for ${client} (${personaCtx}): ${metricsCtx}. Write 3 concise bullet points. Focus on how these metrics align with their life stage, and suggest rebalancing into specific Alexander Forbes Unit Trusts (Equity, Debt, or Hybrid) depending on their current returns and risk.`,
    holdings:    `Write 2-3 concise bullet points on the investment thesis behind these key holdings for ${client}: ${holdingsCtx}. Explain why these positions make sense for their profile (${personaCtx}) and how structuring these holdings inside an Alexander Forbes Retirement Annuity (RA) or Living Annuity (LA) would optimize tax efficiency.`,
    risk:        `Write 2-3 bullet points on the risk management strategy for ${client} (${personaCtx}) based on metrics: ${metricsCtx}. Explain how to hedge these risks using Alexander Forbes Insurance & Risk products (such as Income Protection or Disability Insurance) alongside tactical asset allocation.`,
    timeline:    `Write 2-3 bullet points on the wealth growth trajectory and compounding strategy for ${client} (${personaCtx}). Reference their long-term timeline and recommend structured contributions to a Retirement Annuity (RA) that transitions to a Living Annuity (LA) in their later years.`,
    montecarlo:  `Write 2-3 bullet points interpreting Monte Carlo simulation results for ${client} (${personaCtx}). Key metrics: ${metricsCtx}. Explain probability of goal success clearly, and advise if they should increase contributions to their Retirement Annuity (RA) to boost their probability of success.`,
    insights:    `Write 3-4 strategic advisory bullet points for ${client} (${personaCtx}) based on holdings (${holdingsCtx}) and metrics (${metricsCtx}). Focus on actionable next steps across the 3 Alexander Forbes pillars (Retirement Solutions, Investment Management, Insurance & Protection), such as rebalancing to a Unit Trust - Hybrid fund or covering protection gaps.`,
    custom:      `Write 3 bullet points of general market outlook and investment advice for a wealth management presentation for ${client}, focusing on the importance of active management via Alexander Forbes Unit Trust solutions.`,
  }

  try {
    const promises = deck.map(async (slide) => {
      const prompt = slidePrompts[slide.type] || slidePrompts.custom
      const aiDraft = await askGemini(prompt, options)
      if (aiDraft) {
        return { id: slide.id, draft: aiDraft }
      }

      // Mock fallback (Alexander Forbes aligned)
      const mockDrafts = {
        cover:      `• Alexander Forbes - AF Engage Investment Strategy Report prepared for ${client}.\n• Grounded in our Core pillars: Retirement Solutions, Investment Management, and Insurance & Risk.`,
        metrics:    metrics
          ? `• Portfolio registered a YTD Return of +${metrics.ytdReturn}%.\n• Recommend optimizing yield by allocating to our Unit Trust - Equity or Unit Trust - Debt funds.\n• Volatility is managed at ${metrics.volatility}% with a Sharpe ratio of ${metrics.sharpe}.`
          : `• Portfolio risk-adjusted returns demonstrate sustained outperformance over benchmark models.`,
        holdings:   holdings?.length > 0
          ? `• Core growth holdings represent stable performance engines.\n• Wrapping active equity within a Retirement Annuity (RA) structure offers maximum tax efficiency.\n• Holdings align with Alexander Forbes' client risk guidelines.`
          : `• Current holdings show a well-diversified mix optimised for yield and targeted asset allocation.`,
        risk:       `• Volatility has been systematically hedged through tactical asset allocation.\n• Suggest wrapping with an Insurance & Risk product such as Income Protection or Disability Insurance to guard client path.\n• Liquid buffers protect principal under correction events.`,
        timeline:   `• Compounding projections confirm a steady trajectory towards pre-retirement phases.\n• Wealth transition will leverage a Living Annuity (LA) strategy to sustain drawdowns.\n• Projections remain aligned with targeted timeline parameters.`,
        montecarlo: `• Monte Carlo simulations indicate a high probability of success for achieving retirement targets.\n• Recommend consistent monthly contributions to the client's Retirement Annuity (RA).\n• Strategy remains robust under standard market stress variations.`,
        insights:   `• Key recommendation: optimize tax efficiency via Retirement Annuity (RA) contributions.\n• Address protection gaps with Life Insurance (Death Cover) and Income Protection.\n• Allocate to Unit Trust - Hybrid to capture balanced yield.`,
        custom:     `• Position portfolio to align with retirement solutions (RA/LA)\n• Allocate assets strategically to Unit Trust - Equity and Unit Trust - Hybrid\n• Review coverage under Alexander Forbes Insurance & Risk Products`,
      }
      return { id: slide.id, draft: mockDrafts[slide.type] || mockDrafts.custom }
    })

    const results = await Promise.all(promises)
    const draftsMap = results.reduce((acc, curr) => {
      acc[curr.id] = curr.draft
      acc[curr.id] = curr.draft
      return acc
    }, {})

    res.json({ drafts: draftsMap })
  } catch (err) {
    console.error('Bulk generation error:', err)
    res.status(500).json({ error: 'Failed to generate slide deck' })
  }
})

// POST /api/copilot/generate-custom-deck ─── custom layout and content generation via Gemini
app.post('/api/copilot/generate-custom-deck', async (req, res) => {
  const {
    title,
    description,
    numSlides = 5,
    presentationType,
    audience,
    tone,
    notes,
    options
  } = req.body

  const client = req.body.clientName || 'Valued Partner'
  logActivity('deck_generate_custom', 'Custom Slide Deck Drafted', `Drafted a custom ${numSlides}-slide ${presentationType} presentation ("${title}") with tone: ${tone}.`)

  const systemPrompt = `You are a professional wealth advisor presentation outline planner.
You will generate a presentation deck structure based on the user's requirements.
The output MUST be a valid JSON array of objects representing slides.
Each slide object MUST have:
- "type": one of "cover", "metrics", "holdings", "risk", "timeline", "montecarlo", "insights", "custom"
- "title": a clear, descriptive title for the slide
- "content": 2 to 4 bullet points separated by newlines, using the '•' character at the start of each bullet point. Ensure the bullets directly address the slide topic and description details.
- "notes": short speaker notes / advisor notes for this slide

Do NOT include any markdown code blocks, backticks, or other text outside the JSON array. Output exactly a JSON array.`

  const userPrompt = `Generate a slide deck of exactly ${numSlides} slides based on this configuration:
  Presentation Title: "${title}"
  Main Topic/Description: "${description}"
  Presentation Type: "${presentationType}"
  Target Audience: "${audience}"
  Tone: "${tone}"
  Additional Notes/Instructions: "${notes || 'None'}"`

  try {
    const aiResponse = await askGemini(userPrompt, {
      ...options,
      systemPrompt: systemPrompt
    })

    let slides = []
    if (aiResponse) {
      try {
        let cleanText = aiResponse.trim()
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.substring(7)
        }
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.substring(3)
        }
        if (cleanText.endsWith('```')) {
          cleanText = cleanText.substring(0, cleanText.length - 3)
        }
        slides = JSON.parse(cleanText.trim())
      } catch (err) {
        console.error('Failed to parse Gemini custom deck JSON, using fallback structure', err)
      }
    }

    if (!slides || slides.length === 0) {
      slides = []
      slides.push({
        id: 'slide_cov_' + Math.random().toString(36).substring(2, 7),
        type: 'cover',
        title: title || 'Strategic Wealth Management',
        content: `• Custom deck generated for target audience: ${audience}.\n• Overview of strategic client reviews and wealth allocation objectives.\n• Aligning goals with tax-efficient growth pillars.`,
        notes: 'Welcome the client and set the presentation tone.'
      })
      for (let i = 1; i < numSlides; i++) {
        const slideTypes = ['metrics', 'holdings', 'risk', 'timeline', 'insights']
        const type = slideTypes[(i - 1) % slideTypes.length]
        slides.push({
          id: `slide_${type}_` + Math.random().toString(36).substring(2, 7),
          type: type,
          title: `Analysis Section ${i}: ${type.toUpperCase()}`,
          content: `• Detailed analysis of ${description}.\n• Strategic alignment in accordance with a ${tone} delivery tone.\n• Focus on asset management rebalancing recommendations.`,
          notes: `Presenter notes for slide ${i + 1}.`
        })
      }
    } else {
      slides = slides.map((s, idx) => ({
        id: s.id || `slide_${s.type || 'custom'}_` + Math.random().toString(36).substring(2, 7) + `_${idx}`,
        type: s.type || 'custom',
        title: s.title || `Slide ${idx + 1}`,
        content: s.content || '• Draft content generated by AI.',
        notes: s.notes || ''
      }))
    }

    res.json({ success: true, deck: slides })
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate custom deck', detail: err.message })
  }
})

// POST /api/copilot/chat  ─── Real conversational Gemini chat
app.post('/api/copilot/chat', async (req, res) => {
  const { message, persona, portfolioValue, metrics, stressScenario, options } = req.body

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'message is required' })
  }

  const personaCtx = {
    'young-investor': 'young aggressive growth investor (high risk, heavy tech allocation, $100K–$500K portfolio)',
    'family-planner': 'family planner (balanced 60/40 portfolio, saving $500K college fund, medium risk)',
    'retirement-client': 'retirement-focused client (income-first, capital preservation, $1M+ portfolio, low risk)',
  }[persona] || 'wealth management client'

  const metricsCtx = metrics
    ? `Current metrics — Sharpe: ${metrics.sharpe}, Alpha: ${metrics.alpha}%, Volatility: ${metrics.volatility}%, YTD: ${metrics.ytdReturn}%`
    : ''

  const stressCtx = stressScenario
    ? `NOTE: A "${stressScenario}" stress scenario is currently active on the dashboard.`
    : ''

  const prompt = `You are advising a ${personaCtx} on the Alexander Forbes "AF Engage" platform. Portfolio value: $${portfolioValue?.toLocaleString() || 'N/A'}. ${metricsCtx}. ${stressCtx}

Advisor question: "${message}"

Respond in 2-4 sentences with specific, data-aware advisory insight. Frame your answer within our three pillars (Retirement Solutions, Investment Management, Insurance & Protection). Recommend specific relevant vehicles (e.g. Unit Trusts, Retirement/Living Annuity, or Income Protection) matching the client's current situation. Be direct and confident. Do not use markdown headers.`

  const aiReply = await askGemini(prompt, options)

  if (aiReply) {
    return res.json({ reply: aiReply, source: 'gemini' })
  }

  // Fallback mock response
  res.json({
    reply: `Based on the current ${persona?.replace('-', ' ')} profile, your portfolio is well-positioned for the stated goals. The key metrics are within acceptable thresholds. For more specific advice, please consult your lead advisor with the latest risk assessment.`,
    source: 'mock'
  })
})

// POST /api/copilot/stress-appraisal
app.post('/api/copilot/stress-appraisal', async (req, res) => {
  const { scenario, persona, holdings, metrics } = req.body

  const holdingsCtx = holdings && holdings.length > 0
    ? holdings.map(h => `${h.symbol}: ${h.shares} shares @ $${h.price} ($${h.value.toLocaleString()} total)`).join(', ')
    : 'N/A'

  const metricsCtx = metrics
    ? `Sharpe: ${metrics.sharpe}, Volatility: ${metrics.volatility}%, Max Drawdown: ${metrics.maxDrawdown}%`
    : 'N/A'

  const prompt = `You are an expert risk officer advising an Alexander Forbes advisor.
Client profile: ${persona}
Active stress scenario: ${scenario}
Current holdings: ${holdingsCtx}
Current metrics: ${metricsCtx}

Analyze the direct impact of this stress scenario on the client's specific assets.
Explain the vulnerabilities clearly.
Propose 1 or 2 concrete, realistic rebalancing actions they should take immediately (e.g. shifting assets into Alexander Forbes Unit Trust - Debt for capital shielding, or reinforcing their plan with Insurance & Protection products like Income Protection to hedge income risks).
Keep the advice highly professional, direct, and under 4 sentences. Do not use markdown headers.`

  const aiReply = await askGemini(prompt)

  if (aiReply) {
    return res.json({ reply: aiReply, source: 'gemini' })
  }

  res.json({
    reply: `Under the simulated ${scenario} scenario, high-beta assets face elevated volatility. We recommend reviewing bond positions to shield capital.`,
    source: 'mock'
  })
})

// POST /api/copilot/goal-advisor
app.post('/api/copilot/goal-advisor', async (req, res) => {
  const { persona, current, goal, years, planA, planB, hasPlanB } = req.body

  let prompt = `You are a strategic wealth planning advisor.
Client persona: ${persona}
Current portfolio value: $${current.toLocaleString()}
Target wealth goal: $${goal.toLocaleString()}
Target timeline: ${years} years

Plan A parameters:
- Projected growth rate: ${planA.growth}% p.a.
- Monthly contribution: $${planA.contribution}
- Reached goal? ${planA.reached ? 'Yes' : 'No'} (${planA.finalValue ? '$' + planA.finalValue.toLocaleString() : 'unknown'} projected value)`

  if (hasPlanB) {
    prompt += `\n\nPlan B parameters:
- Projected growth rate: ${planB.growth}% p.a.
- Monthly contribution: $${planB.contribution}
- Reached goal? ${planB.reached ? 'Yes' : 'No'} (${planB.finalValue ? '$' + planB.finalValue.toLocaleString() : 'unknown'} projected value)`
  }

  prompt += `\n\nProvide a professional appraisal of the feasibility of these parameters for this client.
Are the growth rates realistic for this client's risk profile?
What adjustments in either contributions or timeframe should the advisor recommend? Suggest how leveraging tax-deductible contributions to an Alexander Forbes Retirement Annuity (RA) or selecting high-performing Alexander Forbes Unit Trust - Equity funds can assist in closing any projected wealth gap.
Keep your response to 3-4 sentences maximum. Be precise and professional. Do not use markdown headers.`

  const aiReply = await askGemini(prompt)

  if (aiReply) {
    return res.json({ reply: aiReply, source: 'gemini' })
  }

  res.json({
    reply: `Plan A growth rates are within baseline projections. Increasing monthly contributions will significantly accelerate the path to target goal.`,
    source: 'mock'
  })
})

// POST /api/copilot/news-impact
app.post('/api/copilot/news-impact', async (req, res) => {
  const { headline, source, category, persona, holdings } = req.body

  const holdingsCtx = holdings && holdings.length > 0
    ? holdings.map(h => `${h.symbol} (${h.name})`).join(', ')
    : 'equities'

  const prompt = `You are an institutional financial analyst advising on the Alexander Forbes "AF Engage" platform.
Client profile: ${persona}
Client holdings: ${holdingsCtx}
News Headline: "${headline}" (Source: ${source}, Category: ${category})

Explain how this specific piece of news impacts the client's current portfolio holdings.
Specify which assets in their list are most exposed (positively or negatively) and why.
Provide a clear advisory takeaway: suggest whether they should tactically adjust their allocations to Alexander Forbes Unit Trust funds (e.g. rotating towards Unit Trust - Debt or stabilizing via Unit Trust - Hybrid).
Keep the response to 3 sentences max. Do not use markdown headers.`

  const aiReply = await askGemini(prompt)

  if (aiReply) {
    return res.json({ reply: aiReply, source: 'gemini' })
  }

  res.json({
    reply: `The news headline regarding ${headline} points to macro shifts. We monitor the impact on portfolio sectors closely.`,
    source: 'mock'
  })
})

// POST /api/copilot/refine-commentary
app.post('/api/copilot/refine-commentary', async (req, res) => {
  const { text, instruction, persona, holdings, metrics, options } = req.body

  const metricsCtx = metrics
    ? `Sharpe: ${metrics.sharpe}, Alpha: ${metrics.alpha}%, Volatility: ${metrics.volatility}%`
    : 'metrics not available'

  const holdingsCtx = holdings && holdings.length > 0
    ? holdings.slice(0, 3).map(h => h.symbol).join(', ')
    : 'equities'

  const prompt = `You are a premium wealth strategy presentation editor.
Client profile: ${persona}
Current holdings: ${holdingsCtx}
Current metrics: ${metricsCtx}

You are asked to refine the following slide commentary:
"${text}"

Refinement instruction: "${instruction}"

Rewrite the commentary carefully to match this instruction exactly.
If the instruction specifies a tone, change the tone but keep the factual data.
If the instruction specifies bullet points, format the result as 2 or 3 clean, bulleted lines using '•'.
Do not write any introductory text, titles, or concluding remarks. Just output the revised text. Keep it professional and under 4 sentences.`

  const aiReply = await askGemini(prompt, options)

  if (aiReply) {
    return res.json({ draft: aiReply, source: 'gemini' })
  }

  res.json({
    draft: text,
    source: 'mock'
  })
})


// POST /api/copilot/generate-theme
app.post('/api/copilot/generate-theme', async (req, res) => {
  const { description, clientName, persona, options } = req.body

  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'description is required' })
  }

  const personaCtx = {
    'young-investor':    'a young, growth-oriented investor',
    'family-planner':    'a family-focused, balanced investor',
    'retirement-client': 'a retirement-stage, capital-preservation client',
  }[persona] || 'a wealth management client'

  const prompt = `You are a professional presentation designer for Alexander Forbes wealth management.
A financial advisor is building a client-facing investment deck for ${clientName || 'a client'} who is ${personaCtx}.

They described their desired theme as: "${description}"

Generate a complete slide deck color theme based on that description.
Respond ONLY with a valid JSON object (no markdown, no explanation) in this exact format:
{
  "themeName": "<short memorable name, max 3 words>",
  "backgroundColor": "<dark hex color for slide background>",
  "textColor": "<hex color for primary text, should contrast well with background>",
  "primaryColor": "<hex color for highlights, headings, accents>",
  "secondaryColor": "<hex color for secondary accents, charts>",
  "fontFamily": "<one of: Outfit, Inter, Playfair Display, Plus Jakarta Sans, Roboto>",
  "rationale": "<1 sentence explaining why these colors match the description>"
}`

  const aiReply = await askGemini(prompt, options)

  if (aiReply) {
    try {
      // Strip any accidental markdown code fences
      const cleaned = aiReply.replace(/```json|```/g, '').trim()
      const theme = JSON.parse(cleaned)
      return res.json({ theme, source: 'gemini' })
    } catch {
      // If JSON parse fails, return the raw text so frontend can still show something
      return res.json({ raw: aiReply, source: 'gemini-raw' })
    }
  }

  // Fallback — AF brand-aligned default
  const fallbackThemes = {
    'young-investor':    { themeName: 'Equity Growth', backgroundColor: '#030d1a', textColor: '#f1f5f9', primaryColor: '#22d3ee', secondaryColor: '#818cf8', fontFamily: 'Outfit', rationale: 'Cool cyan and indigo reflect ambition and tech-forward growth positioning.' },
    'family-planner':   { themeName: 'Family Trust', backgroundColor: '#0a1628', textColor: '#f8fafc', primaryColor: '#34d399', secondaryColor: '#6ee7b7', fontFamily: 'Plus Jakarta Sans', rationale: 'Green tones evoke stability, growth, and long-term family security.' },
    'retirement-client':{ themeName: 'Capital Shield', backgroundColor: '#0f1117', textColor: '#f4f4f5', primaryColor: '#d4af37', secondaryColor: '#b45309', fontFamily: 'Playfair Display', rationale: 'Gold and warm tones convey prestige, preservation, and trusted legacy.' },
  }
  const fallback = fallbackThemes[persona] || fallbackThemes['retirement-client']
  res.json({ theme: fallback, source: 'mock' })
})


// ─── SQLite DB (clients + activity logs) ─────────────────────────────────────
const db = require('./db')
console.log('✅ SQLite database connected —', require('path').join(__dirname, '../deckora.db'))

function logActivity(type, title, description, metadata = {}) {
  return db.insertActivity({
    id:          `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    description,
    user_name:   'Alex Reed',
    timestamp:   new Date().toISOString(),
    metadata:    JSON.stringify(metadata),
  })
}

app.get('/api/activity', (req, res) => res.json(db.getAllActivity()))
app.post('/api/activity', (req, res) => {
  const { type, title, description, metadata } = req.body
  if (!type || !title) return res.status(400).json({ error: 'Type and Title are required' })
  const newAct = logActivity(type, title, description, metadata)
  res.status(201).json(newAct)
})

// ─── Client Management ────────────────────────────────────────────────────────
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Ensure upload directories exist
const UPLOADS_DIR = path.join(__dirname, '../../uploads')
const LOGOS_DIR   = path.join(UPLOADS_DIR, 'logos')
const PORTFOLIO_DIR = path.join(UPLOADS_DIR, 'portfolios')
;[UPLOADS_DIR, LOGOS_DIR, PORTFOLIO_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }) })

// Serve uploads as static files
app.use('/uploads', express.static(UPLOADS_DIR))

const logoStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, LOGOS_DIR),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
})
const portfolioStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, PORTFOLIO_DIR),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
})
const uploadLogo      = multer({ storage: logoStorage,      limits: { fileSize: 5 * 1024 * 1024 } })
const uploadPortfolio = multer({ storage: portfolioStorage, limits: { fileSize: 10 * 1024 * 1024 } })

// ─── Client ID generator ─────────────────────────────────────────────────────
function generateClientId(name) {
  return `client-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`
}

function parsePortfolioCSV(csvText) {
  const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length <= 1) return []
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.trim())
    if (parts.length < 2) continue
    const row = {}
    headers.forEach((h, idx) => { row[h] = parts[idx] || '' })
    rows.push({
      symbol:    row['symbol']    || row['ticker']            || `STOCK${i}`,
      name:      row['name']      || row['company']           || row['symbol'] || `Asset ${i}`,
      shares:    parseFloat(row['shares']  || row['quantity'] || '0') || 0,
      avgCost:   parseFloat(row['avgcost'] || row['avg cost'] || row['cost']   || '0') || 0,
      value:     parseFloat(row['value']   || row['mkt value']|| '0') || 0,
      allocation:parseFloat(row['allocation'] || row['weight']|| '0') || 0,
      pnlPct:    parseFloat(row['pnl%']    || row['pnl']      || row['return'] || '0') || 0,
      assetClass:row['asset class'] || row['type'] || row['assetclass'] || 'Equity',
    })
  }
  return rows
}

// GET /api/clients — list all clients
app.get('/api/clients', (req, res) => {
  res.json(db.getAllClients())
})

// GET /api/clients/:id — single client
app.get('/api/clients/:id', (req, res) => {
  const client = db.getClientById(req.params.id)
  if (!client) return res.status(404).json({ error: 'Client not found' })
  res.json(client)
})

// POST /api/clients — create client
app.post('/api/clients', (req, res) => {
  const { name, email, contact, address, company, age, persona, current, goal, sharpe, volatility } = req.body
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' })

  const row = {
    id:                  generateClientId(name),
    name:                name.trim(),
    email:               email?.trim() || '',
    contact:             contact?.trim() || '',
    address:             address?.trim() || '',
    company:             company?.trim() || '',
    age:                 parseInt(age, 10) || 35,
    persona:             persona || 'family-planner',
    current:             parseFloat(current) || 0,
    goal:                parseFloat(goal) || 0,
    sharpe:              parseFloat(sharpe) || 1.4,
    volatility:          parseFloat(volatility) || 12.0,
    logo:                null,
    portfolio_holdings:  null,
    created_at:          new Date().toISOString(),
  }
  const newClient = db.insertClient(row)
  logActivity('client_create', 'New Client Created', `Client profile created for ${newClient.name}.`, { clientId: newClient.id, clientName: newClient.name })
  res.status(201).json(newClient)
})

// PUT /api/clients/:id — update client details
app.put('/api/clients/:id', (req, res) => {
  const existing = db.getClientById(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Client not found' })

  const allowed = ['name','email','contact','address','company','age','persona','current','goal','sharpe','volatility']
  const updates = {}
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })

  const updated = db.updateClient(req.params.id, updates)
  logActivity('client_update', 'Client Profile Updated', `Updated profile parameters for ${updated.name}.`, { clientId: updated.id, clientName: updated.name })
  res.json(updated)
})

// DELETE /api/clients/:id — remove client
app.delete('/api/clients/:id', (req, res) => {
  const existing = db.getClientById(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Client not found' })
  db.deleteClient(req.params.id)
  logActivity('client_delete', 'Client Profile Removed', `Deleted client profile for ${existing.name}.`, { clientId: existing.id, clientName: existing.name })
  res.json({ success: true })
})

// POST /api/clients/:id/logo — upload company logo
app.post('/api/clients/:id/logo', uploadLogo.single('logo'), (req, res) => {
  const existing = db.getClientById(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Client not found' })
  if (!req.file)  return res.status(400).json({ error: 'No file uploaded' })

  const logoUrl = `/uploads/logos/${req.file.filename}`
  const updated = db.updateLogo(req.params.id, logoUrl)
  logActivity('logo_upload', 'Company Logo Uploaded', `Uploaded company logo for ${updated.company || updated.name}.`, { clientId: updated.id, clientName: updated.name })
  res.json({ logoUrl, client: updated })
})

// POST /api/clients/:id/portfolio — upload portfolio CSV
app.post('/api/clients/:id/portfolio', uploadPortfolio.single('portfolio'), (req, res) => {
  const existing = db.getClientById(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Client not found' })
  if (!req.file)  return res.status(400).json({ error: 'No file uploaded' })

  try {
    const csvText = fs.readFileSync(req.file.path, 'utf-8')
    const holdings = parsePortfolioCSV(csvText)

    // Auto-calculate total value from holdings if current is 0
    let newCurrent = existing.current
    if (holdings.length > 0) {
      const totalValue = holdings.reduce((sum, h) => sum + (h.value || (h.shares * h.avgCost)), 0)
      if (totalValue > 0 && existing.current === 0) newCurrent = Math.round(totalValue)
    }

    const updated = db.updateHoldings(req.params.id, holdings, newCurrent)
    logActivity('portfolio_upload', 'Portfolio Sheet Imported', `Custom portfolio CSV holding sheet uploaded for ${updated.name} (${holdings.length} positions).`, { clientId: updated.id, clientName: updated.name })
    res.json({ holdings, client: updated, count: holdings.length })
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse portfolio CSV', detail: err.message })
  }
})

// GET /api/clients/template/portfolio — download sample portfolio CSV template
app.get('/api/clients/template/portfolio', (req, res) => {
  const csv = [
    'Symbol,Name,Shares,AvgCost,Value,Allocation,PnL%,Asset Class',
    'AAPL,Apple Inc,50,165.00,9250.00,18.5,12.1,Equity',
    'MSFT,Microsoft Corp,30,380.00,12600.00,25.2,10.5,Equity',
    'BND,Vanguard Bond ETF,200,73.00,15800.00,31.6,3.8,Fixed Income',
    'VNQ,Vanguard Real Estate ETF,80,88.00,7520.00,15.0,5.6,Real Estate',
    'GLD,SPDR Gold Shares,40,215.00,9460.00,18.9,8.2,Commodities',
  ].join('\n')

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="af_portfolio_template.csv"')
  res.send(csv)
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeSince(date) {
  const s = Math.floor((Date.now() - date) / 1000)
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

app.listen(5000, () => console.log('Deckora API running on :5000'))

