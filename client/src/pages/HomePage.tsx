import React from 'react'
import { useAppStore } from '../store/useAppStore'
import {
  Plus,
  Users,
  FileText,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  BarChart3,
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'

const chartData = [
  { month: 'Jan', value: 16 },
  { month: 'Feb', value: 24 },
  { month: 'Mar', value: 18 },
  { month: 'Apr', value: 32 },
  { month: 'May', value: 38 },
  { month: 'Jun', value: 47 },
]

const avatarColors = [
  { bg: 'linear-gradient(135deg,#2563EB,#4F46E5)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#059669,#0D9488)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#7C3AED,#9333EA)', text: '#fff' },
  { bg: 'linear-gradient(135deg,#D97706,#EA580C)', text: '#fff' },
]

const HomePage: React.FC = () => {
  const {
    user,
    setCurrentPage,
    recentDecks,
    upcomingReviews,
    setDeckBuilderStep,
    setSelectedTemplate,
    clients,
  } = useAppStore()

  const handleCreateNewDeck = () => {
    setSelectedTemplate(null)
    setDeckBuilderStep('start')
    setCurrentPage('deck-builder')
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name.split(' ')[0] || 'Alex'

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const kpis = [
    {
      label: 'Total Clients',
      value: String(clients.length + 45),
      change: '+3 this month',
      changeColor: '#16A34A',
      icon: <Users size={18} />,
      iconBg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
      iconColor: '#2563EB',
      accent: '#2563EB',
    },
    {
      label: 'Total Presentations',
      value: '127',
      change: '+12 this month',
      changeColor: '#16A34A',
      icon: <FileText size={18} />,
      iconBg: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)',
      iconColor: '#16A34A',
      accent: '#16A34A',
    },
    {
      label: 'Generated This Month',
      value: '23',
      change: '+18% vs last month',
      changeColor: '#7C3AED',
      icon: <Layers size={18} />,
      iconBg: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)',
      iconColor: '#7C3AED',
      accent: '#7C3AED',
    },
    {
      label: 'Avg. Time Saved',
      value: '3.2h',
      change: 'per presentation',
      changeColor: '#D97706',
      icon: <Clock size={18} />,
      iconBg: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
      iconColor: '#D97706',
      accent: '#D97706',
    },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.35s ease', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Hero Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(135deg,rgba(37,99,235,0.08),rgba(99,102,241,0.05))',
            border: '1px solid rgba(37,99,235,0.15)',
            borderRadius: 20,
            padding: '4px 13px',
            marginBottom: 14,
          }}>
            <Sparkles size={11} color="#2563EB" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', letterSpacing: '0.04em' }}>
              AI WORKSPACE
            </span>
          </div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            color: '#0F172A',
            marginBottom: 7,
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
          }}>
            {greeting}, {firstName}
          </h1>
          <p style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500, letterSpacing: '-0.01em' }}>
            {currentDate}
          </p>
        </div>

        <button
          onClick={handleCreateNewDeck}
          style={{
            padding: '11px 22px',
            background: 'linear-gradient(135deg,#2563EB 0%,#4F46E5 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 13.5,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 6px 20px rgba(37,99,235,0.32),0 2px 8px rgba(37,99,235,0.16)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '-0.01em',
            fontFamily: 'inherit',
            marginTop: 4,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 10px 28px rgba(37,99,235,0.38),0 4px 10px rgba(37,99,235,0.18)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.32),0 2px 8px rgba(37,99,235,0.16)'
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Create New Deck
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 28 }}>
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`card-enter-${i + 1}`}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8EDF5',
              borderRadius: 20,
              padding: '24px 26px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
              transition: 'all 0.25s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(-3px)'
              el.style.boxShadow = '0 12px 32px rgba(15,23,42,0.09),0 4px 12px rgba(15,23,42,0.05)'
              el.style.borderColor = '#C7D2E2'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = '0 1px 4px rgba(15,23,42,0.05)'
              el.style.borderColor = '#E8EDF5'
            }}
          >
            {/* top accent bar */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: 3,
              background: `linear-gradient(90deg,${kpi.accent},${kpi.accent}66)`,
              borderRadius: '20px 20px 0 0',
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {kpi.label}
                </div>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 10 }}>
                  {kpi.value}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: kpi.changeColor, fontWeight: 600 }}>
                  <TrendingUp size={11} /> {kpi.change}
                </div>
              </div>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: kpi.iconBg,
                color: kpi.iconColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {kpi.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions Bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 28,
        padding: '13px 20px',
        background: '#FFFFFF',
        border: '1px solid #E8EDF5',
        borderRadius: 16,
        boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
      }}>
        <span style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: '#CBD5E1',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginRight: 4,
          whiteSpace: 'nowrap',
        }}>
          Quick Actions
        </span>
        <div style={{ width: 1, height: 18, background: '#E8EDF5', marginRight: 4 }} />

        {[
          { label: 'New Deck',         icon: <Plus size={13} color="#2563EB" />,    action: handleCreateNewDeck,                     accent: true  },
          { label: 'Add Client',        icon: <Users size={13} color="#64748B" />,   action: () => setCurrentPage('clients'),          accent: false },
          { label: 'Browse Templates',  icon: <FileText size={13} color="#64748B" />,action: () => setCurrentPage('templates'),        accent: false },
          { label: 'Analytics',         icon: <BarChart3 size={13} color="#64748B" />,action: () => setCurrentPage('analytics'),       accent: false },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            style={{
              padding: '7px 15px',
              background: btn.accent ? 'rgba(37,99,235,0.07)' : '#FAFBFD',
              border: `1px solid ${btn.accent ? 'rgba(37,99,235,0.20)' : '#E8EDF5'}`,
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              color: btn.accent ? '#2563EB' : '#374151',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
              fontFamily: 'inherit',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = btn.accent ? 'rgba(37,99,235,0.12)' : '#F1F5F9'
              e.currentTarget.style.borderColor = btn.accent ? 'rgba(37,99,235,0.30)' : '#C7D2E2'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = btn.accent ? 'rgba(37,99,235,0.07)' : '#FAFBFD'
              e.currentTarget.style.borderColor = btn.accent ? 'rgba(37,99,235,0.20)' : '#E8EDF5'
            }}
          >
            {btn.icon} {btn.label}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.18)', borderRadius: 20 }}>
          <Zap size={11} color="#7C3AED" fill="#7C3AED" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', letterSpacing: '0.03em' }}>AI Ready</span>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1fr', gap: 24 }}>

        {/* LEFT — Recent Presentations */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8EDF5',
          borderRadius: 20,
          boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.4s ease 0.1s both',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '22px 28px',
            borderBottom: '1px solid #F4F6FA',
          }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 3 }}>
                Recent Presentations
              </h3>
              <p style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>Latest deck activity across all clients</p>
            </div>
            <button
              onClick={() => setCurrentPage('templates')}
              style={{
                background: 'none',
                border: '1px solid #E8EDF5',
                borderRadius: 9,
                color: '#2563EB',
                fontSize: 12.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                padding: '6px 12px',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#BFDBFE' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#E8EDF5' }}
            >
              View all <ArrowUpRight size={13} />
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#FAFBFD' }}>
                {['Presentation', 'Client', 'Type', 'Status', 'Modified'].map((h, i) => (
                  <th key={h} style={{
                    padding: '11px 18px',
                    paddingLeft: i === 0 ? 28 : 18,
                    paddingRight: i === 4 ? 28 : 18,
                    textAlign: 'left',
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.07em',
                    color: '#B0BEC5',
                    borderBottom: '1px solid #F0F4F8',
                    whiteSpace: 'nowrap' as const,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentDecks.map((deck) => {
                const sc: Record<string, { bg: string; color: string }> = {
                  'Completed': { bg: '#DCFCE7', color: '#16A34A' },
                  'In Review': { bg: '#FEF9C3', color: '#CA8A04' },
                  'Draft':     { bg: '#F1F5F9', color: '#64748B' },
                }
                const s = sc[deck.status] || sc['Draft']
                return (
                  <tr
                    key={deck.id}
                    style={{ cursor: 'pointer', transition: 'background 0.12s' }}
                    onClick={() => setCurrentPage('deck-builder')}
                    onMouseEnter={(e) => {
                      Array.from(e.currentTarget.cells).forEach(c => ((c as HTMLElement).style.background = '#F8FAFF'))
                    }}
                    onMouseLeave={(e) => {
                      Array.from(e.currentTarget.cells).forEach(c => ((c as HTMLElement).style.background = 'transparent'))
                    }}
                  >
                    <td style={{ padding: '14px 18px', paddingLeft: 28, borderBottom: '1px solid #F4F6FA', fontWeight: 700, color: '#0F172A', fontSize: 13.5, letterSpacing: '-0.01em' }}>
                      {deck.name}
                    </td>
                    <td style={{ padding: '14px 18px', borderBottom: '1px solid #F4F6FA', color: '#64748B', fontWeight: 500, fontSize: 13 }}>
                      {deck.client}
                    </td>
                    <td style={{ padding: '14px 18px', borderBottom: '1px solid #F4F6FA' }}>
                      <span style={{ fontSize: 11, padding: '3px 9px', background: '#F1F5F9', borderRadius: 6, color: '#64748B', fontWeight: 600 }}>
                        {deck.type}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', borderBottom: '1px solid #F4F6FA' }}>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 700, background: s.bg, color: s.color }}>
                        {deck.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', paddingRight: 28, borderBottom: '1px solid #F4F6FA', color: '#94A3B8', fontWeight: 500, fontSize: 12.5 }}>
                      {deck.modified}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Upcoming Reviews */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E8EDF5',
            borderRadius: 20,
            padding: '22px 24px',
            boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
            animation: 'fadeInUp 0.4s ease 0.15s both',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Calendar size={15} color="#2563EB" />
                </div>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Upcoming Reviews
                </h3>
              </div>
              <span style={{
                fontSize: 11, color: '#94A3B8', fontWeight: 600,
                background: '#F8FAFC', border: '1px solid #E8EDF5',
                borderRadius: 6, padding: '3px 8px',
              }}>June 2026</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {upcomingReviews.map((rev, idx) => {
                const ac = avatarColors[idx % avatarColors.length]
                const isLast = idx === upcomingReviews.length - 1
                return (
                  <div
                    key={rev.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 8px',
                      borderBottom: isLast ? 'none' : '1px solid #F4F6FA',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#F8FAFF')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: ac.bg, color: ac.text,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                        flexShrink: 0,
                      }}>
                        {rev.initials}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>{rev.name}</div>
                        <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2, fontWeight: 500 }}>{rev.type}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#374151', letterSpacing: '-0.01em' }}>{rev.date}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{rev.time}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Decks Chart */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E8EDF5',
            borderRadius: 20,
            padding: '22px 24px',
            boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
            animation: 'fadeInUp 0.4s ease 0.2s both',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 3 }}>
                  Decks Generated
                </h3>
                <p style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>Last 6 months</p>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: '#F0FDF4', border: '1px solid #BBF7D0',
                borderRadius: 8, padding: '4px 10px',
              }}>
                <ArrowUpRight size={12} color="#16A34A" />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#16A34A' }}>+47%</span>
              </div>
            </div>

            <div style={{ height: 130, width: '100%', marginTop: 16 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 2, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="deckGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10.5, fill: '#B0BEC5', fontFamily: 'Inter' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#B0BEC5', fontFamily: 'Inter' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#0F172A',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 12,
                      color: '#FFFFFF',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.20)',
                      padding: '8px 14px',
                    }}
                    labelStyle={{ color: '#94A3B8', fontWeight: 600, marginBottom: 2 }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 700 }}
                    cursor={{ stroke: '#E8EDF5', strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fill="url(#deckGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default HomePage
