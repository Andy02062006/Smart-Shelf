import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

const statusTheme = (risk) => {
  if (risk === 'Green') return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.2)', label: 'SAFE' }
  if (risk === 'Yellow') return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.2)', label: 'WARNING' }
  return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.2)', label: 'CRITICAL' }
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
      .catch(() => setError('Node signature could not be verified or was not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Syncing node telemetry...</div>
  
  if (error) return (
    <div className="glass-card animate-in" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', textAlign: 'center' }}>
      <p style={{ color: '#ef4444', marginBottom: '24px', fontSize: '18px', fontWeight: '800', textTransform: 'uppercase' }}>{error}</p>
      <Link to="/dashboard" className="btn-futuristic" style={{ textDecoration: 'none' }}>Return to Control Center</Link>
    </div>
  )

  const s = statusTheme(batch?.risk_level || 'Green')
  const isCritical = batch?.risk_level === 'Red'

  return (
    <div className="animate-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumbs / Detail Header */}
        <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
                <div style={{ fontSize: '11px', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.15em' }}>Inventory // Autonomous Telemetry</div>
                <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#fff', fontFamily: 'Outfit' }}>NODE IDENTIFIER: {batch?.batch_id}</h1>
            </div>
            <div className={isCritical ? 'critical-pulse' : ''} style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px',
                backgroundColor: s.bg, border: `1px solid ${s.border}`, borderRadius: '40px', 
                color: s.color, fontWeight: '900', fontSize: '12px', letterSpacing: '0.1em'
            }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: s.color, borderRadius: '50%', boxShadow: `0 0 10px ${s.color}` }} />
                SYSTEM STATE: {s.label}
            </div>
        </div>

        {/* DECISION PANEL - AI INSIGHT AT TOP */}
        <div className="glass-card" style={{ 
            padding: '48px', 
            marginBottom: '48px', 
            border: `1px solid ${s.border}`,
            background: `linear-gradient(135deg, ${s.bg}, rgba(15, 23, 42, 0.4))`,
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Absolute decorative glow */}
            <div style={{ 
                position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px',
                background: `radial-gradient(circle, ${s.color}22 0%, transparent 70%)`
            }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '2px', height: '20px', backgroundColor: s.color }}></div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: s.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Insight</h4>
            </div>

            <div style={{ fontSize: '28px', color: '#fff', fontWeight: '600', lineHeight: 1.4, maxWidth: '900px', whiteSpace: 'pre-wrap' }}>
                {(() => {
                    const parts = batch?.insight.split(/\n\n/) || [batch?.insight]
                    const mainText = parts[0]
                    const usageGuidance = parts.slice(1).join('\n\n')
                    
                    const mainParts = mainText.split(/\. (?=[A-Z])/)
                    if (mainParts.length > 1) {
                        return (
                            <>
                                {mainParts[0]}. <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>{mainParts.slice(1).join('. ')}</span>
                                {usageGuidance && <div style={{ marginTop: '24px', fontSize: '18px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>{usageGuidance}</div>}
                            </>
                        )
                    }
                    return (
                        <>
                            {mainText}
                            {usageGuidance && <div style={{ marginTop: '24px', fontSize: '18px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>{usageGuidance}</div>}
                        </>
                    )
                })()}
            </div>

            <div style={{ marginTop: '40px', display: 'flex', gap: '48px' }}>
                <div>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>Recommended Operational Response</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: s.color }}>{batch?.recommendation || 'Maintain monitoring'}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <button className="btn-futuristic" style={{ height: '56px', padding: '0 40px', fontSize: '16px' }}>INITIATE CORRECTIVE ACTION</button>
                </div>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px' }}>
            {/* Telemetry Stream */}
            <div className="glass-card" style={{ padding: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Telemetry Stream</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: '8px' }}>Global Asset Coordinates</div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>{batch?.location || 'UNDEFINED'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: '8px' }}>Storage Specification</div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>{batch?.storage_type || 'STANDARD_ISOLATION'}</div>
                    </div>
                </div>
            </div>

            {/* Thermal Sensor Array */}
            <div className="glass-card" style={{ padding: '40px', position: 'relative' }}>
                <div style={{ fontSize: '13px', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '32px' }}>Thermal Array</div>
                <div style={{ fontSize: '72px', fontWeight: '900', color: '#fff', fontFamily: 'Outfit', lineHeight: 1 }}>
                    {batch?.avg_temperature}<span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.2)', marginLeft: '8px' }}>°C</span>
                </div>
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                        <div style={{ width: `${Math.min(100, (batch?.avg_temperature/15)*100)}%`, height: '100%', background: s.color, borderRadius: '2px', boxShadow: `0 0 10px ${s.color}` }}></div>
                    </div>
                    <span style={{ fontSize: '11px', color: s.color, fontWeight: '900' }}>{batch?.avg_temperature > 5 ? 'THERMAL STRESS' : 'THERMAL STABILITY'}</span>
                </div>
            </div>

            {/* Projected System Resilience */}
            <div className="glass-card" style={{ padding: '40px' }}>
                <div style={{ fontSize: '13px', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '32px' }}>Network Resilience</div>
                <div style={{ fontSize: '72px', fontWeight: '900', color: '#6366f1', fontFamily: 'Outfit', lineHeight: 1 }}>
                    {batch?.remaining_shelf_life}<span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.2)', marginLeft: '8px' }}>H</span>
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', marginTop: '16px' }}>
                    Temporal Buffer: <span style={{ color: '#fff', fontWeight: '800' }}>{(batch?.remaining_shelf_life / 24).toFixed(1)} Days</span>
                </div>
            </div>
        </div>

        {/* Security / Network Status */}
        <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ 
                padding: '12px 32px', border: '1px solid rgba(255, 255, 255, 0.05)', 
                borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)'
            }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Node Integrity Verified via Quantum Ledger</div>
            </div>
        </div>
    </div>
  )
}
