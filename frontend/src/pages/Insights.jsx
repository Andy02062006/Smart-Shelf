import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Insights() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/batches')
      .then(res => res.json())
      .then(data => {
        setBatches(data)
        setError(null)
      })
      .catch(() => setError('Strategic network data could not be retrieved.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'rgba(255,255,255,0.4)', fontWeight: '800', textTransform: 'uppercase' }}>Synchronizing Intelligence Matrix...</div>
  
  const total = batches.length
  const safe = batches.filter(b => b.risk_level === 'Green').length
  const atRisk = batches.filter(b => b.risk_level !== 'Green').length
  const criticalBatches = batches.filter(b => b.risk_level === 'Red')

  const systemDirectives = [
    { title: "INVENTORY PRIORITIZATION", detail: "Automated routing indicates immediate processing for Red/Yellow nodes to neutralize waste probability.", color: "#6366f1" },
    { title: "INFRASTRUCTURE AUDIT", detail: "Malfunctioning Freezer 4 showing recurrent thermal spikes. Recommend immediate hardware diagnostics.", color: "#f59e0b" },
    { title: "LOGISTICS RE-ROUTING", detail: "Mobile transport units B-7 and B-9 exhibit cooling degradation. Redirecting to nearest distribution hub.", color: "#6366f1" },
    { title: "SAFETY PROTOCOL ALPHA", detail: "All critical deviations require secondary manual inspection before downstream asset integration.", color: "#8b5cf6" }
  ]

  return (
    <div className="animate-in">
      {/* High-Impact Insight Header */}
      <div className="glass-card" style={{ 
        padding: '64px', marginBottom: '48px', 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '900', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '24px' }}>Strategic Intelligence Matrix</div>
        <h2 style={{ fontSize: '48px', fontWeight: '900', color: '#fff', marginBottom: '32px' }}>Operational Resilience: <span style={{ color: '#10b981' }}>{((safe/total)*100).toFixed(1)}%</span></h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>MAPPED ASSETS</div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff' }}>{total}</div>
            </div>
            <div style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(16, 185, 129, 0.6)' }}>SAFE</div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#10b981' }}>{safe}</div>
            </div>
            <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%', boxShadow: '0 0 8px #ef4444' }}></div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(239, 68, 68, 0.6)' }}>CRITICAL</div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#ef4444' }}>{atRisk}</div>
            </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
        {/* Tactical Anomalies */}
        <div className="glass-card" style={{ padding: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="critical-pulse" style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#fff', textTransform: 'uppercase' }}>Tactical Anomalies</h3>
            </div>
            <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Immediate Action</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {criticalBatches.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                  <div style={{ color: '#10b981', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase' }}>Zero Node Failures Detected</div>
              </div>
            ) : (
              criticalBatches.map(b => (
                <Link to={`/batch/${b.batch_id}`} key={b.batch_id} style={{ textDecoration: 'none' }}>
                  <div className="glass-card" style={{ 
                    padding: '24px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
                            <div style={{ fontWeight: '900', color: '#ef4444', fontSize: '14px' }}>NODE_{b.batch_id}</div>
                        </div>
                        <div style={{ fontSize: '14px', color: '#fff', fontWeight: '800' }}>{b.avg_temperature}°C</div>
                    </div>
                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', fontStyle: 'italic' }}>
                        "{b.insight.split(/\. (?=[A-Z])/)[0]}..."
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Strategic Directives */}
        <div className="glass-card" style={{ padding: '48px' }}>
          <h3 style={{ margin: "0 0 40px 0", fontSize: '20px', fontWeight: '800', color: '#fff', textTransform: 'uppercase' }}>Strategic Directives</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {systemDirectives.map((rec, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '4px', height: 'auto', backgroundColor: rec.color, borderRadius: '2px' }}></div>
                <div>
                    <div style={{ color: '#fff', fontWeight: '900', fontSize: '15px', marginBottom: '6px', textTransform: 'uppercase' }}>{rec.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: '1.6' }}>{rec.detail}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-futuristic" style={{ width: '100%', marginTop: '48px', height: '56px' }}>DEPLOY NETWORK UPDATE</button>
        </div>
      </div>
    </div>
  )
}
