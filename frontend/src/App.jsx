import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import BatchDetails from './pages/BatchDetails'
import Analytics from './pages/Analytics'

const navLinkClass = "nav-link-modern";

export default function App() {
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Premium Sticky Navigation Bar */}
      <header className="glass-card" style={{ 
        position: 'sticky', 
        top: '20px', 
        zIndex: 1000,
        maxWidth: '1200px', 
        margin: '0 auto 60px',
        padding: '16px 32px', 
        borderRadius: '20px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '36px', height: '36px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', 
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            📦
          </div>
          <h1 style={{ 
            margin: 0, fontSize: '20px', fontWeight: '900', color: '#fff', 
            letterSpacing: '-1px', display: 'flex', alignItems: 'center'
          }}>
            SmartShelf <span style={{ color: '#6366f1', fontWeight: '400', marginLeft: '4px' }}>OS</span>
          </h1>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', gap: '12px' }}>
          {[
            { name: 'Dashboard', path: '/' },
            { name: 'Analytics', path: '/analytics' }
          ].map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              style={{
                textDecoration: 'none',
                color: location.pathname === link.path ? '#fff' : '#94a3b8',
                fontWeight: '700',
                fontSize: '13px',
                padding: '10px 20px',
                borderRadius: '10px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: location.pathname === link.path ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                letterSpacing: '0.025em',
                border: location.pathname === link.path ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== link.path) {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== link.path) {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </header>

      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/batch/:id" element={<BatchDetails />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  )
}
