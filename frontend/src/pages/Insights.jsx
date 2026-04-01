import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const riskStyle = (risk) => {
  if (risk === 'Green') return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)' }
  if (risk === 'Yellow') return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' }
  return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)' }
}

export default function Insights() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://127.0.0.1:8001/api/batches')
      .then(res => res.json())
      .then(data => {
        setBatches(data)
        setError(null)
      })
      .catch(() => setError('Failed to connect to Monitoring Hub.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Aggregating system insights...</div>
  
  const total = batches.length
  const safe = batches.filter(b => b.risk_level === 'Green').length
  const atRisk = batches.filter(b => b.risk_level !== 'Green').length
  const criticalBatches = batches.filter(b => b.risk_level === 'Red')

  const systemRecommendations = [
    { title: "Inventory Prioritization", detail: "Prioritize processing of all batches currently in 'Red' or 'Yellow' state to minimize spoilage loss." },
    { title: "Transport Optimization", detail: "Investigate cooling consistency in 'Transport' storage types; multiple anomalies detected in mobile units." },
    { title: "Infrastructure Audit", detail: "Perform maintenance on 'Cold Storage' units showing periodic temperature spikes (specifically Malfunctioning Freezer 4)." },
    { title: "Safety Protocol", detail: "Ensure 'Red' batches are diverted to low-risk processing only after secondary manual inspection." }
  ]

  return (
    <div className="animate-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '48px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>Operational Intelligence Hub</h2>
        <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: '500' }}>System-wide predictive analysis and automated strategic guidance.</p>
      </div>

      {/* Summary Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
        {[
          { label: 'Network Nodes', value: total, color: '#fff', icon: '🌐' },
          { label: 'Safe Operations', value: safe, color: '#10b981', icon: '🛡️' },
          { label: 'At-Risk Units', value: atRisk, color: '#f59e0b', icon: '⚠️' }
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '32px', borderRadius: '28px', borderLeft: `6px solid ${stat.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{stat.label}</div>
                <div style={{ fontSize: '20px' }}>{stat.icon}</div>
            </div>
            <div style={{ fontSize: '48px', fontWeight: '900', color: stat.color, fontFamily: 'Outfit', lineHeight: 1 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Critical Alerts Component */}
        <div className="glass-card" style={{ padding: '40px', borderRadius: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>🚨</span>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Live Anomalies</h3>
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase' }}>Priority: High</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {criticalBatches.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
                  <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>No critical node failures detected.</div>
              </div>
            ) : (
              criticalBatches.map(b => (
                <Link to={`/batch/${b.batch_id}`} key={b.batch_id} style={{ textDecoration: 'none' }}>
                  <div className="glass-card" style={{ 
                    padding: '20px', backgroundColor: 'rgba(239, 68, 68, 0.03)', 
                    border: '1px solid rgba(239, 68, 68, 0.08)', borderRadius: '18px',
                    borderLeft: '4px solid #ef4444'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.03)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ fontWeight: '900', color: '#ef4444', fontSize: '15px' }}>{b.batch_id}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{b.avg_temperature}°C</div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', fontWeight: '500' }}>{b.insight.split('.')[0]}.</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Strategic Recommendations Component */}
        <div className="glass-card" style={{ padding: '40px', borderRadius: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>💡</span>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>System Directives</h3>
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase' }}>Source: AI Analysis</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {systemRecommendations.map((rec, i) => (
              <div key={i} style={{ paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: '#fff', fontWeight: '700', fontSize: '15px', marginBottom: '6px' }}>{rec.title}</div>
                <div style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', fontWeight: '500' }}>{rec.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
