import { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import Dashboard from './pages/Dashboard'
import DeckBuilder from './pages/DeckBuilder'
import Login, { GoogleAuthPopup } from './pages/Login'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import ClientsPage from './pages/ClientsPage'
import ActivityPage from './pages/ActivityPage'

// Core Application Entry View Routing
function App() {
  const currentPage = useAppStore(state => state.currentPage)
  const isLoggedIn = useAppStore(state => state.isLoggedIn)

  // Sync login/logout and session status across multiple open browser tabs
  useEffect(() => {
    const syncAuthSession = (e: StorageEvent) => {
      if (e.key === 'af_user') {
        const store = useAppStore.getState()
        if (!e.newValue && store.isLoggedIn) {
          store.logout()
        } else if (e.newValue) {
          try {
            const parsedUser = JSON.parse(e.newValue)
            if (!store.isLoggedIn || store.user?.email !== parsedUser.email) {
              store.login(parsedUser)
            }
          } catch {
            store.logout()
          }
        }
      }
    }

    const checkActiveSession = () => {
      const stored = localStorage.getItem('af_user')
      const store = useAppStore.getState()
      if (!stored && store.isLoggedIn) {
        store.logout()
      } else if (stored) {
        try {
          const parsedUser = JSON.parse(stored)
          if (!store.isLoggedIn || store.user?.email !== parsedUser.email) {
            store.login(parsedUser)
          }
        } catch {
          store.logout()
        }
      }
    }

    window.addEventListener('storage', syncAuthSession)
    window.addEventListener('focus', checkActiveSession)
    document.addEventListener('visibilitychange', checkActiveSession)

    return () => {
      window.removeEventListener('storage', syncAuthSession)
      window.removeEventListener('focus', checkActiveSession)
      document.removeEventListener('visibilitychange', checkActiveSession)
    }
  }, [])

  // Hash Routing Sync Listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#home'
      const pagePart = hash.split('?')[0].replace('#', '')
      const queryPart = hash.split('?')[1] || ''
      
      const validPages = ['home', 'clients', 'deck-builder', 'analytics', 'templates', 'activity']
      const page = validPages.includes(pagePart) ? pagePart : 'home'
      
      const store = useAppStore.getState()
      
      // Update selected client if hash has query id
      if (page === 'clients' && queryPart) {
        const params = new URLSearchParams(queryPart)
        const clientId = params.get('id')
        if (clientId) {
          const client = store.clients.find(c => c.id === clientId)
          if (client) {
            if (store.selectedClient?.id !== clientId) {
              store.selectClient(client)
              store.setPersona(client.persona)
            }
          } else {
            // Fetch first if list is empty
            store.fetchClients().then(() => {
              const freshClient = useAppStore.getState().clients.find(c => c.id === clientId)
              if (freshClient) {
                useAppStore.getState().selectClient(freshClient)
                useAppStore.getState().setPersona(freshClient.persona)
              }
            })
          }
        }
      } else {
        if (store.selectedClient !== null) {
          store.selectClient(null)
        }
      }
      
      if (store.currentPage !== page) {
        useAppStore.setState({ currentPage: page as any })
      }
    }

    // Run initially to set starting state
    handleHashChange()

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Serve mock Google login popup stand-alone route
  if (window.location.pathname === '/mock-google-login') {
    return <GoogleAuthPopup />
  }

  // Force login screen if not authenticated
  if (!isLoggedIn) {
    return <Login />
  }

  // Render correct page view inside AppShell layout
  switch (currentPage) {
    case 'home':
      return (
        <AppShell>
          <HomePage />
        </AppShell>
      )
    case 'clients':
      return (
        <AppShell>
          <ClientsPage />
        </AppShell>
      )
    case 'deck-builder':
      return (
        <AppShell>
          <DeckBuilder />
        </AppShell>
      )
    case 'analytics':
      return (
        <AppShell>
          <Dashboard />
        </AppShell>
      )
    case 'templates':
      return (
        <AppShell>
          <div style={{ padding: 24, background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Template Library</h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              Explore and apply pre-configured presentation templates for retirement, education, and growth portfolios.
            </p>
          </div>
        </AppShell>
      )
    case 'activity':
      return (
        <AppShell>
          <ActivityPage />
        </AppShell>
      )
    default:
      return (
        <AppShell>
          <HomePage />
        </AppShell>
      )
  }
}

export default App
