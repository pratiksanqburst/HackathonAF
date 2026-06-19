import React, { useState, useEffect } from 'react'
import { useAppStore, User } from '../store/useAppStore'
import { Brain, LogIn, ShieldAlert, Sparkles, UserCheck } from 'lucide-react'

// Mock profiles for simulated Google accounts
const MOCK_GOOGLE_ACCOUNTS: User[] = [
  {
    name: 'Alex Reed',
    email: 'alex.reed@af-wealth.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    role: 'Advisor',
  },
  {
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    role: 'Client',
  },
  {
    name: 'Apex Wealth Admin',
    email: 'admin@apexwealth.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    role: 'Admin',
  },
]

// ─── 1. MOCK GOOGLE AUTH POPUP COMPONENT ──────────────────────────────────────
export const GoogleAuthPopup: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSelectAccount = (user: User) => {
    setSelectedUser(user)
    setLoading(true)
    setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', user }, window.location.origin)
      }
      window.close()
    }, 1500)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      color: '#202124',
      fontFamily: 'Roboto, Arial, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: 450,
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: 8,
        padding: '40px 32px 32px 32px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Google Branding Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <svg width="74" height="24" viewBox="0 0 74 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.24 4.88C11.16 3.75 9.77 3.19 8.17 3.19c-3.23 0-5.96 2.19-6.94 5.15C.99 9.11.85 9.87.85 10.66s.14 1.55.38 2.32c.98 2.96 3.71 5.15 6.94 5.15 1.63 0 3.01-.44 4.09-1.2 1.25-.87 2.06-2.22 2.29-3.79H8.17v-3.08h10.45c.1.53.16 1.08.16 1.65 0 3.29-1.17 6.06-3.21 7.94C13.9 21.19 11.23 22 8.17 22 3.65 22 0 18.35 0 13.83S3.65 5.66 8.17 5.66c2.47 0 4.61.9 6.27 2.48l-2.2 2.2c-.99-.95-2.31-1.46-4.07-1.46zm15.1 8.95c0 3.42-2.58 6-5.83 6s-5.83-2.58-5.83-6 2.58-6 5.83-6 5.83 2.58 5.83 6zm-3.2 0c0-1.92-1.39-3.32-2.63-3.32s-2.63 1.4-2.63 3.32 1.39 3.32 2.63 3.32 2.63-1.4 2.63-3.32zm15.1 0c0 3.42-2.58 6-5.83 6s-5.83-2.58-5.83-6 2.58-6 5.83-6 5.83 2.58 5.83 6zm-3.2 0c0-1.92-1.39-3.32-2.63-3.32s-2.63 1.4-2.63 3.32 1.39 3.32 2.63 3.32 2.63-1.4 2.63-3.32zm14.36-5.74v11.13c0 4.59-2.7 6.47-5.88 6.47-2.99 0-4.78-2-5.46-3.66l2.8-1.16c.5.19 1.45 1.3 2.66 1.3 1.74 0 2.82-1.08 2.82-3.1v-.95h-.1c-.55.68-1.61 1.27-2.95 1.27-2.8 0-5.38-2.43-5.38-5.78 0-3.37 2.58-5.83 5.38-5.83 1.34 0 2.4.59 2.95 1.25h.1v-1h3.06zm-2.98 5.76c0-1.9-1.33-3.34-2.63-3.34-1.32 0-2.65 1.44-2.65 3.34 0 1.88 1.33 3.3 2.65 3.3 1.3 0 2.63-1.42 2.63-3.3zm5.72-8.31h3.24V19.8h-3.24V5.66zm10.74 8.95c0 3.24-2.45 6-5.59 6-3.34 0-5.8-2.58-5.8-6 0-3.48 2.45-6 5.5-6 3.33 0 4.67 2.48 5.09 3.82l.33.85-7.4 3.06c.57 1.12 1.45 1.69 2.7 1.69 1.23 0 2.08-.61 2.63-1.38l2.54 1.69c-.68 1.01-2.31 2.69-5.17 2.69-3.52 0-6.17-2.73-6.17-6.27zm-7.91-.12l4.89-2.02c-.27-.68-.98-1.16-1.87-1.16-1.15 0-2.5 1.03-3.02 3.18z" fill="#757575"/>
          </svg>
        </div>

        {!loading ? (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 400, color: '#202124', margin: '0 0 8px 0' }}>
              Choose an account
            </h1>
            <p style={{ fontSize: 14, color: '#5f6368', margin: '0 0 24px 0' }}>
              to continue to <strong style={{ color: '#1a73e8' }}>insightsphere.com</strong>
            </p>

            <div style={{ textAlign: 'left', borderTop: '1px solid #dadce0', margin: '0 -32px' }}>
              {MOCK_GOOGLE_ACCOUNTS.map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => handleSelectAccount(acc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 32px',
                    borderBottom: '1px solid #dadce0',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#3c4043' }}>{acc.name}</div>
                    <div style={{ fontSize: 12, color: '#5f6368', marginTop: 2 }}>{acc.email}</div>
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#1a73e8',
                    background: '#e8f0fe',
                    padding: '3px 8px',
                    borderRadius: 10,
                  }}>
                    {acc.role}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, fontSize: 12, color: '#5f6368', lineHeight: 1.5, textAlign: 'left' }}>
              To create a fully branded, secure environment, Deckora supports SSO identity providers. Selection assigns appropriate platform viewing keys.
            </div>
          </>
        ) : (
          <div style={{ padding: '40px 0' }}>
            <div style={{
              width: 48,
              height: 48,
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #1a73e8',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 24px auto',
            }} />
            <h2 style={{ fontSize: 16, color: '#3c4043', fontWeight: 500 }}>
              Signing you in as {selectedUser?.name}...
            </h2>
            <p style={{ fontSize: 13, color: '#5f6368', marginTop: 8 }}>
              Verifying credentials with Google Identity Services
            </p>

            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 2. MAIN LOGIN SCREEN COMPONENT ───────────────────────────────────────────
const Login = () => {
  const login = useAppStore((state) => state.login)
  const [openingPopup, setOpeningPopup] = useState(false)

  // Listen to message events from the popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        login(event.data.user)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [login])

  const handleGoogleLogin = () => {
    setOpeningPopup(true)
    const width = 500
    const height = 600
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    const popup = window.open(
      '/mock-google-login',
      'Google OAuth Sign-In',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
    )

    // Reset indicator after some time in case popup closed
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        setOpeningPopup(false)
        clearInterval(timer)
      }
    }, 1000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 10% 20%, rgba(90, 92, 234, 0.15) 0%, rgba(2, 6, 23, 1) 90%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      color: '#fff',
      fontFamily: 'Outfit, sans-serif',
    }}>
      {/* Decorative Orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12), transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.12), transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      {/* Main Glass Panel */}
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: 480,
        padding: '48px 40px',
        textAlign: 'center',
        background: 'rgba(15, 23, 42, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Header App Logo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <img 
            src="/logo.jpg" 
            alt="DECORA logo" 
            style={{
              width: 42,
              height: 42,
              borderRadius: 8,
              objectFit: 'contain',
              border: '1px solid rgba(255,255,255,0.1)'
            }} 
          />
          <div style={{ textAlign: 'left' }}>
            <h1 style={{
              fontSize: 20, fontWeight: 800, margin: 0,
              background: 'linear-gradient(90deg, #38bdf8, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em',
            }}>
              DECORA
            </h1>
            <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Intelligent presentation workspace
            </span>
          </div>
        </div>

        {/* Feature badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: 30,
          padding: '6px 14px',
          marginBottom: 32,
        }}>
          <Sparkles size={12} color="#38bdf8" />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8' }}>Google Sign-In Ready (Sandbox)</span>
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 10px 0', letterSpacing: '-0.02em', color: '#f1f5f9' }}>
          Wealth Intelligence Portal
        </h2>
        <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 36px 0', lineHeight: 1.6 }}>
          Unlock live market tickers, custom portfolios, rebalancing simulators, and export slide presentation decks.
        </p>

        {/* Google sign-in button */}
        <button
          onClick={handleGoogleLogin}
          disabled={openingPopup}
          style={{
            width: '100%',
            height: 48,
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: 8,
            color: '#3c4043',
            fontSize: 14,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            cursor: openingPopup ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          onMouseEnter={(e) => {
            if (!openingPopup) {
              e.currentTarget.style.backgroundColor = '#f8f9fa'
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)'
            }
          }}
          onMouseLeave={(e) => {
            if (!openingPopup) {
              e.currentTarget.style.backgroundColor = '#ffffff'
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
            }
          }}
        >
          {openingPopup ? (
            <div style={{
              width: 18, height: 18,
              border: '2px solid #ccc',
              borderTop: '2px solid #3c4043',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.707c-.18-.54-.282-1.119-.282-1.707 0-.588.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.488.365 2.917.957 4.298l3.007-2.591z" fill="#FBBC05" />
              <path d="M9 3.58c1.32 0 2.5.454 3.436 1.353l2.58-2.58C13.463.892 11.426 0 9 0 5.484 0 2.457 2.023.957 4.961l3.007 2.332c.708-2.127 2.692-3.713 5.036-3.713z" fill="#EA4335" />
            </svg>
          )}
          {openingPopup ? 'Opening Google Account Chooser...' : 'Sign in with Google'}
        </button>

        {/* Guest access disclaimer */}
        <div style={{
          marginTop: 32,
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          textAlign: 'left',
        }}>
          <UserCheck size={18} color="#a78bfa" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
            <strong>Mock SSO Sandbox:</strong> Selecting an account loads specific layouts automatically. No developer console required.
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
