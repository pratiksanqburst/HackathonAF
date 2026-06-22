import React, { useEffect, useState } from 'react'
import { useAppStore, ActivityLog } from '../store/useAppStore'
import {
  Activity,
  Search,
  RefreshCw,
  PlusCircle,
  FileText,
  Upload,
  User,
  Trash2,
  Edit2,
  Clock,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const ActivityPage: React.FC = () => {
  const { activities, activitiesLoading, activitiesError, fetchActivities } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'deck' | 'client' | 'upload'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchActivities()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.user.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeFilter === 'all') return matchesSearch
    if (activeFilter === 'deck') return matchesSearch && act.type === 'deck_generate'
    if (activeFilter === 'client') return matchesSearch && ['client_create', 'client_update', 'client_delete'].includes(act.type)
    if (activeFilter === 'upload') return matchesSearch && ['logo_upload', 'portfolio_upload'].includes(act.type)
    return matchesSearch
  })

  // Group by date/time category
  const getRelativeTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const diffMs = Date.now() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays === 1) return 'Yesterday'
      return `${diffDays} days ago`
    } catch {
      return 'Recent'
    }
  }

  // Get type specific style config
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'client_create':
        return {
          icon: <PlusCircle size={15} />,
          color: '#10B981', // Emerald
          bgColor: 'rgba(16,185,129,0.08)',
          borderColor: 'rgba(16,185,129,0.15)',
          label: 'Client Created'
        }
      case 'client_update':
        return {
          icon: <Edit2 size={14} />,
          color: '#2563EB', // Blue
          bgColor: 'rgba(37,99,235,0.08)',
          borderColor: 'rgba(37,99,235,0.15)',
          label: 'Client Updated'
        }
      case 'client_delete':
        return {
          icon: <Trash2 size={14} />,
          color: '#EF4444', // Red
          bgColor: 'rgba(239,68,68,0.08)',
          borderColor: 'rgba(239,68,68,0.15)',
          label: 'Client Removed'
        }
      case 'logo_upload':
        return {
          icon: <Upload size={14} />,
          color: '#7C3AED', // Purple
          bgColor: 'rgba(124,58,237,0.08)',
          borderColor: 'rgba(124,58,237,0.15)',
          label: 'Logo Upload'
        }
      case 'portfolio_upload':
        return {
          icon: <FileText size={14} />,
          color: '#F59E0B', // Amber
          bgColor: 'rgba(245,158,11,0.08)',
          borderColor: 'rgba(245,158,11,0.15)',
          label: 'Portfolio Import'
        }
      case 'deck_generate':
        return {
          icon: <FileText size={14} />,
          color: '#EC4899', // Pink / Magenta
          bgColor: 'rgba(236,72,153,0.08)',
          borderColor: 'rgba(236,72,153,0.15)',
          label: 'Deck Generated'
        }
      default:
        return {
          icon: <Activity size={14} />,
          color: '#64748B', // Slate
          bgColor: 'rgba(100,116,139,0.08)',
          borderColor: 'rgba(100,116,139,0.15)',
          label: 'System Action'
        }
    }
  }

  // Count stats
  const totalCount = activities.length
  const deckCount = activities.filter(a => a.type === 'deck_generate').length
  const clientCount = activities.filter(a => ['client_create', 'client_update', 'client_delete'].includes(a.type)).length
  const uploadCount = activities.filter(a => ['logo_upload', 'portfolio_upload'].includes(a.type)).length

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', fontFamily: "'Inter', sans-serif", paddingBottom: 50 }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>Decora</span>
            <span style={{ fontSize: 11, color: '#CBD5E1' }}>/</span>
            <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 700 }}>Activity Logs</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', marginBottom: 4 }}>
            Activity Logs
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
            Audit trail of client modifications, slide generations, exports, and profile uploads in real-time.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={activitiesLoading || isRefreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            background: '#FFFFFF',
            border: '1px solid #E8EDF5',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            color: '#4F46E5',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(15,23,42,0.03)',
            transition: 'all 0.15s',
            opacity: activitiesLoading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FAFBFD'
            e.currentTarget.style.borderColor = '#C7D2E2'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF'
            e.currentTarget.style.borderColor = '#E8EDF5'
          }}
        >
          <RefreshCw
            size={13}
            className={isRefreshing ? 'spin' : ''}
            style={{
              animation: isRefreshing ? 'spin 0.6s linear infinite' : 'none',
              transition: 'transform 0.15s'
            }}
          />
          Sync Logs
        </button>
      </div>

      {/* ── Key Metrics ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 28
      }}>
        {[
          { label: 'All Operations', value: totalCount, icon: <Activity size={16} />, color: '#4F46E5', labelText: 'Total audit log items' },
          { label: 'Decks Built', value: deckCount, icon: <FileText size={16} />, color: '#EC4899', labelText: 'Gemini slide sets generated' },
          { label: 'Profile Changes', value: clientCount, icon: <User size={16} />, color: '#10B981', labelText: 'Client records modified' },
          { label: 'Data Uploads', value: uploadCount, icon: <Upload size={16} />, color: '#F59E0B', labelText: 'CSV and image file uploads' }
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8EDF5',
              borderRadius: 16,
              padding: '16px 20px',
              boxShadow: '0 1px 4px rgba(15,23,42,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {stat.label}
              </span>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                {activitiesLoading ? '...' : stat.value}
              </div>
              <span style={{ fontSize: 10, color: '#94A3B8', marginTop: 2, display: 'block' }}>
                {stat.labelText}
              </span>
            </div>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: `${stat.color}0c`,
              color: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter / Search Bar ── */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E8EDF5',
        borderRadius: 16,
        padding: '16px 20px',
        boxShadow: '0 1px 4px rgba(15,23,42,0.02)',
        marginBottom: 20,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#F8FAFC',
          border: '1px solid #E8EDF5',
          borderRadius: 12,
          padding: '8px 14px',
          width: 320,
          maxWidth: '100%'
        }}>
          <Search size={14} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search logs by keyword, user or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 12.5,
              color: '#0F172A',
              width: '100%',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 6, color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>
            <Filter size={12} />
            Filter:
          </div>
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'deck', label: 'Slide Decks' },
            { id: 'client', label: 'Client Records' },
            { id: 'upload', label: 'Uploads & Sheets' }
          ].map((filt) => (
            <button
              key={filt.id}
              onClick={() => setActiveFilter(filt.id as any)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: activeFilter === filt.id ? 'none' : '1px solid #E8EDF5',
                background: activeFilter === filt.id ? 'linear-gradient(135deg, #4F46E5, #3730A3)' : '#FFFFFF',
                color: activeFilter === filt.id ? '#FFFFFF' : '#64748B',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: activeFilter === filt.id ? '0 2px 6px rgba(79,70,229,0.18)' : 'none'
              }}
            >
              {filt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Activity Feed Container ── */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E8EDF5',
        borderRadius: 16,
        boxShadow: '0 1px 5px rgba(15,23,42,0.02)',
        overflow: 'hidden'
      }}>
        {activitiesLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#94A3B8' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', marginBottom: 12, color: '#4F46E5' }} />
            <div style={{ fontSize: 13, fontWeight: 500 }}>Fetching latest activity logs from gateway...</div>
          </div>
        ) : activitiesError ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#EF4444' }}>
            <AlertCircle size={28} style={{ marginBottom: 10, color: '#EF4444' }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>Connection Error</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{activitiesError}</div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#94A3B8' }}>
            <Clock size={28} style={{ marginBottom: 12, color: '#94A3B8' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#64748B' }}>No Activities Found</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, padding: '0 20px' }}>
              {searchTerm ? 'Try adjusting your search keywords or active category filters.' : 'System operations will appear here as they are performed.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredActivities.map((act, index) => {
              const cfg = getTypeConfig(act.type)
              return (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: '20px 24px',
                    borderBottom: index === filteredActivities.length - 1 ? 'none' : '1px solid #F1F5F9',
                    transition: 'background 0.15s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFD' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  {/* Action Icon Badge */}
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: cfg.bgColor,
                    border: `1px solid ${cfg.borderColor}`,
                    color: cfg.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    {cfg.icon}
                  </div>

                  {/* Body details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
                        {act.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94A3B8', fontSize: 11.5 }}>
                        <Clock size={11} />
                        <span>{getRelativeTime(act.timestamp)}</span>
                      </div>
                    </div>

                    <p style={{ fontSize: 13, color: '#475569', marginTop: 4, lineHeight: 1.45, fontWeight: 500 }}>
                      {act.description}
                    </p>

                    {/* Metadata indicators */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: '#F1F5F9',
                        color: '#64748B',
                        padding: '2px 8px',
                        borderRadius: 5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        {cfg.label}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94A3B8', fontSize: 11 }}>
                        <User size={11} />
                        <span>{act.user}</span>
                      </div>

                      {act.metadata?.clientId && (
                        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                          ID: <span style={{ fontFamily: 'monospace', fontSize: 10.5, color: '#94A3B8' }}>{act.metadata.clientId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default ActivityPage
