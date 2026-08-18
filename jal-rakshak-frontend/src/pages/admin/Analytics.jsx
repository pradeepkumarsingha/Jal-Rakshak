import React from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import { BarChart3, Download, Sparkles, TrendingUp, ShieldCheck, Activity } from 'lucide-react'

export default function Analytics() {
  const modelAccuracyData = [
    { time: '00:00', actual: 25.10, aiPredicted: 25.08, errorMargin: 0.02 },
    { time: '03:00', actual: 25.45, aiPredicted: 25.40, errorMargin: 0.05 },
    { time: '06:00', actual: 25.90, aiPredicted: 25.92, errorMargin: 0.02 },
    { time: '09:00', actual: 26.35, aiPredicted: 26.40, errorMargin: 0.05 },
    { time: '12:00', actual: 26.85, aiPredicted: 26.80, errorMargin: 0.05 },
    { time: '15:00', actual: 27.10, aiPredicted: 27.15, errorMargin: 0.05 },
  ]

  const districtInundationData = [
    { district: 'Cuttack', affectedPop: 34500, rescued: 12400, inShelter: 18200 },
    { district: 'Kendrapara', affectedPop: 28000, rescued: 8900, inShelter: 14500 },
    { district: 'Puri', affectedPop: 15800, rescued: 5200, inShelter: 8900 },
    { district: 'Jagatsinghpur', affectedPop: 19200, rescued: 6100, inShelter: 11200 },
    { district: 'Bhubaneswar', affectedPop: 8500, rescued: 2800, inShelter: 4500 },
  ]

  const handleExportSitrep = () => {
    alert('Jal Rakshak Situation Report (SITREP-OD-2026-08) exported as official PDF.')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
            Machine Learning & Disaster Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
            Flood Hydrograph AI Performance & Metrics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Validation of Deep Neural Network forecast accuracy against Central Water Commission sensor telemetry.
          </p>
        </div>

        <button
          onClick={handleExportSitrep}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
        >
          <Download className="w-4 h-4" />
          <span>Export NDMA Situation Report (PDF)</span>
        </button>
      </div>

      {/* Model Accuracy Chart */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="font-extrabold text-base text-white">
                Hydro-Neural Model: Observed CWC Telemetry vs AI Inflow Prediction
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Mean Absolute Error: <strong>±0.038 meters (98.4% Accuracy)</strong></p>
          </div>
          <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold">
            98.4% R² Score
          </span>
        </div>

        <div className="h-64 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={modelAccuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
              <YAxis domain={[24.5, 28]} stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}m`} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="actual" stroke="#06B6D4" strokeWidth={3} name="Observed CWC Sensor Level (m)" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="aiPredicted" stroke="#A855F7" strokeWidth={3} strokeDasharray="4 4" name="Jal Rakshak AI Predicted (m)" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District Affected vs Rescued Breakdown */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-white">Multi-District Evacuation & Rescue Progress</h3>
          <p className="text-xs text-slate-400 mt-0.5">Estimated population at risk vs confirmed rescued / sheltered headcounts</p>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={districtInundationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="district" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="affectedPop" fill="#EF4444" name="Estimated At Risk" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rescued" fill="#10B981" name="Rescued by Boat/Air" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inShelter" fill="#8B5CF6" name="Safely in Relief Camps" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
