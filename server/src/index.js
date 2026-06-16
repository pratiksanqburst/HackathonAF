require('dotenv').config()
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

const SYSTEM_PROMPT = `You are an elite AI financial advisor copilot built into the "AF Engage" wealth management platform by Alexander Forbes.
Your goal is to assist financial advisors in compiling, refining, and generating slide decks, advisory commentary, and client risk assessments.

You MUST frame your advice, commentaries, and rebalancing recommendations around the Alexander Forbes Core Product Portfolio and client Life Stages:

1. CLIENT LIFE STAGES:
- Early Career (Age 22-30): Focus on high-growth compounding and wealth accumulation. Suggest building up a Retirement Annuity (RA), using Unit Trust - Equity under the investment pillar, and getting Income Protection.
- Mid Career (Age 30-45): Focus on family planning, education targets, and safety. Suggest Unit Trust - Hybrid, and robust Life Insurance (Death Cover) & Disability Insurance.
- Pre-Retirement (Age 45-60): Focus on capital consolidation and preparing for transition.
- Retirement (Age 55+): Focus on capital preservation, sustainable drawdowns, estate planning. Suggest Living Annuity (LA) and Guaranteed Annuity for reliable income.

2. CORE PRODUCT PILLARS (always prefer recommending these specific product terms):
- Retirement Solutions: Retirement Annuity (RA), Living Annuity (LA), Guaranteed Annuity.
- Investment Management: Unit Trust - Equity, Unit Trust - Debt, Unit Trust - Hybrid.
- Insurance & Risk Products: Life Insurance (Death Cover), Disability Insurance, Income Protection.

When presenting solutions, connect the client's current asset details or risk factors directly to options in these pillars.
Keep comments premium, highly professional, direct, and under 4 sentences or 3 bullet points. Do NOT use markdown headers or markdown bold headers.`

