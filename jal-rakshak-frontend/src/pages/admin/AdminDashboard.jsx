import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFloodData } from '../../context/FloodDataContext'
import { useAlert } from '../../context/AlertContext'
import StatCard from '../../components/admin/StatCard'
import FloodRiskMap from '../../components/maps/FloodRiskMap'
import AlertBroadcastModal from '../../components/admin/AlertBroadcastModal'
import {
  ShieldAlert,
  Flame,
  Radio,
  Users,
  Home,
  LifeBuoy,
  FileCheck2,
  Send,
  BarChart3,
  Activity,
  Layers,
  Sparkles,
  Waves,
  Gauge,
  Clock,
  ArrowUpRight,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

export default function AdminDashboard() {
  const { emergencies, reports, shelters, rescueTeams, rivers, forecastTimeline } = useFloodData()
  const { alerts } = useAlert()
  const [broadcastOpen, setBroadcastOpen] = useState(false)

  const pendingSos = emergencies.filter((e) => e.status === 'PENDING_ASSIGNMENT' || e.status === 'PENDING').length
  const criticalZonesCount = 3
  const peopleAtRisk = '72,300'
  const deployedBoats = rescueTeams.filter((t) => t.status === 'DEPLOYED' || t.status === 'ON_MISSION' || t.status === 'ON_SCENE').length

  // Find real Hirakud Dam telemetry from rivers array
  const hirakudTelemetry = rivers.find((r) => r.id === 'hirakud-dam') || {
    name: 'Hirakud Dam (Sambalpur, Mahanadi)',
    currentLevel: 629.80,
    warningLevel: 628.00,
    dangerLevel: 630.00,
    inflow: '11.45 Lakh Cusecs',
    outflow: '11.20 Lakh Cusecs',
    gatesOpen: '28 / 64 Sluice Gates',
    capacityPct: 99.6,
    downstreamTransitTime: '~24h to Mundali / Naraj',
  }

  const reservoirData = [
    { time: '06:00', inflow: 9.8, outflow: 9.5, level: 628.4 },
    { time: '09:00', inflow: 10.4, outflow: 10.1, level: 628.9 },
    { time: '12:00', inflow: 11.2, outflow: 10.8, level: 629.3 },
    { time: '15:00', inflow: 11.45, outflow: 11.20, level: 629.8 },
    { time: '18:00 (Live)', inflow: 11.45, outflow: 11.20, level: 629.8 },
    { time: '21:00 (Est)', inflow: 10.9, outflow: 11.2, level: 629.6 },
  ]

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
            Odisha Disaster Operations Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
            Disaster Management Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Integrated multi-district flood telemetry, AI priority triage, and rescue boat deployment
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setBroadcastOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition animate-pulse"
          >
            <Radio className="w-4 h-4" />
            <span>Broadcast Emergency Warning</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Red Alerts"
          value={alerts.length || 2}
          subtitle="Mahanadi & Baitarani"
          icon={ShieldAlert}
          color="red"
          trend="up"
          trendValue="+2 New"
        />
        <StatCard
          title="Critical Inundation Zones"
          value={criticalZonesCount}
          subtitle="Bidanasi, Chauliaganj"
          icon={Layers}
          color="orange"
          trend="up"
          trendValue="Expanding"
        />
        <StatCard
          title="Population in Danger"
          value={peopleAtRisk}
          subtitle="Low-lying settlements"
          icon={Users}
          color="purple"
          trend="up"
          trendValue="Evacuating"
        />
        <StatCard
          title="Pending SOS Distress"
          value={pendingSos}
          subtitle="Awaiting boat dispatch"
          icon={Flame}
          color="red"
          trend="up"
          trendValue="Urgent"
        />
        <StatCard
          title="Deployed Rescue Boats"
          value={`${deployedBoats} / ${rescueTeams.length}`}
          subtitle="NDRF / SDRF / ODRAF"
          icon={LifeBuoy}
          color="emerald"
          trend="down"
          trendValue="Active"
        />
      </div>

      {/* Main Grid: Live GIS Map + Reservoir Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Live Situational GIS Map */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-400" />
              <span>Live Situational GIS Inundation Map</span>
            </h3>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
              GPS SATELLITE SYNC
            </span>
          </div>

          {/* Map with spacious 520px height and non-overlapping controls */}
          <div className="flex-1 w-full min-h-[500px] rounded-2xl overflow-hidden">
            <FloodRiskMap height="520px" zoom={13} showControls={true} />
          </div>
        </div>

        {/* Real Hirakud Dam Telemetry & Hydrograph */}
        <div className="lg:col-span-4 bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-cyan-400" />
                <span>Hirakud Dam Telemetry</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30">
                FRL: {hirakudTelemetry.currentLevel} ft / 630 ft
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Mahanadi Catchment Inflow vs Sluice Discharge Telemetry (CWC Odisha)
            </p>
          </div>

          {/* Hydrograph Inflow Area Chart */}
          <div className="h-44 w-full bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reservoirData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748B" fontSize={9} />
                <YAxis domain={[8, 13]} stroke="#64748B" fontSize={9} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="inflow" stroke="#06B6D4" fill="url(#inflowGrad)" strokeWidth={2} name="Inflow (Lakh Cusecs)" />
                <Area type="monotone" dataKey="outflow" stroke="#EC4899" fill="transparent" strokeWidth={2} strokeDasharray="3 3" name="Controlled Discharge" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Actual Dam Hydrological Status Indicators */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Sluice Gates Open:</span>
              <strong className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded">{hirakudTelemetry.gatesOpen}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Inflow Volume:</span>
              <strong className="text-cyan-400 font-bold">{hirakudTelemetry.inflow}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Controlled Discharge:</span>
              <strong className="text-rose-400 font-bold">{hirakudTelemetry.outflow}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Storage Capacity Level:</span>
              <strong className="text-amber-400 font-bold">{hirakudTelemetry.capacityPct || 99.6}% Full</strong>
            </div>
            <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800/80">
              <span className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Transit to Mundali:</span>
              </span>
              <strong className="text-slate-200 font-semibold text-[11px]">{hirakudTelemetry.downstreamTransitTime}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <Link
              to="/admin/emergencies"
              className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs text-center transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
            >
              <span>Open Live SOS Triage Queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Alert Broadcast Modal */}
      <AlertBroadcastModal isOpen={broadcastOpen} onClose={() => setBroadcastOpen(false)} />
    </div>
  )
}
