import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Line } from 'react-chartjs-2'
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

const statusTheme = (risk) => {
  if (risk === 'Green') return { color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', label: 'Safe' }
  if (risk === 'Yellow') return { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', label: 'Warning' }
  return { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', label: 'Critical' }
}

export default function Dashboard() {
  const [batches, setBatches] = useState([])
  const [simTemp, setSimTemp] = useState(0)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(`/api/batches?sim_temp=${simTemp}`)
      .then(res => res.json())
      .then(data => {
        setBatches(data)
        if (!selectedBatch && data.length > 0) setSelectedBatch(data[0])
        else if (selectedBatch) {
          const updated = data.find(b => b.batch_id === selectedBatch.batch_id)
          if (updated) setSelectedBatch(updated)
        }
      })
  }, [simTemp])

  const filteredBatches = batches.filter(b => 
    b.batch_id.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase())
  )

  const chartData = {
    labels: batches.map(b => b.batch_id),
    datasets: [{
      label: 'Temp (°C)',
      data: batches.map(b => b.avg_temperature),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2,
      borderWidth: 3
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } }
    }
  }

  return (
    <div className="animate-in">
      {/* Analytics Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginBottom: '48px' }}>
        {[
            { label: 'Active Network Nodes', value: batches.length, color: '#6366f1' },
            { label: 'Optimal Operations', value: batches.filter(b => b.risk_level === 'Green').length, color: '#10b981' },
            { label: 'Critical Anomalies', value: batches.filter(b => b.risk_level === 'Red').length, color: '#ef4444' }
        ].map((card, i) => (
          <div key={i} className="glass-card" style={{ padding: '32px', borderBottom: `4px solid ${card.color}` }}>
            <div style={{ fontSize: '11px', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.15em' }}>{card.label}</div>
            <div style={{ fontSize: '56px', fontWeight: '900', color: '#fff', fontFamily: 'Outfit', lineHeight: 1 }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 4fr', gap: '48px', alignItems: 'start' }}>
        {/* Core Node Registry */}
        <div className="glass-card" style={{ padding: '40px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Node Registry Stream</h3>
            <input 
              type="text" 
              placeholder="SEARCH NETWORK NODES..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '240px', height: '44px', fontSize: '12px', background: 'rgba(0,0,0,0.3)', fontWeight: '700' }}
            />
          </div>
          
          <table className="neo-table">
            <thead>
              <tr>
                <th>Identifier</th>
                <th>Global Location</th>
                <th>Telemetry</th>
                <th>Resilience</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map(b => {
                  const s = statusTheme(b.risk_level)
                  const isCritical = b.risk_level === 'Red'
                  return (
                    <tr 
                      key={b.batch_id} 
                      className={isCritical ? 'critical-pulse' : ''}
                      onClick={() => setSelectedBatch(b)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: '900', color: '#fff' }}>{b.batch_id}</td>
                      <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{b.location}</td>
                      <td style={{ fontWeight: '800', color: '#fff' }}>{b.avg_temperature}°C</td>
                      <td style={{ fontWeight: '900', color: '#6366f1' }}>{b.remaining_shelf_life}H</td>
                      <td>
                        <div style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '8px',
                          padding: '6px 14px', borderRadius: '40px', 
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${s.color}44`,
                          color: s.color,
                          fontSize: '10px', fontWeight: '900', textTransform: 'uppercase',
                          letterSpacing: '0.1em'
                        }}>
                          <div style={{ width: '6px', height: '6px', backgroundColor: s.color, borderRadius: '50%', boxShadow: `0 0 10px ${s.color}` }} />
                          {s.label}
                        </div>
                      </td>
                    </tr>
                  )
              })}
            </tbody>
          </table>
        </div>

        {/* Tactical Intelligence Unit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {selectedBatch && (
            <div className="glass-card" style={{ 
                padding: '40px', 
                borderLeft: `1px solid ${statusTheme(selectedBatch.risk_level).color}AA`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative glow */}
                <div style={{ 
                    position: 'absolute', top: 0, right: 0, width: '100px', height: '100px',
                    background: `radial-gradient(circle, ${statusTheme(selectedBatch.risk_level).glow} 0%, transparent 70%)`
                }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                        <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>Node {selectedBatch.batch_id}</h3>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px' }}>{selectedBatch.location} // {selectedBatch.storage_type}</div>
                    </div>
                    <Link to={`/batch/${selectedBatch.batch_id}`} className="btn-futuristic" style={{ padding: '8px 16px', fontSize: '11px' }}>Live View</Link>
                </div>

                <div style={{ height: '180px', marginBottom: '32px' }}>
                    <Line data={chartData} options={chartOptions} />
                </div>

                <div style={{ 
                    padding: '24px', backgroundColor: 'rgba(0,0,0,0.2)', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '16px'
                }}>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: statusTheme(selectedBatch.risk_level).color, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>Insight Directive</div>
                    <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', fontWeight: '500', lineHeight: 1.6, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>"{selectedBatch.insight}"</div>
                </div>
            </div>
          )}

          {/* Simulation Core Control */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Simulation Core</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '800', textTransform: 'uppercase' }}>Thermal Stress Load</label>
              <div style={{ padding: '6px 14px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', color: '#6366f1', fontWeight: '900', fontSize: '18px', fontFamily: 'Outfit' }}>+{simTemp.toFixed(1)}°C</div>
            </div>
            <input 
              type="range" 
              min="0" 
              max="15" 
              step="0.5" 
              value={simTemp} 
              onChange={(e) => setSimTemp(parseFloat(e.target.value))}
              style={{ 
                  width: '100%', cursor: 'pointer', height: '6px', appearance: 'none', 
                  background: 'rgba(255,255,255,0.05)', borderRadius: '10px' 
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontWeight: '900' }}>OPTIMAL</span>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontWeight: '900' }}>CRITICAL LIMIT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
