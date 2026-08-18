import React from 'react'
import { Layers, Locate, Clock, Eye, EyeOff } from 'lucide-react'

export default function MapControls({
  layers,
  setLayers,
  selectedTime,
  setSelectedTime,
  onLocateUser,
}) {
  const timeSteps = [
    { id: 'NOW', label: 'Now (Live)', rain: '42mm' },
    { id: '+3h', label: '+3 Hours', rain: '65mm' },
    { id: '+6h', label: '+6h (Peak)', rain: '80mm' },
    { id: '+12h', label: '+12 Hours', rain: '35mm' },
    { id: '+24h', label: '+24 Hours', rain: '8mm' },
  ]

  const toggleLayer = (key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-2">
      {/* Time-lapse Slider Controls */}
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <Clock className="w-3.5 h-3.5 text-brand-600" />
            <span>Forecast Time Horizon</span>
          </span>
          <button
            onClick={onLocateUser}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-[11px] transition"
            title="Center on my location"
          >
            <Locate className="w-3 h-3" />
            <span>Locate Me</span>
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1">
          {timeSteps.map((step) => (
            <button
              key={step.id}
              onClick={() => setSelectedTime(step.id)}
              className={`py-1.5 px-1 rounded-xl text-center transition flex flex-col items-center justify-center ${
                selectedTime === step.id
                  ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="text-[11px] font-semibold truncate w-full">{step.id}</span>
              <span className="text-[9px] opacity-80">{step.rain}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Layer Toggles */}
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
          <Layers className="w-3.5 h-3.5 text-brand-600" />
          <span>GIS Data Layers</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => toggleLayer('zones')}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition ${
              layers.zones
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
            }`}
          >
            <span>Flood Zones</span>
            {layers.zones ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>

          <button
            onClick={() => toggleLayer('shelters')}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition ${
              layers.shelters
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
            }`}
          >
            <span>Shelters</span>
            {layers.shelters ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>

          <button
            onClick={() => toggleLayer('emergencies')}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition ${
              layers.emergencies
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
            }`}
          >
            <span>SOS Distresses</span>
            {layers.emergencies ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>

          <button
            onClick={() => toggleLayer('reports')}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition ${
              layers.reports
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
            }`}
          >
            <span>Citizen Reports</span>
            {layers.reports ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  )
}
