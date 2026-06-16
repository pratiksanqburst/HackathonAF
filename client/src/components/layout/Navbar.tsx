import React, { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { TrendingUp, Presentation, LogOut, Shield, User as UserIcon, Menu, X } from 'lucide-react'

const Navbar = () => {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const { currentView, setView, user, logout } = useAppStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(99, 179, 237, 0.1)',
        borderRadius: 16,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        marginBottom: 4,
        position: 'relative',
        zIndex: 1000,
        gap: 12,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.45))' }}>
            <defs>
              <linearGradient id="navLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="44" stroke="url(#navLogoGrad)" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />
            <circle cx="50" cy="50" r="38" stroke="url(#navLogoGrad)" strokeWidth="2.5" opacity="0.8" />
            <circle cx="50" cy="50" r="18" fill="url(#navLogoGrad)" fillOpacity="0.15" stroke="url(#navLogoGrad)" strokeWidth="2" />
            <path d="M 50 12 A 38 38 0 0 1 88 50 A 38 38 0 0 1 50 88 A 38 38 0 0 1 12 50 A 38 38 0 0 1 50 12 Z" stroke="url(#navLogoGrad)" strokeWidth="1" opacity="0.3" />
            <line x1="50" y1="12" x2="50" y2="88" stroke="url(#navLogoGrad)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.5" />
            <line x1="12" y1="50" x2="88" y2="50" stroke="url(#navLogoGrad)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.5" />
            <circle cx="50" cy="50" r="7" fill="url(#navLogoGrad)" />
          </svg>
          <div>
            <h1 style={{
              fontSize: 17, fontWeight: 800, margin: 0,
              background: 'linear-gradient(90deg, #38bdf8, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.03em',
              whiteSpace: 'nowrap',
            }}>
              Deckora
            </h1>
            <p className="navbar-brand-sub" style={{ fontSize: 10, color: '#475569', margin: 0, marginTop: 1, whiteSpace: 'nowrap' }}>
              AI-Powered Deck Storytelling
            </p>
          </div>
        </div>

        {/* Navigation tabs – hidden on mobile via CSS class */}
        <div className="navbar-nav">
          <button
            onClick={() => setView('dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: currentView === 'dashboard' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              border: 'none',
              color: currentView === 'dashboard' ? '#38bdf8' : '#94a3b8',
              padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
          >
            <TrendingUp size={14} />
            Dashboard
          </button>
          <button
            onClick={() => setView('deck-builder')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: currentView === 'deck-builder' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              border: 'none',
              color: currentView === 'deck-builder' ? '#38bdf8' : '#94a3b8',
              padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
          >
            <Presentation size={14} />
            Deck Builder
          </button>
        </div>

        {/* Right section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {/* Market status — hidden on mobile */}
          <div className="navbar-right-meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.8)',
            }} />
            <span style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>Markets Live</span>
          </div>
          <div className="navbar-right-meta" style={{ width: 1, height: 18, background: 'rgba(99,179,237,0.15)' }} />
          {/* Date/time — hidden on mobile */}
          <div className="navbar-time navbar-right-meta" style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{timeStr}</div>
            <div style={{ fontSize: 10, color: '#475569' }}>{dateStr}</div>
          </div>

          {/* Mobile hamburger — shown only on mobile via CSS */}
          <button
            className="navbar-mobile-nav"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: mobileMenuOpen ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94a3b8', padding: '6px 8px', borderRadius: 8,
              alignItems: 'center', cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* User Avatar Dropdown */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer',
                boxShadow: '0 0 16px rgba(167,139,250,0.3)', flexShrink: 0, overflow: 'hidden',
              }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'IS'
              )}
            </div>

            {dropdownOpen && (
              <>
                <div onClick={() => setDropdownOpen(false)} style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998,
                }} />
                <div style={{
                  position: 'absolute', top: 46, right: 0, width: 250,
                  background: 'rgba(15, 23, 42, 0.97)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(16px)', borderRadius: 12,
                  padding: '14px 12px', zIndex: 999,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    marginBottom: 12, paddingBottom: 12,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', flexShrink: 0,
                    }}>
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <UserIcon size={18} color="#cbd5e1" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{user?.name || 'Anonymous User'}</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{user?.email || 'no-email@sso.com'}</div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(56, 189, 248, 0.06)',
                    border: '1px solid rgba(56, 189, 248, 0.15)',
                    borderRadius: 6, padding: '6px 10px', marginBottom: 14,
                  }}>
                    <Shield size={11} color="#38bdf8" />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8' }}>
                      {user?.role || 'Guest'} Access
                    </span>
                  </div>

                  <button
                    onClick={() => { setDropdownOpen(false); logout() }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 8,
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.2)',
                      color: '#f43f5e', fontSize: 12, fontWeight: 600,
                      padding: '8px 12px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244, 63, 94, 0.18)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)')}
                  >
                    <LogOut size={12} /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile slide-down navigation tabs */}
      {mobileMenuOpen && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.97)',
          border: '1px solid rgba(99, 179, 237, 0.1)',
          borderRadius: 12, padding: '10px 16px', marginTop: 6,
          display: 'flex', gap: 8, backdropFilter: 'blur(16px)',
        }}>
          {[
            { view: 'dashboard', label: 'Dashboard', Icon: TrendingUp },
            { view: 'deck-builder', label: 'Deck Builder', Icon: Presentation },
          ].map(({ view, label, Icon }) => (
            <button
              key={view}
              onClick={() => { setView(view as any); setMobileMenuOpen(false) }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: currentView === view ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.04)',
                border: currentView === view ? '1px solid rgba(56,189,248,0.3)' : '1px solid rgba(255,255,255,0.06)',
                color: currentView === view ? '#38bdf8' : '#94a3b8',
                padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

export default Navbar
