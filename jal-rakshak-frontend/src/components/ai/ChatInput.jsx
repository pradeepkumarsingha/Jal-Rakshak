import React, { useState } from 'react'
import { Send, Mic, Sparkles } from 'lucide-react'

export default function ChatInput({ onSend, loading, placeholder = 'Ask Jal Rakshak AI...' }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || loading) return
    onSend(text)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className="w-full pl-4 pr-10 py-3.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm outline-none transition"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
          <Sparkles className="w-4 h-4" />
        </span>
      </div>

      <button
        type="submit"
        disabled={!text.trim() || loading}
        className="h-12 w-12 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white flex items-center justify-center transition shadow-md shadow-brand-600/30 shrink-0"
        title="Send Question"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}
