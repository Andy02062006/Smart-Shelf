import { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import BatchDetails from './pages/BatchDetails'
import Analytics from './pages/Analytics'
import Insights from './pages/Insights'
import Login from './pages/Login'

const SidebarItem = ({ to, label, icon, active }) => (
  <Link to={to} style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    borderRadius: '16px',
    textDecoration: 'none',
    color: active ? '#fff' : 'rgba(255, 255, 255, 0.5)',
    backgroundColor: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
    border: active ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
    fontWeight: active ? '700' : '500',
    fontSize: '14px',
    marginBottom: '8px',
    transition: 'all 0.3s ease',
    boxShadow: active ? '0 0 20px -5px rgba(99, 102, 241, 0.4)' : 'none'
  }}>
    <div style={{ width: '20px', height: '20px', filter: active ? 'drop-shadow(0 0 5px #6366f1)' : 'none' }}>{icon}</div>
    {label}
  </Link>
)

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn)
  }, [isLoggedIn])

  const handleLogout = () => {
    setIsLoggedIn(false)
    navigate('/login')
  }

  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) return <Navigate to="/login" />
    return children
  }

  // Icons for Sidebar
  const ChartIcon = <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>
  const StatsIcon = <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  const InsightIcon = <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isLoggedIn && location.pathname !== '/login' && (
        <aside style={{
          width: '260px',
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '40px 20px',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          left: 0,
          zIndex: 50
        }}>
          {/* Logo Section */}
          <div style={{ padding: '0 20px 48px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '40px', height: '40px', 
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
              borderRadius: '12px', 
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' 
            }}></div>
            <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SmartShelf OS</h1>
          </div>

          <nav style={{ flex: 1 }}>
            <SidebarItem to="/dashboard" label="Console" icon={ChartIcon} active={location.pathname === '/dashboard' || location.pathname.startsWith('/batch/')} />
            <SidebarItem to="/analytics" label="Telemetry" icon={StatsIcon} active={location.pathname === '/analytics'} />
            <SidebarItem to="/insights" label="Intelligence" icon={InsightIcon} active={location.pathname === '/insights'} />
          </nav>

          <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
            <button 
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px',
                borderRadius: '16px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                color: '#ef4444',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 20px -5px rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              De-authenticate
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        marginLeft: (isLoggedIn && location.pathname !== '/login') ? '260px' : 0,
        minHeight: '100vh',
        position: 'relative'
      }}>
        {/* Dynamic Page Header */}
        {isLoggedIn && location.pathname !== '/login' && (
          <header style={{
            height: '72px',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 48px',
            position: 'sticky',
            top: 0,
            zIndex: 40
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {location.pathname === '/dashboard' ? 'Neural Monitoring Console' : 
               location.pathname === '/analytics' ? 'Historical Telemetry' : 
               location.pathname === '/insights' ? 'Strategic Intelligence' : 
               location.pathname.startsWith('/batch/') ? 'Node Telemetry Stream' : ''}
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>Operator Admin</div>
                <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: '900', textTransform: 'uppercase' }}>Network Firewall: Active</div>
              </div>
              <div style={{ 
                width: '42px', height: '42px', 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '50%', 
                border: '2px solid rgba(99, 102, 241, 0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div>
              </div>
            </div>
          </header>
        )}

        <div style={{ padding: (isLoggedIn && location.pathname !== '/login') ? '48px' : 0 }}>
          <Routes>
            <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/batch/:id" element={<ProtectedRoute><BatchDetails /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
