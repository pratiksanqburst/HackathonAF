import { SHARED_PRESET_TEMPLATES } from '../data/presetTemplates'
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
import { ChevronUp, ChevronDown, Trash2, Printer, Download, Upload, UserPlus, Play, Pause, X, Sparkles, Library, GitFork, FileOutput, Layers, Check, Briefcase, TrendingUp, ShieldCheck, List, Search } from 'lucide-react'

interface SlidePreviewProps {
  slide: SlideItem
  branding: BrandingConfig
}

const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, branding }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const { selectedPersona, portfolioData, holdings, metrics, monteCarlo } = useAppStore()

  useEffect(() => {
    if (!containerRef.current) return

    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.getBoundingClientRect().width
        setScale(width / 960)
      }
    }

    handleResize()
    const observer = new ResizeObserver(handleResize)
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  const props = {
    branding,
    personaData: {
      persona: selectedPersona,
      portfolio: portfolioData,
      holdings,
      metrics,
      monteCarlo,
    },
    customTitle: slide.title,
    customContent: slide.content,
    overrides: (slide as any).overrides || {},
  }

  const renderContent = () => {
    switch (slide.type) {
      case 'cover':      return <CoverSlide {...props} />
      case 'metrics':    return <MetricsSlide {...props} />
      case 'holdings':   return <HoldingsSlide {...props} />
      case 'risk':       return <RiskSlide {...props} />
      case 'timeline':   return <TimelineSlide {...props} />
      case 'montecarlo': return <MonteCarloSlide {...props} />
      case 'insights':   return <InsightsSlide {...props} />
      case 'custom':     return <CustomTextSlide {...props} />
      default:           return <div>Slide template not found</div>
    }
  }

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        background: branding.backgroundColor
      }}
    >
      <div style={{
        width: 960,
        height: 540,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        position: 'absolute',
        top: 0,
        left: 0
      }}>
        {renderContent()}
      </div>
    </div>
  )
}

const useRef = React.useRef;
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

