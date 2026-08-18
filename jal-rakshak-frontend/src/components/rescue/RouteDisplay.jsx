import React from 'react'
import { Navigation, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react'

export default function RouteDisplay({
  turnByTurn = [
    { instruction: 'Depart Bidanasi Basecamp via Elevated Ring Road', distance: '600m', safe: true },
    { instruction: 'Enter Riverfront Backwater Channel (Prepare 40HP Inflatable Boat)', distance: '1.2km', safe: true },
    { instruction: 'Caution: Submerged Power Line at Ward 4 junction', distance: '400m', safe: false },
    { instruction: 'Arrive at Rooftop Target Coordinates (20.4798° N, 85.8510° E)', distance: '300m', safe: true },
  ],
  warnings = [
    'Strong current (>2.5 m/s) near sluice outlet',
    'Low-hanging electric cables reported in sector',
  ],
  distanceKm = 2.5,
  etaMinutes = 12,
}) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 text-xs text-slate-300">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-extrabold text-white flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span>Tactical Rescue Waypoint Navigation</span>
        </span>
        <span className="font-mono text-emerald-400 font-bold">
          {distanceKm} km • ETA ~{etaMinutes} min
        </span>
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] text-amber-300 space-y-1">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Turn By Turn List */}
      <div className="space-y-2 pt-1">
        {turnByTurn.map((t, idx) => (
          <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <div className="flex-1">
              <p className="text-white font-medium text-xs leading-snug">{t.instruction}</p>
              <span className="text-[10px] text-slate-400">{t.distance}</span>
            </div>
            {t.safe ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
