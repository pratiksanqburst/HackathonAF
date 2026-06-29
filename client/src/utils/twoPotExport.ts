import pptxgen from 'pptxgenjs'

// ── Brand tokens ────────────────────────────────────────────────
const AF_BG      = '0F172A'
const AF_CARD    = '1E293B'
const AF_BORDER  = '334155'
const AF_PRIMARY = '10B981'
const AF_ACCENT  = 'F59E0B'
const AF_RED     = 'EF4444'
const AF_WHITE   = 'F8FAFC'
const AF_MUTED   = '94A3B8'
const AF_SUB     = '64748B'

const footer = (slide: any) => {
  slide.addShape('rect', { x: 0, y: 7.3, w: '100%', h: 0.2, fill: { color: AF_PRIMARY } })
  slide.addText('Wealth Advisory Engage  -  Kabelo Mokgosi  -  Confidential', {
    x: 0.5, y: 7.3, w: 8, h: 0.2, fontSize: 7.5, color: AF_BG, bold: true,
  })
  slide.addText('advisory.com', {
    x: 10.5, y: 7.3, w: 2.8, h: 0.2, fontSize: 7.5, color: AF_BG, align: 'right' as const,
  })
}

const topBar = (slide: any, pptx: any) => {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.06, fill: { color: AF_PRIMARY } })
}

const sectionBadge = (slide: any, text: string, x: number, y: number) => {
  slide.addText(text, { x, y, w: 5, h: 0.22, fontSize: 7.5, bold: true, color: AF_PRIMARY, charSpacing: 2 })
}

const card = (slide: any, pptx: any, x: number, y: number, w: number, h: number, accent = false) => {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: AF_CARD },
    line: { color: accent ? AF_PRIMARY : AF_BORDER, width: accent ? 2 : 1 },
  })
}

// ── Slide 1: Cover ──────────────────────────────────────────────
const addCover = (pptx: any) => {
  const slide = pptx.addSlide()
  slide.background = { fill: AF_BG }
  topBar(slide, pptx)

  slide.addShape(pptx.ShapeType.ellipse, {
    x: 9.5, y: 1.5, w: 5, h: 5,
    fill: { type: 'solid', color: AF_PRIMARY },
    line: { type: 'none' },
  })
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 10.2, y: 2.2, w: 3.6, h: 3.6,
    fill: { type: 'solid', color: AF_BG },
    line: { type: 'none' },
  })

  slide.addText('Wealth Advisory', { x: 0.7, y: 1.6, w: 6, h: 0.45, fontSize: 18, bold: true, color: AF_PRIMARY })

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7, y: 2.15, w: 2.8, h: 0.28,
    fill: { color: AF_ACCENT },
    line: { type: 'none' },
  })
  slide.addText('IMPORTANT ADVISORY', { x: 0.72, y: 2.16, w: 2.76, h: 0.26, fontSize: 7.5, bold: true, color: '0F172A' })

  slide.addText("South Africa's Two-Pot Retirement System", {
    x: 0.7, y: 2.6, w: 8.5, h: 1.6,
    fontSize: 36, bold: true, color: AF_WHITE,
  })

  slide.addText('Why Early Withdrawal Is A Decision You Cannot Afford to Make', {
    x: 0.7, y: 4.3, w: 8, h: 0.6,
    fontSize: 15, color: AF_MUTED,
  })

  slide.addShape(pptx.ShapeType.rect, { x: 0.7, y: 5.1, w: 1.2, h: 0.04, fill: { color: AF_PRIMARY } })

  slide.addText('PREPARED FOR', { x: 0.7, y: 5.25, w: 2.5, h: 0.18, fontSize: 7.5, bold: true, color: AF_SUB })
  slide.addText('Valued Client',  { x: 0.7, y: 5.42, w: 3,   h: 0.3,  fontSize: 13, bold: true, color: AF_WHITE })

  slide.addText('ADVISOR', { x: 4.2, y: 5.25, w: 2.5, h: 0.18, fontSize: 7.5, bold: true, color: AF_SUB })
  slide.addText('Kabelo Mokgosi', { x: 4.2, y: 5.42, w: 3, h: 0.3, fontSize: 13, bold: true, color: AF_WHITE })

  slide.addText('DATE', { x: 7.5, y: 5.25, w: 2.5, h: 0.18, fontSize: 7.5, bold: true, color: AF_SUB })
  slide.addText(new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }), {
    x: 7.5, y: 5.42, w: 3, h: 0.3, fontSize: 13, bold: true, color: AF_WHITE,
  })

  footer(slide)
}