async function askGemini(prompt) {
  if (!gatewayEnabled) return null
  try {
    const response = await fetch(`${GATEWAY_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_KEY}`,
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        temperature: 0.7,
        max_tokens: 512,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
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
  const { persona = 'young-investor', years = 10 } = req.query
  const g = PORTFOLIO_GOALS[persona] || PORTFOLIO_GOALS['young-investor']
  const m = PORTFOLIO_METRICS[persona] || PORTFOLIO_METRICS['young-investor']
  const result = runMonteCarlo(g.current, g.goal, m.ytdReturn * 0.7, m.volatility, Number(years))
  res.json({ ...result, current: g.current, goal: g.goal })
})

// POST /api/copilot/generate-commentary  ─── Real Gemini + mock fallback
app.post('/api/copilot/generate-commentary', async (req, res) => {
  const { slideType, persona, metrics, holdings, clientName, customPrompt } = req.body
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
    cover:       `Write a compelling 1-sentence executive summary for a wealth strategy presentation cover slide prepared for ${client}. Make it sound premium and forward-looking.`,
    metrics:     `Write 3 concise bullet points analysing these portfolio metrics for ${client} (${personaCtx}): ${metricsCtx}. Highlight what's strong and flag any risks.`,
    holdings:    `Write 2-3 concise bullet points on the investment thesis behind these key holdings for ${client}: ${holdingsCtx}. Explain why these positions make sense for a ${personaCtx}.`,
    risk:        `Write 2-3 bullet points on risk management strategy for ${client} (${personaCtx}). Metrics: ${metricsCtx}. Explain how the portfolio is positioned defensively.`,
    timeline:    `Write 2-3 bullet points on the wealth growth trajectory and compounding strategy for ${client} (${personaCtx}). Reference their long-term timeline.`,
    montecarlo:  `Write 2-3 bullet points interpreting Monte Carlo simulation results for ${client} (${personaCtx}). Key metrics: ${metricsCtx}. Explain probability of goal success clearly.`,
    insights:    `Write 3-4 strategic advisory bullet points for ${client} (${personaCtx}). Holdings: ${holdingsCtx}. Metrics: ${metricsCtx}. Focus on actionable next steps.`,
    custom:      customPrompt
      ? `Write 3 concise bullet points for a slide based on this user instruction: "${customPrompt}". Tailor it for the client: ${client} (${personaCtx}). Holdings: ${holdingsCtx}.`
      : `Write 3 bullet points of general market outlook commentary for a wealth management presentation for ${client}.`,
  }

  const prompt = slidePrompts[slideType] || slidePrompts.custom

  // ── Try Gemini first, fall back to mock ───────────────────────────────────
  const aiDraft = await askGemini(prompt)

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
  const { deck = [], persona, metrics, holdings, clientName } = req.body
  const client = clientName || 'Valued Partner'

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
    cover:       `Write a compelling 1-sentence executive summary for a wealth strategy presentation cover slide prepared for ${client}.`,
    metrics:     `Write 3 concise bullet points analysing these portfolio metrics for ${client} (${personaCtx}): ${metricsCtx}. Highlight what's strong and flag any risks.`,
    holdings:    `Write 2-3 concise bullet points on the investment thesis behind these key holdings for ${client}: ${holdingsCtx}. Explain why these positions make sense for a ${personaCtx}.`,
    risk:        `Write 2-3 bullet points on risk management strategy for ${client} (${personaCtx}). Metrics: ${metricsCtx}. Explain how the portfolio is positioned defensively.`,
    timeline:    `Write 2-3 bullet points on the wealth growth trajectory and compounding strategy for ${client} (${personaCtx}). Reference their long-term timeline.`,
    montecarlo:  `Write 2-3 bullet points interpreting Monte Carlo simulation results for ${client} (${personaCtx}). Key metrics: ${metricsCtx}. Explain probability of goal success clearly.`,
    insights:    `Write 3-4 strategic advisory bullet points for ${client} (${personaCtx}). Holdings: ${holdingsCtx}. Metrics: ${metricsCtx}. Focus on actionable next steps.`,
    custom:      `Write 3 bullet points of general market outlook commentary for a wealth management presentation for ${client}.`,
  }

  try {
    const promises = deck.map(async (slide) => {
      const prompt = slidePrompts[slide.type] || slidePrompts.custom
      const aiDraft = await askGemini(prompt)
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

// POST /api/copilot/stress-appraisal
app.post('/api/copilot/stress-appraisal', async (req, res) => {
  const { scenario, persona, holdings, metrics } = req.body

  const holdingsCtx = holdings && holdings.length > 0
    ? holdings.map(h => `${h.symbol}: ${h.shares} shares @ $${h.price} ($${h.value.toLocaleString()} total)`).join(', ')
    : 'N/A'

  const metricsCtx = metrics
    ? `Sharpe: ${metrics.sharpe}, Volatility: ${metrics.volatility}%, Max Drawdown: ${metrics.maxDrawdown}%`
    : 'N/A'

  const prompt = `You are an expert risk officer advising on a portfolio.
Client profile: ${persona}
Active stress scenario: ${scenario}
Current holdings: ${holdingsCtx}
Current metrics: ${metricsCtx}

Analyze the direct impact of this stress scenario on the client's specific assets.
Explain the vulnerabilities clearly.
Propose 1 or 2 concrete, realistic rebalancing actions they should take immediately to protect or optimize their wealth.
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

  prompt += `\n\nProvide a professional appraisal of the feasibility of these parameters.
Are the growth rates realistic for this client's risk profile?
What adjustments in either contributions or timeframe should the advisor recommend?
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

  const prompt = `You are an institutional financial analyst.
Client profile: ${persona}
Client holdings: ${holdingsCtx}
News Headline: "${headline}" (Source: ${source}, Category: ${category})

Explain how this specific piece of news impacts the client's current portfolio holdings.
Specify which assets in their list are most exposed (positively or negatively) and why.
Provide a clear advisory takeaway for the client's advisor.
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
  const { text, instruction, persona, holdings, metrics } = req.body

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

  const aiReply = await askGemini(prompt)

  if (aiReply) {
    return res.json({ draft: aiReply, source: 'gemini' })
  }

  res.json({
    draft: text,
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

app.listen(5000, () => console.log('Deckora API running on :5000'))

