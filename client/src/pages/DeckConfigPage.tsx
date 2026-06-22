import React, { useState } from 'react'
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Sliders,
  Palette,
  FileText,
  Volume2,
  Users,
  Eye,
  Settings,
  Flame,
  Check
} from 'lucide-react'
import { useAppStore, SlideItem } from '../store/useAppStore'

const DeckConfigPage: React.FC = () => {
  const { setDeck, setSelectedSlideId, setCurrentPage } = useAppStore()

  // Form Fields
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [numSlides, setNumSlides] = useState<number>(5)
  const [presentationType, setPresentationType] = useState<string>('Client Review')
  const [audience, setAudience] = useState<string>('Client')
  const [tone, setTone] = useState<string>('Professional')
  const [brandingOption, setBrandingOption] = useState<'client' | 'custom'>('client')
  const [includeVisuals, setIncludeVisuals] = useState<boolean>(true)
  const [additionalNotes, setAdditionalNotes] = useState<string>('')

  // Custom theme colors state (shown if brandingOption === 'custom')
  const [primaryColor, setPrimaryColor] = useState<string>('#38bdf8')
  const [secondaryColor, setSecondaryColor] = useState<string>('#60a5fa')
  const [bgColor, setBgColor] = useState<string>('#0F172A')
  const [textColor, setTextColor] = useState<string>('#F8FAFC')
  const [fontFamily, setFontFamily] = useState<string>('Outfit')

  // UI / Submission state
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generationStep, setGenerationStep] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const steps = [
    'Analyzing target audience & outline request...',
    'Consulting Gemini LLM engine with creative temperature...',
    'Structuring presentation outline and key metrics...',
    'Drafting detailed slide contents & advisor talking points...',
    'Applying requested white-label branding styles...',
    'Redirecting to review workspace...'
  ]

  // Submit and call backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      setErrorMessage('Please provide a description of the presentation you want to create.')
      return
    }

    setIsGenerating(true)
    setGenerationStep(0)
    setErrorMessage(null)

    // Dynamic progress simulation
    const interval = setInterval(() => {
      setGenerationStep(prev => {
        if (prev < steps.length - 2) {
          return prev + 1
        }
        return prev
      })
    }, 1800)

    try {
      // Get LLM custom options from localStorage
      const model = localStorage.getItem('decora_gemini_model') || 'pro'
      const systemPrompt = localStorage.getItem('decora_system_prompt') || ''
      const tempStr = localStorage.getItem('decora_temperature')
      const temperature = tempStr ? parseFloat(tempStr) : 0.7

      const response = await fetch('/api/copilot/generate-custom-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Custom Presentation Strategy',
          description,
          numSlides,
          presentationType,
          audience,
          tone,
          notes: additionalNotes,
          options: { model, systemPrompt, temperature }
        })
      })

      clearInterval(interval)

      if (!response.ok) {
        throw new Error('Failed to generate presentation. Please check your Gemini connection.')
      }

      const data = await response.json()
      if (data.success && data.deck) {
        setGenerationStep(steps.length - 1)

        // Handle Custom Branding configuration save
        if (brandingOption === 'custom') {
          const themeObj = {
            themeName: 'Custom Theme Preset',
            backgroundColor: bgColor,
            textColor: textColor,
            primaryColor: primaryColor,
            secondaryColor: secondaryColor,
            fontFamily: fontFamily
          }
          localStorage.setItem('decora_active_template_theme', JSON.stringify(themeObj))
        }

        // Slight delay for premium UX transition
        setTimeout(() => {
          setDeck(data.deck)
          setSelectedSlideId(data.deck[0].id)
          setCurrentPage('deck-builder')
          setIsGenerating(false)
        }, 1000)
      } else {
        throw new Error('Invalid response structure received from generator server.')
      }
    } catch (err: any) {
      clearInterval(interval)
      setIsGenerating(false)
      setErrorMessage(err.message || 'An unexpected error occurred during deck generation.')
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.35s ease', fontFamily: "'Inter', sans-serif", paddingBottom: 60 }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button
          onClick={() => setCurrentPage('templates')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 38,
            height: 38,
            borderRadius: '50%',
            border: '1px solid #E2E8F0',
            background: '#FFFFFF',
            cursor: 'pointer',
            color: '#64748B',
            transition: 'all 0.15s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
        >
          <ArrowLeft size={16} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>Decora</span>
            <span style={{ fontSize: 11, color: '#CBD5E1' }}>/</span>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>Templates</span>
            <span style={{ fontSize: 11, color: '#CBD5E1' }}>/</span>
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 700 }}>Custom Generator</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Custom AI Presentation Generator
          </h1>
        </div>
      </div>

      {/* ── Form Container ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main Description Block */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E8EDF5', borderRadius: 20, padding: 24, boxShadow: '0 4px 12px rgba(15,23,42,0.01)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>
              <Sparkles size={16} color="#2563EB" />
              Describe Your Target Presentation
            </h3>

            {/* Title field */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Presentation Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Strategic Asset Allocation Review"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  outline: 'none',
                  fontSize: 13,
                  boxSizing: 'border-box',
                  color: '#0F172A'
                }}
              />
            </div>

            {/* Description Prompt area */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569' }}>Presentation Prompt / Topic Details</label>
                <span style={{ fontSize: 11, color: description.length > 1000 ? '#2563EB' : '#94A3B8', fontWeight: 600 }}>
                  {description.length} / 1500 chars
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 1500))}
                rows={5}
                required
                placeholder="Describe the presentation topic, key numbers, trends, or specific items you want to focus on. (e.g. Create a retirement planning presentation for Margaret Chen focused on long-term growth, conservative dividend shielding, and risk management with estate transition plans.)"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  outline: 'none',
                  fontSize: 13,
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  color: '#0F172A'
                }}
              />
              <p style={{ fontSize: 11.5, color: '#64748B', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                Provide detail to help the AI draft highly relevant slides. Suggestion: Include client situation, assets, or concerns.
              </p>
            </div>
          </div>

          {/* Configuration Settings Box */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E8EDF5', borderRadius: 20, padding: 24, boxShadow: '0 4px 12px rgba(15,23,42,0.01)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 20px 0' }}>
              <Sliders size={16} color="#2563EB" />
              Presentation Settings
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              {/* Type */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Presentation Type</label>
                <select
                  value={presentationType}
                  onChange={(e) => setPresentationType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0', outline: 'none', fontSize: 13, color: '#0F172A' }}
                >
                  <option>Client Review</option>
                  <option>Investment Proposal</option>
                  <option>Retirement Planning</option>
                  <option>Portfolio Performance</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Slide Count */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Number of Slides</label>
                <select
                  value={numSlides}
                  onChange={(e) => setNumSlides(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0', outline: 'none', fontSize: 13, color: '#0F172A' }}
                >
                  {[3, 4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={n}>{n} Slides</option>
                  ))}
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Target Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0', outline: 'none', fontSize: 13, color: '#0F172A' }}
                >
                  <option>Client</option>
                  <option>Internal</option>
                  <option>Executive</option>
                </select>
              </div>

              {/* Tone */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Tone / Style</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0', outline: 'none', fontSize: 13, color: '#0F172A' }}
                >
                  <option>Professional</option>
                  <option>Executive</option>
                  <option>Informative</option>
                  <option>Persuasive</option>
                </select>
              </div>
            </div>

            {/* Visuals Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 20, borderTop: '1px solid #F1F5F9' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', margin: 0 }}>Include Visual Layouts</label>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>Automatically position metric widgets, bar charts & assets</span>
              </div>
              <button
                type="button"
                onClick={() => setIncludeVisuals(prev => !prev)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: includeVisuals ? '#2563EB' : '#CBD5E1',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  position: 'absolute',
                  top: 3,
                  left: includeVisuals ? 23 : 3,
                  transition: 'left 0.2s'
                }} />
              </button>
            </div>
          </div>

          {/* Additional Notes Field */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E8EDF5', borderRadius: 20, padding: 24, boxShadow: '0 4px 12px rgba(15,23,42,0.01)' }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Additional Notes / Special Instructions</label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Ensure the risk section highlights our life insurance policies. Focus on the Alexander Forbes unit trusts. Do not use complex jargon."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                outline: 'none',
                fontSize: 13,
                boxSizing: 'border-box',
                resize: 'none',
                color: '#0F172A'
              }}
            />
          </div>

          {errorMessage && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '12px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 500 }}>
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
              transition: 'all 0.2s'
            }}
          >
            Generate Initial Deck Draft
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Right Sidebar: Branding Config */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Branding Options Selector */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E8EDF5', borderRadius: 20, padding: 24, boxShadow: '0 4px 12px rgba(15,23,42,0.01)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>
              <Palette size={16} color="#2563EB" />
              Theme & Branding
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => setBrandingOption('client')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: brandingOption === 'client' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  background: brandingOption === 'client' ? 'rgba(37, 99, 235, 0.03)' : '#FFFFFF',
                  color: '#0F172A',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>Use Client Branding</span>
                {brandingOption === 'client' && <Check size={14} color="#2563EB" />}
              </button>

              <button
                type="button"
                onClick={() => setBrandingOption('custom')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: brandingOption === 'custom' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  background: brandingOption === 'custom' ? 'rgba(37, 99, 235, 0.03)' : '#FFFFFF',
                  color: '#0F172A',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>Custom Branding Theme</span>
                {brandingOption === 'custom' && <Check size={14} color="#2563EB" />}
              </button>
            </div>

            {/* Custom Branding Theme settings form */}
            {brandingOption === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeIn 0.2s ease', borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, color: '#64748B', marginBottom: 4 }}>Primary Accent</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', width: 28, height: 28 }}
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{ flex: 1, padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 12, outline: 'none', color: '#0F172A' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, color: '#64748B', marginBottom: 4 }}>Secondary Accent</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', width: 28, height: 28 }}
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      style={{ flex: 1, padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 12, outline: 'none', color: '#0F172A' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, color: '#64748B', marginBottom: 4 }}>Background Color</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', width: 28, height: 28 }}
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      style={{ flex: 1, padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 12, outline: 'none', color: '#0F172A' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, color: '#64748B', marginBottom: 4 }}>Text Color</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', width: 28, height: 28 }}
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      style={{ flex: 1, padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 12, outline: 'none', color: '#0F172A' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, color: '#64748B', marginBottom: 4 }}>Font Typography</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 12, outline: 'none', color: '#0F172A' }}
                  >
                    <option>Outfit</option>
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Playfair Display</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Generating Fullscreen Overlay ── */}
      {isGenerating && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', zIndex: 99999, animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: 24, padding: '40px 50px',
            width: 500, border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)', display: 'flex',
            flexDirection: 'column', alignItems: 'center', textAlign: 'center'
          }}>
            {/* Spinning Sparkle */}
            <div style={{
              width: 60, height: 60, borderRadius: '50%', background: 'rgba(37,99,235,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20, animation: 'pulse 1.5s infinite'
            }}>
              <Sparkles size={28} color="#2563EB" />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
              Drafting Presentation Layout
            </h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px 0' }}>
              Please wait while Gemini generates your custom content structures.
            </p>

            {/* Progress steps index */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
              {steps.map((stepText, idx) => {
                const isActive = generationStep === idx
                const isCompleted = generationStep > idx
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      fontSize: 12.5, fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#2563EB' : isCompleted ? '#10B981' : '#94A3B8',
                      transition: 'color 0.2s'
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      border: isCompleted ? 'none' : '1px solid currentColor',
                      background: isCompleted ? '#10B981' : 'transparent',
                      display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 700, color: isCompleted ? '#FFFFFF' : 'currentColor'
                    }}>
                      {isCompleted ? <Check size={10} /> : idx + 1}
                    </div>
                    <span>{stepText}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeckConfigPage
