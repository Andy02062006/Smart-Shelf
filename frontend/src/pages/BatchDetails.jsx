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

  const s = riskStyle(batch.risk_level)

  return (
    <div className="animate-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className={`glass-card ${batch.risk_level === 'Red' ? 'critical-pulse' : ''}`} style={{ 
          padding: '60px', borderRadius: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
            <div>
                <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0, color: '#fff' }}>Node: {batch.batch_id}</h2>
                <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: '16px' }}>{batch.location} • {batch.storage_type}</p>
            </div>
            <div style={{ 
                padding: '10px 20px', backgroundColor: s.bg, color: s.color, 
                fontWeight: '800', borderRadius: '12px', fontSize: '12px', border: `1px solid ${s.border}`, textTransform: 'uppercase'
            }}>
                {s.emoji} {batch.risk_level}
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
          <div style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px', letterSpacing: '0.1em' }}>Mean Temperature</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff' }}>{batch.avg_temperature}°C</div>
          </div>
          <div style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px', letterSpacing: '0.1em' }}>Projected Lifespan</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff' }}>{batch.remaining_shelf_life}h</div>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.1em' }}>Operational Intelligence</h4>
          <p style={{ fontSize: '20px', fontWeight: '600', color: '#fff', lineHeight: '1.5' }}>{batch.recommendation}</p>
        </div>

        <div style={{ marginBottom: '48px', padding: '32px', backgroundColor: s.bg, borderRadius: '24px', borderLeft: `6px solid ${s.color}` }}>
          <h4 style={{ fontSize: '10px', color: s.color, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em', fontWeight: '900' }}>Deep Analysis Insight</h4>
          <p style={{ fontSize: '16px', color: '#cbd5e1', margin: 0, fontStyle: 'italic', lineHeight: '1.6' }}>"{batch.insight}"</p>
        </div>

        <Link to="/" style={{ 
            display: 'block', textAlign: 'center', textDecoration: 'none', 
            color: '#6366f1', fontWeight: '800', fontSize: '14px', letterSpacing: '0.1em'
        }}>← DISMISS AND RETURN</Link>
      </div>
    </div>
  )
}
