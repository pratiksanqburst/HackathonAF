import React, { useEffect, useRef, useState } from 'react'
import Sidebar from './Sidebar'
import { Bell, ArrowLeft } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

interface AppShellProps {
  children: React.ReactNode
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const user = useAppStore(state => state.user)
  const currentPage = useAppStore(state => state.currentPage)
  const selectClient = useAppStore(state => state.selectClient)
  const userInitials = user ? user.name.split(' ').map(n => n[0]).join('') : 'AW'
  const mainRef = useRef<HTMLDivElement>(null)

  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'AI Slide Deck Generated', desc: 'Cover, metrics, and insights drafts prepared for Margaret Chen.', time: '5m ago', read: false },
    { id: 2, title: 'Portfolio CSV Uploaded', desc: 'Parsed and imported 5 holdings for Robert Harrington.', time: '45m ago', read: false },
    { id: 3, title: 'New Client Joined', desc: 'Margaret Chen onboarding parameters set successfully.', time: '2h ago', read: false }
  ])

  const handleMarkAllRead = () => {
    setUnreadCount(0)
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  // Scroll to top on every page navigation
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }
    // Also reset window in case body is the scroll container
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [currentPage])

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      {/* Fixed Sidebar */}
      <aside style={{ width: 252, position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50 }}>
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div style={{ marginLeft: 252, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* ── Top Bar ── */}
        <header style={{
          height: 64,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid #E8EDF5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>

          {/* Left Side: Back Button if not on home dashboard */}
          {currentPage !== 'home' ? (
            <button
              onClick={() => {
                // If we are on clients and a client details view is active, close details first
                if (currentPage === 'clients' && window.location.search.includes('id=')) {
                  selectClient(null)
                  window.history.pushState(null, '', '/clients')
                } else {
                  window.history.back()
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#FFFFFF',
                border: '1px solid #E8EDF5',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(15,23,42,0.03)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FAFBFD'
                e.currentTarget.style.borderColor = '#C7D2E2'
                e.currentTarget.style.color = '#0F172A'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF'
                e.currentTarget.style.borderColor = '#E8EDF5'
                e.currentTarget.style.color = '#475569'
              }}
            >
              <ArrowLeft size={14} color="#64748B" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: showNotifications ? '#F8FAFC' : 'none',
                  border: '1px solid',
                  borderColor: showNotifications ? '#C7D2E2' : '#E8EDF5',
                  cursor: 'pointer',
                  color: '#64748B',
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!showNotifications) {
                    e.currentTarget.style.background = '#F8FAFC'
                    e.currentTarget.style.borderColor = '#C7D2E2'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showNotifications) {
                    e.currentTarget.style.background = 'none'
                    e.currentTarget.style.borderColor = '#E8EDF5'
                  }
                }}
              >
                <Bell size={16} strokeWidth={2} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#EF4444',
                    border: '1.5px solid #FFFFFF',
                  }} />
                )}
              </button>

              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: 320,
                  background: '#FFFFFF',
                  border: '1px solid #E8EDF5',
                  borderRadius: 16,
                  boxShadow: '0 10px 25px -5px rgba(15,23,42,0.1), 0 8px 10px -6px rgba(15,23,42,0.05)',
                  padding: '16px 0',
                  zIndex: 100,
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {/* Dropdown Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 18px 12px 18px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        style={{ background: 'none', border: 'none', fontSize: 11, fontWeight: 700, color: '#2563EB', cursor: 'pointer', padding: 0 }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Dropdown Items */}
                  <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        style={{
                          padding: '12px 18px',
                          borderBottom: '1px solid #F8FAFC',
                          background: notif.read ? 'transparent' : 'rgba(37,99,235,0.02)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 3,
                          position: 'relative'
                        }}
                      >
                        {!notif.read && (
                          <div style={{ position: 'absolute', left: 8, top: 18, width: 5, height: 5, borderRadius: '50%', background: '#2563EB' }} />
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{notif.title}</span>
                          <span style={{ fontSize: 10, color: '#94A3B8' }}>{notif.time}</span>
                        </div>
                        <span style={{ fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>{notif.desc}</span>
                      </div>
                    ))}
                  </div>

                  {/* Dropdown Footer */}
                  <div style={{ padding: '10px 18px 0 18px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                    <button 
                      onClick={() => {
                        setShowNotifications(false)
                        useAppStore.getState().setCurrentPage('activity')
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#4F46E5',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      View audit trail
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 28, background: '#E8EDF5' }} />

            {/* User Avatar + Name */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 12px 6px 6px',
              borderRadius: 12,
              border: '1px solid #E8EDF5',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: '#FAFBFD',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F1F5F9'; (e.currentTarget as HTMLElement).style.borderColor = '#C7D2E2' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#FAFBFD'; (e.currentTarget as HTMLElement).style.borderColor = '#E8EDF5' }}
            >
              <div style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 11,
                boxShadow: '0 2px 6px rgba(37,99,235,0.22)',
                flexShrink: 0,
              }}>
                {userInitials}
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                  {user?.name?.split(' ')[0] || 'Alex'}
                </div>
                <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 1 }}>
                  Senior Advisor
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main ref={mainRef} style={{ flex: 1, padding: currentPage === 'deck-builder' ? '16px 24px' : '36px 40px', overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppShell
