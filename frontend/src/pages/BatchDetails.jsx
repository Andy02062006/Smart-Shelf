import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

const riskStyle = (risk) => {
  if (risk === 'Green') return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', emoji: '🟢' }
  if (risk === 'Yellow') return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', emoji: '🟡' }
  return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', emoji: '🔴' }
}

export default function BatchDetails() {
  const { id } = useParams()
  const [batch, setBatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`http://127.0.0.1:8001/api/batches/${id}`)
      .then(res => res.json())
      .then(data => {
        setBatch(data)
        setError(null)
      })
      .catch(() => setError('Batch signature could not be verified or was not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Syncing node data...</div>
  
  if (error) return (
    <div className="glass-card animate-in" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', textAlign: 'center', borderRadius: '24px' }}>
      <p style={{ color: '#ef4444', marginBottom: '24px', fontSize: '18px', fontWeight: '800' }}>{error}</p>
      <Link to="/" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '700' }}>← RETURN TO CONSOLE</Link>
    </div>
  )

  const s = riskStyle(batch?.risk_level || 'Green')
  const shelfLifeHours = batch?.remaining_shelf_life || 0
  const shelfLifeDays = (shelfLifeHours / 24).toFixed(1)

  return (
    <div className="animate-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className={`glass-card ${batch?.risk_level === 'Red' ? 'critical-pulse' : ''}`} style={{ 
          padding: '64px', borderRadius: '40px', border: `1px solid ${s.border}`,
          boxShadow: '0 40px 100px -30px rgba(0,0,0,0.7)'
      }}>
        {/* TOP LEVEL INSIGHT CARD - HIGH DOMINANCE UPGRADE */}
        <div style={{ 
            marginBottom: '60px', padding: '56px', backgroundColor: 'rgba(0,0,0,0.35)', 
            borderRadius: '40px', border: `1px solid ${s.border}`,
            borderLeft: `16px solid ${s.color}`,
            boxShadow: `0 30px 80px -20px rgba(0,0,0,0.6)`,
            position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-10px', right: '30px', fontSize: '110px', opacity: 0.05 }}>{s.emoji}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h4 style={{ fontSize: '12px', color: s.color, textTransform: 'uppercase', marginBottom: 0, letterSpacing: '0.3em', fontWeight: '900' }}>
                 /// OPERATIONAL INTELLIGENCE DIRECTIVE
              </h4>
              <span style={{ fontSize: '40px' }}>{batch?.risk_level === 'Red' ? '⚠️' : '💡'}</span>
          </div>
          <div style={{ color: '#fff', lineHeight: '1.8' }}>
            {batch?.insight ? batch.insight.split('\n\n').map((section, idx) => {
                if (section.includes('*')) {
                    const lines = section.split('\n');
                    const title = lines[0];
                    const items = lines.slice(1).map(l => l.replace('* ', ''));
                    return (
                        <div key={idx} style={{ marginTop: '32px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '18px', letterSpacing: '0.05em' }}>{title}</div>
                            <ul style={{ margin: 0, paddingLeft: '32px', listStyleType: 'disc', fontSize: '18px', color: '#94a3b8' }}>
                                {items.map((item, i) => <li key={i} style={{ marginBottom: '12px' }}>{item}</li>)}
                            </ul>
                        </div>
                    );
                }
                return <div key={idx} style={{ fontSize: '32px', fontWeight: '900', marginBottom: '20px', color: '#fff', letterSpacing: '-1px', lineHeight: '1.4' }}>{section}</div>;
            }) : 'Synchronizing telemetry packets...'}
          </div>
        </div>

        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' }}>
            <div>
                <h2 style={{ fontSize: '48px', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-1.5px' }}>Node {batch?.batch_id || 'N/A'}</h2>
                <div style={{ display: 'flex', gap: '20px', color: '#64748b', fontSize: '16px', fontWeight: '600', marginTop: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📍 {batch?.location || 'Unknown'}</span>
                    <span style={{ opacity: 0.2 }}>|</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📦 {batch?.storage_type || 'Standard'}</span>
                </div>
            </div>
            <div style={{ 
                padding: '14px 28px', backgroundColor: s.bg, color: s.color, 
                fontWeight: '900', borderRadius: '18px', fontSize: '12px', border: `1px solid ${s.border}`, 
                textTransform: 'uppercase', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: s.color }}></div>
                {batch?.risk_level || 'Pending'} {s.emoji}
            </div>
        </div>

        {/* DATA GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px', marginBottom: '60px' }}>
          <div className="glass-card" style={{ padding: '32px', borderRadius: '28px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900', marginBottom: '16px', letterSpacing: '0.15em' }}>Node Telemetry: Mean Temp</div>
            <div style={{ fontSize: '48px', fontWeight: '900', color: '#fff', fontFamily: 'Outfit', lineHeight: 1 }}>{batch?.avg_temperature || 0}<span style={{ fontSize: '20px', color: '#475569', marginLeft: '4px' }}>°C</span></div>
          </div>
          <div className="glass-card" style={{ padding: '32px', borderRadius: '28px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '900', marginBottom: '16px', letterSpacing: '0.15em' }}>Projected Resilience</div>
            <div style={{ fontSize: '48px', fontWeight: '900', color: '#6366f1', fontFamily: 'Outfit', lineHeight: 1 }}>
                <strong>{shelfLifeHours}</strong><span style={{ fontSize: '20px', color: '#475569', marginLeft: '4px' }}>h</span>
                <span style={{ fontSize: '16px', color: '#64748b', marginLeft: '16px', fontWeight: '800' }}>(<strong>{shelfLifeDays}</strong>D)</span>
            </div>
          </div>
        </div>

        {/* MODAL ACTION FOOTER */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '60px', textAlign: 'center' }}>
            <div style={{ marginBottom: '48px' }}>
                <h4 style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.2em', fontWeight: '900' }}>Recommended Directive</h4>
                <p style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>{batch?.recommendation || 'Persistent Monitoring'}</p>
            </div>
            <Link to="/" style={{ 
                display: 'inline-block', padding: '18px 48px', backgroundColor: 'rgba(99, 102, 241, 0.1)',
                textDecoration: 'none', color: '#6366f1', fontWeight: '900', fontSize: '14px', 
                letterSpacing: '0.25em', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.2)',
                boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.3)'
            }}
            onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
                e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                e.target.style.transform = 'translateY(0)';
            }}
            >
                ← RETURN TO COMMAND CENTER
            </Link>
        </div>
      </div>
    </div>
  )
}
