import React, { useState, useEffect, useRef } from 'react'
import { useAppStore, Client, Persona, PortfolioHolding } from '../store/useAppStore'
import { 
  Plus, 
  Search, 
  Upload, 
  Download, 
  UserPlus, 
  ChevronRight,
  TrendingUp,
  FileText,
  Mail,
  Phone,
  MapPin,
  Building,
  Trash2,
  Loader2,
  Sparkles,
  Check,
  AlertTriangle,
  Briefcase,
  Layers,
  ArrowUpRight,
  User,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  Info,
  ArrowLeft,
  Calendar,
  Settings,
  Edit2
} from 'lucide-react'

// Recharts imports for beautiful client performance graph
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts'

// Widgets to embed inside client detail tabs
import AIInsightCard from '../components/widgets/AIInsightCard'
import GoalSimulator from '../components/widgets/GoalSimulator'

const ClientsPage: React.FC = () => {
  const { 
    clients, 
    clientsLoading,
    clientsError,
    fetchClients,
    addClient,
    deleteClient,
    uploadClientLogo,
    uploadClientPortfolio,
    selectClient, 
    setPersona,
    setCurrentPage, 
    setDeckBuilderStep
  } = useAppStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<Client | null>(null)
  const [selectedClientDetails, setSelectedClientDetails] = useState<Client | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'investments' | 'insights' | 'planner'>('overview')

  // Form states (Add)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [contact, setContact] = useState('')
  const [address, setAddress] = useState('')
  const [company, setCompany] = useState('')
  const [age, setAge] = useState(40)
  const [persona, setPersonaState] = useState<Persona>('family-planner')
  const [currentValue, setCurrentValue] = useState(250000)
  const [goalValue, setGoalValue] = useState(500000)
  const [sharpe, setSharpe] = useState(1.45)
  const [volatility, setVolatility] = useState(12.5)

  // Files
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Refs
  const logoInputRef = useRef<HTMLInputElement>(null)
  const portfolioInputRef = useRef<HTMLInputElement>(null)

  const selectedClient = useAppStore(state => state.selectedClient)

  useEffect(() => {
    fetchClients()
  }, [])

  // Synchronize local selected client state with store (routing/reload support)
  useEffect(() => {
    setSelectedClientDetails(selectedClient)
  }, [selectedClient])

  // Whenever a client details page is opened, set this client as selected in the main app store
  // so that widgets like AIInsightCard and GoalSimulator bind to the correct context automatically.
  const handleOpenDetails = (client: Client) => {
    selectClient(client)
    setPersona(client.persona)
    setSelectedClientDetails(client)
    setActiveTab('overview')
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      const newClient = await addClient({
        name,
        email,
        contact,
        address,
        company,
        age,
        persona,
        current: portfolioFile ? 0 : currentValue, 
        goal: goalValue,
        sharpe,
        volatility
      })

      if (logoFile) {
        await uploadClientLogo(newClient.id, logoFile)
      }

      if (portfolioFile) {
        await uploadClientPortfolio(newClient.id, portfolioFile)
      }

      // Reset
      setName('')
      setEmail('')
      setContact('')
      setAddress('')
      setCompany('')
      setAge(40)
      setPersonaState('family-planner')
      setCurrentValue(250000)
      setGoalValue(500000)
      setSharpe(1.45)
      setVolatility(12.5)
      setLogoFile(null)
      setPortfolioFile(null)
      setShowAddModal(false)
      
      await fetchClients()
    } catch (err: any) {
      alert(`Error adding client: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClient = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        await deleteClient(id)
        if (selectedClientDetails?.id === id) {
          selectClient(null)
          setSelectedClientDetails(null)
        }
      } catch (err: any) {
        alert(`Error removing client: ${err.message}`)
      }
    }
  }

  const handleQuickLogoUpload = async (clientId: string, file: File) => {
    try {
      await uploadClientLogo(clientId, file)
      await fetchClients()
      // Refresh current details cache
      const updated = clients.find(c => c.id === clientId)
      if (updated && selectedClientDetails?.id === clientId) {
        setSelectedClientDetails(updated)
      }
    } catch (err: any) {
      alert(`Logo upload failed: ${err.message}`)
    }
  }

  const handleQuickPortfolioUpload = async (clientId: string, file: File) => {
    try {
      await uploadClientPortfolio(clientId, file)
      await fetchClients()
      // Refresh current details cache
      const updated = clients.find(c => c.id === clientId)
      if (updated && selectedClientDetails?.id === clientId) {
        setSelectedClientDetails(updated)
      }
    } catch (err: any) {
      alert(`Portfolio upload failed: ${err.message}`)
    }
  }

  const handleSelectAndBuild = (client: Client) => {
    selectClient(client)
    setPersona(client.persona)
    setDeckBuilderStep('creation-mode')
    setCurrentPage('deck-builder')
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.persona.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const downloadCsvTemplate = () => {
    window.open('/api/clients/template/portfolio', '_blank')
  }

  // Generates 12M historical timeline data points matching the client's current asset value
  const getPerformanceData = (currentVal: number) => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const factors = [0.85, 0.88, 0.86, 0.91, 0.93, 0.92, 0.95, 0.98, 1.00, 1.02, 1.01, 1.05]
    return months.map((m, idx) => ({
      name: m,
      value: Math.round(currentVal * factors[idx])
    }))
  }

  // --- DETAILS VIEW RENDERING ---
  if (selectedClientDetails) {
    const client = clients.find(c => c.id === selectedClientDetails.id) || selectedClientDetails
    const perfData = getPerformanceData(client.current)
    const pcLabel = {
      'young-investor': 'Aggressive Growth',
      'family-planner': 'Balanced Strategy',
      'retirement-client': 'Conservative Strategy'
    }[client.persona] || 'Custom Strategy'

    const riskLabel = {
      'young-investor': 'Aggressive',
      'family-planner': 'Moderate',
      'retirement-client': 'Conservative'
    }[client.persona] || 'Custom'

    const ytdPerf = {
      'young-investor': '+31.7%',
      'family-planner': '+14.3%',
      'retirement-client': '+6.2%'
    }[client.persona] || '+12.4%'

    const ytdBenchmark = {
      'young-investor': '+18.5%',
      'family-planner': '+8.2%',
      'retirement-client': '+4.1%'
    }[client.persona] || '+8.2%'

    return (
      <div style={{ animation: 'fadeIn 0.35s ease', fontFamily: "'Inter', sans-serif", paddingBottom: 56 }}>
        
        {/* Back Link */}
        <button
          onClick={() => {
            selectClient(null)
            setSelectedClientDetails(null)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: 13.5,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            marginBottom: 20,
            padding: 0
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={16} /> Back to Clients
        </button>

        {/* Client Header Card */}
        <div className="glass-card" style={{ padding: '24px 28px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {client.logo ? (
              <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={client.logo} alt={`${client.company} logo`} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800, fontSize: 20 }}>
                {client.name.charAt(0)}
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>{client.name}</h2>
                <span className="badge badge-success" style={{ padding: '2px 8px', fontSize: 10 }}>Active</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>
                {client.company || 'Private Portfolio'} &middot; {pcLabel}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Managed by Alex Whitfield
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleSelectAndBuild(client)}
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: 13, borderRadius: 10 }}
            >
              <Plus size={14} /> Create Deck
            </button>
            
            <button
              onClick={() => setShowEditModal(client)}
              className="btn-secondary"
              style={{ width: 38, height: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}
              title="Edit Profile"
            >
              <Edit2 size={14} />
            </button>

            <button
              onClick={() => handleDeleteClient(client.id, client.name)}
              className="btn-secondary"
              style={{ width: 38, height: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, color: 'var(--danger)', borderColor: 'rgba(220,38,38,0.15)' }}
              title="Remove Client"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <div className="glass-card" style={{ padding: '18px 22px' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Portfolio Value</span>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginTop: 6 }}>
              ${client.current.toLocaleString()}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2, display: 'block' }}>AUM</span>
          </div>

          <div className="glass-card" style={{ padding: '18px 22px' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>YTD Performance</span>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#10B981', marginTop: 6 }}>
              {ytdPerf}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2, display: 'block' }}>vs benchmark {ytdBenchmark}</span>
          </div>

          <div className="glass-card" style={{ padding: '18px 22px' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Risk Score</span>
            <div style={{ fontSize: 22, fontWeight: 800, color: client.persona === 'young-investor' ? '#8B5CF6' : client.persona === 'family-planner' ? '#D97706' : 'var(--accent)', marginTop: 6 }}>
              {riskLabel}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2, display: 'block' }}>Portfolio risk profile</span>
          </div>

          <div className="glass-card" style={{ padding: '18px 22px' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Holdings</span>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginTop: 6 }}>
              {client.portfolioHoldings?.length || 10}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2, display: 'block' }}>Positions</span>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 28, gap: 24 }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'investments', label: 'Investments' },
            { id: 'insights', label: 'Portfolio Insights' },
            { id: 'planner', label: 'Goal Simulator' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 4px',
                fontSize: 13.5,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        {activeTab === 'overview' && (
          <div className="grid-2col">
            {/* Portfolio Performance Area Chart */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ marginBottom: 18 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>Portfolio Performance (12M)</span>
              </div>

              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={perfData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.12}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis 
                      stroke="var(--text-muted)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} 
                    />
                    <Tooltip 
                      formatter={(value: any) => [`$${value.toLocaleString()}`, 'Portfolio value']} 
                      contentStyle={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} 
                    />
                    <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ marginBottom: 18 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Activity</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { title: 'Q1 2026 Portfolio Review created', time: '2 days ago' },
                  { title: 'Risk Assessment exported to PDF', time: '1 week ago' },
                  { title: 'Portfolio allocation updated', time: '2 weeks ago' },
                  { title: 'Investment Strategy Update created', time: '3 weeks ago' },
                  { title: 'Q1 strategy review meeting completed', time: '1 month ago' }
                ].map((act, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{act.title}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'investments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Quick Upload Managers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="glass-card" style={{ padding: 18 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Building size={13} color="var(--accent)" /> Company Logo Branding
                </span>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.45 }}>
                  Overwrites default template branding in slide decks with the client's corporate logo.
                </p>
                <input 
                  type="file" 
                  accept="image/*"
                  ref={logoInputRef}
                  style={{ display: 'none' }}
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (file) await handleQuickLogoUpload(client.id, file)
                  }}
                />
                <button onClick={() => logoInputRef.current?.click()} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}>
                  <Upload size={12} /> Upload Corporate Logo
                </button>
              </div>

              <div className="glass-card" style={{ padding: 18 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Upload size={13} color="var(--accent)" /> Import Portfolio CSV
                </span>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.45 }}>
                  Import custom positions. Use the downloadable template for headers: Ticker, Name, Cost, Shares, Asset Class.
                </p>
                
                <input 
                  type="file" 
                  accept=".csv"
                  ref={portfolioInputRef}
                  style={{ display: 'none' }}
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (file) await handleQuickPortfolioUpload(client.id, file)
                  }}
                />

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => portfolioInputRef.current?.click()} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}>
                    <Upload size={12} /> Upload CSV sheet
                  </button>
                  <button onClick={downloadCsvTemplate} className="btn-secondary" style={{ padding: '6px 10px', fontSize: 12, borderRadius: 8, color: 'var(--accent)' }}>
                    Download Template
                  </button>
                </div>
              </div>
            </div>

            {/* Holdings breakdown table */}
            <div className="glass-card" style={{ padding: 24 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 16 }}>
                Asset Holdings & Portfolio Breakdown
              </span>

              {client.portfolioHoldings && client.portfolioHoldings.length > 0 ? (
                <div className="holdings-scroll" style={{ border: '1px solid var(--border)', borderRadius: 10 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Asset Name</th>
                        <th>Asset Class</th>
                        <th>Shares</th>
                        <th>Avg Cost</th>
                        <th style={{ textAlign: 'right' }}>Total Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {client.portfolioHoldings.map((h, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{h.symbol}</td>
                          <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{h.name}</td>
                          <td>
                            <span style={{ fontSize: 10, padding: '2.5px 7px', borderRadius: 4, background: '#F1F5F9', color: '#475569', fontWeight: 600 }}>
                              {h.assetClass}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{h.shares}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>${h.avgCost.toFixed(2)}</td>
                          <td style={{ fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>
                            ${h.value ? h.value.toLocaleString() : (h.shares * h.avgCost).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '36px', background: '#FAFBFD', border: '1px dashed var(--border)', borderRadius: 12, textAlign: 'center' }}>
                  <Info size={20} style={{ margin: '0 auto 8px auto', color: 'var(--text-muted)' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>No Custom Holdings Loaded</div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                    This client profile is mapped to default benchmark allocations. Upload a completed CSV file to populate custom ticker positions.
                  </p>
                </div>
              )}
            </div>

            {/* Profile Contact Card */}
            <div className="glass-card" style={{ padding: 24 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 16 }}>
                Client Information details
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div style={{ background: '#FAFBFD', padding: '16px', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Mail size={16} color="var(--text-muted)" />
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Email Address</span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{client.email || 'N/A'}</span>
                  </div>
                </div>

                <div style={{ background: '#FAFBFD', padding: '16px', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Phone size={16} color="var(--text-muted)" />
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Contact Phone</span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{client.contact || 'N/A'}</span>
                  </div>
                </div>

                <div style={{ background: '#FAFBFD', padding: '16px', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <MapPin size={16} color="var(--text-muted)" />
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Physical Address</span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }} title={client.address}>
                      {client.address || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'insights' && (
          <div>
            <AIInsightCard />
          </div>
        )}

        {activeTab === 'planner' && (
          <div>
            <GoalSimulator />
          </div>
        )}

        {/* Edit Client Modal */}
        {showEditModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            {/* Simple edit form dialog */}
            <div className="glass-card" style={{ background: '#FFFFFF', borderRadius: 20, width: '90%', maxWidth: 520, padding: 24, boxShadow: 'var(--shadow-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>Edit Profile: {showEditModal.name}</h3>
                <button onClick={() => setShowEditModal(null)} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer' }}>&times;</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={showEditModal.name} 
                    onChange={e => setShowEditModal({ ...showEditModal, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
                  <input 
                    type="email" 
                    value={showEditModal.email || ''} 
                    onChange={e => setShowEditModal({ ...showEditModal, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Company Name</label>
                  <input 
                    type="text" 
                    value={showEditModal.company || ''} 
                    onChange={e => setShowEditModal({ ...showEditModal, company: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => setShowEditModal(null)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12.5, borderRadius: 8 }}>Cancel</button>
                <button 
                  onClick={async () => {
                    const { addClient, ...updatePayload } = useAppStore.getState()
                    try {
                      // Perform edit save via PUT api
                      const res = await fetch(`/api/clients/${showEditModal.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(showEditModal)
                      })
                      if (res.ok) {
                        await fetchClients()
                        setSelectedClientDetails(showEditModal)
                        setShowEditModal(null)
                      }
                    } catch (err: any) {
                      alert(`Save failed: ${err.message}`)
                    }
                  }} 
                  className="btn-primary" 
                  style={{ padding: '8px 18px', fontSize: 12.5, borderRadius: 8 }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    )
  }

  // --- STANDARD CLIENTS DIRECTORY DIRECTORY VIEW ---
  return (
    <div style={{ animation: 'fadeIn 0.35s ease', fontFamily: "'Inter', sans-serif", paddingBottom: 56 }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Decora</span>
            <ChevronRight size={12} color="#CBD5E1" />
            <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>Clients Directory</span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 7 }}>
            Clients Directory
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '-0.01em' }}>
            Manage wealth management client portfolios, upload custom CSV holdings, and generate brand strategy slide decks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            onClick={downloadCsvTemplate}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: 13, borderRadius: 10 }}
          >
            <Download size={14} /> Download Template
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: 13, borderRadius: 10 }}
          >
            <Plus size={14} /> Add Client
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-4col-auto" style={{ marginBottom: 32 }}>
        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Clients</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>{clients.length}</span>
        </div>
        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aggressive / Growth</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#8B5CF6' }}>
            {clients.filter(c => c.persona === 'young-investor').length}
          </span>
        </div>
        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balanced / Family</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#10B981' }}>
            {clients.filter(c => c.persona === 'family-planner').length}
          </span>
        </div>
        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conservative / Retired</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)' }}>
            {clients.filter(c => c.persona === 'retirement-client').length}
          </span>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        
        {/* Table Search & Controls */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FCFDFE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F1F5F9', padding: '8px 14px', borderRadius: 10, width: 340 }}>
            <Search size={15} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by name, company, persona..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: 'var(--text-primary)',
                width: '100%',
                fontWeight: 500
              }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button 
              onClick={() => fetchClients()}
              className="btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: 12,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <RefreshCw size={12} className={clientsLoading ? 'animate-spin' : ''} /> Sync Data
            </button>
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Showing {filteredClients.length} of {clients.length} profiles
            </span>
          </div>
        </div>

        {/* Loading / Error States */}
        {clientsLoading && clients.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12 }}>
            <Loader2 size={28} className="animate-spin" color="var(--accent)" />
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, fontWeight: 500 }}>Retrieving client directories...</p>
          </div>
        ) : clientsError ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: 12, color: 'var(--danger)' }}>
            <AlertTriangle size={28} />
            <p style={{ fontSize: 13.5, fontWeight: 600 }}>Error: {clientsError}</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12 }}>
            <FolderOpen size={32} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, fontWeight: 500 }}>No clients match the search query.</p>
          </div>
        ) : (
          <div className="holdings-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client / Company</th>
                  <th>Age</th>
                  <th>Persona / Strategy</th>
                  <th>Portfolio Value</th>
                  <th>Target Goal</th>
                  <th>Metrics</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const pc = {
                    'young-investor':    { badge: 'badge-purple', label: 'Growth Strategy', color: '#8B5CF6', bg: 'rgba(139,92,246,0.06)' },
                    'family-planner':    { badge: 'badge-success',  label: 'Balanced Strategy', color: '#10B981', bg: 'rgba(16,185,129,0.06)' },
                    'retirement-client': { badge: 'badge-blue',  label: 'Conservative Strategy', color: '#2563EB', bg: 'rgba(37,99,235,0.06)' },
                  }[client.persona] || { badge: 'badge-muted', label: 'Custom', color: '#64748B', bg: 'rgba(100,116,139,0.06)' }

                  return (
                    <tr key={client.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {client.logo ? (
                            <img 
                              src={client.logo} 
                              alt={`${client.company} logo`} 
                              style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'contain', background: '#F8FAFC', border: '1px solid var(--border)' }}
                            />
                          ) : (
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontWeight: 700, fontSize: 13 }}>
                              {client.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              {client.name}
                              {client.portfolioHoldings && client.portfolioHoldings.length > 0 && (
                                <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'rgba(37,99,235,0.08)', color: 'var(--accent)', border: '1px solid rgba(37,99,235,0.15)', fontWeight: 700 }}>
                                  CSV
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500 }}>
                              {client.company || 'Private Wealth'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{client.age}</td>
                      <td>
                        <span className={`badge ${pc.badge}`} style={{ padding: '3px 8px' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: pc.color, marginRight: 2 }} />
                          {pc.label}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        ${client.current.toLocaleString()}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                        ${client.goal.toLocaleString()}
                      </td>
                      <td>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {client.sharpe} <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Sharpe</span>
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {client.volatility}% Vol
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenDetails(client)}
                            className="btn-secondary"
                            style={{
                              padding: '5px 10px',
                              fontSize: 12,
                              borderRadius: 8
                            }}
                          >
                            Details
                          </button>
                          
                          <button
                            onClick={() => handleSelectAndBuild(client)}
                            className="btn-primary"
                            style={{
                              padding: '5px 12px',
                              fontSize: 12,
                              borderRadius: 8,
                              gap: 4
                            }}
                          >
                            Generate Deck <ChevronRight size={11} />
                          </button>
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

      {/* Add Client Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{
            background: '#FFFFFF',
            borderRadius: 20,
            width: '90%',
            maxWidth: 620,
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: 0,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-xl)',
            animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FCFDFE' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  <UserPlus size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Add Client</h3>
                  <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 1 }}>Set up a client profile and configure portfolio targets</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateClient} style={{ padding: '24px' }}>
              
              {/* Profile Details */}
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 14 }}>
                  1. Profile Details
                </span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Sipho Khumalo" 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      style={{ 
                        width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none',
                        background: '#FAFBFD', color: 'var(--text-primary)', transition: 'all 0.15s ease'
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.06)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#FAFBFD'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. sipho.k@email.com" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      style={{ 
                        width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none',
                        background: '#FAFBFD', color: 'var(--text-primary)', transition: 'all 0.15s ease'
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.06)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#FAFBFD'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. +27 82 555 1234" 
                      value={contact} 
                      onChange={e => setContact(e.target.value)}
                      style={{ 
                        width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none',
                        background: '#FAFBFD', color: 'var(--text-primary)', transition: 'all 0.15s ease'
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.06)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#FAFBFD'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Client Age</label>
                    <input 
                      type="number" 
                      value={age} 
                      onChange={e => setAge(parseInt(e.target.value, 10) || 40)}
                      style={{ 
                        width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none',
                        background: '#FAFBFD', color: 'var(--text-primary)', transition: 'all 0.15s ease'
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.06)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#FAFBFD'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Residential Address</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 102 Melrose Arch, Johannesburg" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)}
                      style={{ 
                        width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none',
                        background: '#FAFBFD', color: 'var(--text-primary)', transition: 'all 0.15s ease'
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.06)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#FAFBFD'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Corporate details */}
              <div style={{ marginBottom: 24, borderTop: '1px solid var(--border)', paddingTop: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 14 }}>
                  2. Corporate & Logo Branding
                </span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Company / Trust Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Khumalo Holdings" 
                      value={company} 
                      onChange={e => setCompany(e.target.value)}
                      style={{ 
                        width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none',
                        background: '#FAFBFD', color: 'var(--text-primary)', transition: 'all 0.15s ease'
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.06)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#FAFBFD'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Company Logo</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setLogoFile(e.target.files?.[0] || null)}
                      style={{ 
                        fontSize: 12, color: 'var(--text-secondary)', padding: '6px 0'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Portfolio & Custom Holdings */}
              <div style={{ marginBottom: 28, borderTop: '1px solid var(--border)', paddingTop: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 14 }}>
                  3. Portfolio Customization
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Strategy Persona</label>
                    <select 
                      value={persona} 
                      onChange={e => setPersonaState(e.target.value as Persona)}
                      style={{ 
                        width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none',
                        background: '#FAFBFD', color: 'var(--text-primary)', cursor: 'pointer'
                      }}
                    >
                      <option value="young-investor">Growth (Aggressive Tech)</option>
                      <option value="family-planner">Balanced (Education/Family)</option>
                      <option value="retirement-client">Conservative (Retired)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Target Wealth Goal ($)</label>
                    <input 
                      type="number" 
                      value={goalValue} 
                      onChange={e => setGoalValue(parseFloat(e.target.value) || 0)}
                      style={{ 
                        width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none',
                        background: '#FAFBFD', color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>

                {/* CSV File Upload Section */}
                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px dashed var(--border-hover)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Upload size={13} color="var(--accent)" /> Import Portfolio CSV holdings
                    </span>
                    <button 
                      type="button"
                      onClick={downloadCsvTemplate}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Download size={11} /> Download Template
                    </button>
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.45 }}>
                    If you upload a CSV sheet, tickers and costs will map automatically. If empty, the persona default portfolio values will be used.
                  </p>
                  
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={e => setPortfolioFile(e.target.files?.[0] || null)}
                    style={{ fontSize: 12, color: 'var(--text-secondary)' }}
                  />

                  {!portfolioFile && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Portfolio Assets ($)</label>
                        <input 
                          type="number" 
                          value={currentValue}
                          onChange={e => setCurrentValue(parseFloat(e.target.value) || 0)}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, background: '#FFFFFF' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Sharpe Ratio</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={sharpe}
                          onChange={e => setSharpe(parseFloat(e.target.value) || 1.4)}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, background: '#FFFFFF' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Volatility (%)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={volatility}
                          onChange={e => setVolatility(parseFloat(e.target.value) || 12.0)}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, background: '#FFFFFF' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 18 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 18px', fontSize: 13, borderRadius: 10 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: 13, borderRadius: 10 }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      Save Client
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default ClientsPage
