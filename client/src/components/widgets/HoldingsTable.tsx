import { useAppStore } from '../../store/useAppStore'

const HoldingsTable = () => {
  const { holdings, loading, stressScenario } = useAppStore()

  const isNegativeStress = stressScenario === 'tech-selloff' || stressScenario === 'market-crash'
  const isPositiveStress = stressScenario === 'ai-boom' || stressScenario === 'rebalance'

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
          Portfolio Holdings
        </h2>
        {stressScenario && (
          <span style={{
            fontSize: 9,
            fontWeight: 800,
            color: isPositiveStress ? '#34d399' : '#f43f5e',
            background: isPositiveStress ? 'rgba(52,211,153,0.1)' : 'rgba(244,63,94,0.1)',
            border: `1px solid ${isPositiveStress ? '#34d399' : '#f43f5e'}`,
            borderRadius: 6,
            padding: '3px 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Simulated
          </span>
        )}
      </div>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>
        {stressScenario ? 'Stressed scenario valuations' : 'Live prices and P&L'}
      </p>

      {loading ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#475569', fontSize: 13 }}>Loading holdings...</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 8px', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>ASSET</th>
                <th style={{ padding: '12px 8px', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>SHARES</th>
                <th style={{ padding: '12px 8px', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>PRICE</th>
                <th style={{ padding: '12px 8px', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>VALUE</th>
                <th style={{ padding: '12px 8px', fontSize: 11, color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>P&L</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => {
                // Determine per-row stress glow based on direction of change
                const rowFlash = stressScenario
                  ? h.change >= 0
                    ? 'rgba(52, 211, 153, 0.04)'
                    : 'rgba(244, 63, 94, 0.04)'
                  : 'transparent'

                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: rowFlash,
                      transition: 'background-color 0.5s ease',
                    }}
                  >
                    {/* Symbol + name */}
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{h.symbol}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{h.name}</div>
                    </td>

                    {/* Shares */}
                    <td style={{ padding: '12px 8px', fontSize: 13, color: '#334155' }}>{h.shares}</td>

                    {/* Price + daily change */}
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: stressScenario ? 700 : 400,
                        color: stressScenario
                          ? (h.change >= 0 ? '#34d399' : '#f43f5e')
                          : '#475569',
                        transition: 'color 0.4s ease',
                      }}>
                        ${h.price.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 10, color: h.change >= 0 ? '#34d399' : '#f43f5e', display: 'flex', alignItems: 'center', gap: 2 }}>
                        {h.change >= 0 ? '▲' : '▼'} {Math.abs(h.change).toFixed(2)}%
                      </div>
                    </td>

                    {/* Portfolio value */}
                    <td style={{ padding: '12px 8px', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                      ${h.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* P&L badge */}
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        background: h.pnlPct >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(244,63,94,0.1)',
                        color: h.pnlPct >= 0 ? '#34d399' : '#f43f5e',
                        border: stressScenario
                          ? `1px solid ${h.pnlPct >= 0 ? 'rgba(52,211,153,0.3)' : 'rgba(244,63,94,0.3)'}`
                          : '1px solid transparent',
                        transition: 'all 0.4s ease',
                        boxShadow: stressScenario
                          ? `0 0 6px ${h.pnlPct >= 0 ? 'rgba(52,211,153,0.2)' : 'rgba(244,63,94,0.2)'}`
                          : 'none',
                      }}>
                        {h.pnlPct >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default HoldingsTable
