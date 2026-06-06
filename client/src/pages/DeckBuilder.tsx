import React, { useState, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
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
import { ChevronUp, ChevronDown, Trash2, Printer, Download, Play, Pause, X, Sparkles, Library, GitFork, FileOutput } from 'lucide-react'

// ─── Engage Architecture Section ─────────────────────────────────────────────
const EngageArchitectureSection: React.FC = () => (
  <div style={{
    marginTop: 28,
    background: 'rgba(15,23,42,0.5)',
    border: '1px solid rgba(99,179,237,0.1)',
    borderRadius: 20,
    padding: '28px 28px 32px',
    backdropFilter: 'blur(20px)',
  }}>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
      <div style={{
        width: 4, height: 28, borderRadius: 2,
        background: 'linear-gradient(180deg, #38bdf8, #a78bfa)',
      }} />
      <div>
        <h2 style={{
          fontSize: 15, fontWeight: 800, margin: 0,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          background: 'linear-gradient(90deg, #f1f5f9, #94a3b8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          fontFamily: 'Outfit, sans-serif',
        }}>
          The Engage Architecture for Track A
        </h2>
        <p style={{ fontSize: 11, color: '#475569', margin: '3px 0 0 0' }}>
          Three integrated pillars that power automated, brand-perfect client presentations.
        </p>
      </div>
    </div>

    {/* Architecture 3-card grid */}
    <div className="arch-grid">
      {/* Card 1 – The Library */}
      <div className="arch-card">
        <div className="arch-icon-wrap">
          <Library size={26} color="#38bdf8" strokeWidth={1.8} />
        </div>
        <div>
          <h3 style={{
            fontSize: 15, fontWeight: 800, color: '#f1f5f9', margin: '0 0 10px 0',
            fontFamily: 'Outfit, sans-serif',
          }}>The Library</h3>
          <p style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
            A library of{' '}
            <strong style={{ color: '#f1f5f9' }}>&ldquo;Slide Bricks&rdquo;</strong>
            {' '}— performance charts, risk heatmaps, and fee tables —
            pre-approved by the Alex Forbes brand team.
          </p>
        </div>
      </div>

      {/* Card 2 – The Orchestrator */}
      <div className="arch-card">
        <div className="arch-icon-wrap" style={{
          background: 'rgba(167,139,250,0.1)',
          borderColor: 'rgba(167,139,250,0.2)',
        }}>
          <GitFork size={26} color="#a78bfa" strokeWidth={1.8} />
        </div>
        <div>
          <h3 style={{
            fontSize: 15, fontWeight: 800, color: '#f1f5f9', margin: '0 0 10px 0',
            fontFamily: 'Outfit, sans-serif',
          }}>The Orchestrator</h3>
          <p style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
            The logic that maps{' '}
            <strong style={{ color: '#f1f5f9' }}>Client Facts</strong>
            {' '}to the slide bricks, ensuring the right numbers land on
            the right charts instantly.
          </p>
        </div>
      </div>

      {/* Card 3 – The Export Engine */}
      <div className="arch-card">
        <div className="arch-icon-wrap" style={{
          background: 'rgba(52,211,153,0.1)',
          borderColor: 'rgba(52,211,153,0.2)',
        }}>
          <FileOutput size={26} color="#34d399" strokeWidth={1.8} />
        </div>
        <div>
          <h3 style={{
            fontSize: 15, fontWeight: 800, color: '#f1f5f9', margin: '0 0 10px 0',
            fontFamily: 'Outfit, sans-serif',
          }}>The Export Engine</h3>
          <p style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
            The final &ldquo;Compile&rdquo; step that turns logic into a{' '}
            <strong style={{ color: '#f1f5f9' }}>Publishable PPTX</strong>,
            giving Adviser an editable deck ready for her meeting.
          </p>
        </div>
      </div>
    </div>
  </div>
)

const PRESET_THEMES = [
  {
    themeName: 'Midnight Blue (Default)',
    backgroundColor: '#0b1329',
    textColor: '#ffffff',
    primaryColor: '#38bdf8',
    secondaryColor: '#a78bfa',
    fontFamily: 'Outfit',
  },
  {
    themeName: 'Forest Wealth',
    backgroundColor: '#051812',
    textColor: '#ffffff',
    primaryColor: '#10b981',
    secondaryColor: '#34d399',
    fontFamily: 'Outfit',
  },
  {
    themeName: 'Charcoal Gold',
    backgroundColor: '#111111',
    textColor: '#ffffff',
    primaryColor: '#d97706',
    secondaryColor: '#fbbf24',
    fontFamily: 'Playfair Display',
  },
  {
    themeName: 'Deep Indigo',
    backgroundColor: '#0b0c16',
    textColor: '#ffffff',
    primaryColor: '#6366f1',
    secondaryColor: '#818cf8',
    fontFamily: 'Inter',
  },
  {
    themeName: 'Carbon Platinum',
    backgroundColor: '#18181b',
    textColor: '#f4f4f5',
    primaryColor: '#e2e8f0',
    secondaryColor: '#94a3b8',
    fontFamily: 'Plus Jakarta Sans',
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
    selectedSlideId,
    setSelectedSlideId,
    addSlide,
    deleteSlide,
    moveSlide,
    updateSlideNotes,
    updateCustomSlideContent,
    updateSpecificSlideContent,
  } = useAppStore()

  // Make sure we have data loaded for the selected persona
  useEffect(() => {
    if (deckBuilderStep === 'workspace') {
      fetchDashboardData(selectedPersona)
    }
  }, [selectedPersona, deckBuilderStep])

  const handleClientSelect = async (persona: typeof selectedPersona) => {
    setPersona(persona)
    setDeckBuilderStep('generating')
    
    // Simulate AI Story Engine analysis
    setTimeout(() => {
      setDeckBuilderStep('workspace')
    }, 4000)
  }

  const [isDrafting, setIsDrafting] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'content' | 'branding' | 'data'>('content')

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
    themeName: 'Midnight Blue (Default)',
    backgroundColor: '#0b1329',
    textColor: '#ffffff',
    primaryColor: '#38bdf8',
    secondaryColor: '#a78bfa',
    clientName: 'Sarah Jenkins',
    logoPreset: 'standard',
    logoUrl: '',
    footerText: 'Confidential Strategy Report · Prepared for Jenkins Family Trust',
    fontFamily: 'Outfit',
  })

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
        }),
      })
      const data = await response.json()
      if (data && data.draft) {
        updateCustomSlideContent('content', data.draft)
      }
    } catch (err) {
      console.error('Failed to generate AI draft', err)
    } finally {
      setIsDrafting(false)
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
      background: '#020617',
      color: '#ffffff',
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
        <Navbar />

        {deckBuilderStep !== 'workspace' ? (
          <div className="wizard-screen">
            {deckBuilderStep === 'start' && (
              <div className="wizard-start">
                <h1 style={{ fontSize: 36, fontWeight: 800, color: '#f8fafc', margin: 0 }}>Deck Builder</h1>
                <p style={{ color: '#94a3b8', fontSize: 16 }}>Create an engaging investment story for your client in minutes.</p>
                <button 
                  onClick={() => setDeckBuilderStep('template-selection')}
                  style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #38bdf8, #a78bfa)', color: 'white', borderRadius: 8, fontSize: 16, fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(56,189,248,0.4)' }}
                >
                  Create New Investment Story
                </button>
              </div>
            )}
            
            {deckBuilderStep === 'template-selection' && (
                <div style={{ padding: '40px 20px', maxWidth: 900, margin: '0 auto' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 700, marginBottom: 30, textAlign: 'center', color: '#f8fafc' }}>Choose a Template</h2>
                  <div className="wizard-template-grid">
                  {['Retirement Review', 'Portfolio Performance Review', 'Risk Assessment', 'Fee Impact Analysis', 'Wealth Growth Review', 'Sustainability Planning'].map(template => (
                    <button 
                      key={template}
                      onClick={() => { setSelectedTemplate(template); setDeckBuilderStep('client-selection'); }}
                      style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(99, 179, 237, 0.2)', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.background = 'rgba(56,189,248,0.1)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99, 179, 237, 0.2)'; e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)' }}
                    >
                      {template}
                    </button>
                  ))}
                  <button 
                      onClick={() => { setSelectedTemplate('AI Generated Deck'); setDeckBuilderStep('client-selection'); }}
                      style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(167, 139, 250, 0.15))', border: '1px solid #a78bfa', borderRadius: 12, color: '#c084fc', fontSize: 16, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s', gridColumn: '1 / -1' }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(167, 139, 250, 0.3)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <Sparkles size={20} /> AI Generated Deck
                  </button>
                </div>
              </div>
            )}
            
            {deckBuilderStep === 'client-selection' && (
              <div style={{ padding: '40px 20px', maxWidth: 600, margin: '0 auto' }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 30, textAlign: 'center', color: '#f8fafc' }}>Select a Client</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <button onClick={() => handleClientSelect('retirement-client')} style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(99, 179, 237, 0.2)', borderRadius: 12, color: 'white', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.background = 'rgba(56,189,248,0.1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99, 179, 237, 0.2)'; e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)' }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>David</div>
                    <div style={{ color: '#94a3b8', marginTop: 6, fontSize: 14 }}>Age: 45 | Retirement Goal: 60</div>
                  </button>
                  <button onClick={() => handleClientSelect('family-planner')} style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(99, 179, 237, 0.2)', borderRadius: 12, color: 'white', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.background = 'rgba(56,189,248,0.1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99, 179, 237, 0.2)'; e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)' }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>Sarah</div>
                    <div style={{ color: '#94a3b8', marginTop: 6, fontSize: 14 }}>Age: 38 | College Planning</div>
                  </button>
                  <button onClick={() => handleClientSelect('young-investor')} style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(99, 179, 237, 0.2)', borderRadius: 12, color: 'white', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.background = 'rgba(56,189,248,0.1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99, 179, 237, 0.2)'; e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)' }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>Alex</div>
                    <div style={{ color: '#94a3b8', marginTop: 6, fontSize: 14 }}>Age: 28 | Wealth Growth</div>
                  </button>
                </div>
              </div>
            )}
            
            {deckBuilderStep === 'generating' && (
              <div className="wizard-start">
                <div style={{ width: 60, height: 60, border: '4px solid rgba(56, 189, 248, 0.1)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <h2 style={{ fontSize: 24, color: '#f8fafc', margin: 0 }}>AI Story Engine Analyzing...</h2>
                <div style={{ color: '#94a3b8', textAlign: 'center', fontSize: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
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
        {/* Architecture Section */}
        <EngageArchitectureSection />

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
        <div className="deck-grid" style={{ marginTop: 20 }}>
          {/* COLUMN 1: Slide Manager */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(99, 179, 237, 0.08)',
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
                      background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 6, 23, 0.3)',
                      border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)',
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
                      <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
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
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
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
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 6,
                      fontSize: 10,
                      padding: '5px 10px',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(56,189,248,0.1)'
                      e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)'
                      e.currentTarget.style.color = '#38bdf8'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.color = '#94a3b8'
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
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: 4, padding: '2px 8px' }}>Alex Forbes Dark</span>
                  <span style={{ fontSize: 10, color: '#475569' }}>vs</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#1e3a8a', background: 'rgba(30,58,138,0.08)', border: '1px solid rgba(30,58,138,0.2)', borderRadius: 4, padding: '2px 8px' }}>White Label Corporate</span>
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
            /* Single preview */
            <div style={{
              width: '100%',
              aspectRatio: '16/9',
              background: '#0f172a',
              borderRadius: 12,
              border: '1px solid rgba(99, 179, 237, 0.1)',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            }}>
              {renderSlidePreview(selectedSlide)}
            </div>
            )}
          </div> {/* End Column 2 */}

          {/* COLUMN 3: Tabbed Sidebar Inspector */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 16,
            background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(99, 179, 237, 0.08)',
            borderRadius: 12, padding: '16px 20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            {/* Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
              <button onClick={() => setActiveTab('content')} style={{ flex: 1, padding: '10px 0', background: 'none', borderBottom: activeTab === 'content' ? '2px solid #38bdf8' : '2px solid transparent', color: activeTab === 'content' ? '#38bdf8' : '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, transition: 'all 0.2s' }}>Content</button>
              <button onClick={() => setActiveTab('branding')} style={{ flex: 1, padding: '10px 0', background: 'none', borderBottom: activeTab === 'branding' ? '2px solid #a78bfa' : '2px solid transparent', color: activeTab === 'branding' ? '#e2e8f0' : '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, transition: 'all 0.2s' }}>Branding</button>
              <button onClick={() => setActiveTab('data')} style={{ flex: 1, padding: '10px 0', background: 'none', borderBottom: activeTab === 'data' ? '2px solid #34d399' : '2px solid transparent', color: activeTab === 'data' ? '#e2e8f0' : '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, transition: 'all 0.2s' }}>Data</button>
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
                        width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6, color: '#fff', padding: '8px 12px', fontSize: 12, boxSizing: 'border-box',
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
                        width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6, color: '#fff', padding: '8px 12px', fontSize: 12, lineHeight: 1.5,
                        boxSizing: 'border-box', fontFamily: selectedSlide.type === 'custom' ? 'monospace' : 'inherit',
                      }}
                    />
                  </div>
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
                        width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6, color: '#fff', padding: '8px 12px', fontSize: 12, lineHeight: 1.5,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* BRANDING TAB */}
              {activeTab === 'branding' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s ease' }}>
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
                            {theme.themeName.split(' ')[0]}
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
                        width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6, color: '#fff', padding: '8px 12px', fontSize: 12, boxSizing: 'border-box',
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
                        width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6, color: '#fff', padding: '8px 12px', fontSize: 12, boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>LOGO PRESET & FONT</label>
                    <select
                      value={branding.logoPreset}
                      onChange={(e) => setBranding({ ...branding, logoPreset: e.target.value })}
                      style={{
                        width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6, color: '#fff', padding: '8px 12px', fontSize: 12, cursor: 'pointer', marginBottom: 8,
                      }}
                    >
                      <option value="standard">Standard — InsightSphere</option>
                      <option value="premium">Premium White-Label</option>
                      <option value="custom">Custom Logo URL</option>
                    </select>
                    <select
                      value={branding.fontFamily || 'Outfit'}
                      onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })}
                      style={{
                        width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6, color: '#fff', padding: '8px 12px', fontSize: 12, cursor: 'pointer',
                      }}
                    >
                      <option value="Outfit">Outfit (Modern Wealth)</option>
                      <option value="Inter">Inter (Institutional)</option>
                      <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Tech/Quant)</option>
                    </select>
                  </div>

                  {branding.logoPreset === 'custom' && (
                    <div>
                      <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>LOGO IMAGE URL</label>
                      <input
                        type="text"
                        placeholder="https://example.com/logo.png"
                        value={branding.logoUrl || ''}
                        onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                        style={{
                          width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 6, color: '#fff', padding: '8px 12px', fontSize: 12, boxSizing: 'border-box',
                        }}
                      />
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
                        width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6, color: '#fff', padding: '10px 12px', fontSize: 12, cursor: 'pointer',
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
          background: '#020617',
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
                  background: '#020617',
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
