import React from 'react'

export default function PriorityBadge({ priority = 'CRITICAL', score = 95 }) {
  const getBadge = () => {
    if (priority === 'CRITICAL' || score >= 85) {
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    if (priority === 'HIGH' || score >= 65) {
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }
    if (priority === 'MEDIUM' || score >= 45) {
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    }
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getBadge()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
      <span>{priority} ({score} pts)</span>
    </span>
  )
}
