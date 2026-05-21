import React, { useState, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import { useAppStore } from '../store/useAppStore'
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
import { exportDeckToPPTX, SlideItem } from '../utils/pptxExport'
import { ChevronUp, ChevronDown, Trash2, Printer, Download, Play, Pause, X, Sparkles } from 'lucide-react'

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
    setPersona
  } = useAppStore()

  // Make sure we have data loaded for the selected persona
  useEffect(() => {
    fetchDashboardData(selectedPersona)
  }, [selectedPersona])

  // Slide deck state
  const [deck, setDeck] = useState<SlideItem[]>([
    { id: '1', type: 'cover', notes: 'Welcome the client and set the presentation tone.' },
    { id: '2', type: 'metrics', notes: 'Highlight key performance stats and Sharpe ratios.' },
    { id: '3', type: 'holdings', notes: 'Review specific holdings and active market value.' },
    { id: '4', type: 'risk', notes: 'Explain how target asset weights align to risk profile.' },
    { id: '5', type: 'timeline', notes: 'Show compounding portfolio growth.' },
    { id: '6', type: 'montecarlo', notes: 'Provide probability distribution of retirement goal.' },
    { id: '7', type: 'insights', notes: 'Review AI-generated suggestions.' }
  ])

  const [selectedSlideId, setSelectedSlideId] = useState<string>('1')
  const [isDrafting, setIsDrafting] = useState<boolean>(false)

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

  const updateSlideNotes = (notes: string) => {
    setDeck((prev) =>
      prev.map((s) => (s.id === selectedSlideId ? { ...s, notes } : s))
    )
  }

  const updateCustomSlideContent = (field: 'title' | 'content', value: string) => {
    setDeck((prev) =>
      prev.map((s) =>
        s.id === selectedSlideId
          ? { ...s, [field === 'title' ? 'title' : 'content']: value }
          : s
      )
    )
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

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === deck.length - 1) return

    const newDeck = [...deck]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    const temp = newDeck[index]
    newDeck[index] = newDeck[targetIdx]
    newDeck[targetIdx] = temp

    setDeck(newDeck)
  }

  const deleteSlide = (id: string) => {
    if (deck.length <= 1) return // Keep at least one slide
    const idx = deck.findIndex((s) => s.id === id)
    const newDeck = deck.filter((s) => s.id !== id)
    setDeck(newDeck)
    
    // Switch selection
    if (selectedSlideId === id) {
      const nextSelectIdx = idx === 0 ? 0 : idx - 1
      setSelectedSlideId(newDeck[nextSelectIdx].id)
    }
  }

  const addSlide = (type: SlideItem['type']) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newSlide: SlideItem = {
      id,
      type,
      title: type === 'custom' ? 'Custom Market Outlook' : '',
      content: type === 'custom' ? '• Inflation is cooling down, signaling potential Fed cuts\n• Rebalancing bonds slightly higher to capture yield curves\n• Standard equity allocations remain bullish' : '',
      notes: '',
    }
    setDeck([...deck, newSlide])
    setSelectedSlideId(id)
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
      <div id="screen-root" style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px' }}>
        <Navbar />

        {/* Workspace Title bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 20,
          background: 'rgba(15, 23, 42, 0.4)',
          border: '1px solid rgba(99, 179, 237, 0.1)',
          borderRadius: 12,
          padding: '12px 24px',
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Smart Presentation Deck Builder</h2>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>
              Compile live client portfolios into branded presentations.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
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

        {/* 3-Column main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr 340px',
          gap: 20,
          marginTop: 20,
          alignItems: 'start',
        }}>
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
            <h3 style={{ fontSize: 12, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
              Presentation Slides ({deck.length})
            </h3>
            
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

            {/* Add Slide Selector */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>ADD NEW SLIDE</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(['cover', 'metrics', 'holdings', 'risk', 'timeline', 'montecarlo', 'insights', 'custom'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => addSlide(t)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 4,
                      fontSize: 10,
                      padding: '4px 8px',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Workspace Slide Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* The 16:9 preview container */}
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

            {/* Content & Title Customizer Editor for ALL Slides */}
            {selectedSlide && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(99, 179, 237, 0.08)',
                borderRadius: 12,
                padding: 16,
              }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 12px 0', color: '#94a3b8' }}>
                  {selectedSlide.type === 'custom' ? 'Edit Custom Slide Content' : 'Personalize Slide Layout & Copy'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>
                      {selectedSlide.type === 'custom' ? 'SLIDE TITLE' : 'SLIDE TITLE OVERRIDE'}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        selectedSlide.type === 'cover' ? 'Strategic Wealth Presentation' :
                        selectedSlide.type === 'metrics' ? 'Portfolio Performance & Risk Metrics' :
                        selectedSlide.type === 'holdings' ? 'Current Asset Holdings' :
                        selectedSlide.type === 'risk' ? 'Risk Profile & Asset Allocation' :
                        selectedSlide.type === 'timeline' ? 'Historical Wealth Growth' :
                        selectedSlide.type === 'montecarlo' ? 'Monte Carlo Simulation & Target Success' :
                        selectedSlide.type === 'insights' ? 'AI-Powered Investment Analysis' : 'Slide Title'
                      }
                      value={selectedSlide.title || ''}
                      onChange={(e) => updateCustomSlideContent('title', e.target.value)}
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        color: '#fff',
                        padding: '8px 12px',
                        fontSize: 12,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  {/* Bullet / Advisor Commentary input */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                        {selectedSlide.type === 'custom' ? 'BULLET POINTS (ONE PER LINE)' : 'ADVISOR NOTE / COMMENTARY (Renders directly on slide)'}
                      </label>
                      <button
                        onClick={handleGenerateAIDraft}
                        disabled={isDrafting}
                        style={{
                          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(167, 139, 250, 0.15))',
                          border: '1px solid rgba(167, 139, 250, 0.3)',
                          borderRadius: 4,
                          color: '#c084fc',
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '2px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Sparkles size={10} />
                        {isDrafting ? 'Drafting...' : 'AI Draft'}
                      </button>
                    </div>
                    <textarea
                      rows={selectedSlide.type === 'custom' ? 5 : 3}
                      placeholder={
                        selectedSlide.type === 'custom'
                          ? '• Enter bullet points here...'
                          : 'Enter custom advice, remarks, or summary points for this slide. E.g. "We are maintaining solid bond allocations to hedge inflation spikes."'
                      }
                      value={selectedSlide.content || ''}
                      onChange={(e) => updateCustomSlideContent('content', e.target.value)}
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        color: '#fff',
                        padding: '8px 12px',
                        fontSize: 12,
                        lineHeight: 1.5,
                        boxSizing: 'border-box',
                        fontFamily: selectedSlide.type === 'custom' ? 'monospace' : 'inherit',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Slide Notes Editor */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(99, 179, 237, 0.08)',
              borderRadius: 12,
              padding: 16,
            }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 8px 0', color: '#94a3b8' }}>
                Slide Presentation Notes
              </h3>
              <textarea
                rows={3}
                placeholder="Type advisor remarks or talking points for this slide here. They will show in the PPTX presenter notes..."
                value={selectedSlide?.notes || ''}
                onChange={(e) => updateSlideNotes(e.target.value)}
                style={{
                  width: '100%',
                  background: '#020617',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: '#fff',
                  padding: '8px 12px',
                  fontSize: 12,
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* COLUMN 3: Live Data & Branding panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Live Data controls */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(99, 179, 237, 0.08)',
              borderRadius: 12,
              padding: 16,
            }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 12px 0', color: '#94a3b8' }}>
                Live Data Integration
              </h3>
              <div>
                <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>PORTFOLIO PERSONA</label>
                <select
                  value={selectedPersona}
                  onChange={(e) => setPersona(e.target.value as any)}
                  style={{
                    width: '100%',
                    background: '#020617',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6,
                    color: '#fff',
                    padding: '8px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  <option value="young-investor">Young Investor (High Risk)</option>
                  <option value="family-planner">Family Planner (Medium Risk)</option>
                  <option value="retirement-client">Retirement Client (Low Risk)</option>
                </select>
              </div>
            </div>

            {/* Branding Panel */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(99, 179, 237, 0.08)',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, margin: 0, color: '#94a3b8' }}>
                Branding & White-Labelling
              </h3>

              {/* Theme Selector Presets */}
              <div>
                <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 6 }}>COLOR THEME PRESETS</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {PRESET_THEMES.map((theme) => (
                    <button
                      key={theme.themeName}
                      onClick={() => applyPresetTheme(theme)}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: branding.themeName === theme.themeName ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 6,
                        padding: 8,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>
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

              {/* Client Content overrides */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                <div>
                  <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>CLIENT NAME / PRESENTATION TITLE</label>
                  <input
                    type="text"
                    value={branding.clientName}
                    onChange={(e) => setBranding({ ...branding, clientName: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#020617',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6,
                      color: '#fff',
                      padding: '8px 12px',
                      fontSize: 12,
                      boxSizing: 'border-box',
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
                      width: '100%',
                      background: '#020617',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6,
                      color: '#fff',
                      padding: '8px 12px',
                      fontSize: 12,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>LOGO PRESET STYLE</label>
                  <select
                    value={branding.logoPreset}
                    onChange={(e) => setBranding({ ...branding, logoPreset: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#020617',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6,
                      color: '#fff',
                      padding: '8px 12px',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="standard">Standard: InsightSphere (◈)</option>
                    <option value="premium">Premium White-Label (✦)</option>
                    <option value="custom">Custom URL Logo Link</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>TYPOGRAPHY FONT PAIRING</label>
                  <select
                    value={branding.fontFamily || 'Outfit'}
                    onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#020617',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6,
                      color: '#fff',
                      padding: '8px 12px',
                      fontSize: 12,
                      cursor: 'pointer',
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
                    <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>LOGO IMAGE LINK URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/logo.png"
                      value={branding.logoUrl || ''}
                      onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        color: '#fff',
                        padding: '8px 12px',
                        fontSize: 12,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Advanced Custom Color Pickers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>ADVANCED COLOR OVERRIDES</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 9, color: '#64748b', display: 'block', marginBottom: 2 }}>Background</label>
                    <input
                      type="color"
                      value={branding.backgroundColor}
                      onChange={(e) => setBranding({ ...branding, themeName: 'Custom', backgroundColor: e.target.value })}
                      style={{ width: '100%', height: 28, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 9, color: '#64748b', display: 'block', marginBottom: 2 }}>Text Color</label>
                    <input
                      type="color"
                      value={branding.textColor}
                      onChange={(e) => setBranding({ ...branding, themeName: 'Custom', textColor: e.target.value })}
                      style={{ width: '100%', height: 28, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 9, color: '#64748b', display: 'block', marginBottom: 2 }}>Primary Accent</label>
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, themeName: 'Custom', primaryColor: e.target.value })}
                      style={{ width: '100%', height: 28, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 9, color: '#64748b', display: 'block', marginBottom: 2 }}>Secondary Accent</label>
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, themeName: 'Custom', secondaryColor: e.target.value })}
                      style={{ width: '100%', height: 28, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none' }}
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
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
