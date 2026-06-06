import pptxgen from 'pptxgenjs'
import { BrandingConfig } from '../components/deck/SlideTemplates'
import { Persona, PortfolioData, HoldingData, MetricsData, MonteCarloData, SlideItem } from '../store/useAppStore'


interface ExportData {
  persona: Persona
  portfolio: PortfolioData | null
  holdings: HoldingData[]
  metrics: MetricsData | null
  monteCarlo: MonteCarloData | null
}

const addAdvisorNote = (
  slide: any,
  content: string | undefined,
  primaryColor: string,
  pptx: any
) => {
  if (!content || !content.trim()) return

  // Advisor commentary box background
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 6.3,
    w: 12.3,
    h: 0.65,
    fill: { type: 'solid', color: '1e293b' },
    line: { color: '334155', width: 1 },
  })

  // Accent border on the left
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 6.3,
    w: 0.08,
    h: 0.65,
    fill: { type: 'solid', color: primaryColor },
  })

  // Commentary text
  slide.addText(`Advisor Note: ${content}`, {
    x: 0.8,
    y: 6.35,
    w: 11.8,
    h: 0.55,
    fontSize: 9.5,
    color: 'cbd5e1',
    italic: true,
  })
}

const cleanColor = (hex: string): string => {
  return hex.replace('#', '')
}

