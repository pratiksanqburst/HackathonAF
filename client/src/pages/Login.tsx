import React, { useState, useEffect } from 'react'
import { useAppStore, User } from '../store/useAppStore'
import { Sparkles, UserCheck, TrendingUp, ShieldCheck, BarChart3, Eye, EyeOff } from 'lucide-react'

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

// ─── 1. MOCK GOOGLE AUTH POPUP ────────────────────────────────────────────────
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
      minHeight: '100vh', background: '#ffffff', color: '#202124',
      fontFamily: 'Roboto, Arial, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, boxSizing: 'border-box',
    }}>
      <div style={{
        width: 450, background: '#ffffff', border: '1px solid #dadce0',
        borderRadius: 8, padding: '40px 32px 32px 32px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <svg width="74" height="24" viewBox="0 0 74 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.24 4.88C11.16 3.75 9.77 3.19 8.17 3.19c-3.23 0-5.96 2.19-6.94 5.15C.99 9.11.85 9.87.85 10.66s.14 1.55.38 2.32c.98 2.96 3.71 5.15 6.94 5.15 1.63 0 3.01-.44 4.09-1.2 1.25-.87 2.06-2.22 2.29-3.79H8.17v-3.08h10.45c.1.53.16 1.08.16 1.65 0 3.29-1.17 6.06-3.21 7.94C13.9 21.19 11.23 22 8.17 22 3.65 22 0 18.35 0 13.83S3.65 5.66 8.17 5.66c2.47 0 4.61.9 6.27 2.48l-2.2 2.2c-.99-.95-2.31-1.46-4.07-1.46zm15.1 8.95c0 3.42-2.58 6-5.83 6s-5.83-2.58-5.83-6 2.58-6 5.83-6 5.83 2.58 5.83 6zm-3.2 0c0-1.92-1.39-3.32-2.63-3.32s-2.63 1.4-2.63 3.32 1.39 3.32 2.63 3.32 2.63-1.4 2.63-3.32z" fill="#757575"/>
          </svg>
        </div>
        {!loading ? (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 400, color: '#202124', margin: '0 0 8px 0' }}>Choose an account</h1>
            <p style={{ fontSize: 14, color: '#5f6368', margin: '0 0 24px 0' }}>
              to continue to <strong style={{ color: '#1a73e8' }}>decora.com</strong>
            </p>
            <div style={{ textAlign: 'left', borderTop: '1px solid #dadce0', margin: '0 -32px' }}>
              {MOCK_GOOGLE_ACCOUNTS.map((acc) => (
                <div key={acc.email} onClick={() => handleSelectAccount(acc)}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 32px', borderBottom: '1px solid #dadce0', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <img src={acc.avatar} alt={acc.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#3c4043' }}>{acc.name}</div>
                    <div style={{ fontSize: 12, color: '#5f6368', marginTop: 2 }}>{acc.email}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#1a73e8', background: '#e8f0fe', padding: '3px 8px', borderRadius: 10 }}>{acc.role}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ padding: '40px 0' }}>
            <div style={{ width: 48, height: 48, border: '4px solid #f3f3f3', borderTop: '4px solid #1a73e8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px auto' }} />
            <h2 style={{ fontSize: 16, color: '#3c4043', fontWeight: 500 }}>Signing you in as {selectedUser?.name}...</h2>
            <p style={{ fontSize: 13, color: '#5f6368', marginTop: 8 }}>Verifying credentials with Google Identity Services</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 2. MAIN LOGIN SCREEN ─────────────────────────────────────────────────────
const Login = () => {
  const login = useAppStore((state) => state.login)
  const [openingPopup, setOpeningPopup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState('')

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
    const width = 500, height = 600
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2
    const popup = window.open('/mock-google-login', 'Google OAuth Sign-In', `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`)
    const timer = setInterval(() => {
      if (!popup || popup.closed) { setOpeningPopup(false); clearInterval(timer) }
    }, 1000)
  }

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setIsSigningIn(true)
    // Simulate auth with mock account matching
    setTimeout(() => {
      const matched = MOCK_GOOGLE_ACCOUNTS.find(acc => acc.email.toLowerCase() === email.toLowerCase())
      if (matched) {
        login(matched)
      } else {
        // Log in as default advisor with entered name
        login({ name: email.split('@')[0], email, avatar: '', role: 'Advisor' })
      }
      setIsSigningIn(false)
    }, 1200)
  }

  const features = [
    { icon: <TrendingUp size={18} color="#38bdf8" />, text: 'Live market tickers & portfolio analytics' },
    { icon: <BarChart3 size={18} color="#a78bfa" />, text: 'AI-powered presentation deck builder' },
    { icon: <ShieldCheck size={18} color="#34d399" />, text: 'Risk simulation & rebalancing tools' },
    { icon: <Sparkles size={18} color="#fb923c" />, text: 'Gemini AI commentary & slide refinement' },
  ]

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%',
    height: 52,
    background: focused ? 'rgba(56,189,248,0.06)' : 'rgba(255,255,255,0.04)',
    border: focused ? '1.5px solid rgba(56,189,248,0.5)' : '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#f1f5f9',
    fontSize: 14,
    padding: '0 48px 0 16px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
    fontFamily: 'Outfit, sans-serif',
  })

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'Outfit, sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatOrb { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        ::placeholder { color: rgba(148,163,184,0.6); }
      `}</style>

      {/* ── LEFT PANEL: Branding ── */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.18), transparent 70%)', filter: 'blur(60px)', animation: 'floatOrb 6s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.18), transparent 70%)', filter: 'blur(60px)', animation: 'floatOrb 8s ease-in-out infinite 1s', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '55%', left: '40%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.12), transparent 70%)', filter: 'blur(50px)', animation: 'floatOrb 7s ease-in-out infinite 2s', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56, animation: 'fadeUp 0.6s ease both' }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'contain', border: '1px solid rgba(255,255,255,0.15)' }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(90deg, #38bdf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.03em' }}>
              DECORA
            </div>
            <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
              Intelligent Presentation Workspace — Focused on Deck Builder
            </div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ animation: 'fadeUp 0.6s ease 0.1s both' }}>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: '#f1f5f9', margin: '0 0 16px 0', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
            Your wealth,<br />
            <span style={{ background: 'linear-gradient(90deg, #38bdf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              intelligently managed.
            </span>
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, margin: '0 0 48px 0', maxWidth: 380 }}>
            The all-in-one advisor platform for portfolio analytics, AI-generated presentations, and real-time market intelligence.
          </p>
        </div>

        {/* Features list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp 0.6s ease 0.2s both' }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {f.icon}
              </div>
              <span style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.4 }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 64, fontSize: 11, color: '#334155', animation: 'fadeUp 0.6s ease 0.3s both' }}>
          © 2026 Wealth Advisory Group. Secure & Encrypted.
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div style={{
        flex: 1,
        background: '#020617',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* subtle grid bg */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 440, position: 'relative', animation: 'fadeUp 0.6s ease 0.15s both' }}>

          {/* Welcome text */}
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
              Welcome back
            </h3>
            <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>
              Sign in to your advisor workspace
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 10, fontSize: 13, color: '#f43f5e' }}>
              {error}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
              <input
                type="email"
                placeholder="you@organisation.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                style={inputStyle(emailFocused)}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                <button type="button" style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  style={inputStyle(passwordFocused)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSigningIn}
              style={{
                width: '100%', height: 52, marginTop: 4,
                background: isSigningIn ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg, #2563eb, #4f46e5)',
                border: 'none', borderRadius: 10, color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: isSigningIn ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
              }}
              onMouseEnter={(e) => { if (!isSigningIn) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {isSigningIn ? (
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : null}
              {isSigningIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={openingPopup}
            style={{
              width: '100%', height: 52,
              background: openingPopup ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)',
              border: '1.5px solid rgba(255,255,255,0.1)',
              borderRadius: 10, color: '#e2e8f0',
              fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              cursor: openingPopup ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { if (!openingPopup) { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          >
            {openingPopup ? (
              <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid #e2e8f0', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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

          {/* SSO Note */}
          <div style={{
            marginTop: 28, padding: '14px 16px',
            background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)',
            borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <UserCheck size={16} color="#a78bfa" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
              <strong style={{ color: '#64748b' }}>Mock SSO Sandbox:</strong> Selecting a Google account loads role-specific layouts automatically. No developer console required.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
