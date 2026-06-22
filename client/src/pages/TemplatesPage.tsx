import React, { useState } from 'react'
import { Search, Plus, ArrowRight, Eye, Edit2, ArrowLeft, GripVertical, Trash2, CheckCircle2, Sparkles, X, Check } from 'lucide-react'
import { useAppStore, SlideItem } from '../store/useAppStore'
import { SHARED_PRESET_TEMPLATES, PresetTemplateData, TemplateSlideOutline } from '../data/presetTemplates'

type View = 'list' | 'detail'

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Templates',
  performance: 'Performance',
  planning: 'Planning',
  risk: 'Risk',
  strategy: 'Strategy',
}

const TemplatesPage: React.FC = () => {
  const { setDeck, setSelectedSlideId, setCurrentPage } = useAppStore()

  const [view, setView] = useState<View>('list')
  const [activeTemplate, setActiveTemplate] = useState<PresetTemplateData | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  // Editable slides state for detail view
  const [editSlides, setEditSlides] = useState<TemplateSlideOutline[]>([])
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [savedMsg, setSavedMsg] = useState(false)

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

  const handleSaveSlides = () => {
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2500)
  }

  const moveSlide = (from: number, to: number) => {
    const arr = [...editSlides]
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    setEditSlides(arr)
  }

  const deleteSlide = (idx: number) => setEditSlides(prev => prev.filter((_, i) => i !== idx))

  const addSlide = () => {
    setEditSlides(prev => [...prev, { type: 'custom', title: 'New Slide', desc: 'Click to edit this slide content.' }])
  }

  // ── LIST VIEW ──
  if (view === 'list') return (
    <div style={{ animation: 'fadeIn 0.3s ease', fontFamily: "'Inter', sans-serif", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>Decora</span>
            <span style={{ fontSize: 11, color: '#CBD5E1' }}>/</span>
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 700 }}>Templates</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 4px 0' }}>Presentation Templates</h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Select a template to view, edit its slides, and launch it in the Deck Builder.</p>
        </div>
        <button
          onClick={() => setCurrentPage('deck-config')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#FFFFFF', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)', whiteSpace: 'nowrap' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <Plus size={15} /> Create Custom Deck
        </button>
      </div>

      {/* Search + Filter */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8EDF5', borderRadius: 16, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 28, boxShadow: '0 1px 4px rgba(15,23,42,0.01)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '8px 12px' }}>
          <Search size={16} color="#94A3B8" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#0F172A' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => setCategory(key)} style={{ padding: '7px 14px', borderRadius: 10, border: category === key ? '1px solid rgba(37,99,235,0.2)' : '1px solid #E2E8F0', background: category === key ? 'rgba(37,99,235,0.06)' : '#FFFFFF', color: category === key ? '#2563EB' : '#64748B', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed #E2E8F0', borderRadius: 20 }}>
          <p style={{ color: '#94A3B8', fontSize: 13 }}>No templates found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {filtered.map(t => (
            <div key={t.id} style={{ background: '#FFFFFF', border: '1px solid #E8EDF5', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 14px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(15,23,42,0.02)' }}
            >
              {/* Color ribbon */}
              <div style={{ height: 6, background: `linear-gradient(90deg, ${t.primaryColor}, ${t.color})` }} />
              <div style={{ padding: 24, flex: 1 }}>
                {/* Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.color, background: `${t.color}15`, padding: '3px 9px', borderRadius: 6 }}>{t.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {t.badge && <span style={{ fontSize: 10, fontWeight: 700, color: '#D97706', background: '#FFFBEB', border: '1px solid #FCD34D', padding: '2px 7px', borderRadius: 5 }}>⭐ {t.badge}</span>}
                    <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>{t.slidesCount} slides</span>
                  </div>
                </div>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{t.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.015em' }}>{t.name}</h3>
                <p style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5, margin: '0 0 16px 0' }}>{t.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {t.tags.map((tag, i) => <span key={i} style={{ fontSize: 10.5, color: '#64748B', background: '#F1F5F9', padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>#{tag}</span>)}
                </div>
              </div>
              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #F1F5F9', padding: '12px 20px', gap: 8 }}>
                <button onClick={() => openDetail(t)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 9, color: '#475569', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: '8px 0', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#475569' }}>
                  <Eye size={13} /> View & Edit
                </button>
                <button onClick={() => handleApply(t, t.slides)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: `${t.color}`, border: 'none', borderRadius: 9, color: '#FFFFFF', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: '8px 0', transition: 'all 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  Use Template <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── DETAIL / EDIT VIEW ──
  if (!activeTemplate) return null
  return (
    <div style={{ animation: 'fadeIn 0.3s ease', fontFamily: "'Inter', sans-serif", paddingBottom: 60 }}>
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button onClick={() => setView('list')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', border: '1px solid #E2E8F0', background: '#FFFFFF', cursor: 'pointer', color: '#64748B' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
          onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, cursor: 'pointer' }} onClick={() => setView('list')}>Templates</span>
            <span style={{ fontSize: 11, color: '#CBD5E1' }}>/</span>
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 700 }}>{activeTemplate.name}</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>{activeTemplate.name}</h1>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          {savedMsg && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#10B981', fontWeight: 600, background: '#ECFDF5', padding: '8px 14px', borderRadius: 9, border: '1px solid #A7F3D0' }}>
              <Check size={14} /> Saved
            </span>
          )}
          <button onClick={handleSaveSlides} style={{ padding: '9px 18px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            Save Changes
          </button>
          <button onClick={() => handleApply(activeTemplate, editSlides)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', background: `linear-gradient(135deg, ${activeTemplate.color}, ${activeTemplate.primaryColor})`, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#FFFFFF', cursor: 'pointer', boxShadow: `0 4px 12px ${activeTemplate.color}33` }}>
            <Sparkles size={14} /> Use in Deck Builder
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' }}>
        {/* Slides Editor */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8EDF5', borderRadius: 20, padding: 24, boxShadow: '0 4px 12px rgba(15,23,42,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>Slide Sequence <span style={{ fontWeight: 500, color: '#94A3B8', fontSize: 13 }}>({editSlides.length} slides)</span></h3>
            <button onClick={addSlide} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 9, fontSize: 12.5, fontWeight: 600, color: '#2563EB', cursor: 'pointer' }}>
              <Plus size={13} /> Add Slide
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {editSlides.map((slide, idx) => (
              <div key={idx} style={{ border: editingIdx === idx ? '2px solid #2563EB' : '1px solid #E8EDF5', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.15s', background: editingIdx === idx ? 'rgba(37,99,235,0.01)' : '#FAFAFA' }}>
                {/* Slide row header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <GripVertical size={14} color="#CBD5E1" style={{ cursor: 'grab', flexShrink: 0 }} />
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: `${activeTemplate.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: activeTemplate.color, flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 1 }}>{slide.title}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{slide.type}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {idx > 0 && <button onClick={() => moveSlide(idx, idx - 1)} style={{ background: '#F1F5F9', border: 'none', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', fontSize: 11, color: '#64748B' }}>↑</button>}
                    {idx < editSlides.length - 1 && <button onClick={() => moveSlide(idx, idx + 1)} style={{ background: '#F1F5F9', border: 'none', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', fontSize: 11, color: '#64748B' }}>↓</button>}
                    <button onClick={() => setEditingIdx(editingIdx === idx ? null : idx)} style={{ background: editingIdx === idx ? 'rgba(37,99,235,0.1)' : '#F1F5F9', border: 'none', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', color: editingIdx === idx ? '#2563EB' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Edit2 size={11} />
                    </button>
                    <button onClick={() => deleteSlide(idx)} style={{ background: '#FEF2F2', border: 'none', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Inline edit panel */}
                {editingIdx === idx && (
                  <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Title</label>
                      <input value={slide.title} onChange={e => { const s = [...editSlides]; s[idx] = { ...s[idx], title: e.target.value }; setEditSlides(s) }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Slide Type</label>
                      <select value={slide.type} onChange={e => { const s = [...editSlides]; s[idx] = { ...s[idx], type: e.target.value as any }; setEditSlides(s) }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', outline: 'none' }}>
                        {['cover', 'metrics', 'holdings', 'risk', 'timeline', 'montecarlo', 'insights', 'custom'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Description / Notes</label>
                      <textarea value={slide.desc} onChange={e => { const s = [...editSlides]; s[idx] = { ...s[idx], desc: e.target.value }; setEditSlides(s) }}
                        rows={2} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar: template info + theme preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 24 }}>
          {/* Theme Preview */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E8EDF5', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 12px rgba(15,23,42,0.02)' }}>
            <div style={{ height: 120, background: `linear-gradient(135deg, ${activeTemplate.backgroundColor}, ${activeTemplate.primaryColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, padding: 20 }}>
              <div style={{ fontSize: 22 }}>{activeTemplate.icon}</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>{activeTemplate.themeName}</span>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Theme Colors</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[activeTemplate.backgroundColor, activeTemplate.primaryColor, activeTemplate.color].map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: c, border: '1px solid #E2E8F0' }} />
                    <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace' }}>{c}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 10 }}>Font: <strong style={{ color: '#475569' }}>{activeTemplate.fontFamily}</strong></div>
            </div>
          </div>

          {/* Template info */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E8EDF5', borderRadius: 20, padding: '20px', boxShadow: '0 4px 12px rgba(15,23,42,0.02)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Template Info</div>
            <p style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.6, margin: '0 0 12px 0' }}>{activeTemplate.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {activeTemplate.tags.map((tag, i) => <span key={i} style={{ fontSize: 10.5, color: '#64748B', background: '#F1F5F9', padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>#{tag}</span>)}
            </div>
          </div>

          {/* CTA */}
          <button onClick={() => handleApply(activeTemplate, editSlides)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: `linear-gradient(135deg, ${activeTemplate.color}, ${activeTemplate.primaryColor})`, border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, color: '#FFFFFF', cursor: 'pointer', boxShadow: `0 4px 16px ${activeTemplate.color}44` }}>
            <Sparkles size={15} /> Use in Deck Builder <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TemplatesPage
