import React, { useState } from 'react'
import { exportTwoPotPPTX } from '../utils/twoPotExport'
import { Search, Plus, ArrowRight, Eye, Edit2, ArrowLeft, GripVertical, Trash2, X, Check, Download } from 'lucide-react'
import { useAppStore, SlideItem } from '../store/useAppStore'
import { SHARED_PRESET_TEMPLATES, PresetTemplateData, TemplateSlideOutline } from '../data/presetTemplates'

type View = 'list' | 'detail'

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  performance: 'Performance',
  planning: 'Planning',
  risk: 'Risk',
  strategy: 'Strategy',
}

// Classic monogram icon — no emojis
const TemplateMonogram: React.FC<{ color: string; letter: string; size?: number }> = ({ color, letter, size = 40 }) => (
  <div style={{
    width: size, height: size, borderRadius: 10,
    background: `${color}12`,
    border: `1px solid ${color}30`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }}>
    <span style={{ fontSize: size * 0.4, fontWeight: 800, color, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
      {letter}
    </span>
  </div>
)

const CATEGORY_MONOGRAMS: Record<string, string> = {
  performance: 'Pf',
  planning: 'Pl',
  risk: 'Rk',
  strategy: 'St',
}

const TemplatesPage: React.FC = () => {
  const { setDeck, setSelectedSlideId, setCurrentPage, setDeckBuilderStep, setSelectedTemplate } = useAppStore()
  const [view, setView] = useState<View>('list')
  const [activeTemplate, setActiveTemplate] = useState<PresetTemplateData | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [editSlides, setEditSlides] = useState<TemplateSlideOutline[]>([])
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [savedMsg, setSavedMsg] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleTwoPotDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setDownloadingId('two-pot-advisory')
    try {
      await exportTwoPotPPTX()
    } catch (err) {
      console.error('Two-Pot PPT export failed', err)
    } finally {
      setDownloadingId(null)
    }
  }

  const filtered = SHARED_PRESET_TEMPLATES.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'all' || t.category === category
    return matchSearch && matchCat
  })

  const openDetail = (t: PresetTemplateData) => {
    setActiveTemplate(t)
    setEditSlides(t.slides.map(s => ({ ...s })))
    setEditingIdx(null)
    setView('detail')
  }

  const handleApply = (t: PresetTemplateData, slides: TemplateSlideOutline[]) => {
    const slideItems: SlideItem[] = slides.map((s, idx) => ({
      id: `slide_${Math.random().toString(36).substring(2, 9)}_${idx}`,
      type: s.type,
      title: s.title,
      content: `• ${s.desc}\n• Draft generated from template preset.\n• Review and adjust using AI Slide Refiner.`,
      notes: `Advisor notes for: ${s.title}`,
    }))
    const themeObj = { themeName: t.themeName, backgroundColor: t.backgroundColor, textColor: t.textColor, primaryColor: t.primaryColor, secondaryColor: t.secondaryColor || t.primaryColor, fontFamily: t.fontFamily }
    localStorage.setItem('decora_active_template_theme', JSON.stringify(themeObj))
    setDeck(slideItems)
    setSelectedSlideId(slideItems[0].id)
    setCurrentPage('deck-builder')
  }

  const moveSlide = (from: number, to: number) => {
    const arr = [...editSlides]
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    setEditSlides(arr)
  }

  const deleteSlide = (idx: number) => setEditSlides(prev => prev.filter((_, i) => i !== idx))
  const addSlide = () => setEditSlides(prev => [...prev, { type: 'custom', title: 'New Slide', desc: 'Click to edit.' }])

  // ── LIST VIEW ──
  if (view === 'list') return (
    <div style={{ fontFamily: "'Outfit', 'Inter', sans-serif", paddingBottom: 60, animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Presentation Library</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 6px 0' }}>Templates</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, fontWeight: 400 }}>
            Select, customise, and launch professional presentation templates.
          </p>
        </div>
        <button
          onClick={() => setCurrentPage('deck-config')}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', borderRadius: 10 }}
        >
          <Plus size={14} /> Custom Deck
        </button>
      </div>

      {/* Search + Filter bar */}
      <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit' }}
          />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={13} /></button>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              style={{
                padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: category === key ? 'var(--accent)' : 'transparent',
                color: category === key ? '#fff' : 'var(--text-secondary)',
                fontSize: 12.5, fontWeight: 600, transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', border: '1px dashed var(--border)', borderRadius: 16 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No templates match your search.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
          {filtered.map(t => (
            <div
              key={t.id}
              className="glass-card"
              style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default', padding: 0 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* Left accent strip as top border */}
              <div style={{ height: 4, background: `linear-gradient(90deg, ${t.color}, ${t.secondaryColor || t.color}80)` }} />

              <div style={{ padding: '22px 24px', flex: 1 }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <TemplateMonogram color={t.color} letter={CATEGORY_MONOGRAMS[t.category] || t.name.charAt(0)} />
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.color, marginBottom: 2 }}>{t.category}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{t.slidesCount} slides</div>
                    </div>
                  </div>
                  {t.badge && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: '#92400E',
                      background: '#FEF3C7', border: '1px solid #FDE68A',
                      padding: '3px 9px', borderRadius: 20, letterSpacing: '0.02em',
                    }}>
                      {t.badge}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>{t.name}</h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px 0' }}>{t.description}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {t.tags.map((tag, i) => (
                    <span key={i} style={{ fontSize: 10.5, color: 'var(--text-muted)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--border)', padding: '12px 16px', gap: 8 }}>
                <button
                  onClick={() => openDetail(t)}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, padding: '9px 0', borderRadius: 8 }}
                >
                  <Eye size={12} /> View & Edit
                </button>
                <button
                  onClick={() => handleApply(t, t.slides)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: t.color, border: 'none', borderRadius: 8,
                    color: '#FFFFFF', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: '9px 0',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Use Template <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── DETAIL VIEW ──
  if (!activeTemplate) return null
  return (
    <div style={{ fontFamily: "'Outfit', 'Inter', sans-serif", paddingBottom: 60, animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button
          onClick={() => setView('list')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0 }}
        >
          <ArrowLeft size={15} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
            Templates / <span style={{ color: 'var(--accent)' }}>{activeTemplate.name}</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>{activeTemplate.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {savedMsg && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#10B981', fontWeight: 600, background: 'rgba(16,185,129,0.08)', padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>
              <Check size={13} /> Saved
            </span>
          )}
          <button onClick={() => { setSavedMsg(true); setTimeout(() => setSavedMsg(false), 2200) }} className="btn-secondary" style={{ padding: '9px 16px', fontSize: 13, borderRadius: 9 }}>
            Save Changes
          </button>
          <button
            onClick={() => handleApply(activeTemplate, editSlides)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', background: activeTemplate.color, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, color: '#FFFFFF', cursor: 'pointer' }}
          >
            Use in Deck Builder <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Slides Editor */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>Slide Sequence</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{editSlides.length} slides · Drag to reorder</p>
            </div>
            <button onClick={addSlide} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12.5, fontWeight: 600, borderRadius: 8 }}>
              <Plus size={13} /> Add Slide
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {editSlides.map((slide, idx) => (
              <div
                key={idx}
                style={{
                  border: editingIdx === idx ? `1.5px solid ${activeTemplate.color}` : '1px solid var(--border)',
                  borderRadius: 12, overflow: 'hidden', background: editingIdx === idx ? `${activeTemplate.color}06` : 'var(--bg-secondary)',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                  <GripVertical size={13} color="var(--text-muted)" style={{ cursor: 'grab', flexShrink: 0 }} />
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: `${activeTemplate.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: activeTemplate.color, flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slide.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{slide.type}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    {idx > 0 && <button onClick={() => moveSlide(idx, idx - 1)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>↑</button>}
                    {idx < editSlides.length - 1 && <button onClick={() => moveSlide(idx, idx + 1)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>↓</button>}
                    <button onClick={() => setEditingIdx(editingIdx === idx ? null : idx)} style={{ background: editingIdx === idx ? `${activeTemplate.color}20` : 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', color: editingIdx === idx ? activeTemplate.color : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Edit2 size={11} />
                    </button>
                    <button onClick={() => deleteSlide(idx)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {editingIdx === idx && (
                  <div style={{ padding: '0 14px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: `1px solid ${activeTemplate.color}20` }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</label>
                      <input value={slide.title} onChange={e => { const s = [...editSlides]; s[idx] = { ...s[idx], title: e.target.value }; setEditSlides(s) }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Slide Type</label>
                      <select value={slide.type} onChange={e => { const s = [...editSlides]; s[idx] = { ...s[idx], type: e.target.value as any }; setEditSlides(s) }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', background: 'var(--bg-card)', outline: 'none', fontFamily: 'inherit' }}>
                        {['cover', 'metrics', 'holdings', 'risk', 'timeline', 'montecarlo', 'insights', 'custom'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</label>
                      <textarea value={slide.desc} onChange={e => { const s = [...editSlides]; s[idx] = { ...s[idx], desc: e.target.value }; setEditSlides(s) }}
                        rows={2} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', background: 'var(--bg-card)', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
          {/* Theme preview */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 100, background: `linear-gradient(135deg, ${activeTemplate.backgroundColor}, ${activeTemplate.primaryColor}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <TemplateMonogram color="#fff" letter={CATEGORY_MONOGRAMS[activeTemplate.category] || activeTemplate.name.charAt(0)} size={48} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.02em' }}>{activeTemplate.themeName}</span>
            </div>
            <div style={{ padding: '14px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Theme Colors</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[activeTemplate.backgroundColor, activeTemplate.primaryColor, activeTemplate.color].map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: c, border: '1px solid var(--border)' }} />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{c}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>Font: <strong style={{ color: 'var(--text-secondary)' }}>{activeTemplate.fontFamily}</strong></div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>About</div>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 12px 0' }}>{activeTemplate.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {activeTemplate.tags.map((tag, i) => (
                <span key={i} style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleApply(activeTemplate, editSlides)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 20px', background: activeTemplate.color, border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, color: '#FFFFFF', cursor: 'pointer' }}
          >
            Use in Deck Builder <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TemplatesPage
