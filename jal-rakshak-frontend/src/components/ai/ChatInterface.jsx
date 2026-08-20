import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { assistantApi } from '../../services/assistantApi'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { Bot, Sparkles, AlertTriangle, ShieldCheck, Flame, MapPin, CloudRain } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ChatInterface() {
  const { t, language } = useLanguage()
  const [messages, setMessages] = useState([
    {
      id: 'm-1',
      sender: 'bot',
      text: `Hello! I am **Jal Rakshak AI**, your real-time flood advisory intelligence assistant.\n\nYou can ask me about:\n- **Safe drinking water purification protocols**\n- **Live river levels & barrage discharge telemetry**\n- **Nearest relief shelters and evacuation routes**\n- **Emergency SOS rescue procedures**\n\nHow can I assist you right now?`,
      citations: ['NDMA Guidelines', 'Central Water Commission (CWC)'],
      suggestedActions: [
        { label: 'Check Flood Risk Dashboard', link: '/dashboard' },
        { label: 'Find Verified Relief Shelter', link: '/shelters' },
      ],
      timestamp: new Date().toISOString(),
    },
  ])

  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState({ latitude: 20.1983, longitude: 85.7144 })
  const [liveWeather, setLiveWeather] = useState(null)
  const messagesContainerRef = useRef(null)

  const suggestions = [
    'How to purify flood water for drinking?',
    'What is the live flood status in Cuttack today?',
    'Where is the nearest safe relief shelter with medical aid?',
    'What should I pack in an emergency flood go-bag?',
    'How do I request an NDRF rescue boat?',
  ]

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      })
    }
  }

  useEffect(() => {
    scrollToBottom('smooth')
  }, [messages, loading])

  // Detect Real Device GPS on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
        },
        (err) => {
          console.warn('GPS lookup failed, using fallback:', err.message)
        },
        { enableHighAccuracy: true, timeout: 8000 }
      )
    }
  }, [])

  const handleSendMessage = async (text) => {
    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const data = await assistantApi.chat({
        message: text,
        language,
        history: messages.slice(-4),
        location: userLocation,
      })

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply,
        citations: data.citations,
        suggestedActions: data.suggestedActions,
        nearestShelters: data.nearestShelters,
        helplines: data.helplines,
        sosAction: data.sosAction,
        liveWeather: data.liveWeather,
        timestamp: data.timestamp || new Date().toISOString(),
      }
      setMessages((prev) => [...prev, botMsg])

      if (data.liveWeather) {
        setLiveWeather(data.liveWeather)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: 'Unable to contact live telemetry server. For immediate life-saving assistance, call NDRF helpline 1078 or broadcast an SOS distress beacon.',
          citations: ['NDMA Standard Emergency Protocol'],
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[520px] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white">Jal Rakshak AI Advisor</h3>
              <span className="text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.2 rounded-full">
                Multilingual LLM
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>NDMA Protocol & CWC Knowledge Base</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-cyan-500" />
                GPS: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        <Link
          to="/emergency"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Launch SOS</span>
        </Link>
      </div>

      {/* Emergency Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-900 flex items-center gap-2 shrink-0">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Emergency Advisory:</strong> In immediate life-threatening situations, do not wait for chat. Trigger Emergency SOS or dial <strong>112 / 1078</strong> directly.
        </span>
      </div>

      {/* Live Weather Ticker */}
      {liveWeather && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs text-slate-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-cyan-400" />
            <span>
              Rainfall: <strong>{liveWeather.current_rain_mm} mm/hr</strong> • Wind: <strong>{liveWeather.wind_speed_kmh} km/h</strong>
            </span>
          </div>
          <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Real-Time Connected
          </span>
        </div>
      )}

      {/* Messages Thread (Scoped Scrollable Container) */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-slate-600 font-medium ml-1">Analyzing telemetry & guidelines...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions Chips */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Suggested:
        </span>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(s)}
            className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-medium border border-slate-200/80 transition shrink-0 cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <ChatInput onSend={handleSendMessage} loading={loading} placeholder={t('ai.inputPlaceholder')} />
      </div>
    </div>
  )
}
