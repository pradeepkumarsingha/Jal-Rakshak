import React from 'react'
import { Link } from 'react-router-dom'
import { Bot, User, BookOpen, AlertCircle, Phone, ArrowUpRight, Flame } from 'lucide-react'

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
          <div className="whitespace-pre-line text-left">
            {message.text}
          </div>

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