// ── Slide 2: The Two-Pot Split ───────────────────────────────────
const addSplitSlide = (pptx: any) => {
  const slide = pptx.addSlide()
  slide.background = { fill: AF_BG }
  topBar(slide, pptx)

  sectionBadge(slide, 'SECTION 1  -  THE NEW STRUCTURE', 0.5, 0.2)
  slide.addText('How Your Retirement Money Is Now Split', {
    x: 0.5, y: 0.55, w: 12.3, h: 0.55, fontSize: 22, bold: true, color: AF_WHITE,
  })
  slide.addText('Every rand you contribute is automatically divided into two separate pots from now on.', {
    x: 0.5, y: 1.1, w: 12.3, h: 0.3, fontSize: 11, color: AF_MUTED,
  })

  // Savings Pot
  card(slide, pptx, 0.5, 1.55, 5.9, 4.5, false)
  slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.55, w: 0.1, h: 4.5, fill: { color: AF_PRIMARY } })
  slide.addText('TRANCHE A', { x: 0.75, y: 1.75, w: 5.4, h: 0.22, fontSize: 7.5, bold: true, color: AF_PRIMARY, charSpacing: 2 })
  slide.addText('The Savings Pot', { x: 0.75, y: 2.0, w: 5.4, h: 0.45, fontSize: 20, bold: true, color: AF_WHITE })
  slide.addShape(pptx.ShapeType.rect, { x: 0.75, y: 2.55, w: 1.8, h: 0.55, fill: { color: '14532d' }, line: { color: AF_PRIMARY, width: 1 } })
  slide.addText('33% of contributions', { x: 0.75, y: 2.57, w: 1.8, h: 0.51, fontSize: 11, bold: true, color: AF_PRIMARY, align: 'center' as const })
  slide.addText(
    '- Emergency access pool\n- Withdraw once per year if necessary\n- Minimum withdrawal: R2,000\n- Taxed at your marginal income tax rate\n- Accessible from 1 September 2024',
    { x: 0.75, y: 3.25, w: 5.4, h: 2.5, fontSize: 11, color: AF_WHITE }
  )

  // Retirement Pot
  card(slide, pptx, 7.0, 1.55, 5.9, 4.5, true)
  slide.addShape(pptx.ShapeType.rect, { x: 7.0, y: 1.55, w: 0.1, h: 4.5, fill: { color: AF_ACCENT } })
  slide.addText('TRANCHE B', { x: 7.25, y: 1.75, w: 5.4, h: 0.22, fontSize: 7.5, bold: true, color: AF_ACCENT, charSpacing: 2 })
  slide.addText('The Retirement Pot', { x: 7.25, y: 2.0, w: 5.4, h: 0.45, fontSize: 20, bold: true, color: AF_WHITE })
  slide.addShape(pptx.ShapeType.rect, { x: 7.25, y: 2.55, w: 1.8, h: 0.55, fill: { color: '451a03' }, line: { color: AF_ACCENT, width: 1 } })
  slide.addText('67% of contributions', { x: 7.25, y: 2.57, w: 1.8, h: 0.51, fontSize: 11, bold: true, color: AF_ACCENT, align: 'center' as const })
  slide.addText(
    '- Completely locked until retirement\n- Cannot be touched under any circumstance\n- Protected for long-term growth\n- Converted to income at retirement\n- Grows tax-free while invested',
    { x: 7.25, y: 3.25, w: 5.4, h: 2.5, fontSize: 11, color: AF_WHITE }
  )

  footer(slide)
}

