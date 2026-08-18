import React from 'react'
import { getSeverityInfo, formatTimeAgo } from '../../utils/helpers'
import { Flame, Users, Clock, MapPin, CheckCircle2, Navigation, AlertCircle, Phone } from 'lucide-react'

export default function EmergencyCard({ emergency, onAction, actionLabel = 'Respond' }) {
  if (!emergency) return null

  const severity = getSeverityInfo(emergency.priorityScore || 90)

  const steps = [
    { key: 'PENDING_ASSIGNMENT', label: 'Transmitted' },
    { key: 'DISPATCHED', label: 'Dispatched' },
    { key: 'ON_SCENE', label: 'On Scene' },
    { key: 'RESCUED', label: 'Rescued' },
  ]

  const getCurrentStepIndex = () => {
    switch (emergency.status) {
      case 'PENDING_ASSIGNMENT': return 0
      case 'DISPATCHED':
      case 'IN_PROGRESS': return 1
      case 'ON_SCENE': return 2
      case 'RESCUED':
      case 'CLOSED': return 3
      default: return 0
    }
  }

  const currentIdx = getCurrentStepIndex()

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-red-100 text-red-600">
            <Flame className="w-4 h-4" />
          </span>
          <div>
            <span className="text-[10px] font-bold text-slate-400 font-mono">{emergency.id}</span>
            <h4 className="font-extrabold text-sm text-slate-900 leading-none">{emergency.category}</h4>
          </div>
        </div>

        <span className={severity.badgeClass}>
          {emergency.priority} ({emergency.priorityScore}/100)
        </span>
      </div>

      {/* Location & Time */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1 truncate max-w-[70%]">
          <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          <strong className="text-slate-700">{emergency.location}</strong>
        </span>
        <span className="flex items-center gap-1 shrink-0 text-[11px]">
          <Clock className="w-3 h-3" /> {formatTimeAgo(emergency.timestamp)}
        </span>
      </div>

      {/* Description & Water Depth */}
      <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
        <p className="text-slate-700 font-medium">"{emergency.description}"</p>
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
          <span>Water Depth: <strong className="text-red-700">{emergency.waterDepth}</strong></span>
          <span className="flex items-center gap-1 font-semibold text-slate-800">
            <Users className="w-3 h-3 text-brand-600" /> {emergency.peopleCount} Stranded
          </span>
        </div>
      </div>

      {/* Mission Workflow Stepper */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          {steps.map((step, idx) => {
            const completed = idx <= currentIdx
            const active = idx === currentIdx
            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    completed
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-100'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {completed ? '✓' : idx + 1}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${active ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Footer */}
      {onAction && (
        <div className="mt-4 flex items-center justify-between gap-2">
          {emergency.contactPhone && (
            <a
              href={`tel:${emergency.contactPhone}`}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> {emergency.contactName}
            </a>
          )}
          <button
            onClick={() => onAction(emergency)}
            className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition shadow"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  )
}
