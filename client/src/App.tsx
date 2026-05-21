import { useAppStore } from './store/useAppStore'
import Dashboard from './pages/Dashboard'
import DeckBuilder from './pages/DeckBuilder'
import Login, { GoogleAuthPopup } from './pages/Login'

// Core Application Entry View Routing
function App() {
  const currentView = useAppStore(state => state.currentView)
  const isLoggedIn = useAppStore(state => state.isLoggedIn)

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
