import React, { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../../store/useAppStore'
import {
  Shield,
  Coins,
  TrendingUp,
  Scale,
  Globe,
  RefreshCw,
  Rocket,
  Zap,
  AlertTriangle,
  Brain,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle,
  Play
} from 'lucide-react'

// Helper to generate personalized pitches for the presentation slides
const getPersonaPitch = (persona: string, portfolio: any, metrics: any, holdings: any) => {
  const holdingsSummary = holdings && holdings.length > 0
    ? holdings.slice(0, 3).map((h: any) => `${h.symbol} (${h.allocation}%)`).join(', ')
    : 'equities'

  if (persona === 'young-investor') {
    return `• **Growth Strategy**: The portfolio is heavily positioned in top technology equities, including ${holdingsSummary}, capturing secular megatrends in AI and enterprise software.
• **Performance Metrics**: Demonstrates strong performance with a Sharpe ratio of ${metrics?.sharpe ?? '1.65'} and YTD Return of +${metrics?.ytdReturn ?? '18.5'}%, proving significant outperformance versus broad market benchmarks.
• **Action Plan**: Capitalize on market pullbacks to increase capital contributions. Continue full equity re-investment to maximize compounding benefits.`
  } else if (persona === 'family-planner') {
    return `• **Goal-Oriented Asset Allocation**: Balanced structure of ${holdingsSummary} is tailored specifically to fund future education goals.
• **Stabilized Performance**: The 60/40 ratio delivers an optimal Sharpe ratio of ${metrics?.sharpe ?? '1.42'}, dampening market drawdowns while maintaining consistent participation in equity bull cycles.
• **Strategic Horizon**: Projections suggest a highly stable probability of achieving the target $500K education milestone. Recommend keeping contributions at $1,000 monthly.`
  } else {
    return `• **Capital Preservation & Income Yield**: Defensive allocation designed for monthly retirement distributions. Income generators include ${holdingsSummary}.
• **Risk Cushions**: Sharpe ratio stands stable at ${metrics?.sharpe ?? '1.20'} with maximum drawdown strictly limited. Volatility is kept at a comfortable ${metrics?.volatility ?? '8.5'}%.
• **Distribution Strategy**: Dividend yield of 4.1% allows consistent withdrawals of retirement funds without exhausting principal capital holdings.`
  }
}

interface Message {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: Date
  source?: 'gemini' | 'mock'
  action?: {
    label: string
    onClick: () => void
    completed?: boolean
  }
}

const AIInsightCard = () => {
  const {
    portfolioData,
    loading,
    selectedPersona,
    metrics,
    holdings,
    monteCarlo,
    setStressScenario,
    updateSpecificSlideContent,
    stressScenario
  } = useAppStore()

  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>('')
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const welcomeMessages: Record<string, string> = {
    'young-investor': "Hello! I am your AI Strategic Advisor. I've completed a full audit of the **Young Growth** portfolio. Equities are currently at 85%, primarily weighted in high-beta tech. What market event would you like to stress-test today?",
    'family-planner': "Welcome! I've loaded the **Family Planner** balanced portfolio. The target college fund goal is $500K in 10 years. Asset mix is 60/40. Let's run a stress-test or check tactical optimization.",
    'retirement-client': "Greetings, Advisor. The **Retirement Income** portfolio is active. The current allocations focus on preserving wealth and generating a stable 4.1% dividend yield. Let's examine capital preservation under crisis.",
  }

  // Reseed chat on persona switch
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: welcomeMessages[selectedPersona] ?? "Hello! I am your AI Strategic Advisor . How can I help you optimize this portfolio today?",
        timestamp: new Date()
      }
    ])
  }, [selectedPersona])

  // Scroll to bottom of chat container on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const colorMap: Record<string, string> = {
    'young-investor': '#38bdf8',
    'family-planner': '#a78bfa',
    'retirement-client': '#34d399',
  }
  const color = colorMap[selectedPersona] ?? '#38bdf8'

  const handleSimulate = async (scenario: 'tech-selloff' | 'market-crash' | 'ai-boom' | 'rebalance' | 'pitch') => {
    let userText = ''
    if (scenario === 'tech-selloff') userText = 'Simulate 35% Tech Correction Shock'
    else if (scenario === 'market-crash') userText = 'Stress Test: 2008 Financial Crisis'
    else if (scenario === 'ai-boom') userText = 'Model Future AI Acceleration Surge'
    else if (scenario === 'rebalance') userText = 'Simulate 5% Defensive Rebalance Shift'
    else if (scenario === 'pitch') userText = 'Draft Client Executive Slides Commentary'

    if (isTyping) return

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    // Trigger state changes first so other cards react instantly
    if (scenario !== 'pitch') {
      setStressScenario(scenario)
    }

    try {
      let aiText = ''
      let newAction = undefined
      let source: 'gemini' | 'mock' = 'mock'

      if (scenario === 'pitch') {
        const pitchText = getPersonaPitch(selectedPersona, portfolioData, metrics, holdings)
        aiText = `**Drafted Presenter Deck Commentary**: \n\n"${pitchText}"\n\nYou can now sync this highly customized commentary directly to the slide presentation deck.`

        newAction = {
          label: 'Sync to Presenter Slides',
          onClick: () => {
            updateSpecificSlideContent('insights', 'content', pitchText)
            updateSpecificSlideContent('insights', 'title', `${selectedPersona === 'young-investor' ? 'Young Growth' : selectedPersona === 'family-planner' ? 'Family Planner' : 'Retirement Income'} Strategy Commentary`)

            setMessages(prev => {
              const updated = prev.map(m => m.action?.label === 'Sync to Presenter Slides' ? { ...m, action: { ...m.action, completed: true, label: 'Synced ✓' } } : m)
              return [...updated, {
                id: Math.random().toString(),
                sender: 'ai',
                text: '**Slides updated!** The Client Executive commentary has been successfully synced to the Presentation Slide Deck. You can toggle over to the Deck Builder to verify.',
                timestamp: new Date()
              }]
            })
          }
        }
      } else {
        const res = await fetch('/api/copilot/stress-appraisal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenario,
            persona: selectedPersona,
            holdings,
            metrics,
          }),
        })
        const data = await res.json()
        aiText = data.reply
        source = data.source
      }

      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: aiText,
        timestamp: new Date(),
        action: newAction,
        source
      }])
    } catch (err) {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: `Error analyzing stress simulation. Please check your backend connection.`,
        timestamp: new Date(),
      }])
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    const query = inputValue
    setInputValue('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          persona: selectedPersona,
          portfolioValue: portfolioData?.current,
          metrics,
          stressScenario,
        }),
      })
      const data = await res.json()
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: data.reply || 'I could not process that request. Please try again.',
        timestamp: new Date(),
        source: data.source,
      }])
    } catch {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: `I encountered a network issue reaching the AI service. Please ensure the server is running on port 5000.`,
        timestamp: new Date(),
      }])
    }
  }


  return (
    <div style={{
      padding: '24px 28px',
      background: `linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.8))`,
      border: `1px solid rgba(255,255,255,0.08)`,
      boxShadow: `0 12px 40px rgba(0,0,0,0.5)`,
      borderRadius: 12,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 480,
    }}>
      {/* Background glow orb */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 180, height: 180,
        background: `radial-gradient(circle, ${color}20, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: `linear-gradient(135deg, ${color}35, ${color}10)`,
            border: `1px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 10px ${color}20`,
            flexShrink: 0,
          }}>
            <Brain size={20} color={color} style={{ animation: 'pulse 3s infinite' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              AI Advisor <Sparkles size={13} color={color} />
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'blink 1.5s infinite' }} />
              <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stress Engine Active</span>
            </div>
          </div>
        </div>

        {stressScenario && (
          <button
            onClick={() => setStressScenario(null)}
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#94a3b8',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              padding: '4px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
          >
            Clear Stress
          </button>
        )}
      </div>

      {/* Chat Messages Frame */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: 280,
          paddingRight: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          marginBottom: 16,
          scrollbarWidth: 'thin',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              width: '100%',
            }}
          >
            <div style={{
              display: 'flex',
              gap: 10,
              maxWidth: '85%',
              alignItems: 'flex-start',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
            }}>
              {/* Avatar */}
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: msg.sender === 'user' ? '#4f46e5' : `${color}20`,
                border: msg.sender === 'user' ? 'none' : `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: msg.sender === 'user' ? '#fff' : color,
                flexShrink: 0,
              }}>
                {msg.sender === 'user' ? <User size={13} /> : <Bot size={13} />}
              </div>

              {/* Bubble Body */}
              <div style={{
                background: msg.sender === 'user'
                  ? `linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)`
                  : 'rgba(30, 41, 59, 0.45)',
                border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: msg.sender === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                padding: '12px 14px',
                boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(79,70,229,0.2)' : 'none',
              }}>
                <p style={{
                  fontSize: 12.5,
                  color: msg.sender === 'user' ? '#fff' : '#cbd5e1',
                  lineHeight: 1.6,
                  margin: 0,
                  whiteSpace: 'pre-line',
                }}>
                  {msg.text}
                </p>

                {/* Gemini source badge */}
                {msg.sender === 'ai' && msg.source === 'gemini' && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 8,
                    background: 'linear-gradient(90deg, rgba(56,189,248,0.08), rgba(167,139,250,0.08))',
                    border: '1px solid rgba(167,139,250,0.2)',
                    borderRadius: 20,
                    padding: '2px 8px',
                  }}>
                    <Sparkles size={9} color="#a78bfa" />
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.04em' }}>
                      Gemini AI
                    </span>
                  </div>
                )}

                {/* Optional Message Action Button */}
                {msg.action && (
                  <button
                    disabled={msg.action.completed}
                    onClick={msg.action.onClick}
                    style={{
                      marginTop: 10,
                      background: msg.action.completed ? 'rgba(52,211,153,0.1)' : `linear-gradient(90deg, ${color}, #a78bfa)`,
                      border: msg.action.completed ? '1px solid rgba(52,211,153,0.3)' : 'none',
                      color: msg.action.completed ? '#34d399' : '#000',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: msg.action.completed ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!msg.action?.completed) {
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!msg.action?.completed) {
                        e.currentTarget.style.transform = 'none'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    {msg.action.completed ? <CheckCircle size={12} /> : null}
                    {msg.action.label}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: `${color}15`,
              border: `1px solid ${color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: color,
            }}>
              <Bot size={13} />
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.35)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px 16px 16px 16px', padding: '12px 16px', display: 'flex', gap: 4 }}>
              <span className="dot" style={{ width: 6, height: 6, background: color, borderRadius: '50%', animation: 'bounce 1.4s infinite 0s' }} />
              <span className="dot" style={{ width: 6, height: 6, background: color, borderRadius: '50%', animation: 'bounce 1.4s infinite 0.2s' }} />
              <span className="dot" style={{ width: 6, height: 6, background: color, borderRadius: '50%', animation: 'bounce 1.4s infinite 0.4s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Simulation Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Execute Macro Stress Simulations
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button
            onClick={() => handleSimulate('tech-selloff')}
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 20,
              background: stressScenario === 'tech-selloff' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.03)',
              border: stressScenario === 'tech-selloff' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
              color: stressScenario === 'tech-selloff' ? '#fca5a5' : '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (stressScenario !== 'tech-selloff') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
            }}
            onMouseLeave={(e) => {
              if (stressScenario !== 'tech-selloff') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
            }}
          >
            Tech Sell-off (−15%)
          </button>
          <button
            onClick={() => handleSimulate('market-crash')}
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 20,
              background: stressScenario === 'market-crash' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.03)',
              border: stressScenario === 'market-crash' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
              color: stressScenario === 'market-crash' ? '#fca5a5' : '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (stressScenario !== 'market-crash') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
            }}
            onMouseLeave={(e) => {
              if (stressScenario !== 'market-crash') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
            }}
          >
            2008 Market Crash (−30%)
          </button>
          <button
            onClick={() => handleSimulate('ai-boom')}
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 20,
              background: stressScenario === 'ai-boom' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.03)',
              border: stressScenario === 'ai-boom' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
              color: stressScenario === 'ai-boom' ? '#a7f3d0' : '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (stressScenario !== 'ai-boom') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
            }}
            onMouseLeave={(e) => {
              if (stressScenario !== 'ai-boom') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
            }}
          >
            AI Super-Cycle (+20%)
          </button>
          <button
            onClick={() => handleSimulate('rebalance')}
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 20,
              background: stressScenario === 'rebalance' ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
              border: stressScenario === 'rebalance' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
              color: stressScenario === 'rebalance' ? '#38bdf8' : '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (stressScenario !== 'rebalance') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
            }}
            onMouseLeave={(e) => {
              if (stressScenario !== 'rebalance') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
            }}
          >
            Tactical Rebalance
          </button>
          <button
            onClick={() => handleSimulate('pitch')}
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 20,
              background: 'rgba(167,139,250,0.08)',
              border: '1px solid rgba(167,139,250,0.3)',
              color: '#d8b4fe',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(167,139,250,0.18)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(167,139,250,0.08)'
            }}
          >
            Draft Client Slides Pitch
          </button>
        </div>
      </div>

      {/* Input Form Box */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, position: 'relative' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question about the portfolio structure..."
          style={{
            flex: 1,
            height: 40,
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '0 16px',
            fontSize: 12.5,
            color: '#fff',
            outline: 'none',
            fontFamily: 'Outfit, sans-serif',
            transition: 'all 0.2s',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = color}
          onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
        <button
          type="submit"
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${color}, #a78bfa)`,
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <Send size={14} />
        </button>
      </form>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}

export default AIInsightCard
