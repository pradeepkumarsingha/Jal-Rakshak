import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Mic, MicOff, X, CornerDownLeft } from 'lucide-react'

export default function ChatInput({ onSend, loading, placeholder = 'Ask Jal Rakshak AI flood advisor...' }) {
  const [text, setText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition()
      recognizer.continuous = false
      recognizer.interimResults = false
      recognizer.lang = 'en-IN'

      recognizer.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript))
        setIsListening(false)
      }

      recognizer.onerror = () => setIsListening(false)
      recognizer.onend = () => setIsListening(false)

      recognitionRef.current = recognizer
    }
  }, [])

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch {
        setIsListening(false)
      }
    }
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    if (!text.trim() || loading) return
    onSend(text.trim())
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e) => {
    setText(e.target.value)
    // Auto-expand up to 120px
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  return (
    <div className="space-y-2">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 bg-slate-50/90 border border-slate-300/80 rounded-2xl p-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:bg-white transition-all shadow-xs"
      >
        <div className="relative flex-1 flex items-center min-h-[44px]">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={loading}
            className="w-full resize-none bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none leading-relaxed max-h-[120px]"
          />

          {text && (
            <button
              type="button"
              onClick={() => setText('')}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition shrink-0"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
          {/* Voice Input Button */}
          {window.SpeechRecognition || window.webkitSpeechRecognition ? (
            <button
              type="button"
              onClick={toggleSpeech}
              title={isListening ? 'Stop listening' : 'Speak your question'}
              className={`p-2.5 rounded-xl transition ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-slate-500 hover:text-brand-600 hover:bg-slate-200/60'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          ) : null}

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm shadow-brand-600/30 cursor-pointer disabled:cursor-not-allowed transform active:scale-95"
            title="Send (Press Enter)"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-600" />
          <span>Jal Rakshak AI • Live River Telemetry & NDMA Protocols</span>
        </span>
        <span className="hidden sm:inline font-mono text-[10px]">
          Press <kbd className="bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-bold text-[9px]">Enter ↵</kbd> to send
        </span>
      </div>
    </div>
  )
}
