import './App.scss'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

function App() {
  const { user } = useAuth()

  if (!user) {
    return <Login />
  }

  return <Dashboard />
}

export default App
