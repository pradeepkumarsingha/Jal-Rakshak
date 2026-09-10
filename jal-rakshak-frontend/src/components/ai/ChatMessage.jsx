import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bot,
  User,
  BookOpen,
  AlertCircle,
  Phone,
  ArrowUpRight,
  Flame,
  MapPin,
  Navigation,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ShieldCheck,
} from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'

export default function ChatMessage({ message }) {
  const isBot = message.sender === 'bot'
  const [copied, setCopied] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return

    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    const cleanText = (message.text || '').replace(/[#*`_]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.0
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  return (
    <div className={`flex gap-2 sm:gap-3.5 group ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}>
      {/* Avatar with status glow */}
      <div
        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm sm:shadow-md transition transform group-hover:scale-105 ${
          isBot
            ? 'bg-gradient-to-tr from-brand-900 via-brand-700 to-cyan-500 text-white ring-2 ring-cyan-500/20'
            : 'bg-gradient-to-tr from-slate-900 to-slate-700 text-white ring-2 ring-slate-400/20'
        }`}
      >
        {isBot ? <Bot className="w-4 h-4 sm:w-5 sm:h-5" /> : <User className="w-4 h-4 sm:w-5 sm:h-5" />}
      </div>

      {/* Bubble Content */}
      <div className={`max-w-[94%] sm:max-w-[85%] space-y-1.5 sm:space-y-2 ${isBot ? 'text-left' : 'text-right'}`}>
        <div
          className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-xs sm:text-sm leading-relaxed transition-all ${
            isBot
              ? 'bg-white border border-slate-200/90 text-slate-800 shadow-xs hover:shadow-sm'
              : 'bg-gradient-to-br from-brand-600 via-brand-700 to-cyan-800 text-white shadow-sm'
          }`}
        >
          {/* Bot Tag Header */}
          {isBot && (
            <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-100 text-[10px] sm:text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 font-bold text-brand-950 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="truncate">Jal Rakshak Advisory</span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={handleSpeak}
                  title={speaking ? 'Stop speech' : 'Read aloud'}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-brand-600 transition cursor-pointer"
                >
                  {speaking ? <VolumeX className="w-3.5 h-3.5 text-cyan-600 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy response"
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-brand-600 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* SOS Urgent Alert Banner */}
          {isBot && message.sosAction && (
            <div className="mb-2.5 p-2.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-900 text-xs font-semibold flex items-center gap-2 animate-pulse text-left">
              <div className="w-5 h-5 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <strong className="text-red-700 block text-[11px] sm:text-xs">HIGH PRIORITY SOS BEACON:</strong>
                <p className="text-[10px] sm:text-[11px] text-red-800/90 leading-tight mt-0.5">Rescue units have been alerted with your coordinates.</p>
              </div>
            </div>
          )}

          {/* Render formatted message content */}
          <div className="text-left overflow-x-auto">
            {isBot ? (
              <MarkdownRenderer content={message.text} />
            ) : (
              <div className="whitespace-pre-line font-medium text-white text-xs sm:text-sm">
                {message.text}
              </div>
            )}
          </div>

          {/* Live Detected Relief Shelters Card */}
          {isBot && message.nearestShelters && message.nearestShelters.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-black tracking-wider text-brand-800 uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Nearby Relief Shelters</span>
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono">Live OpenStreetMap</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {message.nearestShelters.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between gap-2 hover:border-brand-500 hover:shadow-2xs transition"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h5 className="font-bold text-slate-900 text-xs line-clamp-1">{s.name}</h5>
                        <span className="shrink-0 text-[9px] bg-brand-50 text-brand-700 border border-brand-200/80 px-1.5 py-0.2 rounded-full font-mono font-bold">
                          {s.distance_km} km
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{s.address || s.type || 'High-Ground Shelter'}</span>
                      </p>
                    </div>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white py-1.5 px-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Evacuate Route</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Embedded Recommended Next Actions */}
          {message.suggestedActions && message.suggestedActions.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5 text-left">
              {message.suggestedActions.map((act, i) => {
                if (act.phone) {
                  return (
                    <a
                      key={i}
                      href={`tel:${act.phone}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 text-white text-[11px] sm:text-xs font-bold hover:bg-red-700 transition shadow-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{act.label}</span>
                    </a>
                  )
                }
                return (
                  <Link
                    key={i}
                    to={act.link}
                    className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition shadow-2xs ${
                      act.urgent
                        ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                        : 'bg-brand-50 text-brand-800 hover:bg-brand-100/90 border border-brand-200'
                    }`}
                  >
                    {act.urgent && <Flame className="w-3 h-3" />}
                    <span>{act.label}</span>
                    <ArrowUpRight className="w-3 h-3 text-brand-600" />
                  </Link>
                )
              })}
            </div>
          )}

          {/* Emergency Helplines Pill Bar */}
          {isBot && message.helplines && Object.keys(message.helplines).length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 text-left">
              {Object.entries(message.helplines).map(([k, v]) => (
                <a
                  key={k}
                  href={`tel:${v}`}
                  className="bg-red-50 hover:bg-red-100 border border-red-200/80 text-red-700 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-xl flex items-center gap-1 transition font-bold"
                >
                  <Phone className="w-2.5 h-2.5 text-red-600" />
                  <span>{k}: <span className="underline">{v}</span></span>
                </a>
              ))}
            </div>
          )}

          {/* Official Citations Footer */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 text-[9px] sm:text-[10px] text-slate-400 flex items-center gap-1 text-left">
              <BookOpen className="w-3 h-3 text-cyan-600 shrink-0" />
              <span className="truncate">Guidelines: {message.citations.join(' • ')}</span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-[9px] sm:text-[10px] text-slate-400 px-1.5 flex items-center gap-1.5 ${isBot ? 'justify-start' : 'justify-end'}`}>
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isBot && <span className="text-emerald-500 font-bold">• Verified</span>}
        </div>
      </div>
    </div>
  )
}
