import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@dairy.com')
  const [password, setPassword] = useState('1234')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    if (email === 'admin@dairy.com' && password === '1234') {
      onLogin()
      navigate('/dashboard')
    } else {
      setError('Neural signature verification failed.')
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background glow */}
      <div style={{ 
        position: 'absolute', width: '600px', height: '600px', 
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', 
        top: '-100px', right: '-100px', zIndex: 0 
      }}></div>

      <div className="glass-card animate-in" style={{ 
        width: '100%', 
        maxWidth: '460px', 
        padding: '64px 56px',
        position: 'relative',
        zIndex: 1,
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ 
              width: '64px', height: '64px', 
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
              borderRadius: '16px', 
              margin: '0 auto 24px',
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)' 
            }}></div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Secure Core</h1>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>SmartShelf OS v4.12.0</p>
        </div>

        {error && (
            <div className="critical-pulse" style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444', padding: '16px', borderRadius: '12px', fontSize: '13px', 
                fontWeight: '700', marginBottom: '32px', textAlign: 'center'
            }}>
                {error}
            </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Operator Identity</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator_772@smartshelf.os"
              required
              style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
            />
          </div>
          <div style={{ marginBottom: '40px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Encrypted Token</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
            />
          </div>
          <button type="submit" className="btn-futuristic" style={{ width: '100%', height: '52px', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Initialize Session
          </button>
        </form>

        <div style={{ marginTop: '48px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.3 }}>
                <div style={{ width: '6px', height: '6px', backgroundColor: '#fff', borderRadius: '50%' }}></div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Satellite Uplink Active</div>
            </div>
        </div>
      </div>
    </div>
  )
}
