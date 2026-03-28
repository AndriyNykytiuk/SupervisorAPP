import './App.scss'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

function App() {
  const { user } = useAuth()

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      {!user ? <Login /> : <Dashboard />}
    </>
  )
}

export default App
