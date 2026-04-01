import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import BatchDetails from './pages/BatchDetails'
import Analytics from './pages/Analytics'
import Insights from './pages/Insights'

const navLinkClass = "nav-link-modern";

export default function App() {
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* PREMIUM GLASS NAVIGATION HUB */}
      <header className="glass-card" style={{ 
        position: 'sticky', 
        top: '24px', 
        zIndex: 1000,
        maxWidth: '1200px', 
        margin: '0 auto 80px',
        padding: '16px 32px', 
        borderRadius: '28px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6)',
        transition: 'all 0.3s ease'
      }}>
        {/* Brand Architecture */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '48px', height: '48px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.4)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'rotate(10deg) scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'rotate(0) scale(1)'}
          >
            🥛
          </div>
          <div>
              <h1 style={{ 
                margin: 0, fontSize: '24px', fontWeight: '900', color: '#fff', 
                letterSpacing: '-1px', lineHeight: 1
              }}>
                SmartShelf
              </h1>
              <div style={{ 
                fontSize: '11px', fontWeight: '700', color: '#6366f1', 
                textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' 
              }}>
                AI Shelf-Life Intelligence for Dairy
              </div>
          </div>
        </Link>

        {/* Tactical Navigation Links */}
        <nav style={{ display: 'flex', gap: '12px', padding: '6px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {[
            { name: 'Dashboard', path: '/' },
            { name: 'Analytics', path: '/analytics' },
            { name: 'Insights', path: '/insights' }
          ].map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              style={{
                textDecoration: 'none',
                color: location.pathname === link.path ? '#fff' : '#64748b',
                fontWeight: '800',
                fontSize: '13px',
                padding: '10px 20px',
                borderRadius: '14px',
                backgroundColor: location.pathname === link.path ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: location.pathname === link.path ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                letterSpacing: '0.02em'
              }}
              onMouseEnter={(e) => {
                  if (location.pathname !== link.path) {
                      e.target.style.color = '#fff';
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
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

        {/* User Profile / Status Mock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#10b981', textTransform: 'uppercase' }}>System Online</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Admin Node 01</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👤</div>
        </div>
      </header>

      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/batch/:id" element={<BatchDetails />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/insights" element={<Insights />} />
        </Routes>
      </main>
    </div>
  )
}
