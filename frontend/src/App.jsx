import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

function App() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBatchId, setSelectedBatchId] = useState(null)

  useEffect(() => {
    const fetchBatches = () => {
      fetch('http://127.0.0.1:8001/api/batches')
        .then(res => res.json())
        .then(data => {
          setBatches(data)
          setSelectedBatchId(prev => (prev === null && data.length > 0 ? data[0].batch_id : prev))
          setLoading(false)
        })
        .catch(err => {
          setError('Failed to fetch batch data.')
          setLoading(false)
        })
    }

    fetchBatches()
    const intervalId = setInterval(fetchBatches, 5000)

    return () => clearInterval(intervalId)
  }, [])

  const riskStyle = (risk) => {
    if (risk === 'Green') return { color: '#16a34a', emoji: '🟢' }
    if (risk === 'Yellow') return { color: '#ea580c', emoji: '🟡' }
    return { color: '#ef4444', emoji: '🔴' }
  }

  const selectedBatch = batches.find(b => b.batch_id === selectedBatchId)

  const chartData = selectedBatch ? {
    labels: selectedBatch.temperature_readings.map((_, i) => `T${i + 1}`),
    datasets: [
      {
        label: `Temperature (°C) - ${selectedBatch.batch_id}`,
        data: selectedBatch.temperature_readings,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2,
      },
      {
        label: 'Threshold (4°C)',
        data: Array(selectedBatch.temperature_readings.length).fill(4),
        borderColor: '#ef4444',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
      }
    ],
  } : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 6 } },
      tooltip: { backgroundColor: '#1e293b', padding: 10, cornerRadius: 8 }
    },
    scales: {
      y: { suggestedMin: 0, suggestedMax: 10, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    }
  }

  return (
    <div style={{
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      padding: '40px 24px',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box'
    }}>
      <h1 style={{
        textAlign: 'center',
        marginBottom: '32px',
        fontSize: '28px',
        color: '#1e293b'
      }}>
        Smart Shelf — Batch Monitor
      </h1>

      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
      {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              flex: 1, backgroundColor: '#fff', borderRadius: '8px',
              padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Total Batches</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>{batches.length}</div>
            </div>
            <div style={{
              flex: 1, backgroundColor: '#fff', borderRadius: '8px',
              padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>High-Risk Batches</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>
                {batches.filter(b => b.risk_level === 'Red').length}
              </div>
            </div>
          </div>

          {selectedBatch && (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0',
              height: '250px'
            }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          )}

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left'
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: '#f8fafc', 
                  borderBottom: '2px solid #e2e8f0' 
                }}>
                  {['Batch ID', 'Avg Temp (°C)', 'Remaining (hrs)', 'Shelf Life %', 'Risk', 'Recommendation'].map(h => (
                    <th key={h} style={{ 
                      padding: '16px 24px', 
                      fontSize: '14px', 
                      color: '#475569', 
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batches.map((b, i) => (
                  <tr key={b.batch_id} style={{ 
                    borderBottom: i === batches.length - 1 ? 'none' : '1px solid #e2e8f0',
                    transition: 'background-color 0.2s ease',
                    backgroundColor: selectedBatchId === b.batch_id ? '#f8fafc' : '#ffffff',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { if (selectedBatchId !== b.batch_id) e.currentTarget.style.backgroundColor = '#f1f5f9' }}
                  onMouseLeave={(e) => { if (selectedBatchId !== b.batch_id) e.currentTarget.style.backgroundColor = '#ffffff' }}
                  onClick={() => setSelectedBatchId(b.batch_id)}
                  >
                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0f172a' }}>{b.batch_id}</td>
                    <td style={{ padding: '16px 24px', color: '#334155' }}>{b.avg_temperature}</td>
                    <td style={{ padding: '16px 24px', color: '#334155' }}>{b.remaining_shelf_life}</td>
                    <td style={{ padding: '16px 24px', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '100%', 
                          height: '6px', 
                          backgroundColor: '#e2e8f0', 
                          borderRadius: '3px',
                          overflow: 'hidden' 
                        }}>
                          <div style={{ 
                            width: `${b.percentage}%`, 
                            height: '100%', 
                            backgroundColor: riskStyle(b.risk_level).color,
                            borderRadius: '3px'
                          }}></div>
                        </div>
                        <span style={{ fontSize: '14px', minWidth: '36px' }}>{b.percentage}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        backgroundColor: `${riskStyle(b.risk_level).color}15`,
                        color: riskStyle(b.risk_level).color, 
                        fontWeight: '600',
                        borderRadius: '9999px',
                        fontSize: '13px'
                      }}>
                        {riskStyle(b.risk_level).emoji} {b.risk_level}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#334155', fontWeight: '500' }}>{b.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default App
