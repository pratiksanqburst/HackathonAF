require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const app = express()
app.use(cors())
app.use(express.json())

// ─── Gemini AI Setup ──────────────────────────────────────────────────────────
const GEMINI_KEY = process.env.GEMINI_API_KEY
const geminiEnabled = GEMINI_KEY && GEMINI_KEY !== 'your_gemini_api_key_here'
let genAI = null
let geminiModel = null

if (geminiEnabled) {
  genAI = new GoogleGenerativeAI(GEMINI_KEY)
  geminiModel = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 512,
    },
    systemInstruction: `You are an elite AI financial advisor copilot built into the AF InsightSphere wealth management platform. 
You assist financial advisors with portfolio analysis, investment storytelling, and client communications. 
You speak with confidence and precision. Use data-driven insights. Keep responses concise — max 4-5 sentences or 4 bullet points. 
Always write in a professional advisory tone. Do NOT use markdown headers or heavy formatting. Use bullet points sparingly.`,
  })
  console.log('✅ Gemini AI copilot enabled')
} else {
  console.log('⚠️  Gemini API key not set — copilot running in mock mode. Add GEMINI_API_KEY to server/.env')
}

async function askGemini(prompt) {
  if (!geminiModel) return null
  try {
    const result = await geminiModel.generateContent(prompt)
    return result.response.text().trim()
  } catch (err) {
    console.error('Gemini API error:', err.message)
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
  const { persona = 'young-investor', years = 10 } = req.query
  const g = PORTFOLIO_GOALS[persona] || PORTFOLIO_GOALS['young-investor']
  const m = PORTFOLIO_METRICS[persona] || PORTFOLIO_METRICS['young-investor']
  const result = runMonteCarlo(g.current, g.goal, m.ytdReturn * 0.7, m.volatility, Number(years))
  res.json({ ...result, current: g.current, goal: g.goal })
})

// POST /api/copilot/generate-commentary  ─── Real Gemini + mock fallback
app.post('/api/copilot/generate-commentary', async (req, res) => {
  const { slideType, persona, metrics, holdings, clientName } = req.body
  const client = clientName || 'Valued Partner'

  // ── Build a rich, data-aware prompt ───────────────────────────────────────
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
    cover:       `Write a compelling 1-sentence executive summary for a wealth strategy presentation cover slide prepared for ${client}. Make it sound premium and forward-looking.`,
    metrics:     `Write 3 concise bullet points analysing these portfolio metrics for ${client} (${personaCtx}): ${metricsCtx}. Highlight what's strong and flag any risks.`,
    holdings:    `Write 2-3 concise bullet points on the investment thesis behind these key holdings for ${client}: ${holdingsCtx}. Explain why these positions make sense for a ${personaCtx}.`,
    risk:        `Write 2-3 bullet points on risk management strategy for ${client} (${personaCtx}). Metrics: ${metricsCtx}. Explain how the portfolio is positioned defensively.`,
    timeline:    `Write 2-3 bullet points on the wealth growth trajectory and compounding strategy for ${client} (${personaCtx}). Reference their long-term timeline.`,
    montecarlo:  `Write 2-3 bullet points interpreting Monte Carlo simulation results for ${client} (${personaCtx}). Key metrics: ${metricsCtx}. Explain probability of goal success clearly.`,
    insights:    `Write 3-4 strategic advisory bullet points for ${client} (${personaCtx}). Holdings: ${holdingsCtx}. Metrics: ${metricsCtx}. Focus on actionable next steps.`,
    custom:      `Write 3 bullet points of general market outlook commentary for a wealth management presentation for ${client}.`,
  }

  const prompt = slidePrompts[slideType] || slidePrompts.custom

  // ── Try Gemini first, fall back to mock ───────────────────────────────────
  const aiDraft = await askGemini(prompt)

  if (aiDraft) {
    return res.json({ draft: aiDraft, source: 'gemini' })
  }

  // Mock fallback (unchanged)
  const mockDrafts = {
    cover:      `An exclusive wealth strategy update prepared for ${client}, highlighting key performance gains, risk metrics, and future asset allocation goals.`,
    metrics:    metrics
      ? `Portfolio registered a strong YTD Return of +${metrics.ytdReturn}%, with Alpha of +${metrics.alpha}% outperforming benchmark indices. Risk remains managed with Sharpe Ratio of ${metrics.sharpe}.`
      : `Portfolio risk-adjusted returns demonstrate sustained outperformance over benchmark models.`,
    holdings:   holdings?.length > 0
      ? `Maintained strategic overweights in ${holdings.slice(0,3).map(h=>h.symbol).join(', ')}. Current gains reflect timely entry points and solid underlying growth fundamentals.`
      : `Current holdings show a well-diversified mix optimised for yield and targeted asset allocation.`,
    risk:       `Asset weights are aligned with the client's defensive growth goals. Volatility has been systematically hedged through tactical asset allocation adjustments.`,
    timeline:   `Historical growth trends reflect steady capital appreciation, capturing upside momentum while maintaining adequate cash reserves to deploy during market corrections.`,
    montecarlo: `Monte Carlo simulations indicate a high probability of success for achieving wealth accumulation goals. We remain on track with current investment patterns.`,
    insights:   `Key recommendations: Take partial profits on tech overweights to rebalance into defensive equities and short-duration corporate debt.`,
  }
  res.json({ draft: mockDrafts[slideType] || mockDrafts.insights, source: 'mock' })
})

// POST /api/copilot/chat  ─── Real conversational Gemini chat
app.post('/api/copilot/chat', async (req, res) => {
  const { message, persona, portfolioValue, metrics, stressScenario } = req.body

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

  const prompt = `You are advising a ${personaCtx}. Portfolio value: $${portfolioValue?.toLocaleString() || 'N/A'}. ${metricsCtx}. ${stressCtx}

Advisor question: "${message}"

Respond in 2-4 sentences with specific, data-aware financial advice. Be direct and confident. Do not use markdown headers.`

  const aiReply = await askGemini(prompt)

  if (aiReply) {
    return res.json({ reply: aiReply, source: 'gemini' })
  }

  // Fallback mock response
  res.json({
    reply: `Based on the current ${persona?.replace('-', ' ')} profile, your portfolio is well-positioned for the stated goals. The key metrics are within acceptable thresholds. For more specific advice, please consult your lead advisor with the latest risk assessment.`,
    source: 'mock'
  })
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeSince(date) {
  const s = Math.floor((Date.now() - date) / 1000)
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

app.listen(5000, () => console.log('AF InsightSphere API running on :5000'))

