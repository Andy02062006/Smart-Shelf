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
    let usage = "\n\nBased on its storage condition, the best use is:\n* Immediate processing if safe\n* Divert to low-risk products\n* Otherwise discard to avoid safety risks";
    
    if (percentage > 70) {
      risk = "Green";
      recommendation = "Safe";
      usage = "\n\nBased on its storage condition, the best use is:\n* Regular production use\n* Standard packaging and distribution";
    } else if (percentage > 40) {
      risk = "Yellow";
      recommendation = "Use Soon";
      usage = "\n\nBased on its storage condition, the best use is:\n* Prioritize for immediate processing\n* Use for short shelf-life products (e.g., curd, paneer)";
    }

    const hours = parseFloat(remaining.toFixed(2));
    const days = parseFloat((hours / 24).toFixed(2));
    const explanation = `According to the stored temperature conditions, the milk is likely to last for ${hours} hours (~${days} days).`;

    return {
      ...b,
      temperature_readings: newTemps,
      avg_temperature: parseFloat((newTemps.reduce((a, b) => a + b) / newTemps.length).toFixed(2)),
      remaining_shelf_life: hours,
      percentage: parseFloat(percentage.toFixed(2)),
      risk_level: risk,
      recommendation,
      insight: explanation + usage
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
      icon: '📡',
      gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
      accent: '#6366f1'
    },
    { 
      label: 'Optimal Health', 
      value: simulatedBatches.filter(b => b.risk_level === 'Green').length, 
      icon: '💎',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)',
      accent: '#10b981'
    },
    { 
      label: 'System Anomalies', 
      value: simulatedBatches.filter(b => b.risk_level !== 'Green').length, 
      icon: '🔥',
      gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%)',
      accent: '#ef4444'
    }
  ]

  return (
    <div className="animate-in">
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px' }}>
            <div className="critical-pulse" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#6366f1' }}></div>
            <div style={{ color: '#64748b', fontWeight: '700', letterSpacing: '0.1em', fontSize: '12px', textTransform: 'uppercase' }}>Synchronizing Node Network...</div>
        </div>
      )}
      
      {!loading && !error && (
        <>
          {/* Executive Summary Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
            {summaryCards.map((card, idx) => (
              <div 
                key={idx} 
                className="glass-card" 
                style={{ 
                    padding: '24px 32px', 
                    borderRadius: '24px', 
                    background: card.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{card.label}</div>
                    <div style={{ fontSize: '40px', fontWeight: '900', color: card.accent, fontFamily: 'Outfit', lineHeight: 1 }}>{card.value}</div>
                </div>
                <div style={{ fontSize: '32px', opacity: 0.8 }}>{card.icon}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', marginBottom: '40px' }}>
             {/* Primary Node Telemetry */}
             {selectedBatch && (
                <div className={`glass-card ${selectedBatch.risk_level === 'Red' ? 'critical-pulse' : ''}`} style={{ padding: '40px', borderRadius: '32px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', flexShrink: 0 }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#fff' }}>Node {selectedBatch.batch_id || 'Telemetry'}</h3>
                            <div style={{ margin: '6px 0', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                                <span style={{ color: '#94a3b8' }}>📍 {selectedBatch.location || 'Unknown'}</span> 
                                <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
                                <span>📦 {selectedBatch.storage_type || 'Standard'}</span>
                            </div>
                        </div>
                        <div style={{ 
                            padding: '10px 20px', borderRadius: '14px', fontSize: '11px', fontWeight: '900',
                            backgroundColor: riskStyle(selectedBatch.risk_level).bg, color: riskStyle(selectedBatch.risk_level).color,
                            border: `1px solid ${riskStyle(selectedBatch.risk_level).border}`, textTransform: 'uppercase', borderLeft: `4px solid ${riskStyle(selectedBatch.risk_level).color}`,
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                             <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: riskStyle(selectedBatch.risk_level).color }}></div>
                             {riskStyle(selectedBatch.risk_level).emoji}
                        </div>
                    </div>

                    <div style={{ flexGrow: 1, minHeight: '320px', marginBottom: '40px' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>

                    {/* Operational Intelligence Terminal - HIGH DOMINANCE UPGRADE */}
                    <div style={{ 
                        padding: '40px', 
                        backgroundColor: 'rgba(0,0,0,0.35)', 
                        borderRadius: '32px', 
                        border: `1px solid ${riskStyle(selectedBatch.risk_level).border}`,
                        borderLeft: `12px solid ${riskStyle(selectedBatch.risk_level).color}`,
                        marginTop: 'auto',
                        boxShadow: `0 15px 40px -15px ${riskStyle(selectedBatch.risk_level).color}44`
                    }}>
                        <div style={{ 
                            fontSize: '11px', 
                            fontWeight: '900', 
                            color: riskStyle(selectedBatch.risk_level).color, 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.2em',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ opacity: 0.5 }}>///</span> OPERATIONAL INTELLIGENCE
                            </div>
                            <span style={{ fontSize: '24px' }}>{selectedBatch.risk_level === 'Red' ? '⚠️' : '💡'}</span>
                        </div>
                        <div style={{ color: '#fff', lineHeight: '1.8' }}>
                            {selectedBatch.insight ? selectedBatch.insight.split('\n\n').map((section, idx) => {
                                if (section.includes('*')) {
                                    const lines = section.split('\n');
                                    const title = lines[0];
                                    const items = lines.slice(1).map(l => l.replace('* ', ''));
                                    return (
                                        <div key={idx} style={{ marginTop: '28px' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>{title}</div>
                                            <ul style={{ margin: 0, paddingLeft: '24px', listStyleType: 'disc', fontSize: '17px', color: '#94a3b8' }}>
                                                {items.map((item, i) => <li key={i} style={{ marginBottom: '12px' }}>{item}</li>)}
                                            </ul>
                                        </div>
                                    );
                                }
                                const highlightedText = section.replace(/(\d+\.?\d*\s*(hours|days))/gi, '<strong>$1</strong>');
                                return (
                                    <div 
                                        key={idx} 
                                        style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px', color: '#fff', letterSpacing: '-0.5px' }}
                                        dangerouslySetInnerHTML={{ __html: highlightedText }}
                                    />
                                );
                            }) : 'Awaiting telemetry...'}
                        </div>
                    </div>
                </div>
             )}

             {/* Sidebar Feed & Controls */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div className="glass-card" style={{ padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.2) 100%)' }}>
                    <div style={{ fontSize: '11px', color: '#6366f1', textTransform: 'uppercase', fontWeight: '900', marginBottom: '28px', letterSpacing: '0.25em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6366f1' }}></div>
                        SIMULATION ENGINE CORE
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>Simulate Temperature Increase</div>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Stress-test nodes in real-time</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', fontFamily: 'Outfit', lineHeight: 1 }}>+{simTemp.toFixed(1)}<span style={{ fontSize: '14px', color: '#64748b', marginLeft: '2px' }}>°C</span></div>
                            </div>
                        </div>
                        
                        <div style={{ position: 'relative', height: '32px', display: 'flex', alignItems: 'center' }}>
                            <input 
                                type="range" min="0" max="10" step="0.1" 
                                value={simTemp} 
                                onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                                style={{ 
                                    width: '100%', accentColor: '#6366f1', cursor: 'grab', 
                                    height: '8px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)',
                                    appearance: 'none', outline: 'none'
                                }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '10px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <span>Baseline (Storage)</span>
                        <span>Terminal Stress (Critical)</span>
                    </div>
                </div>

                <div className="glass-card" style={{ borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.1em' }}>LIVE NODE FEED</span>
                            <select 
                                value={filter} 
                                onChange={(e) => setFilter(e.target.value)}
                                style={{ 
                                    backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                                    color: '#fff', padding: '8px 16px', borderRadius: '12px', fontSize: '11px', 
                                    fontWeight: '700', cursor: 'pointer'
                                }}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Green">Optimal</option>
                                <option value="Yellow">Warning</option>
                                <option value="Red">Critical</option>
                            </select>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="text"
                                placeholder="Filter by Node ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)',
                                    padding: '14px 20px', borderRadius: '16px', color: '#fff', fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ overflowY: 'auto', maxHeight: '420px' }}>
                        {filteredBatches.length === 0 ? (
                            <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                                 <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔍</div>
                                 <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>No nodes match your filter criteria.</div>
                            </div>
                        ) : ( 
                            filteredBatches.map((b, idx) => (
                                <div 
                                    key={b.batch_id} 
                                    onMouseEnter={() => setSelectedBatchId(b.batch_id)}
                                    onClick={() => navigate(`/batch/${b.batch_id}`)}
                                    style={{ 
                                        padding: '20px 32px', 
                                        borderBottom: '1px solid rgba(255,255,255,0.03)', 
                                        cursor: 'pointer',
                                        backgroundColor: selectedBatchId === b.batch_id ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                                        transition: 'all 0.2s ease', 
                                        display: 'grid', 
                                        gridTemplateColumns: 'minmax(80px, 1fr) minmax(100px, 1.5fr) minmax(80px, 1fr)',
                                        alignItems: 'center',
                                        gap: '16px',
                                        borderLeft: selectedBatchId === b.batch_id ? '6px solid #6366f1' : '6px solid transparent'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: '15px', fontWeight: '900', color: selectedBatchId === b.batch_id ? '#fff' : '#cbd5e1' }}>{b.batch_id}</div>
                                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', fontWeight: '700', textTransform: 'uppercase' }}>{b.location}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ 
                                            display: 'inline-block', padding: '4px 12px', borderRadius: '8px',
                                            backgroundColor: `${riskStyle(b.risk_level).color}15`,
                                            border: `1px solid ${riskStyle(b.risk_level).color}33`,
                                            color: riskStyle(b.risk_level).color,
                                            fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em'
                                        }}>
                                            {b.risk_level}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>{b.avg_temperature}°C</div>
                                        <div style={{ fontSize: '10px', color: '#475569', fontWeight: '800', marginTop: '4px', textTransform: 'uppercase' }}>
                                            <span style={{ color: '#94a3b8' }}>Life:</span> <strong>{b.remaining_shelf_life}H</strong>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
             </div>
          </div>
        </>
      )}
    </div>
  )
}
