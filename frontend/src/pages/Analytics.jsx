import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function Analytics() {
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
      .catch(() => setError('Failed to synchronize hub metrics.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Aggregating Hub Metrics...</div>
  
  if (error) return (
    <div className="glass-card animate-in" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', textAlign: 'center', borderRadius: '24px' }}>
      <p style={{ color: '#ef4444', marginBottom: '24px', fontSize: '18px', fontWeight: '800' }}>{error}</p>
      <Link to="/" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '700' }}>← RETURN TO CONSOLE</Link>
    </div>
  )

  const totalBatches = batches.length
  const greenCount = batches.filter(b => b?.risk_level === 'Green').length
  const yellowCount = batches.filter(b => b?.risk_level === 'Yellow').length
  const redCount = batches.filter(b => b?.risk_level === 'Red').length
  
  const avgShelfLife = totalBatches > 0 
    ? (batches.reduce((sum, b) => sum + (b?.remaining_shelf_life || 0), 0) / totalBatches).toFixed(2)
    : 0

  const chartData = {
    labels: ['SAFE', 'MONITOR', 'CRITICAL'],
    datasets: [
      {
        label: 'Nodes',
        data: [greenCount, yellowCount, redCount],
        backgroundColor: [
          'rgba(16, 185, 129, 0.4)',
          'rgba(245, 158, 11, 0.4)',
          'rgba(239, 68, 68, 0.4)'
        ],
        borderColor: [
          '#10b981',
          '#f59e0b',
          '#ef4444'
        ],
        borderWidth: 2,
        borderRadius: 12,
      }
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        backgroundColor: '#1e293b', 
        padding: 12, 
        cornerRadius: 12, 
        titleFont: { size: 14, family: 'Outfit' }, 
        bodyFont: { size: 13, family: 'Inter' } 
      }
    },
    scales: {
      y: { 
          beginAtZero: true, 
          grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
          ticks: { stepSize: 1, color: '#94a3b8', font: { size: 11 } } 
      },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11, weight: '700' } } }
    }
  }

  return (
    <div className="animate-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '48px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>Global Network Intelligence</h2>
        <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: '500' }}>Aggregated telemetry and health distribution across all active monitoring nodes.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        {[
          { label: 'Network Capacity', value: totalBatches, sub: 'Active Nodes', color: '#fff' },
          { label: 'Mean Longevity', value: `${avgShelfLife}h`, sub: 'Projected Avg', color: '#6366f1' },
          { label: 'Critical Risk', value: redCount, sub: 'Immediate Action', color: '#ef4444' },
          { label: 'System Uptime', value: '99.9%', sub: 'Operational', color: '#10b981' }
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '24px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.15em' }}>{stat.label}</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: stat.color, fontFamily: 'Outfit', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '8px', fontWeight: '700' }}>{stat.sub}</div>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', background: `${stat.color}08`, borderRadius: '50%' }}></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', marginBottom: '48px' }}>
        <div className="glass-card" style={{ padding: '40px', borderRadius: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Health Infrastructure Distribution</h3>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase' }}>Telemetry: Real-Time</div>
            </div>
            <div style={{ height: '360px' }}>
                <Bar data={chartData} options={chartOptions} />
            </div>
        </div>

        <div className="glass-card" style={{ padding: '40px', borderRadius: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '24px' }}>Regional Node Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                    { loc: 'Cold Storage Unit A', status: 'Optimal', val: '2.4°C' },
                    { loc: 'Transport Truck 2', status: 'Critical', val: '8.1°C' },
                    { loc: 'Processing Unit B', status: 'Optimal', val: '3.0°C' },
                    { loc: 'Cold Storage Unit C', status: 'Warning', val: '5.5°C' }
                ].map((item, i) => (
                    <div key={i} style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{item.loc}</div>
                            <div style={{ fontSize: '11px', color: item.status === 'Critical' ? '#ef4444' : (item.status === 'Warning' ? '#f59e0b' : '#10b981'), fontWeight: '900', textTransform: 'uppercase', marginTop: '2px' }}>{item.status}</div>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>{item.val}</div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/" style={{ 
            display: 'inline-block', padding: '12px 32px', backgroundColor: 'rgba(99, 102, 241, 0.1)',
            color: '#6366f1', fontWeight: '900', textDecoration: 'none', fontSize: '13px', 
            letterSpacing: '0.1em', borderRadius: '14px', border: '1px solid rgba(99, 102, 241, 0.1)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)'}
        >
            ← BACK TO COMMAND CENTER
        </Link>
      </div>
    </div>
  )
}
