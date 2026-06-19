import React from 'react'
import { useAppStore, AppPage } from '../../store/useAppStore'
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  FileText, 
  Activity, 
  Settings, 
  LogOut,
  BarChart2,
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, logout, user } = useAppStore()

  const navItems: { page: AppPage; label: string; icon: React.ReactNode }[] = [
    { page: 'home',         label: 'Dashboard',          icon: <LayoutDashboard size={17} /> },
    { page: 'clients',      label: 'Clients',             icon: <Users size={17} /> },
    { page: 'deck-builder', label: 'Deck Builder',        icon: <Layers size={17} /> },
    { page: 'analytics',    label: 'Portfolio Analytics', icon: <BarChart2 size={17} /> },
    { page: 'templates',    label: 'Templates',           icon: <FileText size={17} /> },
    { page: 'activity',     label: 'Activity',            icon: <Activity size={17} /> },
  ]

  const userInitials = user ? user.name.split(' ').map(n => n[0]).join('') : 'AW'

  return (
    <div style={{
      width: 252,
      background: '#FFFFFF',
      borderRight: '1px solid #E8EDF5',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'space-between',
      padding: '0',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* ── Brand Logo ── */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: '22px 20px 20px 20px',
          borderBottom: '1px solid #F1F5F9',
        }}>
          <img
            src="/logo.jpg"
            alt="DECORA logo"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              objectFit: 'contain',
              border: '1px solid #E8EDF5',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{
              fontSize: 15,
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '0.04em',
              lineHeight: 1.2,
            }}>DECORA</div>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              color: '#94A3B8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}>INTELLIGENT WORKSPACE</div>
          </div>
        </div>

        {/* ── Nav Section Label ── */}
        <div style={{ padding: '20px 20px 8px 20px' }}>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#CBD5E1',
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
          }}>Main Menu</span>
        </div>

        {/* ── Navigation List ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
          {navItems.map((item) => {
            const isActive = currentPage === item.page
            return (
              <button
                key={item.page}
                onClick={() => setCurrentPage(item.page)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#2563EB' : '#64748B',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(37,99,235,0.10) 0%, rgba(99,102,241,0.06) 100%)'
                    : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? 'inset 3px 0 0 #2563EB' : 'none',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#F8FAFC'
                    e.currentTarget.style.color = '#0F172A'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#64748B'
                  }
                }}
              >
                <span style={{
                  color: isActive ? '#2563EB' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s',
                }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div style={{ padding: '16px 12px 20px 12px', borderTop: '1px solid #F1F5F9' }}>
        {/* Settings */}
        <button
          onClick={() => setCurrentPage('activity')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 500,
            color: '#64748B',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            marginBottom: 8,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#0F172A' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B' }}
        >
          <Settings size={17} color="#94A3B8" />
          Settings
        </button>

        {/* Profile Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #F8FAFF 0%, #F1F5F9 100%)',
          border: '1px solid #E8EDF5',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              flexShrink: 0,
            }}>
              {userInitials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#0F172A',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                maxWidth: 110,
                letterSpacing: '-0.01em',
              }}>
                {user?.name || 'Alex Reed'}
              </div>
              <div style={{ fontSize: 10.5, color: '#94A3B8', whiteSpace: 'nowrap', marginTop: 1 }}>
                {user?.role === 'Advisor' ? 'Senior Advisor' : user?.role || 'Senior Advisor'}
              </div>
            </div>
          </div>
          
          <button
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#CBD5E1'; e.currentTarget.style.background = 'none' }}
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
