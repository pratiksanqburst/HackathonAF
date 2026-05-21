import React, { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { Layers, TrendingUp, Presentation, LogOut, Shield, User as UserIcon } from 'lucide-react'

const Navbar = () => {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const { currentView, setView, user, logout } = useAppStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 28px',
      background: 'rgba(15, 23, 42, 0.7)',
      border: '1px solid rgba(99, 179, 237, 0.1)',
      borderRadius: 16,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      marginBottom: 4,
      position: 'relative',
      zIndex: 1000,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))' }}>
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          {/* Rotating dashed ring */}
          <circle cx="50" cy="50" r="42" stroke="url(#logoGrad)" strokeWidth="3" strokeDasharray="14 8" strokeLinecap="round" />
          {/* Glowing central sphere */}
          <circle cx="50" cy="50" r="24" fill="url(#logoGrad)" fillOpacity="0.18" stroke="url(#logoGrad)" strokeWidth="2.5" />
          {/* Cross orbits */}
          <ellipse cx="50" cy="50" rx="26" ry="7" stroke="#38bdf8" strokeWidth="2" transform="rotate(-30 50 50)" />
          <ellipse cx="50" cy="50" rx="26" ry="7" stroke="#a78bfa" strokeWidth="2" transform="rotate(30 50 50)" />
          {/* Core nucleus */}
          <circle cx="50" cy="50" r="8" fill="url(#logoGrad)" />
        </svg>
        <div>
          <h1 style={{
            fontSize: 18, fontWeight: 800, margin: 0,
            background: 'linear-gradient(90deg, #38bdf8, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-0.03em',
          }}>
            AF InsightSphere
          </h1>
          <p style={{ fontSize: 11, color: '#475569', margin: 0, marginTop: 1 }}>
            Investment Storytelling Experience
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: 8, background: 'rgba(2, 6, 23, 0.4)', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => setView('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: currentView === 'dashboard' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            border: 'none',
            color: currentView === 'dashboard' ? '#38bdf8' : '#94a3b8',
            padding: '6px 14px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          <TrendingUp size={14} />
          Dashboard
        </button>
        <button
          onClick={() => setView('deck-builder')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: currentView === 'deck-builder' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            border: 'none',
            color: currentView === 'deck-builder' ? '#38bdf8' : '#94a3b8',
            padding: '6px 14px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          <Presentation size={14} />
          Deck Builder
        </button>
      </div>

      {/* Right side indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Market status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#34d399',
            boxShadow: '0 0 8px rgba(52,211,153,0.8)',
          }} />
          <span style={{ fontSize: 11, color: '#64748b' }}>Markets Live</span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: 'rgba(99,179,237,0.15)' }} />

        {/* Date/time */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{timeStr}</div>
          <div style={{ fontSize: 10, color: '#475569' }}>{dateStr}</div>
        </div>

        {/* User Account / Avatar Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(167,139,250,0.3)',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'AF'
            )}
          </div>

          {dropdownOpen && (
            <>
              {/* Overlay listener to close dropdown */}
              <div
                onClick={() => setDropdownOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  zIndex: 998,
                  cursor: 'default',
                }}
              />
              {/* Dropdown Card */}
              <div style={{
                position: 'absolute',
                top: 48,
                right: 0,
                width: 260,
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                borderRadius: 12,
                padding: '16px 12px',
                zIndex: 999,
                boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                textAlign: 'left',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <UserIcon size={20} color="#cbd5e1" />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{user?.name || 'Anonymous User'}</div>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{user?.email || 'no-email@sso.com'}</div>
                  </div>
                </div>

                {/* Role and Permissions section */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(56, 189, 248, 0.06)',
                  border: '1px solid rgba(56, 189, 248, 0.15)',
                  borderRadius: 6,
                  padding: '6px 10px',
                  marginBottom: 16,
                }}>
                  <Shield size={12} color="#38bdf8" />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8' }}>
                    Authenticated Role: {user?.role || 'Guest'}
                  </span>
                </div>

                {/* Actions */}
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    logout()
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    color: '#f43f5e',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '8px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244, 63, 94, 0.18)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)')}
                >
                  <LogOut size={13} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
