import { useState, useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { Bell, Trash2, Plus, AlertCircle } from 'lucide-react'

interface AlertRule {
  id: string
  symbol: string
  condition: 'Above' | 'Below'
  targetPrice: number
  isActive: boolean
}

const StockAlertRules = () => {
  const { holdings } = useAppStore()
  
  // Initialize with some mock sample alerts on client holdings
  const [rules, setRules] = useState<AlertRule[]>([
    { id: '1', symbol: 'NVDA', condition: 'Above', targetPrice: 950.00, isActive: true },
    { id: '2', symbol: 'META', condition: 'Below', targetPrice: 460.00, isActive: true },
  ])

  const [symbol, setSymbol] = useState('')
  const [condition, setCondition] = useState<'Above' | 'Below'>('Above')
  const [targetPrice, setTargetPrice] = useState('')

  // Set default symbol once holdings are loaded
  useEffect(() => {
    if (holdings.length > 0 && !symbol) {
      setSymbol(holdings[0].symbol)
    }
  }, [holdings, symbol])

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!symbol || !targetPrice) return

    const price = parseFloat(targetPrice)
    if (isNaN(price) || price <= 0) return

    const newRule: AlertRule = {
      id: String(Date.now()),
      symbol,
      condition,
      targetPrice: price,
      isActive: true,
    }

    setRules([...rules, newRule])
    setTargetPrice('')
  }

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id))
  }

  const handleToggleActive = (id: string) => {
    setRules(rules.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r))
  }

  return (
    <div className="glass-card" style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
        <Bell size={18} style={{ color: '#fbbf24' }} />
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Smart Stock Price Alerts
          </h2>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Set threshold notifications on portfolio holdings</p>
        </div>
      </div>

      {/* Alert Creator Form */}
      <form onSubmit={handleAddRule} style={{
        display: 'flex',
        gap: 10,
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
        alignItems: 'flex-end',
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>ASSET SYMBOL</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            style={{
              width: '100%',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 6,
              color: '#0F172A',
              padding: '6px 8px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {holdings.map((h) => (
              <option key={h.symbol} value={h.symbol}>{h.symbol} - {h.name}</option>
            ))}
          </select>
        </div>

        <div style={{ width: 100 }}>
          <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>CONDITION</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as any)}
            style={{
              width: '100%',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 6,
              color: '#0F172A',
              padding: '6px 8px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <option value="Above">Price Above</option>
            <option value="Below">Price Below</option>
          </select>
        </div>

        <div style={{ width: 120 }}>
          <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>TRIGGER PRICE ($)</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            style={{
              width: '100%',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 6,
              color: '#0F172A',
              padding: '6px 8px',
              fontSize: 12,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button type="submit" style={{
          background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
          border: 0,
          borderRadius: 6,
          color: '#fff',
          padding: '6px 12px',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          height: 30,
        }}>
          <Plus size={14} />
          Add
        </button>
      </form>

      {/* Rules list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#475569', fontSize: 12 }}>
            No stock alerts configured. Set one above!
          </div>
        ) : (
          rules.map((rule) => {
            const holding = holdings.find((h) => h.symbol === rule.symbol)
            const currentPrice = holding ? holding.price : 0
            
            // Check trigger condition
            const isTriggered = rule.isActive && (
              rule.condition === 'Above' ? currentPrice >= rule.targetPrice : currentPrice <= rule.targetPrice
            )

            return (
              <div
                key={rule.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isTriggered ? 'rgba(239, 68, 68, 0.05)' : '#F8FAFC',
                  border: isTriggered ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: '12px 16px',
                  transition: 'all 0.2s',
                }}
              >
                {/* Symbol & Condition */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{rule.symbol}</span>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                      Alert when {rule.condition === 'Above' ? 'Exceeds' : 'Drops Below'} <span style={{ color: '#fbbf24', fontWeight: 600 }}>${rule.targetPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#475569', display: 'block' }}>Current Price</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>${currentPrice ? currentPrice.toFixed(2) : '-'}</span>
                  </div>
                </div>

                {/* Status Indicator & Controls */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {isTriggered && (
                    <span
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 6,
                        color: '#f87171',
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '3px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        animation: 'pulse 1.8s infinite',
                      }}
                    >
                      <AlertCircle size={10} />
                      TRIGGERED
                    </span>
                  )}

                  {/* Toggle Rule status switch */}
                  <button
                    onClick={() => handleToggleActive(rule.id)}
                    style={{
                      background: rule.isActive ? 'rgba(56, 189, 248, 0.2)' : '#F1F5F9',
                      border: rule.isActive ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid #E2E8F0',
                      borderRadius: 4,
                      color: rule.isActive ? '#38bdf8' : '#64748b',
                      fontSize: 9,
                      fontWeight: 600,
                      padding: '3px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    {rule.isActive ? 'Active' : 'Disabled'}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    style={{
                      background: 'transparent',
                      border: 0,
                      color: '#475569',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Embedded CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}

export default StockAlertRules