// ── Slide 3: The Tax Penalty ─────────────────────────────────────
const addTaxSlide = (pptx: any) => {
  const slide = pptx.addSlide()
  slide.background = { fill: AF_BG }
  topBar(slide, pptx)

  sectionBadge(slide, 'SECTION 2  -  THE PENALTY', 0.5, 0.2)
  slide.addText('Why Withdrawing Early Is A Costly Mistake', {
    x: 0.5, y: 0.55, w: 12.3, h: 0.55, fontSize: 22, bold: true, color: AF_WHITE,
  })

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.2, w: 12.3, h: 1.0, fill: { color: '431407' }, line: { color: AF_ACCENT, width: 2 },
  })
  slide.addText('Example Scenario: You decide to withdraw R30,000 from your Savings Pot today.', {
    x: 0.7, y: 1.3, w: 11.9, h: 0.35, fontSize: 13, bold: true, color: AF_ACCENT,
  })
  slide.addText('Here is what that decision actually costs you over the next 20 years:', {
    x: 0.7, y: 1.68, w: 11.9, h: 0.28, fontSize: 10.5, color: 'FED7AA',
  })

  const impacts = [
    { label: 'Gross Withdrawal', value: 'R30,000',   sub: 'Requested amount',           color: AF_WHITE, accent: AF_BORDER },
    { label: 'Tax Deducted (up to 45%)', value: '-R13,500', sub: 'Taxed at marginal rate', color: AF_RED,   accent: AF_RED },
    { label: 'Net Cash Received', value: 'R16,500',  sub: 'What actually reaches you',  color: AF_MUTED, accent: AF_BORDER },
  ]
  impacts.forEach((item, i) => {
    const x = 0.5 + i * 4.1
    card(slide, pptx, x, 2.4, 3.9, 1.8, false)
    slide.addShape(pptx.ShapeType.rect, { x, y: 2.4, w: 3.9, h: 0.06, fill: { color: item.accent } })
    slide.addText(item.label, { x: x + 0.2, y: 2.55, w: 3.5, h: 0.28, fontSize: 9.5, color: AF_MUTED })
    slide.addText(item.value, { x: x + 0.2, y: 2.88, w: 3.5, h: 0.65, fontSize: 26, bold: true, color: item.color })
    slide.addText(item.sub,   { x: x + 0.2, y: 3.6,  w: 3.5, h: 0.25, fontSize: 8.5, color: AF_SUB })
  })

  card(slide, pptx, 0.5, 4.45, 12.3, 2.4, false)
  slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 4.45, w: 12.3, h: 0.06, fill: { color: AF_RED } })
  slide.addText('THE INVISIBLE LOSS - Future Growth Destroyed', {
    x: 0.75, y: 4.6, w: 8, h: 0.3, fontSize: 12, bold: true, color: AF_RED,
  })
  slide.addText('R30,000 today  ==>  R140,000 in 20 years', {
    x: 0.75, y: 5.0, w: 6, h: 0.45, fontSize: 18, bold: true, color: AF_WHITE,
  })
  slide.addText('(assumed 8% per annum growth)', {
    x: 0.75, y: 5.5, w: 5, h: 0.22, fontSize: 9, color: AF_MUTED, italic: true,
  })
  slide.addText('For every R1 taken out today, you lose R4.60 in future wealth.', {
    x: 7.5, y: 4.8, w: 5, h: 0.9, fontSize: 14, bold: true, color: AF_ACCENT,
  })
  slide.addText('The "4.6x Rule"', {
    x: 7.5, y: 5.75, w: 5, h: 0.25, fontSize: 9.5, color: AF_MUTED, italic: true,
  })

  footer(slide)
}

