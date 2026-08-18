import React from 'react'
import { Waves } from 'lucide-react'

export default function Loading({ message = 'Loading intelligence telemetry...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin"></div>
        <Waves className="w-6 h-6 text-brand-600 absolute animate-pulse" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600 animate-pulse">{message}</p>
    </div>
  )
}