const getSlideShortLabel = (type: string, title?: string) => {
  if (type === 'custom') return title || 'Custom'
  if (type === 'montecarlo') return 'Monte Carlo'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

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
    setCurrentPage,
    fetchClients,
  } = useAppStore()

  // Load client list on mount
  useEffect(() => {
    fetchClients()
  }, [])

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
  const [templateCategory, setTemplateCategory] = useState<string>('all')
  const [templateSearch, setTemplateSearch] = useState<string>('')
  const [libSearch, setLibSearch] = useState<string>('')
  const [libCategory, setLibCategory] = useState<string>('all')

  const loadSteps = [
    'Retrieving client portfolio data...',
    'Analyzing Performance, Risk metrics & Fees...',
    'Generating AI Advisory Narrative Flow...',
    'Assembling custom brand Slide Bricks...'
  ]

  const [loadProgress, setLoadProgress] = useState(0)

  useEffect(() => {
    if (deckBuilderStep === 'generating') {
      setLoadProgress(0)
      
      const interval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 25
        })
      }, 950)
      
      return () => clearInterval(interval)
    }
  }, [deckBuilderStep])
  
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

    // Apply client brand colors to theme if available
    const brandColors = client.brandColors
    const hasBrandColors = brandColors && brandColors.length >= 2

    // Sync ALL client metadata into branding so it flows into every slide and PPTX
    setBranding(prev => ({
      ...prev,
      clientName: client.name,
      footerText: `Wealth Advisory Engage · Prepared for ${client.name}`,
      clientLogo: client.logo || null,
      clientCompany: client.company || '',
      clientType: client.clientType,
      clientAge: client.age,
      brandColors: client.brandColors,
      // Auto-apply client's brand colors to the presentation theme
      ...(hasBrandColors ? {
        primaryColor: brandColors![0],
        secondaryColor: brandColors![1] || brandColors![0],
      } : {}),
    }))

    // Refresh portfolio data for the client's persona so slides have live data
    await fetchDashboardData(client.persona)

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
    
    const currentTemplateObj = SHARED_PRESET_TEMPLATES.find(t => t.name === selectedTemplate || t.id === selectedTemplate)
    
    setTimeout(() => {
      let finalSlides: SlideItem[] = []
      
      if (currentTemplateObj) {
        // Initialize deck based on the selected template's actual slides!
        finalSlides = currentTemplateObj.slides.map((s, idx) => ({
          id: `slide_${Math.random().toString(36).substring(2, 9)}_${idx}`,
          type: s.type,
          title: s.title,
          content: `• ${s.desc}\n• Draft generated from template preset.\n• Review and adjust using AI Slide Refiner.`,
          notes: `Advisor notes for: ${s.title}`,
        }))

        // Set the active template theme in localStorage
        const themeObj = {
          themeName: currentTemplateObj.themeName,
          backgroundColor: currentTemplateObj.backgroundColor,
          textColor: currentTemplateObj.textColor,
          primaryColor: currentTemplateObj.primaryColor,
          secondaryColor: currentTemplateObj.secondaryColor || currentTemplateObj.primaryColor,
          fontFamily: currentTemplateObj.fontFamily
        }
        localStorage.setItem('decora_active_template_theme', JSON.stringify(themeObj))
        
        // Also apply the theme config color branding
        setBranding(prev => ({
          ...prev,
          themeName: currentTemplateObj.themeName,
          backgroundColor: currentTemplateObj.backgroundColor,
          primaryColor: currentTemplateObj.primaryColor,
          secondaryColor: currentTemplateObj.secondaryColor || currentTemplateObj.primaryColor,
          textColor: currentTemplateObj.textColor,
          fontFamily: currentTemplateObj.fontFamily,
        }))
      } else {
        // Fallback to the old fixed template deck creation
        resetDeckForTemplate('fixed')
        const currentDeck = useAppStore.getState().deck
        finalSlides = [...currentDeck]
      }
      
      // Map/filter deck based on template config values
      
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
      + "Pratik Sen,35,family-planner,320000,750000,1.55,10.4\n"
      + "Sipho Khumalo,58,retirement-client,1250000,1800000,1.15,6.2\n"
      + "Zama Naidoo,26,young-investor,85000,300000,2.05,24.1";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "advisory_clients_template.csv");
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
        if (document.fullscreenElement) document.exitFullscreen()
      }
    }

    // Sync React state if user exits fullscreen via browser (Escape / F11)
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsPresenting(false)
        setIsAutoplay(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
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
  const [branding, setBranding] = useState<BrandingConfig>(() => {
    const savedTemplateTheme = localStorage.getItem('decora_active_template_theme')
    if (savedTemplateTheme) {
      try {
        const themeObj = JSON.parse(savedTemplateTheme)
        localStorage.removeItem('decora_active_template_theme')
        // If we have a pre-selected client from the store, use it
        const currentClient = useAppStore.getState().selectedClient
        return {
          themeName: themeObj.themeName,
          backgroundColor: themeObj.backgroundColor,
          textColor: themeObj.textColor,
          primaryColor: themeObj.primaryColor,
          secondaryColor: themeObj.secondaryColor,
          clientName: currentClient?.name || '',
          logoPreset: 'standard',
          logoUrl: '',
          footerText: currentClient
            ? `Wealth Advisory Engage · Prepared for ${currentClient.name}`
            : 'Wealth Advisory Engage · Confidential',
          fontFamily: themeObj.fontFamily || 'Outfit',
          clientLogo: currentClient?.logo || null,
          clientCompany: currentClient?.company || '',
          clientType: currentClient?.clientType,
          clientAge: currentClient?.age,
          brandColors: currentClient?.brandColors,
        }
      } catch (e) {
        console.error('Failed to parse active template theme', e)
      }
    }

    const savedPrimary = localStorage.getItem('decora_primary_color') || '#38bdf8'
    const savedSecondary = localStorage.getItem('decora_secondary_color') || '#60a5fa'
    const savedBg = localStorage.getItem('decora_bg_color') || '#1e40af'
    const savedText = localStorage.getItem('decora_text_color') || '#ffffff'
    const savedFont = localStorage.getItem('decora_font_family') || 'Outfit'

    // Check if there's already a selected client in the store
    const currentClient = useAppStore.getState().selectedClient

    return {
      themeName: 'Quarterly Review (Blue)',
      backgroundColor: savedBg,
      textColor: savedText,
      primaryColor: savedPrimary,
      secondaryColor: savedSecondary,
      clientName: currentClient?.name || '',
      logoPreset: 'standard',
      logoUrl: '',
      footerText: currentClient
        ? `Wealth Advisory Engage · Prepared for ${currentClient.name}`
        : localStorage.getItem('decora_footer_text') || 'Wealth Advisory Engage · Confidential',
      fontFamily: savedFont,
      clientLogo: currentClient?.logo || null,
      clientCompany: currentClient?.company || '',
      clientType: currentClient?.clientType,
      clientAge: currentClient?.age,
      brandColors: currentClient?.brandColors,
      logoFit: 'contain',
    }
  })

  // Sync branding with ALL client fields whenever the selected client changes (e.g. navigating from Clients page)
  useEffect(() => {
    if (selectedClient) {
      // Apply client brand colors to the theme if available
      const brandColors = selectedClient.brandColors
      const hasBrandColors = brandColors && brandColors.length >= 2

      setBranding(prev => ({
        ...prev,
        clientName: selectedClient.name,
        footerText: `Wealth Advisory Engage · Prepared for ${selectedClient.name}`,
        // Inject all client metadata so cover slide & PPTX are fully personalised
        clientLogo: selectedClient.logo || null,
        clientCompany: selectedClient.company || '',
        clientType: selectedClient.clientType,
        clientAge: selectedClient.age,
        brandColors: selectedClient.brandColors,
        // Auto-apply client brand colors to the presentation theme if available
        ...(hasBrandColors ? {
          primaryColor: brandColors![0],
          secondaryColor: brandColors![1] || brandColors![0],
        } : {}),
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

  const getAiOptions = () => {
    const model = localStorage.getItem('decora_gemini_model') || 'pro'
    const systemPrompt = localStorage.getItem('decora_system_prompt') || ''
    const tempStr = localStorage.getItem('decora_temperature')
    const temperature = tempStr ? parseFloat(tempStr) : 0.7
    return { model, systemPrompt, temperature }
  }

  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false)

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
          options: getAiOptions(),
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
          options: getAiOptions(),
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
          options: getAiOptions(),
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
          options: getAiOptions(),
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

  const updateSlideOverride = (key: string, value: any) => {
    setDeck(deck.map(s => {
      if (s.id === selectedSlideId) {
        const overrides = { ...((s as any).overrides || {}), [key]: value };
        return { ...s, overrides };
      }
      return s;
    }));
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
          options: getAiOptions(),
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
      overrides: (slideItem as any).overrides || {},
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
      minHeight: '100%',
      background: 'transparent',
      color: '#0F172A',
    }}>
      {/* Global Print Styling Injection */}
      <style>{`
        @media print {
          /* Force backgrounds and colors to print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide normal screen items including sidebar and header */
          #screen-root, aside, header, nav, footer, button, select, input, textarea, .no-print {
            display: none !important;
          }
          /* Reset root layout margins and height for printing */
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            background: ${branding.backgroundColor} !important;
          }
          /* Remove sidebar margins from main layout */
          aside + div {
            margin-left: 0 !important;
            padding: 0 !important;
            height: auto !important;
            display: block !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            display: block !important;
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
      <div id="screen-root" style={{ width: '100%', height: '100%' }}>

        {deckBuilderStep !== 'workspace' ? (
          <div className="wizard-screen">
            {deckBuilderStep === 'start' && (() => {
              const filteredLib = SHARED_PRESET_TEMPLATES.filter(t => {
                const matchSearch = t.name.toLowerCase().includes(libSearch.toLowerCase()) ||
                  t.description.toLowerCase().includes(libSearch.toLowerCase())
                const matchCat = libCategory === 'all' || t.category === libCategory
                return matchSearch && matchCat
              })

              return (
                <div style={{ animation: 'fadeIn 0.25s ease' }}>
                  {/* Deck Library Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Deck Library</h1>
                      <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                        {SHARED_PRESET_TEMPLATES.length} presentation templates · Choose one to launch
                      </p>
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

                  {/* Search + Category filter bar */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 28, alignItems: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '7px 12px', borderRadius: 8, flex: 1, maxWidth: 300 }}>
                      <Search size={13} color="#94A3B8" />
                      <input
                        type="text"
                        value={libSearch}
                        onChange={e => setLibSearch(e.target.value)}
                        placeholder="Search templates..."
                        style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#0F172A', width: '100%', fontFamily: 'inherit' }}
                      />
                      {libSearch && (
                        <button onClick={() => setLibSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' }}>
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[
                        { key: 'all', label: 'All' },
                        { key: 'performance', label: 'Performance' },
                        { key: 'planning', label: 'Planning' },
                        { key: 'risk', label: 'Risk' },
                        { key: 'strategy', label: 'Strategy' }
                      ].map(cat => (
                        <button
                          key={cat.key}
                          onClick={() => setLibCategory(cat.key)}
                          style={{
                            padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: libCategory === cat.key ? '#2563EB' : 'transparent',
                            color: libCategory === cat.key ? '#fff' : '#64748B',
                            fontSize: 12.5, fontWeight: 600, transition: 'all 0.15s',
                          }}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Template Cards Grid — same layout as Templates page */}
                  {filteredLib.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', border: '1px dashed #E2E8F0', borderRadius: 16 }}>
                      <p style={{ color: '#94A3B8', fontSize: 13.5 }}>No templates match your search.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                      {filteredLib.map(tmpl => (
                        <div
                          key={tmpl.id}
                          style={{
                            background: '#FFFFFF', border: '1px solid #E2E8F0',
                            borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${tmpl.color}22` }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                        >
                          {/* Top accent strip */}
                          <div style={{ height: 4, background: `linear-gradient(90deg, ${tmpl.color}, ${tmpl.secondaryColor || tmpl.color}80)` }} />

                          <div style={{ padding: '20px 22px', flex: 1 }}>
                            {/* Top row: monogram + badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                  width: 42, height: 42, borderRadius: 10,
                                  background: `${tmpl.color}12`, border: `1px solid ${tmpl.color}30`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  flexShrink: 0,
                                }}>
                                  <span style={{ fontSize: 18, fontWeight: 800, color: tmpl.color, fontFamily: "'Outfit', sans-serif" }}>
                                    {tmpl.category === 'performance' ? 'Pf' : tmpl.category === 'planning' ? 'Pl' : tmpl.category === 'risk' ? 'Rk' : 'St'}
                                  </span>
                                </div>
                                <div>
                                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: tmpl.color, marginBottom: 2 }}>{tmpl.category}</div>
                                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>{tmpl.slidesCount} slides</div>
                                </div>
                              </div>
                              {tmpl.badge && (
                                <span style={{
                                  fontSize: 10, fontWeight: 700, color: '#92400E',
                                  background: '#FEF3C7', border: '1px solid #FDE68A',
                                  padding: '3px 9px', borderRadius: 20, letterSpacing: '0.02em',
                                }}>
                                  {tmpl.badge}
                                </span>
                              )}
                            </div>

                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 7px 0', letterSpacing: '-0.02em' }}>{tmpl.name}</h3>
                            <p style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.6, margin: '0 0 14px 0' }}>{tmpl.description}</p>

                            {/* Tags */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              {tmpl.tags.map((tag, i) => (
                                <span key={i} style={{ fontSize: 10.5, color: '#64748B', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Actions footer */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #E2E8F0', padding: '10px 14px', gap: 8 }}>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                setSelectedTemplate(tmpl.name)
                                setDeckBuilderStep('template-selection')
                              }}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '8px 0', background: '#F8FAFC', border: '1px solid #E2E8F0',
                                borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: '#475569', cursor: 'pointer'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                              onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                            >
                              View Details
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                setSelectedTemplate(tmpl.name)
                                setDeckBuilderStep('template-config')
                              }}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '8px 0', background: tmpl.color, border: 'none',
                                borderRadius: 8, fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', cursor: 'pointer',
                                transition: 'opacity 0.15s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                              Use Template →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}

            
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
                      setCurrentPage('deck-config')
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

            {deckBuilderStep === 'template-selection' && (() => {
              const filteredTemplates = SHARED_PRESET_TEMPLATES.filter(t => {
                const matchSearch = t.name.toLowerCase().includes(templateSearch.toLowerCase()) || 
                                    t.description.toLowerCase().includes(templateSearch.toLowerCase());
                const matchCat = templateCategory === 'all' || t.category === templateCategory;
                return matchSearch && matchCat;
              });

              return (
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

                  {/* Search and Filter bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px' }}>
                      <Search size={14} color="#64748B" />
                      <input
                        type="text"
                        value={templateSearch}
                        onChange={e => setTemplateSearch(e.target.value)}
                        placeholder="Search templates..."
                        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#0F172A', fontFamily: 'inherit' }}
                      />
                      {templateSearch && (
                        <button onClick={() => setTemplateSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' }}>
                          <X size={13} />
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[
                        { key: 'all', label: 'All' },
                        { key: 'performance', label: 'Performance' },
                        { key: 'planning', label: 'Planning' },
                        { key: 'risk', label: 'Risk' },
                        { key: 'strategy', label: 'Strategy' }
                      ].map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => setTemplateCategory(cat.key)}
                          style={{
                            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: templateCategory === cat.key ? '#2563EB' : 'transparent',
                            color: templateCategory === cat.key ? '#ffffff' : '#64748B',
                            fontSize: 12.5, fontWeight: 600, transition: 'all 0.15s',
                          }}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Template List from shared source */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                    {filteredTemplates.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed #E2E8F0', borderRadius: 16 }}>
                        <p style={{ color: '#94A3B8', fontSize: 13.5 }}>No templates match your search.</p>
                      </div>
                    ) : (
                      filteredTemplates.map((tmpl) => (
                        <div
                          key={tmpl.id}
                          onClick={() => { setSelectedTemplate(tmpl.name); setDeckBuilderStep('template-config'); }}
                          style={{
                            background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
                            padding: '20px 24px', cursor: 'pointer', transition: 'all 0.18s ease',
                            display: 'flex', alignItems: 'center', gap: 20
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = tmpl.color; e.currentTarget.style.boxShadow = `0 4px 16px ${tmpl.color}20` }}
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
                            <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 10px 0', lineHeight: 1.5 }}>{tmpl.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Requires:</span>
                              {tmpl.tags.map(tag => (
                                <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#F1F5F9', color: '#475569', fontWeight: 500 }}>{tag}</span>
                              ))}
                            </div>
                          </div>

                          {/* Slide count + arrow */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                            <span style={{ fontSize: 12, color: '#94A3B8' }}>{tmpl.slidesCount} slides</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })()}

            {deckBuilderStep === 'template-config' && (() => {
              const currentTemplateObj = SHARED_PRESET_TEMPLATES.find(t => t.name === selectedTemplate || t.id === selectedTemplate);
              
              const outlineItems = currentTemplateObj
                ? currentTemplateObj.slides.map((s, idx) => {
                    const num = String(idx + 1).padStart(2, '0');
                    let show = true;
                    if (s.type === 'metrics' || s.type === 'montecarlo') show = includeCharts;
                    if (s.type === 'holdings') show = includeBenchmark;
                    if (s.type === 'timeline' || s.type === 'risk') show = includeMarketOutlook;
                    return { num, name: s.title, show };
                  })
                : [
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
                                <select
                                  value={selectedClient?.id || ''}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    const client = clients.find(c => c.id === val)
                                    if (client) {
                                      selectClient(client)
                                      const brandColors = client.brandColors
                                      const hasBrandColors = brandColors && brandColors.length >= 2
                                      setBranding(prev => ({
                                        ...prev,
                                        clientName: client.name,
                                        footerText: `Wealth Advisory Engage · Prepared for ${client.name}`,
                                        clientLogo: client.logo || null,
                                        clientCompany: client.company || '',
                                        clientType: client.clientType,
                                        clientAge: client.age,
                                        brandColors: client.brandColors,
                                        ...(hasBrandColors ? {
                                          primaryColor: brandColors![0],
                                          secondaryColor: brandColors![1] || brandColors![0],
                                        } : {}),
                                      }))
                                      fetchDashboardData(client.persona)
                                    } else {
                                      selectClient(null)
                                      setBranding(prev => ({
                                        ...prev,
                                        clientName: '',
                                        footerText: 'Wealth Advisory Engage · Confidential',
                                        clientLogo: null,
                                        clientCompany: '',
                                        clientType: undefined,
                                        clientAge: undefined,
                                        brandColors: undefined,
                                      }))
                                    }
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #E2E8F0',
                                    outline: 'none',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#0F172A',
                                    background: '#F8FAFC',
                                    marginTop: 4,
                                    boxSizing: 'border-box',
                                    cursor: 'pointer',
                                    height: '38px',
                                  }}
                                >
                                  <option value="">Select a client...</option>
                                  {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
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
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                fontFamily: "'Inter', sans-serif"
              }}>
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid #E8EDF5',
                  borderRadius: 24,
                  padding: '40px 48px',
                  boxShadow: '0 20px 40px -15px rgba(15,23,42,0.08)',
                  width: '100%',
                  maxWidth: 520,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 28,
                  animation: 'fadeIn 0.4s ease'
                }}>
                  {/* Spinner/Icon Header */}
                  <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      border: '4px solid rgba(37,99,235,0.06)',
                      borderTopColor: '#2563EB',
                      animation: 'spin 1.2s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite'
                    }} />
                    <Sparkles size={28} color="#2563EB" style={{ animation: 'pulse 1.8s infinite' }} />
                  </div>

                  {/* Header Title */}
                  <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: 21, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                      AI Story Engine Analyzing...
                    </h2>
                    <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 6, margin: 0, fontWeight: 500 }}>
                      Building your client-ready advisory slide deck
                    </p>
                  </div>

                  {/* Progress Bar Container */}
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ width: '100%', height: 6, background: '#F1F5F9', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{
                        width: `${loadProgress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
                        borderRadius: 10,
                        transition: 'width 0.4s ease-out'
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>
                      <span>PROGRESS</span>
                      <span style={{ color: '#2563EB' }}>{loadProgress}%</span>
                    </div>
                  </div>

                  {/* Checklist Steps */}
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid #F1F5F9', paddingTop: 20 }}>
                    {loadSteps.map((step, idx) => {
                      const isCompleted = loadProgress > (idx * 25) + 20;
                      const isActive = loadProgress >= (idx * 25) && loadProgress <= (idx * 25) + 20;
                      
                      return (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          opacity: isCompleted ? 1 : isActive ? 1 : 0.4,
                          transition: 'opacity 0.3s ease'
                        }}>
                          {isCompleted ? (
                            <div style={{
                              width: 18, height: 18, borderRadius: '50%',
                              background: '#E6F4EA', border: '1px solid #34D399',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#10B981', flexShrink: 0
                            }}>
                              <Check size={11} strokeWidth={3} />
                            </div>
                          ) : isActive ? (
                            <div style={{
                              width: 18, height: 18, borderRadius: '50%',
                              border: '2px solid #2563EB', borderTopColor: 'transparent',
                              animation: 'spin 1s linear infinite', flexShrink: 0
                            }} />
                          ) : (
                            <div style={{
                              width: 18, height: 18, borderRadius: '50%',
                              border: '1px solid #CBD5E1', flexShrink: 0
                            }} />
                          )}
                          <span style={{
                            fontSize: 13,
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#0F172A' : '#475569'
                          }}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
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
                  ? '#F1F5F9'
                  : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                border: 'none',
                color: isGeneratingReport ? '#94A3B8' : '#fff',
                fontSize: 12,
                fontWeight: 700,
                padding: '8px 16px',
                borderRadius: 8,
                cursor: isGeneratingReport ? 'wait' : 'pointer',
                boxShadow: isGeneratingReport ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.2)',
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
                background: isBulkDrafting ? '#F1F5F9' : '#FAF5FF',
                border: isBulkDrafting ? '1px solid #E2E8F0' : '1px solid #C084FC',
                color: isBulkDrafting ? '#94A3B8' : '#7C3AED',
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


            <button
              onClick={() => {
                const idx = deck.findIndex((s) => s.id === selectedSlideId)
                setPresentationIndex(idx >= 0 ? idx : 0)
                setIsPresenting(true)
                // Request native browser fullscreen
                const el = document.documentElement
                if (el.requestFullscreen) el.requestFullscreen()
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#475569',
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
                background: '#EFF6FF',
                border: '1px solid #93C5FD',
                color: '#1D4ED8',
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
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                border: 'none',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
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
            gap: 20,
            height: 'calc(100vh - 180px)',
            gridTemplateColumns: '270px 1fr 320px',
            transition: 'grid-template-columns 0.3s ease',
            alignItems: 'stretch',
            overflow: 'hidden'
          }}
        >
          {/* COLUMN 1: Slide Manager */}
          <div style={{
            width: 270,
            flexShrink: 0,
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                Slide Library
              </h3>
              <span style={{
                fontSize: 10, fontWeight: 800, color: '#34d399',
                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                borderRadius: 6, padding: '4px 8px',
              }}>
                {deck.length} BRICKS
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingRight: 4 }}>
              {deck.map((slide, index) => {
                const isSelected = slide.id === selectedSlideId
                return (
                  <div
                    key={slide.id}
                    onClick={() => setSelectedSlideId(slide.id)}
                    style={{
                      background: isSelected ? '#EFF6FF' : '#F8FAFC',
                      border: isSelected ? '1px solid #2563EB' : '1px solid #E2E8F0',
                      borderRadius: 10,
                      padding: '14px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1, marginRight: 8 }}>
                      <span style={{ fontSize: 13, color: isSelected ? '#38bdf8' : '#475569', fontWeight: 800, flexShrink: 0 }}>
                        {index + 1}
                      </span>
                      <span style={{ 
                        fontSize: 13, 
                        fontWeight: 700, 
                        color: isSelected ? '#1D4ED8' : '#0F172A', 
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                        flex: 1
                      }}>
                        {getSlideShortLabel(slide.type, slide.title)}
                      </span>
                    </div>

                    {/* Move & Delete controls */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => moveSlide(index, 'up')}
                        disabled={index === 0}
                        style={{
                          background: 'none', border: 'none',
                          color: index === 0 ? '#CBD5E1' : '#64748b',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', padding: 4,
                        }}
                        title="Move Up"
                      >
                        <ChevronUp size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => moveSlide(index, 'down')}
                        disabled={index === deck.length - 1}
                        style={{
                          background: 'none', border: 'none',
                          color: index === deck.length - 1 ? '#CBD5E1' : '#64748b',
                          cursor: index === deck.length - 1 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', padding: 4,
                        }}
                        title="Move Down"
                      >
                        <ChevronDown size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => deleteSlide(slide.id)}
                        disabled={deck.length <= 1}
                        style={{
                          background: 'none', border: 'none',
                          color: deck.length <= 1 ? '#CBD5E1' : '#f87171',
                          cursor: deck.length <= 1 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', padding: 4,
                          marginLeft: 4,
                        }}
                        title="Delete Slide"
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Slide Brick Picker */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 12 }}>+ ADD SLIDE BRICK</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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
                      borderRadius: 8,
                      fontSize: 11,
                      padding: '8px 12px',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflowY: 'auto', paddingRight: 4 }}>



            {/* Single preview with inline editing */}
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
              {selectedSlide && <SlidePreview slide={selectedSlide} branding={branding} />}
              
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
                              options: getAiOptions(),
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
          </div> {/* End Column 2 */}

          {/* COLUMN 3: Tabbed Sidebar Inspector */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 16,
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: 12, padding: '20px 24px',
            boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
            flex: 1,
            overflow: 'hidden'
          }}>
            {/* Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: 12 }}>
              <button onClick={() => setActiveTab('content')} style={{ flex: 1, padding: '14px 0', background: 'none', borderBottom: activeTab === 'content' ? '2px solid #2563EB' : '2px solid transparent', color: activeTab === 'content' ? '#2563EB' : '#64748B', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, transition: 'all 0.2s' }}>Content</button>
              <button onClick={() => setActiveTab('branding')} style={{ flex: 1, padding: '14px 0', background: 'none', borderBottom: activeTab === 'branding' ? '2px solid #7C3AED' : '2px solid transparent', color: activeTab === 'branding' ? '#7C3AED' : '#64748B', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, transition: 'all 0.2s' }}>Branding</button>
              <button onClick={() => setActiveTab('data')} style={{ flex: 1, padding: '14px 0', background: 'none', borderBottom: activeTab === 'data' ? '2px solid #059669' : '2px solid transparent', color: activeTab === 'data' ? '#059669' : '#64748B', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, transition: 'all 0.2s' }}>Data</button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4, paddingBottom: 40 }}>
              
              {/* CONTENT TAB */}
              {activeTab === 'content' && selectedSlide && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s ease' }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 6, fontWeight: 700 }}>
                      {selectedSlide.type === 'custom' ? 'SLIDE TITLE' : 'SLIDE TITLE OVERRIDE'}
                    </label>
                    <input
                      type="text"
                      placeholder="Slide Title"
                      value={selectedSlide.title || ''}
                      onChange={(e) => updateCustomSlideContent('title', e.target.value)}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 8, color: '#0F172A', padding: '12px 14px', fontSize: 13, boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>
                        {selectedSlide.type === 'custom' ? 'BULLET POINTS' : 'ADVISOR COMMENTARY'}
                      </label>
                      <button
                        onClick={handleGenerateAIDraft}
                        disabled={isDrafting}
                        style={{
                          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(167, 139, 250, 0.15))',
                          border: '1px solid rgba(167, 139, 250, 0.3)', borderRadius: 6, color: '#c084fc',
                          fontSize: 10, fontWeight: 800, padding: '4px 10px', display: 'flex', alignItems: 'center',
                          gap: 6, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        <Sparkles size={12} /> {isDrafting ? 'Drafting...' : 'AI Draft'}
                      </button>
                    </div>
                    <textarea
                      rows={selectedSlide.type === 'custom' ? 6 : 4}
                      placeholder="Enter custom advice or summary points..."
                      value={selectedSlide.content || ''}
                      onChange={(e) => updateCustomSlideContent('content', e.target.value)}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 8, color: '#0F172A', padding: '12px 14px', fontSize: 13, lineHeight: 1.6,
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
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                        <button
                          onClick={() => handleRefineCommentary('Make the tone highly formal and professional for an institutional partner.')}
                          disabled={isRefining}
                          style={{
                            padding: '6px 10px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                            borderRadius: 6, color: '#475569', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        >
                          <Briefcase size={13} color="#3b82f6" /> Formal Tone
                        </button>
                        <button
                          onClick={() => handleRefineCommentary('Focus heavily on equity growth, target wealth goals, and positive compounding returns.')}
                          disabled={isRefining}
                          style={{
                            padding: '6px 10px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                            borderRadius: 6, color: '#475569', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        >
                          <TrendingUp size={13} color="#10b981" /> Growth Pitch
                        </button>
                        <button
                          onClick={() => handleRefineCommentary('Emphasize defensive hedges, risk parameters, low volatility, and wealth preservation.')}
                          disabled={isRefining}
                          style={{
                            padding: '6px 10px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                            borderRadius: 6, color: '#475569', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        >
                          <ShieldCheck size={13} color="#8b5cf6" /> Capital Shield
                        </button>
                        <button
                          onClick={() => handleRefineCommentary('Format the content as a neat list of bullet points using Unicode dot marks.')}
                          disabled={isRefining}
                          style={{
                            padding: '6px 10px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                            borderRadius: 6, color: '#475569', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        >
                          <List size={13} color="#f59e0b" /> Bullet Points
                        </button>
                      </div>

                      {/* Custom Refinement */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          placeholder="Or type prompt e.g. translate to French..."
                          value={refineInstruction}
                          onChange={(e) => setRefineInstruction(e.target.value)}
                          style={{
                            flex: 1, background: '#FFFFFF', border: '1px solid #E2E8F0',
                            borderRadius: 6, color: '#0F172A', padding: '8px 10px', fontSize: 11,
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
                            border: 0, borderRadius: 6, color: '#000', fontSize: 11, fontWeight: 700,
                            padding: '0 14px', cursor: refineInstruction.trim() ? 'pointer' : 'not-allowed',
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
                      padding: 14,
                      background: 'rgba(56, 189, 248, 0.03)',
                      border: '1px solid rgba(56, 189, 248, 0.1)',
                      borderRadius: 10,
                    }}>
                      <label style={{ fontSize: 11, color: '#38bdf8', fontWeight: 800, display: 'block', marginBottom: 8 }}>
                        ✦ Gemini Custom Slide Composer
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Tell Gemini what this custom slide should explain (e.g. impact of high interest rates on small caps)..."
                        value={customSlidePrompt}
                        onChange={(e) => setCustomSlidePrompt(e.target.value)}
                        style={{
                          width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                          borderRadius: 8, color: '#0F172A', padding: '10px 12px', fontSize: 13, lineHeight: 1.5,
                          boxSizing: 'border-box', resize: 'none', marginBottom: 10
                        }}
                      />
                      <button
                        onClick={handleGenerateAIDraft}
                        disabled={isDrafting}
                        style={{
                          width: '100%',
                          background: `linear-gradient(135deg, #38bdf8, #a78bfa)`,
                          border: 0, borderRadius: 8, color: '#000', fontSize: 13, fontWeight: 800,
                          padding: '10px 0', cursor: isDrafting ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isDrafting ? 'Drafting Custom Slide...' : 'Generate Custom Slide Content'}
                      </button>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      PRESENTER NOTES
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Type advisor remarks here..."
                      value={selectedSlide?.notes || ''}
                      onChange={(e) => updateSlideNotes(e.target.value)}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 8, color: '#0F172A', padding: '12px 14px', fontSize: 13, lineHeight: 1.6,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Dynamic component overrides based on slide type */}
                  <div style={{
                    marginTop: 16,
                    borderTop: '1px solid #E2E8F0',
                    paddingTop: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}>
                    <label style={{ fontSize: 11, color: '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Edit Slide Components
                    </label>

                    {selectedSlide.type === 'cover' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 700 }}>CLIENT NAME OVERRIDE</label>
                          <input
                            type="text"
                            placeholder="Valued Client / Partner"
                            value={(selectedSlide as any).overrides?.clientName || branding.clientName || ''}
                            onChange={(e) => updateSlideOverride('clientName', e.target.value)}
                            style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#0F172A', padding: '10px 12px', fontSize: 12, boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 700 }}>PRESENTATION DATE</label>
                          <input
                            type="text"
                            placeholder="e.g. October 2026"
                            value={(selectedSlide as any).overrides?.date || ''}
                            onChange={(e) => updateSlideOverride('date', e.target.value)}
                            style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#0F172A', padding: '10px 12px', fontSize: 12, boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    )}

                    {selectedSlide.type === 'metrics' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 700 }}>SHARPE RATIO</label>
                          <input
                            type="number"
                            step="0.01"
                            value={(selectedSlide as any).overrides?.sharpe !== undefined ? (selectedSlide as any).overrides.sharpe : (metrics?.sharpe || 1.84)}
                            onChange={(e) => updateSlideOverride('sharpe', parseFloat(e.target.value) || 0)}
                            style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#0F172A', padding: '10px 12px', fontSize: 12, boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 700 }}>ALPHA (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={(selectedSlide as any).overrides?.alpha !== undefined ? (selectedSlide as any).overrides.alpha : (metrics?.alpha || 4.2)}
                            onChange={(e) => updateSlideOverride('alpha', parseFloat(e.target.value) || 0)}
                            style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#0F172A', padding: '10px 12px', fontSize: 12, boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 700 }}>BETA</label>
                          <input
                            type="number"
                            step="0.01"
                            value={(selectedSlide as any).overrides?.beta !== undefined ? (selectedSlide as any).overrides.beta : (metrics?.beta || 0.95)}
                            onChange={(e) => updateSlideOverride('beta', parseFloat(e.target.value) || 0)}
                            style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#0F172A', padding: '10px 12px', fontSize: 12, boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 700 }}>VOLATILITY (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={(selectedSlide as any).overrides?.volatility !== undefined ? (selectedSlide as any).overrides.volatility : (metrics?.volatility || 14.5)}
                            onChange={(e) => updateSlideOverride('volatility', parseFloat(e.target.value) || 0)}
                            style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#0F172A', padding: '10px 12px', fontSize: 12, boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 700 }}>YTD RETURN (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={(selectedSlide as any).overrides?.ytdReturn !== undefined ? (selectedSlide as any).overrides.ytdReturn : (metrics?.ytdReturn || 31.7)}
                            onChange={(e) => updateSlideOverride('ytdReturn', parseFloat(e.target.value) || 0)}
                            style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#0F172A', padding: '10px 12px', fontSize: 12, boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 700 }}>MAX DRAWDOWN (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={(selectedSlide as any).overrides?.maxDrawdown !== undefined ? (selectedSlide as any).overrides.maxDrawdown : (metrics?.maxDrawdown || -12.3)}
                            onChange={(e) => updateSlideOverride('maxDrawdown', parseFloat(e.target.value) || 0)}
                            style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#0F172A', padding: '10px 12px', fontSize: 12, boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    )}

                    {selectedSlide.type === 'holdings' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ fontSize: 9.5, color: '#64748b', fontStyle: 'italic' }}>Customize top holdings values directly:</div>
                        {((selectedSlide as any).overrides?.holdings || holdings).slice(0, 4).map((hold: any, hIdx: number) => (
                          <div key={hIdx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, width: 45, color: '#0F172A' }}>{hold.symbol}</span>
                            <input
                              type="text"
                              value={hold.name}
                              placeholder="Name"
                              onChange={(e) => {
                                const newH = [...((selectedSlide as any).overrides?.holdings || holdings)];
                                newH[hIdx] = { ...newH[hIdx], name: e.target.value };
                                updateSlideOverride('holdings', newH);
                              }}
                              style={{ flex: 1.5, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#0F172A', padding: '8px 10px', fontSize: 11, boxSizing: 'border-box' }}
                            />
                            <input
                              type="number"
                              value={hold.value}
                              placeholder="Value ($)"
                              onChange={(e) => {
                                const newH = [...((selectedSlide as any).overrides?.holdings || holdings)];
                                newH[hIdx] = { ...newH[hIdx], value: parseFloat(e.target.value) || 0 };
                                updateSlideOverride('holdings', newH);
                              }}
                              style={{ flex: 1.2, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#0F172A', padding: '8px 10px', fontSize: 11, boxSizing: 'border-box' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedSlide.type === 'risk' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ fontSize: 9.5, color: '#64748b', fontStyle: 'italic' }}>Customize Strategic Target weights:</div>
                        {[
                          { key: 'risk_pct1', label: 'US Equities / Defensive' },
                          { key: 'risk_pct2', label: 'Int\'l Equities / Dividend' },
                          { key: 'risk_pct3', label: 'Alternatives / Treasury' },
                          { key: 'risk_pct4', label: 'Cash / Liquid Reserves' }
                        ].map((field, fIdx) => (
                          <div key={field.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: '#0F172A', fontWeight: 600 }}>{field.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <input
                                type="number"
                                value={(selectedSlide as any).overrides?.[field.key] !== undefined ? (selectedSlide as any).overrides[field.key] : (fIdx === 0 ? 60 : fIdx === 1 ? 20 : fIdx === 2 ? 15 : 5)}
                                onChange={(e) => updateSlideOverride(field.key, parseFloat(e.target.value) || 0)}
                                style={{ width: 60, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#0F172A', padding: '8px 10px', fontSize: 11, textAlign: 'right' }}
                              />
                              <span style={{ fontSize: 11, color: '#64748b' }}>%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedSlide.type === 'montecarlo' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 700 }}>SUCCESS PROBABILITY (%)</label>
                          <input
                            type="number"
                            value={(selectedSlide as any).overrides?.probability !== undefined ? (selectedSlide as any).overrides.probability : (monteCarlo?.probability || 95)}
                            onChange={(e) => updateSlideOverride('probability', parseInt(e.target.value) || 0)}
                            style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#0F172A', padding: '10px 12px', fontSize: 12, boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    )}

                    {selectedSlide.type === 'timeline' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 6, fontWeight: 700 }}>CHART VISUALIZATION TYPE</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                            {[
                              { id: 'area', label: 'Area Chart' },
                              { id: 'line', label: 'Line Chart' },
                              { id: 'bar', label: 'Bar Chart' },
                              { id: 'donut', label: 'Donut Chart' },
                            ].map((opt) => {
                              const active = ((selectedSlide as any).overrides?.chartType || 'area') === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  onClick={() => updateSlideOverride('chartType', opt.id)}
                                  style={{
                                    padding: '8px 10px',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    border: active ? '1px solid var(--accent)' : '1px solid #E2E8F0',
                                    background: active ? 'rgba(37,99,235,0.06)' : '#FFFFFF',
                                    color: active ? 'var(--accent)' : '#475569',
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reset Button */}
                    {Object.keys((selectedSlide as any).overrides || {}).length > 0 && (
                      <button
                        onClick={() => {
                          setDeck(deck.map(s => s.id === selectedSlideId ? { ...s, overrides: undefined } : s))
                        }}
                        style={{
                          marginTop: 6,
                          padding: '6px 12px',
                          background: '#FEF2F2',
                          border: '1px solid #FEE2E2',
                          borderRadius: 8,
                          color: '#EF4444',
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: 'pointer',
                          alignSelf: 'flex-start',
                        }}
                      >
                        Reset Slide Overrides
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* BRANDING TAB */}
              {activeTab === 'branding' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s ease' }}>

                  {/* ✦ AI Theme Studio */}
                  <div style={{
                    padding: 16,
                    background: 'linear-gradient(135deg, rgba(167,139,250,0.06), rgba(56,189,248,0.04))',
                    border: '1px solid rgba(167,139,250,0.2)',
                    borderRadius: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <Sparkles size={16} color="#a78bfa" />
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#c084fc' }}>AI Theme Studio</span>
                      <span style={{ fontSize: 11, color: '#475569', marginLeft: 'auto' }}>Describe → Generate → Apply</span>
                    </div>
                    <textarea
                      rows={2}
                      placeholder={'e.g. "Bold corporate red and white, formal serif font for retirement clients"...'}
                      value={themePrompt}
                      onChange={(e) => setThemePrompt(e.target.value)}
                      style={{
                        width: '100%', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.15)',
                        borderRadius: 8, color: '#4C1D95', padding: '10px 14px', fontSize: 13,
                        lineHeight: 1.5, boxSizing: 'border-box', resize: 'none', marginBottom: 12,
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
                        border: 0, borderRadius: 8, color: isGeneratingTheme || !themePrompt.trim() ? '#475569' : '#000',
                        fontSize: 13, fontWeight: 800, padding: '10px 0',
                        cursor: isGeneratingTheme || !themePrompt.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'all 0.2s',
                      }}
                    >
                      <Sparkles size={14} />
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
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 8, fontWeight: 700 }}>1-CLICK THEMES</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {PRESET_THEMES.map((theme) => (
                        <button
                          key={theme.themeName}
                          onClick={() => applyPresetTheme(theme)}
                          style={{
                            background: branding.themeName === theme.themeName ? 'rgba(124, 58, 237, 0.08)' : '#F8FAFC',
                            border: branding.themeName === theme.themeName ? '1px solid #7C3AED' : '1px solid #E2E8F0',
                            borderRadius: 8, padding: 12, cursor: 'pointer', textAlign: 'left',
                            display: 'flex', flexDirection: 'column', gap: 6, transition: 'all 0.2s',
                          }}
                        >
                          <span style={{ fontSize: 11, fontWeight: 700, color: branding.themeName === theme.themeName ? '#7C3AED' : '#334155' }}>
                            {theme.themeName.split(' (')[0]}
                          </span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <div style={{ width: 14, height: 14, borderRadius: 3, background: theme.primaryColor }} />
                            <div style={{ width: 14, height: 14, borderRadius: 3, background: theme.secondaryColor }} />
                            <div style={{ width: 14, height: 14, borderRadius: 3, background: theme.backgroundColor }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 6, fontWeight: 700 }}>CLIENT NAME / TITLE</label>
                    <input
                      type="text"
                      value={branding.clientName}
                      onChange={(e) => setBranding({ ...branding, clientName: e.target.value })}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 8, color: '#0F172A', padding: '12px 14px', fontSize: 13, boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 6, fontWeight: 700 }}>FOOTER LEGAL REMARKS</label>
                    <input
                      type="text"
                      value={branding.footerText}
                      onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 8, color: '#0F172A', padding: '12px 14px', fontSize: 13, boxSizing: 'border-box',
                      }}
                    />
                  </div>

                   <div>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 6, fontWeight: 700 }}>LOGO PRESET, FIT & FONT</label>
                    <select
                      value={branding.logoPreset}
                      onChange={(e) => setBranding({ ...branding, logoPreset: e.target.value })}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 8, color: '#0F172A', padding: '12px 14px', fontSize: 13, cursor: 'pointer', marginBottom: 8,
                      }}
                    >
                      <option value="standard">Standard — Decora</option>
                      <option value="premium">Premium White-Label</option>
                      <option value="custom">Custom Logo URL</option>
                    </select>
                    <select
                      value={branding.logoFit || 'contain'}
                      onChange={(e) => setBranding({ ...branding, logoFit: e.target.value as any })}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 8, color: '#0F172A', padding: '12px 14px', fontSize: 13, cursor: 'pointer', marginBottom: 8,
                      }}
                    >
                      <option value="contain">Contain (Keep Aspect Ratio)</option>
                      <option value="cover">Cover (Fill & Crop)</option>
                      <option value="fill">Stretch (Fit to Frame)</option>
                    </select>
                    <select
                      value={branding.fontFamily || 'Outfit'}
                      onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 8, color: '#0F172A', padding: '12px 14px', fontSize: 13, cursor: 'pointer',
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
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 6, fontWeight: 700 }}>PORTFOLIO PERSONA</label>
                    <select
                      value={selectedPersona}
                      onChange={(e) => setPersona(e.target.value as any)}
                      style={{
                        width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 8, color: '#0F172A', padding: '12px 14px', fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      <option value="young-investor">Young Investor (High Risk)</option>
                      <option value="family-planner">Family Planner (Medium Risk)</option>
                      <option value="retirement-client">Retirement Client (Low Risk)</option>
                    </select>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 10, lineHeight: 1.5 }}>
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
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: '#000',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>

          {/* True Fullscreen Slide — fills entire viewport, maintaining 16:9 */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
          }}>
            {deck[presentationIndex] && <SlidePreview slide={deck[presentationIndex]} branding={branding} />}
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
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  padding: '6px 10px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="3000" style={{ background: '#1e293b', color: '#FFFFFF' }}>3s interval</option>
                <option value="5000" style={{ background: '#1e293b', color: '#FFFFFF' }}>5s interval</option>
                <option value="10000" style={{ background: '#1e293b', color: '#FFFFFF' }}>10s interval</option>
              </select>
            </div>

            <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.1)' }} />

            <button
              onClick={() => {
                setIsPresenting(false)
                setIsAutoplay(false)
                if (document.fullscreenElement) document.exitFullscreen()
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
