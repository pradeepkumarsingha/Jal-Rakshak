import React, { useState } from 'react'
import { Layers, Locate, Clock, Eye, EyeOff, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

export default function MapControls({
  layers,
  setLayers,
  selectedTime,
  setSelectedTime,
  onLocateUser,
}) {
  const [isExpanded, setIsExpanded] = useState(() => (typeof window !== 'undefined' ? window.innerWidth > 768 : true))
  const [activeTab, setActiveTab] = useState('ALL') // 'ALL' | 'FORECAST' | 'LAYERS'

  const timeSteps = [
    { id: 'NOW', label: 'NOW', rain: '42mm' },
    { id: '+3h', label: '+3h', rain: '65mm' },
    { id: '+6h', label: '+6h', rain: '80mm' },
    { id: '+12h', label: '+12h', rain: '35mm' },
    { id: '+24h', label: '+24h', rain: '8mm' },
  ]

  const toggleLayer = (key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const activeLayersCount = Object.values(layers).filter(Boolean).length

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl text-white text-xs overflow-hidden transition-all duration-300">
      {/* Header Bar with Minimize/Expand Toggle */}
      <div className="p-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 font-bold text-xs text-white hover:text-cyan-400 transition"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>GIS Controls</span>
          <span className="text-[10px] font-mono bg-slate-800 text-cyan-300 px-1.5 py-0.2 rounded font-normal">
            {selectedTime} • {activeLayersCount}/4
          </span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-1 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400" />}
        </button>

        <button
          onClick={onLocateUser}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-600/80 hover:bg-brand-600 text-white font-bold text-[11px] transition shadow-xs"
          title="Center on my location"
        >
          <Locate className="w-3 h-3" />
          <span>Locate Me</span>
        </button>
      </div>

      {/* Expandable Control Panel Body */}
      {isExpanded && (
        <div className="p-2.5 space-y-2.5 max-h-[380px] overflow-y-auto">
          {/* Forecast Time Horizon */}
          <div>
            <div className="flex items-center justify-between mb-1 text-[11px]">
              <span className="flex items-center gap-1 font-bold text-slate-300">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Forecast Time Horizon</span>
              </span>
              <span className="text-[10px] text-cyan-300 font-mono">Hydro-ML</span>
            </div>

            <div className="grid grid-cols-5 gap-1">
              {timeSteps.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setSelectedTime(step.id)}
                  className={`py-1 px-1 rounded-lg text-center transition flex flex-col items-center justify-center ${
                    selectedTime === step.id
                      ? 'bg-brand-600 text-white font-extrabold shadow-md shadow-brand-600/40 ring-1 ring-white/20'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-bold">{step.label}</span>
                  <span className="text-[9px] text-cyan-300/90">{step.rain}</span>
                </button>
              ))}
            </div>
          </div>

          {/* GIS Data Layers */}
          <div className="pt-1.5 border-t border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              GIS Layer Overlays:
            </span>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => toggleLayer('zones')}
                className={`flex items-center justify-between px-2 py-1 rounded-lg border text-[10px] font-bold transition ${
                  layers.zones
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-slate-800/50 text-slate-500 border-slate-700/50 line-through'
                }`}
              >
                <span>Flood Zones</span>
                {layers.zones ? <Eye className="w-3 h-3 text-red-400" /> : <EyeOff className="w-3 h-3" />}
              </button>

              <button
                type="button"
                onClick={() => toggleLayer('shelters')}
                className={`flex items-center justify-between px-2 py-1 rounded-lg border text-[10px] font-bold transition ${
                  layers.shelters
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-slate-800/50 text-slate-500 border-slate-700/50 line-through'
                }`}
              >
                <span>Shelters</span>
                {layers.shelters ? <Eye className="w-3 h-3 text-purple-400" /> : <EyeOff className="w-3 h-3" />}
              </button>

              <button
                type="button"
                onClick={() => toggleLayer('emergencies')}
                className={`flex items-center justify-between px-2 py-1 rounded-lg border text-[10px] font-bold transition ${
                  layers.emergencies
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800/50 text-slate-500 border-slate-700/50 line-through'
                }`}
              >
                <span>SOS Distresses</span>
                {layers.emergencies ? <Eye className="w-3 h-3 text-rose-400" /> : <EyeOff className="w-3 h-3" />}
              </button>

              <button
                type="button"
                onClick={() => toggleLayer('reports')}
                className={`flex items-center justify-between px-2 py-1 rounded-lg border text-[10px] font-bold transition ${
                  layers.reports
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800/50 text-slate-500 border-slate-700/50 line-through'
                }`}
              >
                <span>Citizen Reports</span>
                {layers.reports ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
