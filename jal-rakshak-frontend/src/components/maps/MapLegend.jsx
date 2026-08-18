import React from 'react'
import { Shield, Home, AlertTriangle, Flame, LifeBuoy } from 'lucide-react'

export default function MapLegend() {
  return (
    <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200 text-xs space-y-2">
      <div className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-1.5">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-brand-600" />
          <span>GIS Intelligence Legend</span>
        </span>
      </div>

      {/* Severity Color Swatches */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Inundation Risk Zones
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-red-500/60 border border-red-600"></span>
            <span className="text-[11px] text-slate-700">Critical (&gt;1.5m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-orange-500/50 border border-orange-600"></span>
            <span className="text-[11px] text-slate-700">High (0.8-1.5m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-500/40 border border-amber-600"></span>
            <span className="text-[11px] text-slate-700">Medium (0.3-0.8m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500/30 border border-emerald-600"></span>
            <span className="text-[11px] text-slate-700">Safe High Ground</span>
          </div>
        </div>
      </div>

      {/* Markers Legend */}
      <div className="border-t border-slate-100 pt-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Map Entities
        </span>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
            <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center">
              <Flame className="w-2.5 h-2.5" />
            </span>
            <span>Active SOS Beacon (Pulsing)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
            <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
              <Home className="w-2.5 h-2.5" />
            </span>
            <span>Relief Shelter / Evac Camp</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
              <AlertTriangle className="w-2.5 h-2.5" />
            </span>
            <span>Citizen Hazard Report</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <LifeBuoy className="w-2.5 h-2.5" />
            </span>
            <span>Deployed Rescue Boat Unit</span>
          </div>
        </div>
      </div>
    </div>
  )
}