// ── Slide 4: Visual Impact Comparison ───────────────────────────
const addImpactSlide = (pptx: any) => {
  const slide = pptx.addSlide()
  slide.background = { fill: AF_BG }
  topBar(slide, pptx)

  sectionBadge(slide, 'SECTION 2  -  VISUALISING THE COST', 0.5, 0.2)
  slide.addText('The True Cost of R30,000 Withdrawn Today', {
    x: 0.5, y: 0.55, w: 12.3, h: 0.55, fontSize: 22, bold: true, color: AF_WHITE,
  })

  const chartData = [{
    name: 'Value at Retirement (20 yrs @ 8% p.a.)',
    labels: ['Left in pot (grows to)', 'Withdrawn (R0 invested)'],
    values: [140000, 0],
  }]
  slide.addChart(pptx.ChartType.bar, chartData, {
    x: 0.5, y: 1.2, w: 7.5, h: 5.0,
    showTitle: false,
    showLegend: true,
    legendPos: 'b',
    legendColor: AF_MUTED,
    valAxisLabelFormatCode: 'R#,##0',
    chartColors: [AF_PRIMARY, AF_RED],
    valGridLine: { color: AF_BORDER },
    catAxisLabelColor: AF_WHITE,
    valAxisLabelColor: AF_WHITE,
  })

  const callouts = [
    { label: 'Money Left to Grow',     val: 'R140,000', color: AF_PRIMARY, icon: 'YES' },
    { label: 'Money After Withdrawal', val: 'R0',       color: AF_RED,     icon: 'NO'  },
    { label: 'Wealth Destroyed',       val: 'R140,000', color: AF_ACCENT,  icon: '!!!' },
  ]
  callouts.forEach((c, i) => {
    const y = 1.4 + i * 1.6
    card(slide, pptx, 8.4, y, 4.4, 1.3, false)
    slide.addShape(pptx.ShapeType.rect, { x: 8.4, y, w: 0.08, h: 1.3, fill: { color: c.color } })
    slide.addText(c.icon,  { x: 8.55, y: y + 0.18, w: 0.7,  h: 0.35, fontSize: 9,  bold: true, color: c.color })
    slide.addText(c.label, { x: 9.3,  y: y + 0.1,  w: 3.3,  h: 0.28, fontSize: 9.5, color: AF_MUTED })
    slide.addText(c.val,   { x: 9.3,  y: y + 0.42, w: 3.3,  h: 0.55, fontSize: 22, bold: true, color: c.color })
  })

  slide.addText('Source: Illustrative example - 8% p.a. compound growth over 20 years, marginal tax rate 45%', {
    x: 0.5, y: 6.35, w: 12.3, h: 0.22, fontSize: 8, color: AF_SUB, italic: true,
  })

  footer(slide)
}

// ── Slide 5: Goals ───────────────────────────────────────────────
const addGoalsSlide = (pptx: any) => {
  const slide = pptx.addSlide()
  slide.background = { fill: AF_BG }
  topBar(slide, pptx)

  sectionBadge(slide, 'SECTION 3  -  YOUR GOALS', 0.5, 0.2)
  slide.addText('Your Retirement Goals & Our Plan to Protect Them', {
    x: 0.5, y: 0.55, w: 12.3, h: 0.55, fontSize: 22, bold: true, color: AF_WHITE,
  })
  slide.addText('Kabelo Mokgosi - Your Wealth Advisor', {
    x: 0.5, y: 1.12, w: 12.3, h: 0.28, fontSize: 11, color: AF_MUTED,
  })

  const goals = [
    {
      num: 'GOAL 01', color: AF_PRIMARY,
      title: 'Retire Comfortably Without Lifestyle Downgrade',
      body: 'Ensure your Retirement Pot grows undisturbed so it can replace your current income at retirement. Every early withdrawal reduces your replacement ratio.',
    },
    {
      num: 'GOAL 02', color: AF_ACCENT,
      title: 'Protect You From Short-Term Financial Emergencies',
      body: 'Build a separate emergency fund outside your retirement savings so that the Savings Pot remains your absolute last resort - not your first call.',
    },
    {
      num: 'GOAL 03', color: '818CF8',
      title: 'Maximise Long-Term Compound Growth',
      body: 'Leaving money invested for 20+ years is how wealth is built. The two-pot system is designed to protect this - let it work as intended.',
    },
  ]
  goals.forEach((g, i) => {
    const y = 1.55 + i * 1.65
    card(slide, pptx, 0.5, y, 12.3, 1.4, false)
    slide.addShape(pptx.ShapeType.rect, { x: 0.5, y, w: 0.08, h: 1.4, fill: { color: g.color } })
    slide.addText(g.num,   { x: 0.75, y: y + 0.1,  w: 3, h: 0.22, fontSize: 7.5, bold: true, color: g.color, charSpacing: 2 })
    slide.addText(g.title, { x: 0.75, y: y + 0.33, w: 7, h: 0.35, fontSize: 15,  bold: true, color: AF_WHITE })
    slide.addText(g.body,  { x: 0.75, y: y + 0.72, w: 11.5, h: 0.45, fontSize: 10.5, color: AF_MUTED })
  })

  footer(slide)
}

