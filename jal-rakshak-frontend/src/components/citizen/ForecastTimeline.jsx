import React from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { CloudRain, Waves, AlertTriangle } from 'lucide-react'

export default function ForecastTimeline({ forecast = [] }) {
  if (!forecast || forecast.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 text-center py-10 text-xs text-slate-500">
        <Waves className="w-8 h-8 mx-auto text-slate-300 mb-2 animate-pulse" />
        <p className="font-bold text-slate-700">Predictive Hydrograph Timeline</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Hydrological runoff forecast for this coordinate is synchronizing...
        </p>
      </div>
    )
  }

  const chartData = forecast.map((f) => ({
    time: f.timeLabel || f.time,
    rainMm: f.rainMm !== undefined ? f.rainMm : 0,
    waterLevel: f.waterLevel !== undefined ? f.waterLevel : 0,
    riskScore: f.riskScore !== undefined ? f.riskScore : 0,
  }))

  const waterLevels = chartData.map((d) => d.waterLevel).filter((v) => typeof v === 'number' && !isNaN(v))
  const minWater = waterLevels.length ? Math.max(0, Math.floor(Math.min(...waterLevels) - 1)) : 20
  const maxWater = waterLevels.length ? Math.ceil(Math.max(...waterLevels) + 1) : 30

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-100 text-brand-700">
              <Waves className="w-4 h-4" />
            </span>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              24-Hour Hydrograph & Inundation Surge Forecast
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Predictive AI correlation between catchment runoff and precipitation intensity
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className="flex items-center gap-1 font-semibold text-brand-600">
            <span className="w-3 h-3 rounded-full bg-brand-500"></span> Water Level (Meters)
          </span>
          <span className="flex items-center gap-1 font-semibold text-cyan-500">
            <span className="w-3 h-3 rounded bg-cyan-400"></span> Rain (mm/hr)
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-72 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
            <YAxis
              yAxisId="water"
              domain={[minWater, maxWater]}
              stroke="#0284C7"
              fontSize={11}
              tickFormatter={(v) => `${v}m`}
            />
            <YAxis
              yAxisId="rain"
              orientation="right"
              domain={[0, 100]}
              stroke="#06B6D4"
              fontSize={11}
              tickFormatter={(v) => `${v}mm`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-800">
                      <p className="font-bold text-brand-300 mb-1">{label} Forecast Point</p>
                      <p className="text-slate-300">
                        River / Runoff Level: <strong className="text-white">{data.waterLevel}m</strong>
                      </p>
                      <p className="text-slate-300">
                        Rainfall: <strong className="text-cyan-300">{data.rainMm} mm/hr</strong>
                      </p>
                      <p className="text-slate-300">
                        Predicted Risk: <strong className="text-red-400">{data.riskScore}/100</strong>
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar yAxisId="rain" dataKey="rainMm" fill="#38BDF8" radius={[4, 4, 0, 0]} maxBarSize={30} opacity={0.65} />
            <Area
              yAxisId="water"
              type="monotone"
              dataKey="waterLevel"
              stroke="#0284C7"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#waterGradient)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly Forecast Pills */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-4 border-t border-slate-100">
        {forecast.map((f, i) => (
          <div
            key={i}
            className={`p-2.5 rounded-xl border text-center transition ${
              f.status === 'CRITICAL'
                ? 'bg-red-50/70 border-red-200 text-red-900'
                : f.status === 'HIGH'
                ? 'bg-orange-50/70 border-orange-200 text-orange-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <span className="text-[11px] font-bold block">{f.time}</span>
            <span className="text-xs font-extrabold mt-0.5 block">{f.waterLevel}m</span>
            <span className="text-[10px] text-slate-500 font-medium">{f.rainMm} mm</span>
          </div>
        ))}
      </div>
    </div>
  )
}
