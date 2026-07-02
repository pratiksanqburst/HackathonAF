import React, { useState, useEffect } from 'react'
import {
  Settings,
  Sliders,
  Palette,
  Database,
  Cpu,
  Save,
  CheckCircle,
  Shield,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

const SettingsPage: React.FC = () => {
  // Local state for the settings form
  const [activeTab, setActiveTab] = useState<'ai' | 'branding' | 'system'>('ai')
  const [llmModel, setLlmModel] = useState<'haiku' | 'gpt'>('gpt')
  const [primaryColor, setPrimaryColor] = useState<string>('#3b82f6')
  const [secondaryColor, setSecondaryColor] = useState<string>('#60a5fa')
  const [backgroundColor, setBackgroundColor] = useState<string>('#1e40af')
  const [textColor, setTextColor] = useState<string>('#ffffff')
  const [fontFamily, setFontFamily] = useState<string>('Outfit')
  const [footerText, setFooterText] = useState<string>('Confidential · For licensed advisor use only')
  const [liveDataInterval, setLiveDataInterval] = useState<number>(5000)
  const [enableMfa, setEnableMfa] = useState<boolean>(true)
  const [autoSave, setAutoSave] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)

  // Load configuration defaults on mount
  useEffect(() => {
    const savedModel = localStorage.getItem('decora_llm_model')
    if (savedModel) setLlmModel(savedModel as any)

    const savedPrimary = localStorage.getItem('decora_primary_color')
    if (savedPrimary) setPrimaryColor(savedPrimary)

    const savedSecondary = localStorage.getItem('decora_secondary_color')
    if (savedSecondary) setSecondaryColor(savedSecondary)

    const savedBg = localStorage.getItem('decora_bg_color')
    if (savedBg) setBackgroundColor(savedBg)

    const savedText = localStorage.getItem('decora_text_color')
    if (savedText) setTextColor(savedText)

    const savedFont = localStorage.getItem('decora_font_family')
    if (savedFont) setFontFamily(savedFont)

    const savedFooter = localStorage.getItem('decora_footer_text')
    if (savedFooter) setFooterText(savedFooter)
  }, [])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveSuccess(false)

    // Save variables in localStorage to persist preferences
    localStorage.setItem('decora_llm_model', llmModel)
    localStorage.setItem('decora_primary_color', primaryColor)
    localStorage.setItem('decora_secondary_color', secondaryColor)
    localStorage.setItem('decora_bg_color', backgroundColor)
    localStorage.setItem('decora_text_color', textColor)
    localStorage.setItem('decora_font_family', fontFamily)
    localStorage.setItem('decora_footer_text', footerText)

    try {
      const modelString = llmModel === 'gpt' ? 'gpt-4o-mini' : 'claude-3-haiku-20240307'
      await fetch('/api/settings/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelString })
      })
    } catch (e) {
      console.error('Failed to update LLM on server', e)
    }

    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }, 800)
  }

  return (
    <div style={{ animation: 'fadeIn 0.35s ease', fontFamily: "'Inter', sans-serif", paddingBottom: 60 }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>Decora</span>
            <span style={{ fontSize: 11, color: '#CBD5E1' }}>/</span>
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 700 }}>Settings</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', marginBottom: 4 }}>
            System Settings
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
            Configure model overrides, branding defaults, data sync intervals, and white-labeling preferences.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            border: 'none',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            color: '#FFFFFF',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          {isSaving ? (
            <RefreshCw size={14} className="spin" style={{ animation: 'spin 0.6s linear infinite' }} />
          ) : saveSuccess ? (
            <CheckCircle size={14} />
          ) : (
            <Save size={14} />
          )}
          {isSaving ? 'Saving Changes...' : saveSuccess ? 'Settings Saved!' : 'Save Settings'}
        </button>
      </div>

      {saveSuccess && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          color: '#10B981',
          padding: '12px 18px',
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'slideDown 0.3s ease',
        }}>
          <CheckCircle size={16} />
          Your Decora system configurations have been successfully saved and applied.
        </div>
      )}

      {/* ── Main Layout Splitter ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28 }}>
        {/* Navigation Sidebar Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { id: 'ai', label: 'AI Configuration', icon: <Cpu size={16} />, desc: 'Model & prompt overrides' },
            { id: 'branding', label: 'Brand & Theming', icon: <Palette size={16} />, desc: 'White-label styles' },
            { id: 'system', label: 'System & Security', icon: <Sliders size={16} />, desc: 'Data sync & access' },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: isActive ? '1px solid rgba(37,99,235,0.15)' : '1px solid transparent',
                  background: isActive ? 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 100%)' : 'transparent',
                  color: isActive ? '#2563EB' : '#475569',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  boxShadow: isActive ? '0 4px 12px rgba(15,23,42,0.03)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: isActive ? 'rgba(37, 99, 235, 0.08)' : 'rgba(148,163,184,0.08)',
                  color: isActive ? '#2563EB' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {tab.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{tab.label}</div>
                  <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 1, fontWeight: 500 }}>{tab.desc}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Content Container */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8EDF5',
          borderRadius: 20,
          padding: '28px 32px',
          boxShadow: '0 1px 6px rgba(15,23,42,0.02)',
        }}>
          {/* TAB 1: AI CONFIGURATION */}
          {activeTab === 'ai' && (
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cpu size={18} color="#2563EB" />
                AI Engine & Presentation Agent
              </h2>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24, fontWeight: 500 }}>
                Manage default large language model configurations, system behavior instructions, and creative temperature parameters.
              </p>

              {/* Model Choice Card Group */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 10 }}>
                  Active LLM Engine Selection
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { id: 'haiku', title: 'Claude Haiku', desc: 'Optimized for high-speed slide draft generation, re-orchestrations, and lightning-fast tone transformations.' },
                    { id: 'gpt', title: 'GPT-4o Mini', desc: 'Deep reasoning, rich analytics interpretations, and complex portfolio comment structures. Recommended for professional reports.' },
                  ].map((model) => {
                    const isSelected = llmModel === model.id
                    return (
                      <div
                        key={model.id}
                        onClick={() => setLlmModel(model.id as any)}
                        style={{
                          border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                          borderRadius: 14,
                          padding: '16px 20px',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(37,99,235,0.02)' : 'transparent',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{model.title}</span>
                          <div style={{
                            width: 16, height: 16, borderRadius: '50%', border: isSelected ? '5px solid #2563EB' : '2px solid #CBD5E1',
                            background: '#FFFFFF',
                          }} />
                        </div>
                        <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.45, margin: 0, fontWeight: 500 }}>{model.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRANDING & THEMING */}
          {activeTab === 'branding' && (
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Palette size={18} color="#2563EB" />
                Default Brand & Color Theme presets
              </h2>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24, fontWeight: 500 }}>
                Set default primary colors, brand logo presets, and presentation remarks applied to newly created slide decks.
              </p>

              {/* Color Grid Picker */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 12 }}>
                  Default Theme Color Tokens
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {[
                    { label: 'Primary Brand Color', value: primaryColor, set: setPrimaryColor },
                    { label: 'Secondary Brand Color', value: secondaryColor, set: setSecondaryColor },
                    { label: 'Slide Background', value: backgroundColor, set: setBackgroundColor },
                    { label: 'Text/Foreground Color', value: textColor, set: setTextColor },
                  ].map((color, i) => (
                    <div key={i} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                      <div style={{
                        width: '100%', height: 48, borderRadius: 8, background: color.value,
                        border: '1px solid #CBD5E1', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <input
                          type="color"
                          value={color.value}
                          onChange={(e) => color.set(e.target.value)}
                          style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                        />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>{color.label}</span>
                      <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#94A3B8' }}>{color.value.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Default Font and Footer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                    Default Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    style={{
                      width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0',
                      borderRadius: 10, color: '#0F172A', padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    <option value="Outfit">Outfit (Geometric & Modern)</option>
                    <option value="Inter">Inter (Clean & Professional)</option>
                    <option value="Roboto">Roboto (High Legibility)</option>
                    <option value="Playfair Display">Playfair Display (Premium Serif)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                    Default Footer Disclaimer
                  </label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    style={{
                      width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0',
                      borderRadius: 10, color: '#0F172A', padding: '10px 14px', fontSize: 13, outline: 'none',
                    }}
                    placeholder="Enter default footer disclaimer..."
                  />
                </div>
              </div>

              {/* White Label Preview Box */}
              <div style={{
                background: backgroundColor,
                color: textColor,
                borderRadius: 14,
                padding: '20px 24px',
                border: '1px solid rgba(15,23,42,0.08)',
                fontFamily: fontFamily === 'Playfair Display' ? "'Playfair Display', serif" : fontFamily === 'Outfit' ? "'Outfit', sans-serif" : "'Inter', sans-serif"
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 5, background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }} />
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Decora Demo Slide</span>
                  </div>
                  <span style={{ fontSize: 10, opacity: 0.6 }}>Slide 1 of 5</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px 0' }}>Strategic Investment Plan</h3>
                <p style={{ fontSize: 11, opacity: 0.8, margin: 0, lineHeight: 1.4 }}>
                  Demo output using your active brand styles. Re-evaluating asset performance criteria under baseline interest rates.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 14, paddingTop: 8, fontSize: 8, opacity: 0.5 }}>
                  <span>{footerText}</span>
                  <span>Decora Wealth Analytics</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM & SECURITY */}
          {activeTab === 'system' && (
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Database size={18} color="#2563EB" />
                Data Synchronization & Security Controls
              </h2>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24, fontWeight: 500 }}>
                Adjust stress testing scenarios, live pricing interval refreshes, and multi-factor authorization configurations.
              </p>

              {/* Data Refresh Interval */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                  Live Data Stream Refreshes
                </label>
                <select
                  value={liveDataInterval}
                  onChange={(e) => setLiveDataInterval(Number(e.target.value))}
                  style={{
                    width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0',
                    borderRadius: 10, color: '#0F172A', padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                  }}
                >
                  <option value="3000">3 Seconds (High responsiveness - active presentations)</option>
                  <option value="5000">5 Seconds (Balanced responsiveness - standard)</option>
                  <option value="10000">10 Seconds (Lower responsiveness - bandwidth saver)</option>
                </select>
                <p style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 6, lineHeight: 1.45, fontWeight: 500 }}>
                  Adjust how frequently the dashboard re-queries backend pricing databases during portfolio reviews.
                </p>
              </div>

              {/* Toggle controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  {
                    title: 'Force Single Sign-On Multi-Factor Verification',
                    desc: 'Enforce MFA during advisor logins when accessing client PII or portfolio holdings databases.',
                    val: enableMfa,
                    set: setEnableMfa
                  },
                  {
                    title: 'Enable Background Automatic Slide Draft Saving',
                    desc: 'Instantly persist presentation progress in the browser cache to prevent network failures.',
                    val: autoSave,
                    set: setAutoSave
                  }
                ].map((control, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
                    <div style={{ marginRight: 20 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', display: 'block' }}>{control.title}</span>
                      <span style={{ fontSize: 11.5, color: '#64748B', display: 'block', marginTop: 3, lineHeight: 1.4, fontWeight: 500 }}>{control.desc}</span>
                    </div>
                    <div
                      onClick={() => control.set(!control.val)}
                      style={{
                        width: 44, height: 24, borderRadius: 12,
                        background: control.val ? '#2563EB' : '#CBD5E1',
                        position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: '#FFFFFF',
                        position: 'absolute', top: 3, left: control.val ? 23 : 3,
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
