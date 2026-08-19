import React from 'react'
import { Link } from 'react-router-dom'
import { Bot, User, BookOpen, AlertCircle, Phone, ArrowUpRight, Flame, MapPin, Navigation } from 'lucide-react'

export default function ChatMessage({ message }) {
  const isBot = message.sender === 'bot'

  return (
    <div className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
          isBot
            ? 'bg-gradient-to-tr from-brand-700 to-cyan-500 text-white'
            : 'bg-slate-800 text-white'
        }`}
      >
        {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Bubble Content */}
      <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${isBot ? 'text-left' : 'text-right'}`}>
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
            isBot
              ? 'bg-white border border-slate-200 text-slate-800 shadow-sm'
              : 'bg-brand-600 text-white shadow-md'
          }`}
        >
          {/* SOS Beacon Banner */}
          {isBot && message.sosAction && (
            <div className="mb-2.5 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2 animate-pulse text-left">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>SOS Beacon Triggered: High priority rescue incident flagged at your coordinates.</span>
            </div>
          )}

          <div className="whitespace-pre-line text-left">
            {message.text}
          </div>

          {/* Live Detected Shelters */}
          {isBot && message.nearestShelters && message.nearestShelters.length > 0 && (
            <div className="mt-3 flex flex-col gap-2 text-left">
              <span className="text-[10px] font-bold tracking-wider text-brand-600 uppercase">
                Live Detected Shelters (OpenStreetMap):
              </span>
              {message.nearestShelters.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col gap-1.5 hover:border-brand-500/40 transition"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-slate-800 text-xs">{s.name}</h4>
                    <span className="text-[11px] bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full font-mono font-semibold">
                      {s.distance_km} km away
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{s.address || s.type}</span>
                  </p>
                  <div className="flex gap-2 pt-1 border-t border-slate-200/50 mt-1">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 bg-brand-600 hover:bg-brand-500 text-white py-1 px-2 rounded-lg text-[11px] font-bold transition shadow-xs"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Get Safe Route</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Embedded Suggested Actions */}
          {message.suggestedActions && message.suggestedActions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-left">
              {message.suggestedActions.map((act, i) => {
                if (act.phone) {
                  return (
                    <a
                      key={i}
                      href={`tel:${act.phone}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shadow"
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
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow ${
                      act.urgent
                        ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                        : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
                    }`}
                  >
                    {act.urgent && <Flame className="w-3.5 h-3.5" />}
                    <span>{act.label}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                )
              })}
            </div>
          )}

          {/* Helplines */}
          {isBot && message.helplines && Object.keys(message.helplines).length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5 text-left">
              {Object.entries(message.helplines).map(([k, v]) => (
                <a
                  key={k}
                  href={`tel:${v}`}
                  className="bg-red-50 hover:bg-red-100/80 border border-red-200/60 text-red-700 text-[11px] px-2 py-1 rounded-lg flex items-center gap-1 transition shadow-2xs font-semibold"
                >
                  <Phone className="w-2.5 h-2.5" />
                  <span>{k}: <strong>{v}</strong></span>
                </a>
              ))}
            </div>
          )}

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1.5 text-left">
              <BookOpen className="w-3 h-3 text-brand-600 shrink-0" />
              <span className="truncate">Citations: {message.citations.join(' • ')}</span>
            </div>
          )}
        </div>

        <span className="text-[10px] text-slate-400 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
