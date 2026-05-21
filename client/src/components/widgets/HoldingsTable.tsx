import { useAppStore } from '../../store/useAppStore'

const HoldingsTable = () => {
  const { holdings, loading } = useAppStore()

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
        Portfolio Holdings
      </h2>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>Live prices and P&L</p>

      {loading ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#475569', fontSize: 13 }}>Loading holdings...</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(99,179,237,0.1)' }}>
                <th style={{ padding: '12px 8px', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>ASSET</th>
                <th style={{ padding: '12px 8px', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>SHARES</th>
                <th style={{ padding: '12px 8px', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>PRICE</th>
                <th style={{ padding: '12px 8px', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>VALUE</th>
                <th style={{ padding: '12px 8px', fontSize: 11, color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>P&L</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(99,179,237,0.05)' }}>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{h.symbol}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{h.name}</div>
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: 13, color: '#cbd5e1' }}>{h.shares}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ fontSize: 13, color: '#cbd5e1' }}>${h.price.toFixed(2)}</div>
                    <div style={{ fontSize: 10, color: h.change >= 0 ? '#34d399' : '#f43f5e' }}>
                      {h.change >= 0 ? '▲' : '▼'} {Math.abs(h.change).toFixed(2)}%
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>
                    ${h.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      background: h.pnlPct >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(244,63,94,0.1)',
                      color: h.pnlPct >= 0 ? '#34d399' : '#f43f5e'
                    }}>
                      {h.pnlPct >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default HoldingsTable
