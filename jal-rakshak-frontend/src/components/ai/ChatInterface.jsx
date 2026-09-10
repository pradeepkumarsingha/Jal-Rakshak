import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { assistantApi } from '../../services/assistantApi'
import { reverseGeocode } from '../../services/geocodeService'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import {
  Bot,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Flame,
  MapPin,
  CloudRain,
  RefreshCw,
  Trash2,
  Droplets,
  LifeBuoy,
  PhoneCall,
  Activity,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ChatInterface({ onOpenIntel }) {
  const { t, language } = useLanguage()
  const [messages, setMessages] = useState([
    {
      id: 'm-1',
      sender: 'bot',
      text: `### Welcome to Jal Rakshak AI Flood Intelligence 🌊\n\nI am your 24/7 disaster response & flood telemetry AI advisor, integrated with **Open-Meteo GloFAS river discharge models**, **CWC Barrage Gauges**, and **NDMA Safety Guidelines**.\n\n**Ask me anything regarding:**\n- **Safe drinking water disinfection & boiling protocols**\n- **Live river discharge levels (Mahanadi, Brahmani, Baitarani)**\n- **Emergency evacuation routes & nearest relief shelters**\n- **NDRF rescue coordination and SOS distress procedures**\n\nSelect a topic below or type your emergency question.`,
      citations: ['NDMA Guidelines on Flood Management', 'Central Water Commission (CWC)', 'Open-Meteo GloFAS'],
      suggestedActions: [
        { label: 'Check Flood Risk Dashboard', link: '/dashboard' },
        { label: 'Find Verified Relief Shelter', link: '/shelters' },
        { label: 'Evacuation Route Planner', link: '/route' },
      ],
      timestamp: new Date().toISOString(),
    },
  ])

  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState({ latitude: 20.1983, longitude: 85.7144, label: 'Cuttack, Odisha' })
  const [locating, setLocating] = useState(false)
  const [liveWeather, setLiveWeather] = useState({ current_rain_mm: 4.2, wind_speed_kmh: 22, river_level: 'High Caution' })
  const messagesContainerRef = useRef(null)

  const topicCategories = [
    {
      icon: Droplets,
      title: 'Water Purification',
      desc: 'Boiling & chlorine dosage',
      prompt: 'How to purify flood water for safe drinking and what is the chlorine dosage?',
      color: 'from-blue-500/10 to-cyan-500/10 border-blue-200 text-blue-800',
    },
    {
      icon: Activity,
      title: 'River Discharge',
      desc: 'Mahanadi & Hirakud status',
      prompt: 'What is the live flood water discharge and barrage status in Mahanadi basin?',
      color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-800',
    },
    {
      icon: ShieldCheck,
      title: 'Relief Shelters',
      desc: 'Nearest safe high ground',
      prompt: 'Where is the nearest verified relief shelter with food and medical supplies?',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-800',
    },
    {
      icon: LifeBuoy,
      title: 'NDRF Rescue',
      desc: 'Rescue boat & SOS procedures',
      prompt: 'How do I request an NDRF evacuation boat if roads are submerged?',
      color: 'from-rose-500/10 to-red-500/10 border-rose-200 text-rose-800',
    },
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

  // Detect GPS and reverse-geocode to real location name
  const detectGPS = () => {
    if (navigator.geolocation) {
      setLocating(true)
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          let realPlaceName = `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`

          try {
            const geo = await reverseGeocode(lat, lng)
            if (geo && geo.shortName) {
              realPlaceName = geo.shortName
            }
          } catch {
            // fallback
          }

          setUserLocation({
            latitude: lat,
            longitude: lng,
            label: realPlaceName,
            address: realPlaceName,
          })
          setLocating(false)
        },
        () => {
          setLocating(false)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  }

  useEffect(() => {
    detectGPS()
  }, [])

  const handleClearChat = () => {
    if (window.confirm('Clear all conversation history?')) {
      setMessages([
        {
          id: `m-${Date.now()}`,
          sender: 'bot',
          text: 'Conversation cleared. How can I assist you with flood intelligence or emergency response?',
          citations: ['NDMA Guidelines'],
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }

  const handleSendMessage = async (text) => {
    if (!text || !text.trim()) return

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const data = await assistantApi.chat({
        message: text.trim(),
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
          text: '### Telemetry Connection Note\n\nLive assistant server is currently offline or unreachable. For immediate life-saving emergency support:\n\n- **National Disaster Helpline:** [1078](tel:1078)\n- **State Emergency Operations Center:** [1070](tel:1070)\n- **Police / Medical Emergency:** [112](tel:112)',
          citations: ['NDMA Standard Emergency Operating Procedure'],
          suggestedActions: [
            { label: 'Trigger Emergency SOS', link: '/emergency', urgent: true },
            { label: 'View Relief Shelters', link: '/shelters' },
          ],
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xl">
      {/* Top Tactical Command Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950 text-white px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-blue-400 flex items-center justify-center text-white shadow-md sm:shadow-lg shadow-cyan-500/20">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="font-extrabold text-xs sm:text-base text-white tracking-tight truncate">
                Jal Rakshak AI
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                <Sparkles className="w-2.5 h-2.5" />
                <span>RAG</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <button
                type="button"
                onClick={detectGPS}
                className="hover:text-cyan-300 flex items-center gap-1 font-mono text-[9px] sm:text-[10px] text-cyan-400 bg-slate-800/80 px-1.5 sm:px-2 py-0.5 rounded-md border border-slate-700 transition cursor-pointer max-w-[130px] sm:max-w-[220px] truncate"
                title="Click to refresh device location"
              >
                <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{locating ? 'Acquiring...' : userLocation.label || `${userLocation.latitude.toFixed(2)}, ${userLocation.longitude.toFixed(2)}`}</span>
                <RefreshCw className={`w-2.5 h-2.5 ml-0.5 shrink-0 ${locating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Right */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenIntel && (
            <button
              type="button"
              onClick={onOpenIntel}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              title="View Emergency Hotlines"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden xs:inline">Hotlines</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/80 border border-slate-800 transition cursor-pointer"
            title="Reset conversation"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <Link
            to="/emergency"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-extrabold transition shadow-md shadow-red-600/30 animate-pulse"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>SOS</span>
          </Link>
        </div>
      </div>

      {/* Emergency Advisory Disclaimer Strip */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] text-amber-900 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">
            <strong>Emergency:</strong> For immediate danger dial NDRF <strong>1078</strong> or <strong>112</strong>.
          </span>
        </div>
        <a
          href="tel:112"
          className="shrink-0 px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold uppercase transition"
        >
          Call 112
        </a>
      </div>

      {/* Live Telemetry Info Header */}
      {liveWeather && (
        <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs text-slate-300 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] whitespace-nowrap">
            <span className="flex items-center gap-1 text-cyan-400">
              <CloudRain className="w-3 h-3 text-cyan-400" />
              <span>Precip: <strong>{liveWeather.current_rain_mm} mm/h</strong></span>
            </span>
            <span className="text-slate-600">•</span>
            <span>Wind: <strong>{liveWeather.wind_speed_kmh} km/h</strong></span>
          </div>
          <span className="text-emerald-400 font-mono text-[9px] sm:text-[10px] flex items-center gap-1 shrink-0 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Active Telemetry</span>
          </span>
        </div>
      )}

      {/* Messages Thread */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4 bg-slate-50/50"
      >
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-2 sm:gap-3.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-brand-900 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 text-slate-600 text-xs flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.4s]" />
              <span className="font-semibold text-slate-700 ml-1 text-[11px] sm:text-xs">Querying flood intelligence...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Starter Topic Cards (shown when message count is small) */}
      {messages.length <= 2 && (
        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white border-t border-slate-100 shrink-0">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-600" />
            <span>Recommended Questions</span>
          </div>
          {/* Horizontal scroll on mobile, 2-column grid on larger screens */}
          <div className="flex sm:grid sm:grid-cols-2 gap-2 overflow-x-auto pb-1 no-scrollbar">
            {topicCategories.map((cat, idx) => {
              const Icon = cat.icon
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(cat.prompt)}
                  className={`shrink-0 w-[210px] sm:w-auto text-left p-2 sm:p-2.5 rounded-2xl border bg-gradient-to-br ${cat.color} hover:shadow-xs transition cursor-pointer flex items-center gap-2 active:scale-[0.98]`}
                >
                  <div className="p-1.5 rounded-xl bg-white shadow-2xs shrink-0">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-[11px] sm:text-xs leading-snug truncate">{cat.title}</h5>
                    <p className="text-[9px] sm:text-[10px] opacity-80 truncate">{cat.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-2 sm:p-3.5 bg-white border-t border-slate-200/80 shrink-0">
        <ChatInput onSend={handleSendMessage} loading={loading} placeholder={t('ai.inputPlaceholder') || 'Ask Jal Rakshak AI about flood safety, shelters, or water...'} />
      </div>
    </div>
  )
}