export const exportDeckToPPTX = async (
  deck: SlideItem[],
  branding: BrandingConfig,
  data: ExportData
) => {
  const pptx = new pptxgen()
  pptx.defineLayout({ name: 'CUSTOM_WIDESCREEN', width: 13.33, height: 7.5 })
  pptx.layout = 'CUSTOM_WIDESCREEN'

  // Master Background & Text Colors
  const bgColor = cleanColor(branding.backgroundColor)
  const textColor = cleanColor(branding.textColor)
  const primaryColor = cleanColor(branding.primaryColor)
  const secondaryColor = cleanColor(branding.secondaryColor)

  deck.forEach((slideItem) => {
    const slide = pptx.addSlide()
    
    // Add Slide Notes if any
    if (slideItem.notes) {
      slide.addNotes(slideItem.notes)
    }

    // Set background color
    slide.background = { fill: bgColor }

    // Top decorative colored line (100% width, thin height)
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.08,
      fill: { type: 'solid', color: primaryColor },
    })

    // Header & Footer (Except for cover slide)
    if (slideItem.type !== 'cover') {
      // Top left logo indicator
      slide.addText('◈ InsightSphere', {
        x: 0.5,
        y: 0.2,
        w: 3.0,
        h: 0.3,
        fontSize: 12,
        bold: true,
        color: primaryColor,
      })

      // Top right prepared statement
      slide.addText(branding.clientName ? `Prepared for: ${branding.clientName}` : 'Portfolio Proposal', {
        x: 8.0,
        y: 0.2,
        w: 5.0,
        h: 0.3,
        fontSize: 9,
        align: 'right',
        color: '94A3B8',
      })

      // Bottom left confidentiality statement
      slide.addText(branding.footerText || 'Confidential · For internal client use only', {
        x: 0.5,
        y: 7.1,
        w: 6.0,
        h: 0.3,
        fontSize: 8,
        color: '64748B',
      })

      // Bottom right system label
      slide.addText('AF InsightSphere', {
        x: 8.0,
        y: 7.1,
        w: 5.0,
        h: 0.3,
        fontSize: 8,
        align: 'right',
        color: '64748B',
      })
    }

    // Slide-Specific Layouts
    switch (slideItem.type) {
      case 'cover': {
        // Large background circle decoration
        slide.addShape(pptx.ShapeType.ellipse, {
          x: 9.0,
          y: 2.0,
          w: 4.5,
          h: 4.5,
          fill: { type: 'solid', color: primaryColor },
          line: { type: 'none' }
        })

        // Cover Logo
        slide.addText('◈ InsightSphere', {
          x: 0.8,
          y: 1.8,
          w: 4.0,
          h: 0.4,
          fontSize: 18,
          bold: true,
          color: primaryColor,
        })

        // Cover Title
        slide.addText(slideItem.title || (branding.clientName ? `Strategic Wealth Presentation` : 'Investment Strategy & Review'), {
          x: 0.8,
          y: 2.5,
          w: 8.5,
          h: 1.5,
          fontSize: 32,
          bold: true,
          color: textColor,
          fontFace: 'Arial',
        })

        // Cover Subtitle
        slide.addText(slideItem.content || 'Custom Portfolio Analytics & Projected Outcomes', {
          x: 0.8,
          y: 4.0,
          w: 8.5,
          h: 0.4,
          fontSize: 14,
          color: '94A3B8',
        })

        // Thin Separator line
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.8,
          y: 4.6,
          w: 1.0,
          h: 0.04,
          fill: { type: 'solid', color: primaryColor },
        })

        // Metadata grid
        slide.addText('CLIENT', { x: 0.8, y: 5.2, w: 2.0, h: 0.2, fontSize: 8, color: '64748B', bold: true })
        slide.addText(branding.clientName || 'Valued Partner', { x: 0.8, y: 5.4, w: 2.5, h: 0.3, fontSize: 12, color: textColor, bold: true })

        slide.addText('DATE', { x: 3.8, y: 5.2, w: 2.0, h: 0.2, fontSize: 8, color: '64748B', bold: true })
        slide.addText(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), { x: 3.8, y: 5.4, w: 2.5, h: 0.3, fontSize: 12, color: textColor, bold: true })
        break
      }

      case 'metrics': {
        // Slide Title
        slide.addText(slideItem.title || 'Portfolio Performance & Risk Metrics', {
          x: 0.5,
          y: 0.8,
          w: 10.0,
          h: 0.4,
          fontSize: 20,
          bold: true,
          color: primaryColor,
        })

        const m = data.metrics
        if (!m) {
          slide.addText('Metrics Loading...', { x: 0.5, y: 1.5, fontSize: 14, color: 'fff' })
          break
        }

        const metricsList = [
          { label: 'Sharpe Ratio', value: String(m.sharpe), desc: 'Risk-adjusted return' },
          { label: 'Alpha', value: `${m.alpha}%`, desc: 'Excess return vs benchmark' },
          { label: 'Beta', value: String(m.beta), desc: 'Market sensitivity' },
          { label: 'Volatility', value: `${m.volatility}%`, desc: 'Annualized price spread' },
          { label: 'YTD Return', value: `${m.ytdReturn}%`, desc: 'Calendar year performance' },
          { label: 'Max Drawdown', value: `${m.maxDrawdown}%`, desc: 'Peak-to-trough risk' },
        ]

        // Add 2x3 grid of cards
        metricsList.forEach((metric, index) => {
          const col = index % 3
          const row = Math.floor(index / 3)

          const x = 0.5 + col * 4.1
          const y = 1.6 + row * 2.4

          // Card Background
          slide.addShape(pptx.ShapeType.roundRect, {
            x,
            y,
            w: 3.8,
            h: 2.0,
            fill: { type: 'solid', color: '1e293b' },
            line: { color: '334155', width: 1 },
          })

          // Metric Label
          slide.addText(metric.label, {
            x: x + 0.2,
            y: y + 0.2,
            w: 3.4,
            h: 0.3,
            fontSize: 11,
            color: '94A3B8',
          })

          // Metric Value
          slide.addText(metric.value, {
            x: x + 0.2,
            y: y + 0.5,
            w: 3.4,
            h: 0.8,
            fontSize: 26,
            bold: true,
            color: 'ffffff',
          })

          // Metric Desc
          slide.addText(metric.desc, {
            x: x + 0.2,
            y: y + 1.4,
            w: 3.4,
            h: 0.3,
            fontSize: 8,
            color: '64748B',
          })
        })
        addAdvisorNote(slide, slideItem.content, primaryColor, pptx)
        break
      }

      case 'holdings': {
        slide.addText(slideItem.title || 'Current Asset Holdings', {
          x: 0.5,
          y: 0.8,
          w: 10.0,
          h: 0.4,
          fontSize: 20,
          bold: true,
          color: primaryColor,
        })

        const rows = data.holdings
        const tableBody = [
          [
            { text: 'Asset', options: { fill: { color: '0f172a' }, color: '94A3B8', bold: true } },
            { text: 'Shares', options: { fill: { color: '0f172a' }, color: '94A3B8', bold: true, align: 'right' as const } },
            { text: 'Avg Cost', options: { fill: { color: '0f172a' }, color: '94A3B8', bold: true, align: 'right' as const } },
            { text: 'Price', options: { fill: { color: '0f172a' }, color: '94A3B8', bold: true, align: 'right' as const } },
            { text: 'Market Value', options: { fill: { color: '0f172a' }, color: '94A3B8', bold: true, align: 'right' as const } },
            { text: 'Total P&L', options: { fill: { color: '0f172a' }, color: '94A3B8', bold: true, align: 'right' as const } },
          ],
          ...rows.map((row) => [
            { text: `${row.symbol}\n${row.name}`, options: { fill: { color: '1e293b' }, color: 'ffffff' } },
            { text: String(row.shares), options: { fill: { color: '1e293b' }, color: 'ffffff', align: 'right' as const } },
            { text: `$${row.avgCost.toFixed(2)}`, options: { fill: { color: '1e293b' }, color: 'ffffff', align: 'right' as const } },
            { text: `$${row.price.toFixed(2)}`, options: { fill: { color: '1e293b' }, color: 'ffffff', align: 'right' as const } },
            { text: `$${row.value.toLocaleString()}`, options: { fill: { color: '1e293b' }, color: 'ffffff', align: 'right' as const, bold: true } },
            {
              text: `${row.pnlPct >= 0 ? '+' : ''}${row.pnlPct}%`,
              options: {
                fill: { color: '1e293b' },
                color: row.pnlPct >= 0 ? '34D399' : 'F87171',
                align: 'right' as const,
                bold: true,
              },
            },
          ]),
        ]

        slide.addTable(tableBody, {
          x: 0.5,
          y: 1.5,
          w: 12.3,
          h: 4.8,
          border: { type: 'solid', color: '334155', pt: 1 },
          fontSize: 10,
        })
        addAdvisorNote(slide, slideItem.content, primaryColor, pptx)
        break
      }

      case 'risk': {
        slide.addText(slideItem.title || 'Risk Profile & Asset Allocation', {
          x: 0.5,
          y: 0.8,
          w: 10.0,
          h: 0.4,
          fontSize: 20,
          bold: true,
          color: primaryColor,
        })

        const p = data.portfolio
        
        // Narrative Card on the Left
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5,
          y: 1.6,
          w: 5.5,
          h: 4.5,
          fill: { type: 'solid', color: '1e293b' },
          line: { color: primaryColor, width: 2 },
        })

        slide.addText('BRANDED RISK LEVEL', {
          x: 0.8,
          y: 1.9,
          w: 4.9,
          h: 0.3,
          fontSize: 9,
          color: '94A3B8',
          bold: true,
        })

        slide.addText(`${p?.risk || 'Balanced'} Allocation`, {
          x: 0.8,
          y: 2.3,
          w: 4.9,
          h: 0.5,
          fontSize: 22,
          bold: true,
          color: 'ffffff',
        })

        slide.addText(
          slideItem.content || 'This strategic target is structured to optimize capital efficiency. High equities alignment ensures growth captures market run-ups, while balanced debt cushions against drawdown volatility.',
          {
            x: 0.8,
            y: 3.0,
            w: 4.9,
            h: 2.5,
            fontSize: 11,
            color: 'cbd5e1',
            lineSpacing: 1.4,
          }
        )

        // Native Doughnut Chart on the Right
        const allocations = data.persona === 'young-investor'
          ? [
              { name: 'US Equities (Tech focus)', value: 60 },
              { name: 'Int\'l Equities (Growth)', value: 20 },
              { name: 'Alternatives / Crypto', value: 15 },
              { name: 'Cash / Liquid Bonds', value: 5 },
            ]
          : data.persona === 'family-planner'
          ? [
              { name: 'US Equities (Core & Div)', value: 40 },
              { name: 'Int\'l Stocks', value: 20 },
              { name: 'Fixed Income (Bonds)', value: 30 },
              { name: 'Alternatives (Real Estate)', value: 10 },
            ]
          : [
              { name: 'US Defensive Stocks', value: 30 },
              { name: 'High-Yield Dividend Funds', value: 20 },
              { name: 'Long-Term Treasury Bonds', value: 40 },
              { name: 'Cash Reserves', value: 10 },
            ]

        const chartData = [
          {
            name: 'Allocation',
            labels: allocations.map((a) => a.name),
            values: allocations.map((a) => a.value),
          },
        ]

        slide.addChart(pptx.ChartType.doughnut, chartData, {
          x: 6.5,
          y: 1.6,
          w: 6.3,
          h: 4.5,
          showLegend: true,
          legendPos: 'b',
          legendColor: 'ffffff',
          legendFontSize: 9,
          chartColors: [primaryColor, secondaryColor, 'a78bfa', '94a3b8'],
          holeSize: 55,
        })
        break
      }

      case 'timeline': {
        slide.addText(slideItem.title || 'Historical Wealth Growth', {
          x: 0.5,
          y: 0.8,
          w: 10.0,
          h: 0.4,
          fontSize: 20,
          bold: true,
          color: primaryColor,
        })

        const p = data.portfolio
        if (!p) break

        // Left Panel cards
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.5,
          y: 1.8,
          w: 4.5,
          h: 1.8,
          fill: { type: 'solid', color: '1e293b' },
          line: { color: '334155', width: 1 },
        })
        slide.addText('INITIAL PORTFOLIO VALUE', { x: 0.7, y: 2.0, w: 4.1, h: 0.2, fontSize: 8, color: '94A3B8' })
        slide.addText(`$${(p.wealthData[0]?.value || 0).toLocaleString()}`, { x: 0.7, y: 2.3, w: 4.1, h: 0.5, fontSize: 20, bold: true, color: 'ffffff' })
        slide.addText(`As of ${p.wealthData[0]?.year || '2020'}`, { x: 0.7, y: 2.9, w: 4.1, h: 0.2, fontSize: 8, color: '64748B' })

        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.5,
          y: 4.0,
          w: 4.5,
          h: 1.8,
          fill: { type: 'solid', color: '1e293b' },
          line: { color: '334155', width: 1 },
        })
        slide.addText('CURRENT PORTFOLIO VALUE', { x: 0.7, y: 4.2, w: 4.1, h: 0.2, fontSize: 8, color: '94A3B8' })
        slide.addText(`$${p.current.toLocaleString()}`, { x: 0.7, y: 4.5, w: 4.1, h: 0.5, fontSize: 20, bold: true, color: primaryColor })
        slide.addText(`As of ${p.wealthData[p.wealthData.length - 1]?.year || '2025'}`, { x: 0.7, y: 5.1, w: 4.1, h: 0.2, fontSize: 8, color: '64748B' })

        // Right side data table
        const timelineTableBody = [
          [
            { text: 'Year', options: { fill: { color: '0f172a' }, color: '94A3B8', bold: true } },
            { text: 'Value', options: { fill: { color: '0f172a' }, color: '94A3B8', bold: true, align: 'right' as const } },
            { text: 'YoY Growth', options: { fill: { color: '0f172a' }, color: '94A3B8', bold: true, align: 'right' as const } },
          ],
          ...p.wealthData.map((row, idx) => {
            const prev = idx > 0 ? p.wealthData[idx - 1].value : row.value
            const growth = idx > 0 ? `${((row.value - prev) / prev * 100).toFixed(1)}%` : '-'
            return [
              { text: row.year, options: { fill: { color: '1e293b' }, color: 'ffffff' } },
              { text: `$${row.value.toLocaleString()}`, options: { fill: { color: '1e293b' }, color: 'ffffff', align: 'right' as const, bold: true } },
              { text: growth, options: { fill: { color: '1e293b' }, color: growth !== '-' ? '34D399' : 'ffffff', align: 'right' as const } },
            ]
          }),
        ]

        slide.addTable(timelineTableBody, {
          x: 5.6,
          y: 1.8,
          w: 7.2,
          h: 4.0,
          border: { type: 'solid', color: '334155', pt: 1 },
          fontSize: 10,
        })
        addAdvisorNote(slide, slideItem.content, primaryColor, pptx)
        break
      }

      case 'montecarlo': {
        slide.addText(slideItem.title || 'Monte Carlo Simulation & Target Success', {
          x: 0.5,
          y: 0.8,
          w: 10.0,
          h: 0.4,
          fontSize: 20,
          bold: true,
          color: primaryColor,
        })

        const mc = data.monteCarlo
        if (!mc) break
        const lastRow = mc.chartData[mc.chartData.length - 1] || {}

        // Left Panel success probability card
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.5,
          y: 1.8,
          w: 5.0,
          h: 4.0,
          fill: { type: 'solid', color: '1e293b' },
          line: { color: primaryColor, width: 2 },
        })

        slide.addText('PROBABILITY OF MEETING GOAL', {
          x: 0.7,
          y: 2.2,
          w: 4.6,
          h: 0.3,
          fontSize: 10,
          color: '94A3B8',
          bold: true,
          align: 'center',
        })

        slide.addText(`${mc.probability}%`, {
          x: 0.7,
          y: 2.7,
          w: 4.6,
          h: 1.2,
          fontSize: 54,
          bold: true,
          color: mc.probability >= 70 ? '34D399' : 'FBBF24',
          align: 'center',
        })

        slide.addText(`Current Portfolio Value: $${mc.current.toLocaleString()}\nTarget Wealth Goal: $${mc.goal.toLocaleString()}`, {
          x: 0.7,
          y: 4.2,
          w: 4.6,
          h: 0.8,
          fontSize: 10,
          color: 'cbd5e1',
          align: 'center',
          lineSpacing: 1.3,
        })

        // Right side scenarios endpoints table
        const mcTable = [
          [
            { text: 'Scenario Path', options: { fill: { color: '0f172a' }, color: '94A3B8', bold: true } },
            { text: 'Ending Value (10 Years)', options: { fill: { color: '0f172a' }, color: '94A3B8', bold: true, align: 'right' as const } },
          ],
          [
            { text: 'Optimistic (95th Percentile)', options: { fill: { color: '1e293b' }, color: 'ffffff' } },
            { text: `$${(lastRow.best || 0).toLocaleString()}`, options: { fill: { color: '1e293b' }, color: '34D399', align: 'right' as const, bold: true } },
          ],
          [
            { text: 'Median Scenario (50th Percentile)', options: { fill: { color: '1e293b' }, color: 'ffffff' } },
            { text: `$${(lastRow.median || 0).toLocaleString()}`, options: { fill: { color: '1e293b' }, color: primaryColor, align: 'right' as const, bold: true } },
          ],
          [
            { text: 'Conservative Scenario (25th Percentile)', options: { fill: { color: '1e293b' }, color: 'ffffff' } },
            { text: `$${(lastRow.conservative || 0).toLocaleString()}`, options: { fill: { color: '1e293b' }, color: 'ffffff', align: 'right' as const, bold: true } },
          ],
          [
            { text: 'Pessimistic Scenario (5th Percentile)', options: { fill: { color: '1e293b' }, color: 'ffffff' } },
            { text: `$${(lastRow.pessimistic || 0).toLocaleString()}`, options: { fill: { color: '1e293b' }, color: 'F87171', align: 'right' as const, bold: true } },
          ],
        ]

        slide.addTable(mcTable, {
          x: 6.0,
          y: 1.8,
          w: 6.8,
          h: 4.0,
          border: { type: 'solid', color: '334155', pt: 1 },
          fontSize: 10,
        })
        addAdvisorNote(slide, slideItem.content, primaryColor, pptx)
        break
      }

      case 'insights': {
        slide.addText(slideItem.title || 'AI-Powered Investment Analysis', {
          x: 0.5,
          y: 0.8,
          w: 10.0,
          h: 0.4,
          fontSize: 20,
          bold: true,
          color: primaryColor,
        })

        const p = data.portfolio
        const insightText = slideItem.content || p?.insight || 'No insights compiled yet. Please load dynamic persona data.'

        // Large quote shape background
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.5,
          y: 1.8,
          w: 12.3,
          h: 4.0,
          fill: { type: 'solid', color: '1e293b' },
          line: { color: '334155', width: 1 },
        })

        // Quote marks
        slide.addText('“', {
          x: 0.8,
          y: 2.0,
          w: 1.0,
          h: 0.5,
          fontSize: 48,
          bold: true,
          color: primaryColor,
        })

        slide.addText('EXECUTIVE PORTFOLIO SUMMARY', {
          x: 1.2,
          y: 2.2,
          w: 10.0,
          h: 0.4,
          fontSize: 12,
          bold: true,
          color: primaryColor,
        })

        slide.addText(insightText, {
          x: 1.2,
          y: 2.7,
          w: 10.8,
          h: 2.8,
          fontSize: 14,
          color: 'e2e8f0',
          fontFace: 'Arial',
          italic: true,
          lineSpacing: 1.4,
        })
        break
      }

      case 'custom': {
        slide.addText(slideItem.title || 'Market Summary & Review', {
          x: 0.5,
          y: 0.8,
          w: 10.0,
          h: 0.4,
          fontSize: 20,
          bold: true,
          color: primaryColor,
        })

        const lines = slideItem.content ? slideItem.content.split('\n').filter((l) => l.trim()) : []
        
        if (lines.length > 0) {
          // Render bullets
          const textObjects = lines.map((line) => {
            const cleanLine = line.startsWith('-') || line.startsWith('•') ? line.substring(1).trim() : line
            return {
              text: cleanLine,
              options: { bullet: true, indentLevel: 0, fontSize: 13, color: 'ffffff' },
            }
          })

          slide.addText(textObjects, {
            x: 0.8,
            y: 1.8,
            w: 11.5,
            h: 4.5,
            lineSpacing: 1.5,
          })
        } else {
          slide.addText('No content provided for this slide.', {
            x: 0.8,
            y: 1.8,
            w: 11.5,
            h: 1.0,
            fontSize: 12,
            color: '64748B',
            italic: true,
          })
        }
        break
      }
    }
  })

  // Write file to trigger client-side download
  const filename = `${branding.clientName.replace(/\s+/g, '_') || 'Client'}_Investment_Presentation.pptx`
  await pptx.writeFile({ fileName: filename })
}
