import React from 'react'
import ChatInterface from '../../components/ai/ChatInterface'
import { Bot } from 'lucide-react'

export default function AIChat() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col h-[calc(100vh-5rem)] max-h-[900px]">
      <div className="mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-brand-100 text-brand-700">
            <Bot className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Jal Rakshak AI Flood Advisor
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Ask questions in English, Hindi, or Odia about drinking water safety, river telemetry levels, nearest relief camps, and emergency procedures.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  )
}
