import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

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
      .catch(() => setError('Historical telemetry could not be synchronized.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'rgba(255,255,255,0.4)', fontWeight: '800', textTransform: 'uppercase' }}>Synchronizing Temporal Data...</div>

  if (error) return (
    <div className="glass-card animate-in" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', textAlign: 'center' }}>
      <p style={{ color: '#ef4444', marginBottom: '24px', fontSize: '18px', fontWeight: '800', textTransform: 'uppercase' }}>{error}</p>
      <Link to="/dashboard" className="btn-futuristic" style={{ textDecoration: 'none' }}>Return to Control Center</Link>
    </div>
  )

  const chartData = {
    labels: batches.map(b => `NODE_${b.batch_id}`),
    datasets: [
      {
        label: 'Mean Temp (°C)',
        data: batches.map(b => b.avg_temperature),
        backgroundColor: batches.map(b => b.risk_level === 'Red' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(99, 102, 241, 0.4)'),
        borderColor: batches.map(b => b.risk_level === 'Red' ? '#ef4444' : '#6366f1'),
        borderWidth: 1,
        borderRadius: 8,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            titleFont: { weight: '800' },
            padding: 12,
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1
        }
    },
    scales: {
      y: { border: { display: false }, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10, weight: '800' } } },
      x: { border: { display: false }, grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10, weight: '800' } } }
    }
  }

  const handleExport = () => {
    if (!window.jspdf) {
        alert("Intelligence engine initializing. Please wait.");
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Theme colors
    const primaryTitle = "#0f172a";
    const accent = "#6366f1";
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(primaryTitle);
    doc.text("SMARTSHELF OS", 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("STRATEGIC TELEMETRY REPORT // INTERNAL ONLY", 20, 38);
    
    // Divider
    doc.setDrawColor(200);
    doc.line(20, 45, 190, 45);
    
    // Global Stats
    doc.setFontSize(14);
    doc.setTextColor(primaryTitle);
    doc.text("Infrastructure Summary", 20, 60);
    
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Total Managed Nodes: ${batches.length}`, 20, 70);
    doc.text(`System Integrity: ${((batches.filter(b => b.risk_level === 'Green').length / batches.length) * 100).toFixed(1)}%`, 20, 78);
    doc.text(`Generation Timestamp: ${new Date().toLocaleString()}`, 20, 86);
    
    // Table Header
    doc.setFont("helvetica", "bold");
    doc.setFillColor(245, 247, 250);
    doc.rect(20, 100, 170, 10, 'F');
    doc.text("NODE ID", 25, 107);
    doc.text("TEMPERATURE", 60, 107);
    doc.text("RESILIENCE", 100, 107);
    doc.text("RISK STATE", 140, 107);
    
    // Table Body
    doc.setFont("helvetica", "normal");
    let y = 117;
    batches.forEach((b) => {
        doc.text(b.batch_id, 25, y);
        doc.text(`${b.avg_temperature} C`, 60, y);
        doc.text(`${b.remaining_shelf_life}H`, 100, y);
        doc.text(b.risk_level.toUpperCase(), 140, y);
        y += 10;
        
        if (y > 270) {
            doc.addPage();
            y = 30;
        }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Quantum-Signed Intelligence Report // Node: SS-PRIMARY-CORE // Page ${i} of ${pageCount}`, 20, 285);
    }
    
    doc.save(`SmartShelf_Intelligence_Report_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '48px' }}>
        <div className="glass-card" style={{ padding: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Regional Thermal Analysis</h3>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Telemetry Uplink: Active</div>
            </div>
            <div style={{ height: '450px' }}>
                <Bar data={chartData} options={chartOptions} />
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            <div className="glass-card" style={{ padding: '40px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '32px' }}>Infrastructure Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[
                        { loc: 'Cold Storage Unit A', status: 'Safe', val: '2.4°C' },
                        { loc: 'Transport Truck 2', status: 'Critical', val: '8.1°C' },
                        { loc: 'Processing Unit B', status: 'Safe', val: '3.0°C' },
                        { loc: 'Cold Storage Unit C', status: 'Warning', val: '5.5°C' }
                    ].map((item, i) => (
                        <div key={i} style={{ 
                            padding: '20px', background: 'rgba(255,255,255,0.02)', 
                            borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>{item.loc}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                    <div style={{ 
                                        width: '6px', height: '6px', borderRadius: '50%', 
                                        backgroundColor: item.status === 'Critical' ? '#ef4444' : (item.status === 'Deviation' ? '#f59e0b' : '#10b981'),
                                        boxShadow: `0 0 8px ${item.status === 'Critical' ? '#ef4444' : (item.status === 'Deviation' ? '#f59e0b' : '#10b981')}`
                                    }} />
                                    <div style={{ fontSize: '10px', color: item.status === 'Critical' ? '#ef4444' : (item.status === 'Deviation' ? '#f59e0b' : '#10b981'), fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.status}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', fontFamily: 'Outfit' }}>{item.val}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card" style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), transparent)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '16px' }}>Network Diagnostics</h4>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Analysis of temporal drift indicates 99.8% network synchronization across all managed satellite hubs.</div>
                <button onClick={handleExport} className="btn-futuristic" style={{ width: '100%', marginTop: '24px', height: '44px', fontSize: '11px' }}>Export Intelligence Report</button>
            </div>
        </div>
      </div>
    </div>
  )
}
