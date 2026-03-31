import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

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
      grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
      ticks: { color: '#94a3b8', font: { size: 11 } } 
    },
    x: { 
      grid: { display: false }, 
      ticks: { color: '#94a3b8', font: { size: 11 } } 
    }
  }
}

const riskStyle = (risk) => {
  if (risk === 'Green') return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.15)', emoji: 'Safe' }
  if (risk === 'Yellow') return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', emoji: 'Warning' }
  return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', emoji: 'Critical' }
}

const BASE_SHELF_LIFE = 120; // Matches utils.py

export default function Dashboard() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBatchId, setSelectedBatchId] = useState(null)
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [simTemp, setSimTemp] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBatches = (isInitial = false) => {
      if (isInitial) setLoading(true)
      fetch('http://127.0.0.1:8001/api/batches')
        .then(res => res.json())
        .then(data => {
          setBatches(data)
          setSelectedBatchId(prev => (prev === null && data.length > 0 ? data[0].batch_id : prev))
          setError(null)
        })
        .catch(() => setError('Failed to connect to monitoring node.'))
        .finally(() => { if (isInitial) setLoading(false) })
    }
    fetchBatches(true)
    const id = setInterval(() => fetchBatches(false), 5000)
    return () => clearInterval(id)
  }, [])

  // Simulate temperature increase and recalculate logic (matching backend)
  const simulatedBatches = batches.map(b => {
    if (simTemp === 0) return b;
    const newTemps = b.temperature_readings.map(t => parseFloat((t + simTemp).toFixed(2)));
    const reduction = newTemps.reduce((sum, t) => sum + (t > 4 ? (t - 4) * 2 : 0), 0);
    const remaining = Math.max(BASE_SHELF_LIFE - reduction, 0);
    const percentage = (remaining / BASE_SHELF_LIFE) * 100;
    
    let risk = "Red";
    let recommendation = "Discard";
    let insight = "High spoilage risk due to simulated temperature exposure";
    if (percentage > 70) {
      risk = "Green";
      recommendation = "Safe";
      insight = "Storage conditions remain optimal under simulation";
    } else if (percentage > 40) {
      risk = "Yellow";
      recommendation = "Use Soon";
      insight = "Heightened temperature risk detected by simulation";
    }

    return {
      ...b,
      temperature_readings: newTemps,
      avg_temperature: parseFloat((newTemps.reduce((a, b) => a + b) / newTemps.length).toFixed(2)),
      remaining_shelf_life: parseFloat(remaining.toFixed(2)),
      percentage: parseFloat(percentage.toFixed(2)),
      risk_level: risk,
      recommendation,
      insight
    };
  });

  const filteredBatches = simulatedBatches.filter(b => {
    const matchesFilter = filter === 'All' || b.risk_level === filter;
    const matchesSearch = b.batch_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const selectedBatch = simulatedBatches.find(b => b.batch_id === selectedBatchId)

  const chartData = selectedBatch ? {
    labels: selectedBatch.temperature_readings.map((_, i) => `T${i + 1}`),
    datasets: [
      {
        label: 'Temp',
        data: selectedBatch.temperature_readings,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        borderWidth: 4,
        pointRadius: 4,
        pointBackgroundColor: '#6366f1',
        fill: true,
      }
    ],
  } : null

  const summaryCards = [
    { 
      label: 'Connected Nodes', 
      value: simulatedBatches.length, 
      icon: '🌐',
      gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(129, 140, 248, 0.05) 100%)',
      accent: '#6366f1'
    },
    { 
      label: 'Optimal Health', 
      value: simulatedBatches.filter(b => b.risk_level === 'Green').length, 
      icon: '🛡️',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
      accent: '#10b981'
    },
    { 
      label: 'Anomalies Detected', 
      value: simulatedBatches.filter(b => b.risk_level !== 'Green').length, 
      icon: '⚠️',
      gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
      accent: '#ef4444'
    }
  ]

  return (
    <div className="animate-in">
      {loading && <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Syncing with Shelf Node...</div>}
      
      {!loading && !error && (
        <>
          {/* Enhanced Summary Cards with Micro-interactions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
            {summaryCards.map((card, idx) => (
              <div 
                key={idx} 
                className="glass-card" 
                style={{ 
                    padding: '32px', 
                    borderRadius: '24px', 
                    background: card.gradient,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.borderColor = card.accent + '33';
                    e.currentTarget.style.boxShadow = `0 12px 48px -12px ${card.accent}44`;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.37)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{card.icon}</span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{card.label}</span>
                </div>
                <div style={{ fontSize: '52px', fontWeight: '900', color: card.accent, fontFamily: 'Outfit', lineHeight: 1 }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', marginBottom: '40px' }}>
             {selectedBatch && (
                <div className={`glass-card ${selectedBatch.risk_level === 'Red' ? 'critical-pulse' : ''}`} style={{ padding: '40px', borderRadius: '32px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', flexShrink: 0 }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>{selectedBatch.batch_id} Details</h3>
                            <p style={{ margin: '4px 0', color: '#94a3b8', fontSize: '14px' }}>{selectedBatch.location} • {selectedBatch.storage_type}</p>
                        </div>
                        <div style={{ 
                            padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800',
                            backgroundColor: riskStyle(selectedBatch.risk_level).bg, color: riskStyle(selectedBatch.risk_level).color,
                            border: `1px solid ${riskStyle(selectedBatch.risk_level).border}`, textTransform: 'uppercase'
                        }}>{riskStyle(selectedBatch.risk_level).emoji}</div>
                    </div>
                    <div style={{ flexGrow: 1, minHeight: '300px' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>
             )}

             <div className="glass-card" style={{ borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px -20px rgba(0,0,0,0.5)' }}>
                <div style={{ 
                    padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', 
                    display: 'flex', flexDirection: 'column', gap: '16px',
                    backgroundColor: 'rgba(255,255,255,0.01)'
                }}>
                    {/* Simulation Console */}
                    <div style={{ marginBottom: '8px', padding: '16px', backgroundColor: 'rgba(99,102,241,0.05)', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Simulation Console</span>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: '#6366f1' }}>+{simTemp}°C</span>
                        </div>
                        <input 
                            type="range" min="0" max="10" step="0.5"
                            value={simTemp}
                            onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer', accentColor: '#6366f1' }}
                        />
                        <div style={{ textAlign: 'center', fontSize: '10px', color: '#64748b', marginTop: '8px', fontWeight: '600' }}>
                            Simulated Temperature Increase
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.15em' }}>SYSTEM FEED</span>
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ 
                                backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', 
                                color: '#cbd5e1', padding: '6px 14px', borderRadius: '10px', fontSize: '11px', 
                                fontWeight: '700', cursor: 'pointer', outline: 'none'
                            }}
                        >
                            <option value="All">All Nodes</option>
                            <option value="Green">Safe State</option>
                            <option value="Yellow">Monitor State</option>
                            <option value="Red">Critical State</option>
                        </select>
                    </div>
                    <input 
                        type="text"
                        placeholder="Search Batch ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            padding: '12px 18px',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none'
                        }}
                    />
                </div>
                
                <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
                    {filteredBatches.length === 0 ? (
                        <div style={{ padding: '60px 40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                             No monitoring nodes matched your query.
                        </div>
                    ) : ( 
                        filteredBatches.map((b, idx) => (
                            <div 
                                key={b.batch_id} 
                                onMouseEnter={() => setSelectedBatchId(b.batch_id)}
                                onClick={() => navigate(`/batch/${b.batch_id}`)}
                                style={{ 
                                    padding: '24px 28px', 
                                    borderBottom: '1px solid rgba(255,255,255,0.03)', 
                                    cursor: 'pointer',
                                    backgroundColor: selectedBatchId === b.batch_id ? 'rgba(99, 102, 241, 0.1)' : (idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'),
                                    transition: 'all 0.2s ease', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: '900', color: selectedBatchId === b.batch_id ? '#fff' : 'inherit' }}>{b.batch_id}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{b.location}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '17px', fontWeight: '900', color: riskStyle(b.risk_level).color }}>{b.avg_temperature}°C</div>
                                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>LIFE: {b.remaining_shelf_life}H</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
             </div>
          </div>
        </>
      )}
    </div>
  )
}
