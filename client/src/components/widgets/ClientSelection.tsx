import { useEffect } from 'react'
import { useAppStore, type Persona } from '../../store/useAppStore'
import { Rocket, Home, Sunrise } from 'lucide-react'

const personas: { id: Persona; label: string; icon: React.ComponentType<any>; desc: string; color: string }[] = [
  {
    id: 'young-investor',
    label: 'Young Investor',
    icon: Rocket,
    desc: 'High growth, high risk',
    color: '#38bdf8',
  },
  {
    id: 'family-planner',
    label: 'Family Planner',
    icon: Home,
    desc: 'Balanced & protected',
    color: '#a78bfa',
  },
  {
    id: 'retirement-client',
    label: 'Retirement Client',
    icon: Sunrise,
    desc: 'Stable & income-focused',
    color: '#34d399',
  },
]

const ClientSelection = () => {
  const { selectedPersona, setPersona, fetchDashboardData } = useAppStore()

  useEffect(() => {
    fetchDashboardData(selectedPersona)
  }, [])

  const handleSelect = (persona: Persona) => {
    setPersona(persona)
  }

  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>
        Select Client Profile
      </p>
      <div className="client-selection-row">
        {personas.map((p) => {
          const isActive = selectedPersona === p.id
          return (
            <button
              key={p.id}
              id={`persona-${p.id}`}
              onClick={() => handleSelect(p.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                background: isActive
                  ? `${p.color}15`
                  : '#FFFFFF',
                border: `1px solid ${isActive ? p.color : '#E2E8F0'}`,
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isActive
                  ? `0 4px 12px ${p.color}20`
                  : '0 1px 3px rgba(15,23,42,0.05)',
                minWidth: 160,
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: isActive ? `${p.color}25` : '#F8FAFC',
                border: `1px solid ${isActive ? p.color + '40' : '#E2E8F0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isActive ? p.color : '#64748B',
                flexShrink: 0,
              }}>
                <p.icon size={16} />
              </div>
              <div style={{ textAlign: 'left', minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.label}
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{p.desc}</div>
              </div>
              {isActive && (
                <div style={{
                  marginLeft: 'auto',
                  width: 7, height: 7,
                  borderRadius: '50%',
                  background: p.color,
                  boxShadow: `0 0 6px ${p.color}`,
                  flexShrink: 0,
                }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ClientSelection
