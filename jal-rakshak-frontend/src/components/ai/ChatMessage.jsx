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
  CheckCircle2,
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
    <div className={`flex gap-3.5 group ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}>
      {/* Avatar with status glow */}
      <div
        className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition transform group-hover:scale-105 ${
          isBot
            ? 'bg-gradient-to-tr from-brand-900 via-brand-700 to-cyan-500 text-white ring-2 ring-cyan-500/20'
            : 'bg-gradient-to-tr from-slate-900 to-slate-700 text-white ring-2 ring-slate-400/20'
        }`}
      >
        {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>

      {/* Bubble Content */}
      <div className={`max-w-[90%] sm:max-w-[80%] space-y-2 ${isBot ? 'text-left' : 'text-right'}`}>
        <div
          className={`p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed transition-all ${
            isBot
              ? 'bg-white border border-slate-200/90 text-slate-800 shadow-sm hover:shadow-md'
              : 'bg-gradient-to-br from-brand-600 via-brand-700 to-cyan-800 text-white shadow-md'
          }`}
        >
          {/* Bot Tag Header */}
          {isBot && (
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 font-bold text-brand-950">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Jal Rakshak Advisory Intelligence</span>
              </div>
              <div className="flex items-center gap-1">
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
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-900 text-xs font-semibold flex items-center gap-2.5 animate-pulse text-left">
              <div className="w-6 h-6 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-red-700">HIGH PRIORITY SOS BEACON DETECTED:</strong>
                <p className="text-[11px] text-red-800/90 mt-0.5">Tactical rescue units and district administration have been notified for your current coordinates.</p>
              </div>
            </div>
          )}

          {/* Render formatted message content */}
          <div className="text-left">
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
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-wider text-brand-800 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Nearby Open Relief Shelters</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Live OpenStreetMap Telemetry</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {message.nearestShelters.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between gap-2 hover:border-brand-500 hover:shadow-sm transition"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h5 className="font-bold text-slate-900 text-xs line-clamp-1">{s.name}</h5>
                        <span className="shrink-0 text-[10px] bg-brand-50 text-brand-700 border border-brand-200/80 px-2 py-0.5 rounded-full font-mono font-bold">
                          {s.distance_km} km
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{s.address || s.type || 'Designated High-Ground Shelter'}</span>
                      </p>
                    </div>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white py-1.5 px-3 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Evacuate Safe Route</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Embedded Recommended Next Actions */}
          {message.suggestedActions && message.suggestedActions.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-left">
              {message.suggestedActions.map((act, i) => {
                if (act.phone) {
                  return (
                    <a
                      key={i}
                      href={`tel:${act.phone}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{act.label}</span>
                    </a>
                  )
                }
                return (
                  <Link
                    key={i}
                    to={act.link}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                      act.urgent
                        ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                        : 'bg-brand-50 text-brand-800 hover:bg-brand-100/90 border border-brand-200'
                    }`}
                  >
                    {act.urgent && <Flame className="w-3.5 h-3.5" />}
                    <span>{act.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-brand-600" />
                  </Link>
                )
              })}
            </div>
          )}

          {/* Emergency Helplines Pill Bar */}
          {isBot && message.helplines && Object.keys(message.helplines).length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5 text-left">
              {Object.entries(message.helplines).map(([k, v]) => (
                <a
                  key={k}
                  href={`tel:${v}`}
                  className="bg-red-50 hover:bg-red-100 border border-red-200/80 text-red-700 text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition font-bold"
                >
                  <Phone className="w-3 h-3 text-red-600" />
                  <span>{k}: <span className="underline">{v}</span></span>
                </a>
              ))}
            </div>
          )}

          {/* Official Citations Footer */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1.5 text-left">
              <BookOpen className="w-3 h-3 text-cyan-600 shrink-0" />
              <span className="truncate">Verified Guidelines: {message.citations.join(' • ')}</span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-[10px] text-slate-400 px-2 flex items-center gap-1.5 ${isBot ? 'justify-start' : 'justify-end'}`}>
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isBot && <span className="text-emerald-500 font-bold">• Verified</span>}
        </div>
      </div>
    </div>
  )
}