// ── Slide 6: Next Steps ──────────────────────────────────────────
const addNextStepsSlide = (pptx: any) => {
  const slide = pptx.addSlide()
  slide.background = { fill: AF_BG }
  topBar(slide, pptx)

  sectionBadge(slide, 'SECTION 4  -  NEXT STEPS', 0.5, 0.2)
  slide.addText('What We Recommend You Do Now', {
    x: 0.5, y: 0.55, w: 12.3, h: 0.55, fontSize: 22, bold: true, color: AF_WHITE,
  })

  const steps = [
    {
      num: '01', color: AF_PRIMARY,
      title: 'Do Not Withdraw From Your Savings Pot',
      body: 'Unless facing a genuine financial crisis, leave it untouched. The tax cost alone makes it one of the most expensive borrowing mechanisms available.',
    },
    {
      num: '02', color: AF_ACCENT,
      title: 'Build a 3-Month Emergency Fund Separately',
      body: 'Open a high-yield notice account or money market fund. Save R3,000-R5,000/month until you hold 3 months of expenses. Removes the temptation entirely.',
    },
    {
      num: '03', color: '818CF8',
      title: 'Review Your Contribution Rate',
      body: 'Work with Kabelo to assess whether your current rate meets your retirement income target. Small increases now make a massive difference at retirement.',
    },
    {
      num: '04', color: '34D399',
      title: 'Schedule Your Next Advisory Meeting',
      body: 'Contact your financial advisor to review your retirement readiness score, contribution strategy, and insurance coverage under the Two-Pot framework.',
    },
  ]

  steps.forEach((step, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 0.5 + col * 6.4
    const y = 1.4 + row * 2.6
    card(slide, pptx, x, y, 6.0, 2.3, false)
    slide.addShape(pptx.ShapeType.rect, { x, y, w: 6.0, h: 0.06, fill: { color: step.color } })
    slide.addText(step.num,   { x: x + 0.2, y: y + 0.18, w: 0.55, h: 0.55, fontSize: 22, bold: true, color: step.color })
    slide.addText(step.title, { x: x + 0.85, y: y + 0.18, w: 4.9,  h: 0.55, fontSize: 12.5, bold: true, color: AF_WHITE })
    slide.addText(step.body,  { x: x + 0.2,  y: y + 0.85, w: 5.6,  h: 1.25, fontSize: 10, color: AF_MUTED })
  })

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 6.65, w: 12.3, h: 0.55,
    fill: { color: '14532d' }, line: { color: AF_PRIMARY, width: 1 },
  })
  slide.addText('Contact Kabelo Mokgosi  -  Wealth Advisory Engage  -  0860 100 333  -  engage@advisory.com', {
    x: 0.7, y: 6.7, w: 11.9, h: 0.45, fontSize: 10.5, bold: true, color: AF_PRIMARY, align: 'center' as const,
  })

  footer(slide)
}

// ── Main export function ─────────────────────────────────────────
export const exportTwoPotPPTX = async () => {
  const pptx = new pptxgen()
  pptx.defineLayout({ name: 'WIDESCREEN', width: 13.33, height: 7.5 })
  pptx.layout = 'WIDESCREEN'
  pptx.author = 'Wealth Advisory Engage'
  pptx.company = 'Wealth Advisory'
  pptx.subject = 'Two-Pot Retirement System Advisory'
  pptx.title = "South Africa's Two-Pot Retirement System - Client Advisory"

  addCover(pptx)
  addSplitSlide(pptx)
  addTaxSlide(pptx)
  addImpactSlide(pptx)
  addGoalsSlide(pptx)
  addNextStepsSlide(pptx)

  await pptx.writeFile({ fileName: 'WealthAdvisory_TwoPot_Retirement_Advisory.pptx' })
}
