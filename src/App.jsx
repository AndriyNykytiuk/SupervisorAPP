import { useState } from 'react'
import './App.scss'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

function App() {
  const [user, setUser] = useState(null)
  const [selectedBrigade, setSelectedBrigade] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
    // Default to user's own brigade
    if (userData.brigadeId) {
      setSelectedBrigade(userData.brigadeId)
    }
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Dashboard
      user={user}
      selectedBrigade={selectedBrigade}
      onBrigadeChange={setSelectedBrigade}
      onLogout={() => { setUser(null); setSelectedBrigade(null) }}
    />
  )
}

export default App
