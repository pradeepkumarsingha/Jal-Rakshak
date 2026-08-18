import React from 'react'
import ChatInterface from '../../components/ai/ChatInterface'
import { Bot, Sparkles, BookOpen, ShieldCheck } from 'lucide-react'

export default function AIChat() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-brand-100 text-brand-700">
            <Bot className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Jal Rakshak AI Flood Advisor
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ask questions in English, Hindi, or Odia about drinking water safety, river telemetry levels, nearest relief camps, and emergency procedures.
        </p>
      </div>

      <ChatInterface />
    </div>
  )
}
