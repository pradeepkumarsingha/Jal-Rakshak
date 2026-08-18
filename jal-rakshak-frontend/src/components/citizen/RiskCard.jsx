import React from 'react'
import { getSeverityInfo } from '../../utils/helpers'
import { AlertTriangle, CloudRain, Droplets, Gauge, ShieldAlert, ArrowUpRight } from 'lucide-react'

export default function RiskCard({
  riskScore = 88,
  location = 'Cuttack, Odisha',
  factors = [
    { name: 'Upstream Inflow (Hirakud Reservoir)', value: 'Heavy (+14%)', impact: 'HIGH' },
    { name: 'Soil Saturation Index', value: '92% Saturated', impact: 'HIGH' },
    { name: 'High Tide Backflow Surge', value: '+0.8m Backwater', impact: 'MEDIUM' },
    { name: 'Drainage Channel Siltation', value: '45% Choked', impact: 'MEDIUM' },
  ],
  lastUpdated = new Date(),
}) {
  const severity = getSeverityInfo(riskScore)

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 relative overflow-hidden">
      {/* Top Accent Gradient Border */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: severity.color }}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Score & Gauge */}
        <div className="flex items-center gap-5">
          {/* Radial Circular Meter */}
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3.8"
                strokeDasharray={`${riskScore}, 100`}
                strokeLinecap="round"
                stroke={severity.color}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-slate-900 leading-none">
                {riskScore}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={severity.badgeClass}>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{severity.level} RISK</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Auto AI Telemetry</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
              {location}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Predicted Inundation: <strong className="text-slate-800">1.45 meters in next 4h</strong>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Updated: {new Date(lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Right Side: Contributing Environmental Factors */}
        <div className="md:max-w-md w-full bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Key Risk Drivers (Neural Hydro-Model)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {factors.map((f, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
                <span className="text-slate-600 truncate mr-2 font-medium">{f.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                  f.impact === 'HIGH' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
