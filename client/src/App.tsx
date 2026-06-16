import { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import Dashboard from './pages/Dashboard'
import DeckBuilder from './pages/DeckBuilder'
import Login, { GoogleAuthPopup } from './pages/Login'

// Core Application Entry View Routing
function App() {
  const currentView = useAppStore(state => state.currentView)
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

  // Serve mock Google login popup stand-alone route
  if (window.location.pathname === '/mock-google-login') {
    return <GoogleAuthPopup />
  }

  // Force login screen if not authenticated
  if (!isLoggedIn) {
    return <Login />
  }

  return currentView === 'dashboard' ? <Dashboard /> : <DeckBuilder />
}

export default App
