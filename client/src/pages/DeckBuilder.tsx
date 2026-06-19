import React, { useState, useEffect } from 'react'
import { useAppStore, SlideItem } from '../store/useAppStore'
import {
  BrandingConfig,
  CoverSlide,
  MetricsSlide,
  HoldingsSlide,
  RiskSlide,
  TimelineSlide,
  MonteCarloSlide,
  InsightsSlide,
  CustomTextSlide
} from '../components/deck/SlideTemplates'
import { exportDeckToPPTX } from '../utils/pptxExport'
import { ChevronUp, ChevronDown, Trash2, Printer, Download, Upload, UserPlus, Play, Pause, X, Sparkles, Library, GitFork, FileOutput, Layers } from 'lucide-react'


const PRESET_THEMES = [
  {
    themeName: 'Quarterly Review (Blue)',
    backgroundColor: '#1e40af',
    textColor: '#ffffff',
    primaryColor: '#38bdf8',
    secondaryColor: '#60a5fa',
    fontFamily: 'Outfit',
  },
  {
    themeName: 'Risk Assessment (Green)',
    backgroundColor: '#065f46',
    textColor: '#ffffff',
    primaryColor: '#10b981',
    secondaryColor: '#34d399',
    fontFamily: 'Outfit',
  },
  {
    themeName: 'Retirement Strategy (Navy)',
    backgroundColor: '#1e3a5f',
    textColor: '#ffffff',
    primaryColor: '#2563EB',
    secondaryColor: '#3b82f6',
    fontFamily: 'Inter',
  },
  {
    themeName: 'Investment Recommendations (Indigo)',
    backgroundColor: '#0c1445',
    textColor: '#ffffff',
    primaryColor: '#1e40af',
    secondaryColor: '#6366f1',
    fontFamily: 'Inter',
  },
  {
    themeName: 'Annual Performance (Sky)',
    backgroundColor: '#1e40af',
    textColor: '#ffffff',
    primaryColor: '#60a5fa',
    secondaryColor: '#93c5fd',
    fontFamily: 'Outfit',
  },
  {
    themeName: 'Portfolio Rebalance (Mint)',
    backgroundColor: '#065f46',
    textColor: '#ffffff',
    primaryColor: '#34d399',
    secondaryColor: '#6ee7b7',
    fontFamily: 'Plus Jakarta Sans',
  },
  {
    themeName: 'Tax Optimization (Ocean)',
    backgroundColor: '#1e3a5f',
    textColor: '#ffffff',
    primaryColor: '#3b82f6',
    secondaryColor: '#93c5fd',
    fontFamily: 'Outfit',
  },
  {
    themeName: 'Client Onboarding (Purple)',
    backgroundColor: '#0c1445',
    textColor: '#ffffff',
    primaryColor: '#6366f1',
    secondaryColor: '#a78bfa',
    fontFamily: 'Outfit',
  }
]
const DeckBuilder = () => {
  const {
    selectedPersona,
    portfolioData,
    holdings,
    metrics,
    monteCarlo,
    fetchDashboardData,
    setPersona,

    deckBuilderStep,
    setDeckBuilderStep,
    selectedTemplate,
    setSelectedTemplate,

    // Global Slide deck state and operations
    deck,
    setDeck,
    selectedSlideId,
    setSelectedSlideId,
    addSlide,
    deleteSlide,
    moveSlide,
    updateSlideNotes,
    updateCustomSlideContent,
    updateSpecificSlideContent,
    resetDeckForTemplate,

    // Client Management
    clients,
    selectedClient,
    selectClient,
    importClientsFromCSV,
  } = useAppStore()

  // Make sure we have data loaded for the selected persona
  useEffect(() => {
    if (deckBuilderStep === 'workspace') {
      fetchDashboardData(selectedPersona)
    }
  }, [selectedPersona, deckBuilderStep])

  // Template Configuration form states
  const [reportingPeriod, setReportingPeriod] = useState<string>('Q1 2026 (January - March 2026)')
  const [focusAreas, setFocusAreas] = useState<string>('Portfolio performance, asset allocation review, risk assessment')
  const [meetingObjective, setMeetingObjective] = useState<string>('Review Q1 performance and discuss Q2 strategy')
  const [additionalNotes, setAdditionalNotes] = useState<string>('')
  
  // Presentation inclusion slide flags
  const [includeCharts, setIncludeCharts] = useState<boolean>(true)
  const [includeBenchmark, setIncludeBenchmark] = useState<boolean>(true)
  const [includeMarketOutlook, setIncludeMarketOutlook] = useState<boolean>(true)

  // Dynamically update default values based on selected template
  useEffect(() => {
    if (!selectedTemplate) return
    
    if (selectedTemplate.includes('Quarterly') || selectedTemplate.includes('Q1') || selectedTemplate.includes('Q2')) {
      setReportingPeriod('Q1 2026 (January - March 2026)')
      setFocusAreas('Portfolio performance, asset allocation review, risk assessment')
      setMeetingObjective('Review Q1 performance and discuss Q2 strategy')
    } else if (selectedTemplate.includes('Performance') || selectedTemplate.includes('Annual')) {
      setReportingPeriod('Last 12 Months (YTD)')
      setFocusAreas('Asset class allocation, benchmark comparisons, fee analysis')
      setMeetingObjective('Evaluate historical returns and portfolio composition')
    } else if (selectedTemplate.includes('Retirement')) {
      setReportingPeriod('2026 - 2046 Projection')
      setFocusAreas('Monte Carlo probability, monthly drawdowns, inflation protection')
      setMeetingObjective('Assess retirement readiness and income safety margin')
    } else if (selectedTemplate.includes('Risk')) {
      setReportingPeriod('Current Portfolio Allocation')
      setFocusAreas('Stress testing, volatility analysis, correlation report')
      setMeetingObjective('Validate risk thresholds and downside protection limits')
    } else {
      setReportingPeriod('Next 12 Months')
      setFocusAreas('Sector allocation recommendations, rebalancing strategy')
      setMeetingObjective('Outline investment proposal and capital deployment targets')
    }
  }, [selectedTemplate])

  const handleClientSelect = async (client: import('../store/useAppStore').Client) => {
    selectClient(client)
    // Update branding with client's name!
    setBranding(prev => ({
      ...prev,
      clientName: client.name,
      footerText: `Alexander Forbes Engage · Prepared for ${client.name}`,
    }))
    
    if (selectedTemplate === 'Custom Canvas') {
      setDeckBuilderStep('generating')
      resetDeckForTemplate('custom')
      setTimeout(() => {
        // Log activity
        fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'deck_generate',
            title: 'Custom Slide Deck Created',
            description: `Started new custom blank canvas deck for ${client.name}.`,
            metadata: { clientId: client.id, clientName: client.name }
          })
        }).catch(err => console.error(err))
        
        setDeckBuilderStep('workspace')
      }, 4000)
    } else {
      setDeckBuilderStep('template-config')
    }
  }

  const handleGeneratePresentation = () => {
    setDeckBuilderStep('generating')
    
    // Initialize standard deck
    resetDeckForTemplate('fixed')
    
    setTimeout(() => {
      // Get current deck from store
      const currentDeck = useAppStore.getState().deck
      
      // Map/filter deck based on template config values
      let finalSlides = [...currentDeck]
      
      // 1. Cover slide update
      finalSlides = finalSlides.map(s => {
        if (s.type === 'cover') {
          return {
            ...s,
            title: selectedTemplate || 'Client Review',
            content: `${selectedClient?.name || 'Client'} · ${reportingPeriod}`,
            notes: `Meeting Objective: ${meetingObjective}\nFocus Areas: ${focusAreas}\n\nNotes: ${additionalNotes}`
          }
        }
        if (s.type === 'insights') {
          return {
            ...s,
            content: `• Objective: ${meetingObjective}\n• Key Focus: ${focusAreas}\n• Focus Areas: Portfolio optimization under the ${selectedClient?.persona || 'balanced'} strategy.`
          }
        }
        return s
      })
      
      // 2. Checkbox filters
      if (!includeCharts) {
        finalSlides = finalSlides.filter(s => s.type !== 'metrics' && s.type !== 'montecarlo')
      }
      if (!includeBenchmark) {
        finalSlides = finalSlides.filter(s => s.type !== 'holdings')
      }
      if (!includeMarketOutlook) {
        finalSlides = finalSlides.filter(s => s.type !== 'timeline' && s.type !== 'risk')
      }
      
      // Update store deck
      useAppStore.setState({
        deck: finalSlides,
        selectedSlideId: finalSlides[0]?.id || '1'
      })
      
      // Log activity
      fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'deck_generate',
          title: 'Slide Deck Generated',
          description: `Generated ${selectedTemplate} presentation with custom config for ${selectedClient?.name}.`,
          metadata: { clientId: selectedClient?.id, clientName: selectedClient?.name }
        })
      }).catch(err => console.error(err))
      
      // Move to workspace
      setDeckBuilderStep('workspace')
    }, 4000)
  }

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (text) {
        importClientsFromCSV(text)
      }
    }
    reader.readAsText(file)
  }

  const downloadCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Age,Persona,Portfolio Value,Goal,Sharpe,Volatility\n"
      + "Pratik Forbes,35,family-planner,320000,750000,1.55,10.4\n"
      + "Sipho Khumalo,58,retirement-client,1250000,1800000,1.15,6.2\n"
      + "Zama Naidoo,26,young-investor,85000,300000,2.05,24.1";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "af_clients_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const [isDrafting, setIsDrafting] = useState<boolean>(false)
  const [isBulkDrafting, setIsBulkDrafting] = useState<boolean>(false)
  const [isEditingInline, setIsEditingInline] = useState<boolean>(false)
  const [inlineTitle, setInlineTitle] = useState<string>('')
  const [inlineContent, setInlineContent] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'content' | 'branding' | 'data'>('content')

  // AI custom prompt and refinement states
  const [customSlidePrompt, setCustomSlidePrompt] = useState<string>('')
  const [refineInstruction, setRefineInstruction] = useState<string>('')
  const [isRefining, setIsRefining] = useState<boolean>(false)

  // AI Theme Studio states
  const [themePrompt, setThemePrompt] = useState<string>('')
  const [generatedTheme, setGeneratedTheme] = useState<null | {
    themeName: string
    backgroundColor: string
    textColor: string
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    rationale?: string
  }>(null)
  const [isGeneratingTheme, setIsGeneratingTheme] = useState<boolean>(false)

  // Presenter Mode states
  const [isPresenting, setIsPresenting] = useState<boolean>(false)
  const [presentationIndex, setPresentationIndex] = useState<number>(0)
  const [isAutoplay, setIsAutoplay] = useState<boolean>(false)
  const [autoplaySpeed, setAutoplaySpeed] = useState<number>(5000)

  // Keyboard navigation for Presenter Mode
  useEffect(() => {
    if (!isPresenting) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        setPresentationIndex((prev) => (prev < deck.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setPresentationIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setIsPresenting(false)
        setIsAutoplay(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPresenting, deck.length])

  // Autoplay slideshow timer
  useEffect(() => {
    if (!isPresenting || !isAutoplay) return

    const interval = setInterval(() => {
      setPresentationIndex((prev) => (prev < deck.length - 1 ? prev + 1 : 0))
    }, autoplaySpeed)

    return () => clearInterval(interval)
  }, [isPresenting, isAutoplay, autoplaySpeed, deck.length])

  // Branding configuration
  const [branding, setBranding] = useState<BrandingConfig>({
    themeName: 'Quarterly Review (Blue)',
    backgroundColor: '#1e40af',
    textColor: '#ffffff',
    primaryColor: '#38bdf8',
    secondaryColor: '#60a5fa',
    clientName: 'Margaret Chen',
    logoPreset: 'standard',
    logoUrl: '',
    footerText: 'Alexander Forbes Engage · Prepared for Margaret Chen',
    fontFamily: 'Outfit',
  })

  // Sync branding client name whenever the selected client changes (e.g. navigating from Clients page)
  useEffect(() => {
    if (selectedClient) {
      setBranding(prev => ({
        ...prev,
        clientName: selectedClient.name,
        footerText: `Alexander Forbes Engage · Prepared for ${selectedClient.name}`,
      }))
    }
  }, [selectedClient?.id])

  // Theme application
  const applyPresetTheme = (theme: typeof PRESET_THEMES[0]) => {
    setBranding((prev) => ({
      ...prev,
      themeName: theme.themeName,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      fontFamily: theme.fontFamily,
    }))
  }

  const selectedSlide = deck.find((s) => s.id === selectedSlideId) || deck[0]

  // Brand Comparison Mode
  const [showBrandComparison, setShowBrandComparison] = useState<boolean>(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false)

  const whiteLabelBranding: BrandingConfig = {
    themeName: 'White Label Corporate',
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    primaryColor: '#1e3a8a',
    secondaryColor: '#3b82f6',
    clientName: branding.clientName,
    logoPreset: 'premium',
    logoUrl: '',
    footerText: `Prepared by Your Wealth Adviser · ${branding.clientName} · Confidential`,
    fontFamily: 'Inter',
  }

  // One-Click Report: rebuild deck + AI commentary + export PPTX
  const handleOneClickReport = async () => {
    setIsGeneratingReport(true)
    try {
      // Ensure all standard slide bricks are present
      const standardTypes: SlideItem['type'][] = ['cover', 'metrics', 'holdings', 'risk', 'timeline', 'montecarlo', 'insights']
      const missingTypes = standardTypes.filter(t => !deck.some(s => s.type === t))
      missingTypes.forEach(t => addSlide(t))

      // AI-draft the insights slide
      const res = await fetch('/api/copilot/generate-commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideType: 'insights',
          persona: selectedPersona,
          metrics,
          holdings,
          clientName: branding.clientName,
        }),
      })
      const data = await res.json()
      if (data?.draft) {
        updateSpecificSlideContent('insights', 'content', data.draft)
      }

      // Export PPTX
      await handleExportPPTX()
    } catch (e) {
      console.error('One-click report failed', e)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleGenerateAIDraft = async () => {
    if (!selectedSlide) return
    setIsDrafting(true)
    try {
      const response = await fetch('/api/copilot/generate-commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideType: selectedSlide.type,
          persona: selectedPersona,
          metrics,
          holdings,
          clientName: branding.clientName,
          customPrompt: selectedSlide.type === 'custom' ? customSlidePrompt : undefined,
        }),
      })
      const data = await response.json()
      if (data && data.draft) {
        updateCustomSlideContent('content', data.draft)
        if (isEditingInline) {
          setInlineContent(data.draft)
        }
      }
    } catch (err) {
      console.error('Failed to generate AI draft', err)
    } finally {
      setIsDrafting(false)
    }
  }

  const handleRefineCommentary = async (instruction: string) => {
    if (!selectedSlide) return
    setIsRefining(true)
    try {
      const response = await fetch('/api/copilot/refine-commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedSlide.content || '',
          instruction,
          persona: selectedPersona,
          metrics,
          holdings,
        }),
      })
      const data = await response.json()
      if (data && data.draft) {
        updateCustomSlideContent('content', data.draft)
        if (isEditingInline) {
          setInlineContent(data.draft)
        }
      }
    } catch (err) {
      console.error('Failed to refine commentary', err)
    } finally {
      setIsRefining(false)
    }
  }

  const handleGenerateTheme = async () => {
    if (!themePrompt.trim()) return
    setIsGeneratingTheme(true)
    setGeneratedTheme(null)
    try {
      const res = await fetch('/api/copilot/generate-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: themePrompt,
          clientName: branding.clientName,
          persona: selectedPersona,
        }),
      })
      const data = await res.json()
      if (data?.theme) {
        setGeneratedTheme(data.theme)
      }
    } catch (err) {
      console.error('Theme generation failed', err)
    } finally {
      setIsGeneratingTheme(false)
    }
  }

  const applyGeneratedTheme = () => {
    if (!generatedTheme) return
    setBranding(prev => ({
      ...prev,
      themeName: generatedTheme.themeName,
      backgroundColor: generatedTheme.backgroundColor,
      textColor: generatedTheme.textColor,
      primaryColor: generatedTheme.primaryColor,
      secondaryColor: generatedTheme.secondaryColor,
      fontFamily: generatedTheme.fontFamily,
    }))
    // Apply to all slides too
    setDeck(deck.map((s: import('../store/useAppStore').SlideItem) => ({
      ...s,
      backgroundColor: generatedTheme.backgroundColor,
      textColor: generatedTheme.textColor,
      primaryColor: generatedTheme.primaryColor,
      secondaryColor: generatedTheme.secondaryColor,
      fontFamily: generatedTheme.fontFamily,
    })))
    setGeneratedTheme(null)
    setThemePrompt('')
  }

  // Sync inline edit state with current slide selection
  useEffect(() => {
    if (selectedSlide) {
      setInlineTitle(selectedSlide.title || '')
      setInlineContent(selectedSlide.content || '')
    }
    setIsEditingInline(false)
  }, [selectedSlideId])

  const handleSaveInline = () => {
    updateCustomSlideContent('title', inlineTitle)
    updateCustomSlideContent('content', inlineContent)
    setIsEditingInline(false)
  }

  const handleGenerateAllSlides = async () => {
    setIsBulkDrafting(true)
    try {
      const response = await fetch('/api/copilot/generate-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deck,
          persona: selectedPersona,
          metrics,
          holdings,
          clientName: branding.clientName,
        }),
      })
      const data = await response.json()
      if (data && data.drafts) {
        const updatedDeck = deck.map(slide => {
          if (data.drafts[slide.id]) {
            return {
              ...slide,
              content: data.drafts[slide.id]
            }
          }
          return slide
        })
        setDeck(updatedDeck)
      }
    } catch (err) {
      console.error('Failed to generate bulk drafts', err)
    } finally {
      setIsBulkDrafting(false)
    }
  }


  // PPTX Export Trigger
  const handleExportPPTX = async () => {
    try {
      await exportDeckToPPTX(deck, branding, {
        persona: selectedPersona,
        portfolio: portfolioData,
        holdings,
        metrics,
        monteCarlo,
      })
    } catch (e) {
      console.error('Failed to export presentation', e)
    }
  }

  // Print PDF Trigger
  const handleExportPDF = () => {
    window.print()
  }

  // Render preview slide component
  const renderSlidePreview = (slideItem: SlideItem) => {
    const props = {
      branding,
      personaData: {
        persona: selectedPersona,
        portfolio: portfolioData,
        holdings,
        metrics,
        monteCarlo,
      },
      customTitle: slideItem.title,
      customContent: slideItem.content,
    }

    switch (slideItem.type) {
      case 'cover':
        return <CoverSlide {...props} />
      case 'metrics':
        return <MetricsSlide {...props} />
      case 'holdings':
        return <HoldingsSlide {...props} />
      case 'risk':
        return <RiskSlide {...props} />
      case 'timeline':
        return <TimelineSlide {...props} />
      case 'montecarlo':
        return <MonteCarloSlide {...props} />
      case 'insights':
        return <InsightsSlide {...props} />
      case 'custom':
        return <CustomTextSlide {...props} />
      default:
        return <div>Slide template not found</div>
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      color: '#0F172A',
      paddingBottom: 40,
    }}>
      {/* Global Print Styling Injection */}
      <style>{`
        @media print {
          /* Force backgrounds and colors to print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide normal screen items */
          #screen-root, nav, footer, button, select, input, textarea, .no-print {
            display: none !important;
          }
          /* Show print items */
          #print-root {
            display: block !important;
            background: ${branding.backgroundColor} !important;
            color: ${branding.textColor} !important;
            width: 100% !important;
            height: auto !important;
          }
          .print-page {
            width: 11in;
            height: 6.18in; /* 16:9 standard US letter size */
            page-break-after: always;
            box-sizing: border-box;
            overflow: hidden;
            display: block !important;
          }
          /* Reset margins */
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            margin: 0;
            background: ${branding.backgroundColor} !important;
          }
        }
        @media screen {
          #print-root {
            display: none;
          }
        }
      `}</style>

      {/* Screen Layout wrapper */}
      <div id="screen-root" className="page-container-wide">

        {deckBuilderStep !== 'workspace' ? (
          <div className="wizard-screen">
            {deckBuilderStep === 'start' && (
              <div style={{ animation: 'fadeIn 0.25s ease' }}>
                {/* Deck Library Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Deck Library</h1>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>8 presentations across all clients</p>
                  </div>
                  <button
                    onClick={() => {
                      selectClient(null)
                      setDeckBuilderStep('creation-mode')
                    }}
                    style={{
                      padding: '10px 18px', background: '#2563EB', color: '#FFFFFF',
                      border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13.5,
                      display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
                    onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
                  >
                    + Create New Deck
                  </button>
                </div>

                {/* Search + Filter bar */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F1F5F9', padding: '8px 14px', borderRadius: 8, flex: 1, maxWidth: 280 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <span style={{ fontSize: 13, color: '#94A3B8' }}>Search decks...</span>
                  </div>
                  <button style={{ padding: '8px 14px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    Filter by Type
                  </button>
                </div>

                {/* Deck Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                  {[
                    { title: 'Q1 2026 Portfolio Review', client: 'Margaret Chen', type: 'Quarterly Review', status: 'Completed', slides: 18, date: 'Jun 9, 2026', color1: '#1e40af', color2: '#3b82f6' },
                    { title: 'Risk Assessment — Growth Portfolio', client: 'Robert Harrington', type: 'Risk Assessment', status: 'In Review', slides: 12, date: 'Jun 1, 2026', color1: '#065f46', color2: '#10b981' },
                    { title: 'Retirement Planning Strategy 2026', client: 'Patricia Sullivan', type: 'Retirement Planning', status: 'Draft', slides: 9, date: 'May 22, 2026', color1: '#1e3a5f', color2: '#2563EB' },
                    { title: 'Investment Recommendations Q2', client: 'James Okonkwo', type: 'Investment', status: 'Completed', slides: 15, date: 'May 18, 2026', color1: '#0c1445', color2: '#1e40af' },
                    { title: 'Annual Performance Review', client: 'Sarah Kowalski', type: 'Performance', status: 'Completed', slides: 22, date: 'May 9, 2026', color1: '#1e40af', color2: '#60a5fa' },
                    { title: 'Portfolio Rebalancing Proposal', client: 'David Kim', type: 'Portfolio', status: 'Completed', slides: 14, date: 'May 1, 2026', color1: '#065f46', color2: '#34d399' },
                    { title: 'Tax Optimization Strategy', client: 'Linda Nakamura', type: 'Tax Planning', status: 'In Review', slides: 11, date: 'Apr 25, 2026', color1: '#1e3a5f', color2: '#3b82f6' },
                    { title: 'New Client Onboarding Deck', client: 'Thomas Reyes', type: 'Onboarding', status: 'Draft', slides: 8, date: 'Apr 15, 2026', color1: '#0c1445', color2: '#6366f1' },
                  ].map((deck, i) => {
                    const statusColors: Record<string, {bg: string, color: string}> = {
                      'Completed': { bg: '#D1FAE5', color: '#059669' },
                      'In Review': { bg: '#FEF3C7', color: '#D97706' },
                      'Draft':     { bg: '#F1F5F9', color: '#64748B' },
                    }
                    const sc = statusColors[deck.status]
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          const client = clients.find(c => c.name === deck.client)
                          if (client) {
                            selectClient(client)
                          }
                          const secondaryColor = {
                            '#3b82f6': '#60a5fa',
                            '#10b981': '#34d399',
                            '#2563EB': '#3b82f6',
                            '#1e40af': '#60a5fa',
                            '#60a5fa': '#93c5fd',
                            '#34d399': '#6ee7b7',
                            '#6366f1': '#a78bfa',
                          }[deck.color2] || '#ffffff'

                          setBranding({
                            themeName: deck.title + " Theme",
                            backgroundColor: deck.color1,
                            textColor: '#ffffff',
                            primaryColor: deck.color2,
                            secondaryColor: secondaryColor,
                            clientName: deck.client,
                            logoPreset: 'standard',
                            logoUrl: '',
                            footerText: `Alexander Forbes Engage · Prepared for ${deck.client}`,
                            fontFamily: 'Outfit',
                          })
                          setSelectedTemplate(deck.type)
                          resetDeckForTemplate('fixed')
                          setDeckBuilderStep('generating')
                          setTimeout(() => {
                            setDeckBuilderStep('workspace')
                          }, 4000)
                        }}
                        style={{
                          background: '#FFFFFF', border: '1px solid #E2E8F0',
                          borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                          transition: 'all 0.2s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none' }}
                      >
                        {/* Thumbnail Preview */}
                        <div style={{
                          height: 130, background: `linear-gradient(135deg, ${deck.color1}, ${deck.color2})`,
                          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                          padding: '12px 14px', position: 'relative', overflow: 'hidden'
                        }}>
                          {/* Slide preview lines */}
                          <div style={{ position: 'absolute', bottom: 16, left: 14, right: 14 }}>
                            <div style={{ height: 2, background: 'rgba(255,255,255,0.4)', borderRadius: 2, marginBottom: 6 }} />
                            <div style={{ height: 2, background: 'rgba(255,255,255,0.25)', borderRadius: 2, width: '70%', marginBottom: 6 }} />
                            <div style={{ height: 2, background: 'rgba(255,255,255,0.15)', borderRadius: 2, width: '50%' }} />
                          </div>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <div style={{ width: 6, height: 6, borderRadius: 1, background: 'rgba(255,255,255,0.6)' }} />
                            <div style={{ width: 6, height: 6, borderRadius: 1, background: 'rgba(255,255,255,0.4)' }} />
                          </div>
                          <button style={{ background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: 4, color: '#fff', padding: '2px 6px', fontSize: 10, cursor: 'pointer' }}>···</button>
                        </div>
                        {/* Card metadata */}
                        <div style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginBottom: 4, lineHeight: 1.3 }}>{deck.title}</div>
                          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>{deck.client}</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#EFF6FF', color: '#2563EB', fontWeight: 600 }}>{deck.type}</span>
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color, fontWeight: 600 }}>{deck.status}</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 10, display: 'flex', gap: 10 }}>
                            <span>{deck.slides} slides</span>
                            <span>·</span>
                            <span>{deck.date}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {deckBuilderStep === 'creation-mode' && (
              <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', animation: 'fadeIn 0.25s ease' }}>
                {/* Back button */}
                <button
                  onClick={() => setDeckBuilderStep('start')}
                  style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, padding: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#0F172A'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  Back to Library
                </button>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Create New Presentation</h2>
                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 32 }}>
                  Select how you want to build this presentation. You can use a prebuilt template or start from scratch.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {/* Card 1: Use Template */}
                  <div
                    onClick={() => {
                      setDeckBuilderStep('template-selection')
                    }}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 16,
                      padding: 32,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#2563EB'
                      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(37,99,235,0.1), 0 8px 10px -6px rgba(37,99,235,0.05)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#E2E8F0'
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)'
                      e.currentTarget.style.transform = 'none'
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: 'rgba(37,99,235,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#2563EB', fontSize: 24,
                    }}>
                      <Layers size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Use Prebuilt Template</h3>
                      <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                        Start with a structured, advisor-approved template layout like Quarterly Review, Portfolio Performance, or Retirement Strategy.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                      <span style={{ fontSize: 10.5, padding: '3px 8px', borderRadius: 4, background: '#EFF6FF', color: '#2563EB', fontWeight: 600 }}>Fast Onboarding</span>
                      <span style={{ fontSize: 10.5, padding: '3px 8px', borderRadius: 4, background: '#EFF6FF', color: '#2563EB', fontWeight: 600 }}>AI Narrative</span>
                    </div>
                  </div>

                  {/* Card 2: Create Custom Deck */}
                  <div
                    onClick={() => {
                      setSelectedTemplate('Custom Canvas')
                      handleGeneratePresentation()
                    }}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 16,
                      padding: 32,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#10B981'
                      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(16,185,129,0.1), 0 8px 10px -6px rgba(16,185,129,0.05)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#E2E8F0'
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)'
                      e.currentTarget.style.transform = 'none'
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: 'rgba(16,185,129,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#10B981', fontSize: 24,
                    }}>
                      <GitFork size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Create Custom Deck</h3>
                      <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                        Start with a blank cover slide. Build your presentation slide-by-slide, drag in custom slide bricks, and use AI prompts to draft commentary on the fly.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                      <span style={{ fontSize: 10.5, padding: '3px 8px', borderRadius: 4, background: '#ECFDF5', color: '#10B981', fontWeight: 600 }}>Flexible</span>
                      <span style={{ fontSize: 10.5, padding: '3px 8px', borderRadius: 4, background: '#ECFDF5', color: '#10B981', fontWeight: 600 }}>Blank Canvas</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {deckBuilderStep === 'template-selection' && (
              <div style={{ maxWidth: 860, margin: '0 auto', animation: 'fadeIn 0.25s ease' }}>
                {/* Back button */}
                <button
                  onClick={() => setDeckBuilderStep('creation-mode')}
                  style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, padding: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#0F172A'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  Back
                </button>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Select a Template</h2>
                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>
                  Choose a presentation structure designed for <strong style={{ color: '#2563EB' }}>financial advisors</strong>
                </p>

                {/* Category Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                  {['All', 'Performance', 'Planning', 'Risk', 'Strategy'].map((tab, idx) => (
                    <button key={tab} style={{
                      padding: '6px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                      background: idx === 0 ? '#2563EB' : '#F1F5F9',
                      color: idx === 0 ? '#FFFFFF' : '#64748B'
                    }}>{tab}</button>
                  ))}
                </div>

                {/* Template List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {[
                    {
                      icon: '📊', name: 'Quarterly Review', badge: 'Most Used', slides: 18,
                      desc: 'Comprehensive quarterly portfolio performance review with benchmark comparisons and forward outlook.',
                      tags: ['Reporting Period', 'Portfolio Holdings', 'Benchmark', 'Meeting Objective'],
                      color: '#2563EB'
                    },
                    {
                      icon: '📈', name: 'Portfolio Performance', badge: null, slides: 14,
                      desc: 'Deep-dive performance attribution analysis with asset class breakdown and risk-adjusted returns.',
                      tags: ['Period', 'Asset Allocation', 'Benchmark', 'Key Metrics'],
                      color: '#10B981'
                    },
                    {
                      icon: '🕐', name: 'Retirement Planning', badge: null, slides: 16,
                      desc: 'Long-term retirement income strategy with projected scenarios, Social Security optimization and drawdown modelling.',
                      tags: ['Target Date', 'Income Goals', 'Risk Tolerance', 'Current Assets'],
                      color: '#F59E0B'
                    },
                    {
                      icon: '🛡', name: 'Risk Assessment', badge: null, slides: 12,
                      desc: 'Portfolio risk profiling with stress testing, correlation analysis, and recommended adjustments.',
                      tags: ['Risk Profile', 'Portfolio Holdings', 'Market Scenarios', 'Time Horizon'],
                      color: '#EF4444'
                    },
                    {
                      icon: '💼', name: 'Investment Recommendation', badge: null, slides: 15,
                      desc: 'Actionable investment recommendations with rationale, expected returns and implementation roadmap.',
                      tags: ['Investment Goals', 'Capital Available', 'Sectors', 'Timeline'],
                      color: '#7C3AED'
                    },
                  ].map((tmpl) => (
                    <div
                      key={tmpl.name}
                      onClick={() => { setSelectedTemplate(tmpl.name); setDeckBuilderStep('template-config'); }}
                      style={{
                        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
                        padding: '20px 24px', cursor: 'pointer', transition: 'all 0.18s ease',
                        display: 'flex', alignItems: 'center', gap: 20
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: `${tmpl.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                      }}>
                        {tmpl.icon}
                      </div>

                      {/* Description */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{tmpl.name}</span>
                          {tmpl.badge && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#FEF3C7', color: '#D97706' }}>⭐ {tmpl.badge}</span>
                          )}
                        </div>
                        <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 10px 0', lineHeight: 1.5 }}>{tmpl.desc}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Requires:</span>
                          {tmpl.tags.map(tag => (
                            <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#F1F5F9', color: '#475569', fontWeight: 500 }}>{tag}</span>
                          ))}
                        </div>
                      </div>

                      {/* Slide count + arrow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>{tmpl.slides} slides</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom CTA */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    disabled
                    style={{ padding: '10px 20px', background: '#CBD5E1', color: '#94A3B8', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'not-allowed' }}
                  >
                    Configure Template →
                  </button>
                </div>
              </div>
            )}

            {deckBuilderStep === 'template-config' && (() => {
              const outlineItems = [
                { num: '01', name: 'Executive Summary', show: true },
                { num: '02', name: 'Portfolio Overview', show: true },
                { num: '03', name: 'Asset Allocation', show: true },
                { num: '04', name: 'Performance vs Benchmark', show: includeBenchmark },
                { num: '05', name: 'Top Holdings', show: includeBenchmark },
                { num: '06', name: 'Risk Metrics', show: true },
                { num: '07', name: 'Market Commentary', show: includeMarketOutlook },
                { num: '08', name: 'Key Takeaways', show: true },
                { num: '09', name: 'Next Steps', show: true },
                { num: '10', name: 'Performance Charts', show: includeCharts },
                { num: '11', name: 'Market Outlook', show: includeMarketOutlook }
              ];
              const activeOutline = outlineItems.filter(item => item.show);

              return (
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px', animation: 'fadeIn 0.25s ease' }}>
                  {/* Back button */}
                  <button
                    onClick={() => setDeckBuilderStep('client-selection')}
                    style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#0F172A'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                    Back
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'start' }}>
                    
                    {/* Left Column: Form Settings */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      
                      {/* Client Information summary card */}
                      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          Client Information
                        </h3>
                        {(() => {
                          const personaIndustryMap: Record<string, string> = {
                            'family-planner': 'Family Office',
                            'young-investor': 'Technology / Growth',
                            'retirement-client': 'Retirement Planning',
                          }
                          const industryLabel = personaIndustryMap[selectedClient?.persona || ''] || 'Wealth Management'
                          const portfolioVal = selectedClient?.current
                            ? `$${selectedClient.current.toLocaleString()}`
                            : '—'
                          const goalVal = selectedClient?.goal
                            ? `$${selectedClient.goal.toLocaleString()}`
                            : ''

                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Client Name</label>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', background: '#F8FAFC', padding: '8px 12px', borderRadius: 6, marginTop: 4 }}>
                                  {branding.clientName}
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Company / Entity</label>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', background: '#F8FAFC', padding: '8px 12px', borderRadius: 6, marginTop: 4 }}>
                                  {selectedClient?.company || '—'}
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Industry</label>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', background: '#F8FAFC', padding: '8px 12px', borderRadius: 6, marginTop: 4 }}>
                                  {industryLabel}
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Portfolio Value</label>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', background: '#F8FAFC', padding: '8px 12px', borderRadius: 6, marginTop: 4 }}>
                                  {portfolioVal}
                                  {goalVal && (
                                    <span style={{ fontSize: 11, fontWeight: 400, color: '#64748B', marginLeft: 6 }}>
                                      / {goalVal} goal
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>

                      {/* Presentation Details */}
                      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          Presentation Details
                        </h3>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Reporting Period *</label>
                          <select
                            value={reportingPeriod}
                            onChange={(e) => setReportingPeriod(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13.5, background: '#FFFFFF', color: '#0F172A' }}
                          >
                            <option value="Q1 2026 (January - March 2026)">Q1 2026 (January - March 2026)</option>
                            <option value="Q2 2026 (April - June 2026)">Q2 2026 (April - June 2026)</option>
                            <option value="Q3 2026 (July - September 2026)">Q3 2026 (July - September 2026)</option>
                            <option value="Q4 2026 (October - December 2026)">Q4 2026 (October - December 2026)</option>
                            <option value="2025 Annual Review (Full Year)">2025 Annual Review (Full Year)</option>
                            <option value="Last 12 Months (YTD Performance)">Last 12 Months (YTD Performance)</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Focus Areas</label>
                          <input
                            type="text"
                            value={focusAreas}
                            onChange={(e) => setFocusAreas(e.target.value)}
                            placeholder="e.g. Portfolio performance, asset allocation review, risk assessment"
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13.5, color: '#0F172A', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Meeting Objective *</label>
                          <input
                            type="text"
                            value={meetingObjective}
                            onChange={(e) => setMeetingObjective(e.target.value)}
                            placeholder="e.g. Review Q1 performance and discuss Q2 strategy"
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13.5, color: '#0F172A', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Additional Notes</label>
                          <textarea
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            placeholder="Any additional context or specific points to include..."
                            rows={3}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13.5, color: '#0F172A', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      {/* Include In Presentation */}
                      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                          Include In Presentation
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                            <input
                              type="checkbox"
                              checked={includeCharts}
                              onChange={(e) => setIncludeCharts(e.target.checked)}
                              style={{ width: 16, height: 16, cursor: 'pointer' }}
                            />
                            Performance Charts & Visualizations
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                            <input
                              type="checkbox"
                              checked={includeBenchmark}
                              onChange={(e) => setIncludeBenchmark(e.target.checked)}
                              style={{ width: 16, height: 16, cursor: 'pointer' }}
                            />
                            Benchmark Comparison Analysis
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                            <input
                              type="checkbox"
                              checked={includeMarketOutlook}
                              onChange={(e) => setIncludeMarketOutlook(e.target.checked)}
                              style={{ width: 16, height: 16, cursor: 'pointer' }}
                            />
                            Forward-Looking Market Outlook
                          </label>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button
                          onClick={handleGeneratePresentation}
                          style={{
                            padding: '12px 24px', background: '#2563EB', color: '#FFFFFF',
                            border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14,
                            cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
                            display: 'flex', alignItems: 'center', gap: 8
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
                          onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
                        >
                          Generate Presentation →
                        </button>
                      </div>

                    </div>

                    {/* Right Column: Deck Summary Card */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563EB', marginBottom: 16 }}>
                        <Library size={18} />
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deck Summary</span>
                      </div>

                      <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>{selectedTemplate || 'Quarterly Review'}</h3>
                      <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px 0' }}>{branding.clientName} · {selectedClient?.company || '—'}</p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 20, borderBottom: '1px solid #F1F5F9', marginBottom: 20 }}>
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Period</span>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>{reportingPeriod}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Objective</span>
                          <span style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.4 }}>{meetingObjective}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Slides</span>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#2563EB' }}>~{activeOutline.length} slides</span>
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Slide Outline</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {activeOutline.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8', width: 20 }}>{item.num}</span>
                              <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 500 }}>{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

            {deckBuilderStep === 'generating' && (
              <div className="wizard-start">
                <div style={{ width: 60, height: 60, border: '4px solid rgba(56, 189, 248, 0.1)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <h2 style={{ fontSize: 24, color: '#0F172A', margin: 0 }}>AI Story Engine Analyzing...</h2>
                <div style={{ color: '#64748B', textAlign: 'center', fontSize: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ margin: 0 }}>• Retrieving client data</p>
                  <p style={{ margin: 0 }}>• Analyzing Performance, Risk & Fees</p>
                  <p style={{ margin: 0 }}>• Generating Narrative Flow</p>
                  <p style={{ margin: 0 }}>• Assembling Slide Bricks</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>


        {/* Workspace Title bar */}
        <div className="deck-titlebar">
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Slide Brick Deck Builder</h2>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>
              Library → Orchestrate → Export: Automated client presentations in one click.
            </p>
          </div>
          <div className="deck-titlebar-actions">
            {/* ONE-CLICK REPORT */}
            <button
              onClick={handleOneClickReport}
              disabled={isGeneratingReport}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: isGeneratingReport
                  ? 'rgba(255,255,255,0.05)'
                  : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                border: 'none',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                padding: '8px 16px',
                borderRadius: 8,
                cursor: isGeneratingReport ? 'wait' : 'pointer',
                boxShadow: isGeneratingReport ? 'none' : '0 0 16px rgba(245,158,11,0.35)',
                animation: isGeneratingReport ? 'none' : 'pulse 2s infinite',
                transition: 'all 0.2s',
              }}
            >
              {isGeneratingReport ? 'Generating…' : '1-Click Report'}
            </button>

            {/* AI GENERATE ALL */}
            <button
              onClick={handleGenerateAllSlides}
              disabled={isBulkDrafting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: isBulkDrafting ? 'rgba(255,255,255,0.05)' : 'rgba(167, 139, 250, 0.15)',
                border: '1px solid rgba(167, 139, 250, 0.4)',
                color: '#d8b4fe',
                fontSize: 12,
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 8,
                cursor: isBulkDrafting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Sparkles size={14} style={{ animation: isBulkDrafting ? 'spin 2s linear infinite' : 'none' }} />
              {isBulkDrafting ? 'Generating all...' : 'AI Generate All'}
            </button>

            {/* BRAND COMPARISON TOGGLE */}
            <button
              onClick={() => setShowBrandComparison(!showBrandComparison)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: showBrandComparison
                  ? 'rgba(167,139,250,0.2)'
                  : 'rgba(167, 139, 250, 0.1)',
                border: showBrandComparison
                  ? '1px solid #a78bfa'
                  : '1px solid rgba(167, 139, 250, 0.3)',
                color: '#a78bfa',
                fontSize: 12,
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {showBrandComparison ? 'Exit Comparison' : 'Brand Comparison'}
            </button>
            <button
              onClick={() => {
                const idx = deck.findIndex((s) => s.id === selectedSlideId)
                setPresentationIndex(idx >= 0 ? idx : 0)
                setIsPresenting(true)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(167, 139, 250, 0.1)',
                border: '1px solid rgba(167, 139, 250, 0.3)',
                color: '#a78bfa',
                fontSize: 12,
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <Play size={14} />
              Presenter Mode
            </button>
            <button
              onClick={handleExportPDF}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: 12,
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <Printer size={14} />
              Export PDF (Print)
            </button>
            <button
              onClick={handleExportPPTX}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'linear-gradient(135deg, #38bdf8, #a78bfa)',
                border: 'none',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(56,189,248,0.2)',
              }}
            >
              <Download size={14} />
              Export PPTX
            </button>
          </div>
        </div>

        {/* 3-Column Responsive Grid */}
        <div 
          className="deck-grid" 
          style={{ 
            marginTop: 20,
            gridTemplateColumns: showBrandComparison ? '260px 1fr' : '260px 1fr 340px',
            transition: 'grid-template-columns 0.3s ease'
          }}
        >
          {/* COLUMN 1: Slide Manager */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                Slide Brick Library
              </h3>
              <span style={{
                fontSize: 9, fontWeight: 800, color: '#34d399',
                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                borderRadius: 4, padding: '2px 6px',
              }}>
                {deck.length} BRICKS
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
              {deck.map((slide, index) => {
                const isSelected = slide.id === selectedSlideId
                return (
                  <div
                    key={slide.id}
                    onClick={() => setSelectedSlideId(slide.id)}
                    style={{
                      background: isSelected ? '#EFF6FF' : '#F8FAFC',
                      border: isSelected ? '1px solid #2563EB' : '1px solid #E2E8F0',
                      borderRadius: 8,
                      padding: 10,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 10, color: isSelected ? '#38bdf8' : '#475569', fontWeight: 700 }}>
                        {index + 1}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? '#1D4ED8' : '#0F172A', textTransform: 'capitalize' }}>
                        {slide.type === 'custom' ? slide.title || 'Custom Slide' : `${slide.type} Slide`}
                      </span>
                    </div>

                    {/* Move & Delete controls */}
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => moveSlide(index, 'up')}
                        disabled={index === 0}
                        style={{
                          background: 'none', border: 'none',
                          color: index === 0 ? '#334155' : '#64748b',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', padding: 2,
                        }}
                        title="Move Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveSlide(index, 'down')}
                        disabled={index === deck.length - 1}
                        style={{
                          background: 'none', border: 'none',
                          color: index === deck.length - 1 ? '#334155' : '#64748b',
                          cursor: index === deck.length - 1 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', padding: 2,
                        }}
                        title="Move Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        onClick={() => deleteSlide(slide.id)}
                        disabled={deck.length <= 1}
                        style={{
                          background: 'none', border: 'none',
                          color: deck.length <= 1 ? '#334155' : '#f87171',
                          cursor: deck.length <= 1 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', padding: 2,
                          marginLeft: 4,
                        }}
                        title="Delete Slide"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Slide Brick Picker */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 12 }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>+ ADD SLIDE BRICK</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {([
                  { type: 'cover',      label: 'Cover' },
                  { type: 'metrics',    label: 'Metrics' },
                  { type: 'holdings',   label: 'Holdings' },
                  { type: 'risk',       label: 'Risk' },
                  { type: 'timeline',   label: 'Timeline' },
                  { type: 'montecarlo', label: 'Monte Carlo' },
                  { type: 'insights',   label: 'Insights' },
                  { type: 'custom',     label: 'Custom' },
                ] as const).map(({ type: t, label }) => (
                  <button
                    key={t}
                    onClick={() => addSlide(t as SlideItem['type'])}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      borderRadius: 6,
                      fontSize: 10,
                      padding: '5px 10px',
                      color: '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(37,99,235,0.08)'
                      e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'
                      e.currentTarget.style.color = '#2563EB'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F1F5F9'
                      e.currentTarget.style.borderColor = '#E2E8F0'
                      e.currentTarget.style.color = '#475569'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Workspace Slide Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Live Data Injection Badge */}
            {metrics && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(52,211,153,0.06)',
                border: '1px solid rgba(52,211,153,0.2)',
                borderRadius: 8, padding: '8px 14px',
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', animation: 'blink 1.5s infinite' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', letterSpacing: '0.04em' }}>LIVE DATA INJECTED</span>
                <span style={{ fontSize: 10, color: '#64748b', marginLeft: 4 }}>
                  YTD: <strong style={{ color: metrics.ytdReturn >= 0 ? '#34d399' : '#f43f5e' }}>{metrics.ytdReturn >= 0 ? '+' : ''}{metrics.ytdReturn.toFixed(1)}%</strong>
                  &nbsp;·&nbsp; Sharpe: <strong style={{ color: '#38bdf8' }}>{metrics.sharpe.toFixed(2)}</strong>
                  &nbsp;·&nbsp; MC Goal: <strong style={{ color: '#a78bfa' }}>{monteCarlo?.probability ?? '—'}%</strong>
                  &nbsp;·&nbsp; {holdings.length} Holdings
                </span>
              </div>
            )}

            {/* Brand Comparison Mode: side-by-side */}
            {showBrandComparison ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: 4, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Default Dark Theme</span>
                  <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>vs</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#a78bfa', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 4, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>White Label Corporate Theme</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(56,189,248,0.4)', boxShadow: '0 0 20px rgba(56,189,248,0.12)' }}>
                    {renderSlidePreview(selectedSlide)}
                  </div>
                  <div style={{ aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(30,58,138,0.4)', boxShadow: '0 0 20px rgba(30,58,138,0.12)' }}>
                    {(() => {
                      const wlProps = {
                        branding: whiteLabelBranding,
                        personaData: { persona: selectedPersona, portfolio: portfolioData, holdings, metrics, monteCarlo },
                        customTitle: selectedSlide?.title,
                        customContent: selectedSlide?.content,
                      }
                      switch (selectedSlide?.type) {
                        case 'cover':      return <CoverSlide {...wlProps} />
                        case 'metrics':    return <MetricsSlide {...wlProps} />
                        case 'holdings':   return <HoldingsSlide {...wlProps} />
                        case 'risk':       return <RiskSlide {...wlProps} />
                        case 'timeline':   return <TimelineSlide {...wlProps} />
                        case 'montecarlo': return <MonteCarloSlide {...wlProps} />
                        case 'insights':   return <InsightsSlide {...wlProps} />
                        case 'custom':     return <CustomTextSlide {...wlProps} />
                        default:           return <div>Slide not found</div>
                      }
                    })()}
                  </div>
                </div>
              </div>
            ) : (
            /* Single preview with inline editing */
            <div 
              style={{
                width: '100%',
                aspectRatio: '16/9',
                background: '#0f172a',
                borderRadius: 12,
                border: '1px solid rgba(99, 179, 237, 0.1)',
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                position: 'relative',
                cursor: 'pointer',
              }}
              onDoubleClick={() => {
                if (!isEditingInline && selectedSlide) {
                  setInlineTitle(selectedSlide.title || '')
                  setInlineContent(selectedSlide.content || '')
                  setIsEditingInline(true)
                }
              }}
            >
              {renderSlidePreview(selectedSlide)}
              
              {/* Double-click Hint Badge */}
              {!isEditingInline && (
                <div style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#38bdf8',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  opacity: 0.85,
                }}>
                  <Layers size={12} /> Double-click slide to edit text inline
                </div>
              )}

              {/* Inline Editing Overlay */}
              {isEditingInline && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(15, 23, 42, 0.92)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '24px 32px',
                  zIndex: 50,
                  justifyContent: 'center',
                }}
                onDoubleClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Layers size={18} color="#38bdf8" />
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Inline Slide Editor</h3>
                    </div>
                    <button
                      onClick={async () => {
                        setIsDrafting(true)
                        try {
                          const response = await fetch('/api/copilot/generate-commentary', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              slideType: selectedSlide.type,
                              persona: selectedPersona,
                              metrics,
                              holdings,
                              clientName: branding.clientName,
                              customPrompt: selectedSlide.type === 'custom' ? customSlidePrompt : undefined,
                            }),
                          })
                          const data = await response.json()
                          if (data && data.draft) {
                            setInlineContent(data.draft)
                          }
                        } catch (err) {
                          console.error('Failed to generate inline AI draft', err)
                        } finally {
                          setIsDrafting(false)
                        }
                      }}
                      disabled={isDrafting}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(167, 139, 250, 0.15)',
                        border: '1px solid rgba(167, 139, 250, 0.4)',
                        color: '#c084fc',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: isDrafting ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Sparkles size={12} /> {isDrafting ? 'Drafting...' : 'Draft with AI'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Slide Title</label>
                      <input 
                        type="text"
                        value={inlineTitle}
                        onChange={(e) => setInlineTitle(e.target.value)}
                        style={{
                          background: 'rgba(2, 6, 23, 0.6)',
                          border: '1px solid #E2E8F0',
                          borderRadius: 8,
                          padding: '10px 14px',
                          color: '#fff',
                          fontSize: 14,
                          outline: 'none',
                        }}
                        placeholder="Enter slide title..."
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minHeight: 0 }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Slide Commentary</label>
                      <textarea
                        value={inlineContent}
                        onChange={(e) => setInlineContent(e.target.value)}
                        style={{
                          background: 'rgba(2, 6, 23, 0.6)',
                          border: '1px solid #E2E8F0',
                          borderRadius: 8,
                          padding: '10px 14px',
                          color: '#fff',
                          fontSize: 12,
                          outline: 'none',
                          resize: 'none',
                          flex: 1,
                          lineHeight: 1.5,
                        }}
                        placeholder="Enter slide commentary..."
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                    <button 
                      onClick={() => setIsEditingInline(false)}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid #E2E8F0',
                        color: '#cbd5e1',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveInline}
                      style={{
                        padding: '8px 20px',
                        background: 'linear-gradient(135deg, #38bdf8, #a78bfa)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}
          </div> {/* End Column 2 */}

          {/* COLUMN 3: Tabbed Sidebar Inspector */}
          <div style={{
            display: showBrandComparison ? 'none' : 'flex', flexDirection: 'column', gap: 16,
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: 12, padding: '16px 20px',
            boxShadow: '0 1px 4px rgba(15,23,42,0.06)'
          }}>
            {/* Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: 8 }}>
              <button onClick={() => setActiveTab('content')} style={{ flex: 1, padding: '10px 0', background: 'none', borderBottom: activeTab === 'content' ? '2px solid #2563EB' : '2px solid transparent', color: activeTab === 'content' ? '#2563EB' : '#64748B', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, transition: 'all 0.2s' }}>Content</button>
              <button onClick={() => setActiveTab('branding')} style={{ flex: 1, padding: '10px 0', background: 'none', borderBottom: activeTab === 'branding' ? '2px solid #7C3AED' : '2px solid transparent', color: activeTab === 'branding' ? '#7C3AED' : '#64748B', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, transition: 'all 0.2s' }}>Branding</button>
              <button onClick={() => setActiveTab('data')} style={{ flex: 1, padding: '10px 0', background: 'none', borderBottom: activeTab === 'data' ? '2px solid #059669' : '2px solid transparent', color: activeTab === 'data' ? '#059669' : '#64748B', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, transition: 'all 0.2s' }}>Data</button>
            </div>

            <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 280px)', paddingRight: 4 }}>
              
              {/* CONTENT TAB */}
              {activeTab === 'content' && selectedSlide && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s ease' }}>
                  <div>
                    <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>
                      {selectedSlide.type === 'custom' ? 'SLIDE TITLE' : 'SLIDE TITLE OVERRIDE'}
                    </label>
                    <input
                      type="text"
                      placeholder="Slide Title"
                      value={selectedSlide.title || ''}
                      onChange={(e) => updateCustomSlideContent('title', e.target.value)}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 6, color: '#0F172A', padding: '8px 12px', fontSize: 12, boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                        {selectedSlide.type === 'custom' ? 'BULLET POINTS' : 'ADVISOR COMMENTARY'}
                      </label>
                      <button
                        onClick={handleGenerateAIDraft}
                        disabled={isDrafting}
                        style={{
                          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(167, 139, 250, 0.15))',
                          border: '1px solid rgba(167, 139, 250, 0.3)', borderRadius: 4, color: '#c084fc',
                          fontSize: 9, fontWeight: 700, padding: '2px 8px', display: 'flex', alignItems: 'center',
                          gap: 4, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        <Sparkles size={10} /> {isDrafting ? 'Drafting...' : 'AI Draft'}
                      </button>
                    </div>
                    <textarea
                      rows={selectedSlide.type === 'custom' ? 6 : 4}
                      placeholder="Enter custom advice or summary points..."
                      value={selectedSlide.content || ''}
                      onChange={(e) => updateCustomSlideContent('content', e.target.value)}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 6, color: '#0F172A', padding: '8px 12px', fontSize: 12, lineHeight: 1.5,
                        boxSizing: 'border-box', fontFamily: selectedSlide.type === 'custom' ? 'monospace' : 'inherit',
                      }}
                    />

                    {/* AI Slide Refiner Toolkit */}
                    <div style={{
                      marginTop: 10,
                      padding: 12,
                      background: 'rgba(167, 139, 250, 0.03)',
                      border: '1px solid rgba(167, 139, 250, 0.1)',
                      borderRadius: 8,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: '#c084fc', marginBottom: 8 }}>
                        <Sparkles size={11} /> AI Slide Refiner
                      </div>
                      
                      {/* Presets */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                        <button
                          onClick={() => handleRefineCommentary('Make the tone highly formal and professional for an institutional partner.')}
                          disabled={isRefining}
                          style={{
                            padding: '4px 8px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                            borderRadius: 4, color: '#475569', fontSize: 10, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        >
                          🗣️ Formal Tone
                        </button>
                        <button
                          onClick={() => handleRefineCommentary('Focus heavily on equity growth, target wealth goals, and positive compounding returns.')}
                          disabled={isRefining}
                          style={{
                            padding: '4px 8px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                            borderRadius: 4, color: '#475569', fontSize: 10, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        >
                          📈 Growth Pitch
                        </button>
                        <button
                          onClick={() => handleRefineCommentary('Emphasize defensive hedges, risk parameters, low volatility, and wealth preservation.')}
                          disabled={isRefining}
                          style={{
                            padding: '4px 8px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                            borderRadius: 4, color: '#475569', fontSize: 10, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        >
                          🛡️ Capital Shield
                        </button>
                        <button
                          onClick={() => handleRefineCommentary('Format the content as a neat list of bullet points using Unicode dot marks.')}
                          disabled={isRefining}
                          style={{
                            padding: '4px 8px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                            borderRadius: 4, color: '#475569', fontSize: 10, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        >
                          🎯 Bullet Points
                        </button>
                      </div>

                      {/* Custom Refinement */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="text"
                          placeholder="Or type prompt e.g. translate to French..."
                          value={refineInstruction}
                          onChange={(e) => setRefineInstruction(e.target.value)}
                          style={{
                            flex: 1, background: '#FFFFFF', border: '1px solid #E2E8F0',
                            borderRadius: 4, color: '#0F172A', padding: '5px 8px', fontSize: 10.5,
                          }}
                        />
                        <button
                          onClick={() => {
                            if (refineInstruction.trim()) {
                              handleRefineCommentary(refineInstruction)
                              setRefineInstruction('')
                            }
                          }}
                          disabled={isRefining || !refineInstruction.trim()}
                          style={{
                            background: refineInstruction.trim() ? '#a78bfa' : 'rgba(255,255,255,0.05)',
                            border: 0, borderRadius: 4, color: '#000', fontSize: 10, fontWeight: 700,
                            padding: '0 10px', cursor: refineInstruction.trim() ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s'
                          }}
                        >
                          {isRefining ? 'Refining...' : 'Refine'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Gemini Slide Composer for Custom Slides */}
                  {selectedSlide.type === 'custom' && (
                    <div style={{
                      padding: 12,
                      background: 'rgba(56, 189, 248, 0.03)',
                      border: '1px solid rgba(56, 189, 248, 0.1)',
                      borderRadius: 8,
                    }}>
                      <label style={{ fontSize: 10, color: '#38bdf8', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                        ✦ Gemini Custom Slide Composer
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Tell Gemini what this custom slide should explain (e.g. impact of high interest rates on small caps)..."
                        value={customSlidePrompt}
                        onChange={(e) => setCustomSlidePrompt(e.target.value)}
                        style={{
                          width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                          borderRadius: 6, color: '#0F172A', padding: '6px 8px', fontSize: 11, lineHeight: 1.4,
                          boxSizing: 'border-box', resize: 'none', marginBottom: 8
                        }}
                      />
                      <button
                        onClick={handleGenerateAIDraft}
                        disabled={isDrafting}
                        style={{
                          width: '100%',
                          background: `linear-gradient(135deg, #38bdf8, #a78bfa)`,
                          border: 0, borderRadius: 6, color: '#000', fontSize: 11, fontWeight: 700,
                          padding: '6px 0', cursor: isDrafting ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isDrafting ? 'Drafting Custom Slide...' : 'Generate Custom Slide Content'}
                      </button>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      PRESENTER NOTES
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Type advisor remarks here..."
                      value={selectedSlide?.notes || ''}
                      onChange={(e) => updateSlideNotes(e.target.value)}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 6, color: '#0F172A', padding: '8px 12px', fontSize: 12, lineHeight: 1.5,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* BRANDING TAB */}
              {activeTab === 'branding' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s ease' }}>

                  {/* ✦ AI Theme Studio */}
                  <div style={{
                    padding: 14,
                    background: 'linear-gradient(135deg, rgba(167,139,250,0.06), rgba(56,189,248,0.04))',
                    border: '1px solid rgba(167,139,250,0.2)',
                    borderRadius: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <Sparkles size={13} color="#a78bfa" />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#c084fc' }}>AI Theme Studio</span>
                      <span style={{ fontSize: 9, color: '#475569', marginLeft: 'auto' }}>Describe → Generate → Apply</span>
                    </div>
                    <textarea
                      rows={2}
                      placeholder={'e.g. "Bold Alexander Forbes red and white, formal serif font for retirement clients"...'}
                      value={themePrompt}
                      onChange={(e) => setThemePrompt(e.target.value)}
                      style={{
                        width: '100%', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.15)',
                        borderRadius: 6, color: '#4C1D95', padding: '7px 10px', fontSize: 11,
                        lineHeight: 1.4, boxSizing: 'border-box', resize: 'none', marginBottom: 8,
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      onClick={handleGenerateTheme}
                      disabled={isGeneratingTheme || !themePrompt.trim()}
                      style={{
                        width: '100%',
                        background: isGeneratingTheme || !themePrompt.trim()
                          ? 'rgba(255,255,255,0.05)'
                          : 'linear-gradient(135deg, #a78bfa, #38bdf8)',
                        border: 0, borderRadius: 6, color: isGeneratingTheme || !themePrompt.trim() ? '#475569' : '#000',
                        fontSize: 11, fontWeight: 700, padding: '7px 0',
                        cursor: isGeneratingTheme || !themePrompt.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'all 0.2s',
                      }}
                    >
                      <Sparkles size={11} />
                      {isGeneratingTheme ? 'Generating Theme...' : 'Generate AI Theme'}
                    </button>

                    {/* Generated Theme Preview */}
                    {generatedTheme && (
                      <div style={{
                        marginTop: 12,
                        padding: 12,
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        animation: 'fadeIn 0.3s ease',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>{generatedTheme.themeName}</span>
                          <span style={{ fontSize: 9, color: '#38bdf8', fontWeight: 600 }}>✦ AI Generated</span>
                        </div>

                        {/* Color swatches */}
                        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                          {[
                            { color: generatedTheme.backgroundColor, label: 'BG' },
                            { color: generatedTheme.primaryColor,    label: 'Primary' },
                            { color: generatedTheme.secondaryColor,  label: 'Accent' },
                            { color: generatedTheme.textColor,       label: 'Text' },
                          ].map(({ color, label }) => (
                            <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                              <div style={{
                                height: 28, borderRadius: 5, background: color,
                                border: '1px solid rgba(255,255,255,0.12)', marginBottom: 3,
                              }} />
                              <span style={{ fontSize: 8, color: '#64748b' }}>{label}</span>
                            </div>
                          ))}
                        </div>

                        {/* Mini slide preview */}
                        <div style={{
                          height: 48, borderRadius: 5, marginBottom: 8,
                          background: generatedTheme.backgroundColor,
                          border: `1px solid ${generatedTheme.primaryColor}40`,
                          display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8,
                          overflow: 'hidden',
                        }}>
                          <div style={{ width: 3, height: 28, background: generatedTheme.primaryColor, borderRadius: 2, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: generatedTheme.textColor, fontFamily: generatedTheme.fontFamily }}>AF Engage · {generatedTheme.themeName}</div>
                            <div style={{ fontSize: 8, color: generatedTheme.primaryColor, marginTop: 2 }}>Strategy Presentation Preview</div>
                          </div>
                        </div>

                        {generatedTheme.rationale && (
                          <p style={{ fontSize: 9.5, color: '#94a3b8', lineHeight: 1.4, margin: '0 0 10px 0', fontStyle: 'italic' }}>
                            {generatedTheme.rationale}
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={applyGeneratedTheme}
                            style={{
                              flex: 1,
                              background: `linear-gradient(135deg, ${generatedTheme.primaryColor}, ${generatedTheme.secondaryColor})`,
                              border: 0, borderRadius: 5, color: '#000', fontSize: 10, fontWeight: 700,
                              padding: '6px 0', cursor: 'pointer',
                            }}
                          >
                            Apply to Deck
                          </button>
                          <button
                            onClick={() => setGeneratedTheme(null)}
                            style={{
                              padding: '6px 10px', background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 5,
                              color: '#64748b', fontSize: 10, cursor: 'pointer',
                            }}
                          >
                            Discard
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 6 }}>1-CLICK THEMES</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {PRESET_THEMES.map((theme) => (
                        <button
                          key={theme.themeName}
                          onClick={() => applyPresetTheme(theme)}
                          style={{
                            background: branding.themeName === theme.themeName ? 'rgba(167, 139, 250, 0.1)' : 'rgba(255,255,255,0.03)',
                            border: branding.themeName === theme.themeName ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 6, padding: 8, cursor: 'pointer', textAlign: 'left',
                            display: 'flex', flexDirection: 'column', gap: 4, transition: 'all 0.2s',
                          }}
                        >
                          <span style={{ fontSize: 10, fontWeight: 600, color: branding.themeName === theme.themeName ? '#a78bfa' : '#fff' }}>
                            {theme.themeName.split(' (')[0]}
                          </span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: theme.primaryColor }} />
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: theme.secondaryColor }} />
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: theme.backgroundColor }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                    <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>CLIENT NAME / TITLE</label>
                    <input
                      type="text"
                      value={branding.clientName}
                      onChange={(e) => setBranding({ ...branding, clientName: e.target.value })}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 6, color: '#0F172A', padding: '8px 12px', fontSize: 12, boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>FOOTER LEGAL REMARKS</label>
                    <input
                      type="text"
                      value={branding.footerText}
                      onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 6, color: '#0F172A', padding: '8px 12px', fontSize: 12, boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>LOGO PRESET & FONT</label>
                    <select
                      value={branding.logoPreset}
                      onChange={(e) => setBranding({ ...branding, logoPreset: e.target.value })}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 6, color: '#0F172A', padding: '8px 12px', fontSize: 12, cursor: 'pointer', marginBottom: 8,
                      }}
                    >
                      <option value="standard">Standard — Deckora</option>
                      <option value="premium">Premium White-Label</option>
                      <option value="custom">Custom Logo URL</option>
                    </select>
                    <select
                      value={branding.fontFamily || 'Outfit'}
                      onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 6, color: '#0F172A', padding: '8px 12px', fontSize: 12, cursor: 'pointer',
                      }}
                    >
                      <option value="Outfit">Outfit (Modern Wealth)</option>
                      <option value="Inter">Inter (Institutional)</option>
                      <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Tech/Quant)</option>
                    </select>
                  </div>

                  {branding.logoPreset === 'custom' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {/* Drag & Drop / Click upload zone */}
                      <label
                        htmlFor="logo-upload"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          padding: '16px 12px',
                          background: 'rgba(56, 189, 248, 0.04)',
                          border: '2px dashed rgba(56, 189, 248, 0.3)',
                          borderRadius: 10,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.background = 'rgba(56,189,248,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)'; e.currentTarget.style.background = 'rgba(56,189,248,0.04)'; }}
                      >
                        {branding.logoUrl ? (
                          <img
                            src={branding.logoUrl}
                            alt="Custom logo preview"
                            style={{ maxHeight: 40, maxWidth: 120, objectFit: 'contain', borderRadius: 4 }}
                          />
                        ) : (
                          <>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Download size={16} color="#38bdf8" />
                            </div>
                            <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>Click to upload logo</span>
                            <span style={{ fontSize: 9, color: '#475569' }}>PNG, JPG, SVG · max 2MB</span>
                          </>
                        )}
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const reader = new FileReader()
                            reader.onload = (ev) => {
                              setBranding({ ...branding, logoUrl: ev.target?.result as string })
                            }
                            reader.readAsDataURL(file)
                          }}
                        />
                      </label>

                      {/* Or paste URL */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                        <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>or paste URL</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                      </div>
                      <input
                        type="text"
                        placeholder="https://example.com/logo.png"
                        value={branding.logoUrl && !branding.logoUrl.startsWith('data:') ? branding.logoUrl : ''}
                        onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                        style={{
                          width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                          borderRadius: 6, color: '#0F172A', padding: '8px 12px', fontSize: 11, boxSizing: 'border-box',
                        }}
                      />

                      {/* Clear logo button */}
                      {branding.logoUrl && (
                        <button
                          onClick={() => setBranding({ ...branding, logoUrl: '' })}
                          style={{
                            padding: '6px 12px', background: 'rgba(248,113,113,0.1)',
                            border: '1px solid rgba(248,113,113,0.25)', borderRadius: 6,
                            color: '#f87171', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          ✕ Remove Logo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* DATA TAB */}
              {activeTab === 'data' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s ease' }}>
                  <div>
                    <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>PORTFOLIO PERSONA</label>
                    <select
                      value={selectedPersona}
                      onChange={(e) => setPersona(e.target.value as any)}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 6, color: '#0F172A', padding: '10px 12px', fontSize: 12, cursor: 'pointer',
                      }}
                    >
                      <option value="young-investor">Young Investor (High Risk)</option>
                      <option value="family-planner">Family Planner (Medium Risk)</option>
                      <option value="retirement-client">Retirement Client (Low Risk)</option>
                    </select>
                    <p style={{ fontSize: 11, color: '#64748b', marginTop: 8, lineHeight: 1.5 }}>
                      Changing the persona will instantly re-orchestrate data across all Slide Bricks using live metric aggregation.
                    </p>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
      </>
      )}
    </div>

      {/* Fullscreen Presenter Mode Overlay */}
      {isPresenting && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: '#FFFFFF',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '20px',
        }}>
          {/* Animated decorative gradient blobs in the background */}
          <div style={{
            position: 'absolute',
            top: '10%', left: '10%',
            width: '40vw', height: '40vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.03) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '10%', right: '10%',
            width: '40vw', height: '40vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.03) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Fullscreen 16:9 Slide Wrapper */}
          <div style={{
            width: '100%',
            maxWidth: '1200px',
            aspectRatio: '16/9',
            boxShadow: '0 25px 70px rgba(0,0,0,0.8), 0 0 100px rgba(56,189,248,0.1)',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            position: 'relative',
          }}>
            {renderSlidePreview(deck[presentationIndex])}
          </div>

          {/* Floating Glass Control Panel */}
          <div style={{
            position: 'absolute',
            bottom: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 14,
            padding: '10px 20px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 10000,
          }}>
            <button
              onClick={() => setPresentationIndex((prev) => (prev > 0 ? prev - 1 : 0))}
              disabled={presentationIndex === 0}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: presentationIndex === 0 ? '#475569' : '#cbd5e1',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: presentationIndex === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              ← Prev
            </button>

            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, minWidth: 80, textAlign: 'center' }}>
              Slide {presentationIndex + 1} of {deck.length}
            </span>

            <button
              onClick={() => setPresentationIndex((prev) => (prev < deck.length - 1 ? prev + 1 : prev))}
              disabled={presentationIndex === deck.length - 1}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: presentationIndex === deck.length - 1 ? '#475569' : '#cbd5e1',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: presentationIndex === deck.length - 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Next →
            </button>

            <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.1)' }} />

            {/* Autoplay Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setIsAutoplay(!isAutoplay)}
                style={{
                  background: isAutoplay ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: isAutoplay ? '1px solid #38bdf8' : 'none',
                  color: isAutoplay ? '#38bdf8' : '#cbd5e1',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {isAutoplay ? <Pause size={12} /> : <Play size={12} />}
                Autoplay
              </button>

              <select
                value={autoplaySpeed}
                onChange={(e) => setAutoplaySpeed(Number(e.target.value))}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  padding: '5px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <option value="3000">3s interval</option>
                <option value="5000">5s interval</option>
                <option value="10000">10s interval</option>
              </select>
            </div>

            <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.1)' }} />

            <button
              onClick={() => {
                setIsPresenting(false)
                setIsAutoplay(false)
              }}
              style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: 'none',
                color: '#f43f5e',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <X size={12} />
              Exit
            </button>
          </div>
        </div>
      )}

      {/* DEDICATED PRINT CONTAINER: Hidden on screen, shown during window.print() */}
      <div id="print-root">
        {deck.map((slideItem) => (
          <div key={slideItem.id} className="print-page">
            {renderSlidePreview(slideItem)}
          </div>
        ))}
      </div>

    </div>
  )
}

export default DeckBuilder
