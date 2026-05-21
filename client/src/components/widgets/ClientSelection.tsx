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
    <div style={{ marginTop: 24 }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>
        Select Client Profile
      </p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {personas.map((p) => {
          const isActive = selectedPersona === p.id
          return (
            <button
              key={p.id}
              id={`persona-${p.id}`}
              onClick={() => handleSelect(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 20px',
                background: isActive
                  ? `linear-gradient(135deg, ${p.color}22, ${p.color}11)`
                  : 'rgba(15, 23, 42, 0.6)',
                border: `1px solid ${isActive ? p.color + '60' : 'rgba(99,179,237,0.12)'}`,
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? `0 0 20px ${p.color}25, 0 4px 20px rgba(0,0,0,0.3)` : '0 2px 10px rgba(0,0,0,0.2)',
                transform: isActive ? 'translateY(-2px)' : 'none',
                minWidth: 180,
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: isActive ? `${p.color}25` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? p.color + '40' : 'rgba(255,255,255,0.06)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isActive ? p.color : '#94a3b8',
                flexShrink: 0,
              }}>
                <p.icon size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: isActive ? p.color : '#e2e8f0', fontFamily: 'Outfit, sans-serif' }}>
                  {p.label}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{p.desc}</div>
              </div>
              {isActive && (
                <div style={{
                  marginLeft: 'auto',
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: p.color,
                  boxShadow: `0 0 8px ${p.color}`,
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
