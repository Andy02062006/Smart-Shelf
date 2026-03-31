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
  const greenCount = batches.filter(b => b.risk_level === 'Green').length
  const yellowCount = batches.filter(b => b.risk_level === 'Yellow').length
  const redCount = batches.filter(b => b.risk_level === 'Red').length
  
  const avgShelfLife = totalBatches > 0 
    ? (batches.reduce((sum, b) => sum + b.remaining_shelf_life, 0) / totalBatches).toFixed(2)
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
    <div className="animate-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '40px', textAlign: 'center', color: '#fff' }}>System Intelligence</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', marginBottom: '48px' }}>
        <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em' }}>Network Capacity</div>
          <div style={{ fontSize: '48px', fontWeight: '900', color: '#fff', fontFamily: 'Outfit' }}>{totalBatches}</div>
        </div>
        <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em' }}>Mean Longevity</div>
          <div style={{ fontSize: '48px', fontWeight: '900', color: '#6366f1', fontFamily: 'Outfit' }}>{avgShelfLife}h</div>
        </div>
      </div>

      <div className="glass-card" style={{ 
          padding: '48px', borderRadius: '32px', marginBottom: '48px' 
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '32px', textAlign: 'center', color: '#fff' }}>Global Health Distribution</h3>
        <div style={{ height: '350px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/" style={{ color: '#6366f1', fontWeight: '800', textDecoration: 'none', fontSize: '14px', letterSpacing: '0.1em' }}>← BACK TO REAL-TIME FEED</Link>
      </div>
    </div>
  )
}
