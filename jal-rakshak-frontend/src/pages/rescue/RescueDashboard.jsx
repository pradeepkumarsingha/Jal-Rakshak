import React from 'react'
import { Link } from 'react-router-dom'
import { useFloodData } from '../../context/FloodDataContext'
import { useAuth } from '../../context/AuthContext'
import FloodRiskMap from '../../components/maps/FloodRiskMap'
import AssignmentCard from '../../components/rescue/AssignmentCard'
import {
  LifeBuoy,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  Flame,
  Radio,
  Navigation,
  Shield,
  Activity,
} from 'lucide-react'

export default function RescueDashboard() {
  const { user } = useAuth()
  const { emergencies, rescueTeams, updateEmergencyStatus } = useFloodData()

  const myTeam = rescueTeams.find((t) => t.id === 'TEAM-NDRF-07') || rescueTeams[0]
  const activeMissions = emergencies.filter(
    (e) => e.status === 'IN_PROGRESS' || e.status === 'DISPATCHED' || e.status === 'ON_SCENE'
  )

  const handleUpdateStatus = (id, status) => {
    updateEmergencyStatus(id, status)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Field Rescue Unit Operational Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
            {myTeam.name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Commander: <strong className="text-slate-200">{myTeam.commander}</strong> • Base: {myTeam.currentLocation} • Status: <span className="text-emerald-400 font-bold">{myTeam.status}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/rescue/assignments"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>View Active Missions ({activeMissions.length})</span>
          </Link>
        </div>
      </div>

      {/* Equipment & Unit Readiness Card */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Tactical Equipment Manifest & Readiness
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Primary Craft</span>
            <strong className="text-white text-xs mt-0.5 block">{myTeam.unitType}</strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Boat Extraction Capacity</span>
            <strong className="text-white text-xs mt-0.5 block">{myTeam.capacityPersons} Persons / Trip</strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Comms Frequency</span>
            <strong className="text-emerald-400 font-mono text-xs mt-0.5 block">VHF Ch 16 (156.8 MHz)</strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Helpline Callback</span>
            <strong className="text-cyan-400 text-xs mt-0.5 block">{myTeam.phone}</strong>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-slate-800">
          {myTeam.equipment?.map((eq, i) => (
            <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
              ✓ {eq}
            </span>
          ))}
        </div>
      </div>

      {/* Main Grid: Active Missions & Tactical Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tactical Map */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Tactical Mission GPS & Flood Hazards</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              UNIT RADAR ACTIVE
            </span>
          </div>

          <FloodRiskMap height="500px" center={[20.4782, 85.8621]} zoom={13} showControls={true} />
        </div>

        {/* Assigned Missions Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              <span>Assigned Extraction Missions</span>
            </h3>
            <Link to="/rescue/assignments" className="text-xs font-bold text-emerald-400 hover:underline">
              All Missions &rarr;
            </Link>
          </div>

          {activeMissions.length === 0 ? (
            <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs">
              No active distress missions currently assigned to this unit.
            </div>
          ) : (
            activeMissions.slice(0, 2).map((m) => (
              <AssignmentCard key={m.id} mission={m} onUpdateStatus={handleUpdateStatus} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
