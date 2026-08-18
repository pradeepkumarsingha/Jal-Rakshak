import React, { useState } from 'react'
import { useFloodData } from '../../context/FloodDataContext'
import { useAlert } from '../../context/AlertContext'
import { getSeverityInfo, formatTimeAgo } from '../../utils/helpers'
import {
  Flame,
  Search,
  Filter,
  Users,
  Shield,
  LifeBuoy,
  Phone,
  CheckCircle,
  Clock,
  ArrowUpDown,
} from 'lucide-react'

export default function EmergencyTable() {
  const { emergencies, rescueTeams, assignEmergency } = useFloodData()
  const { showToast } = useAlert()
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedSos, setSelectedSos] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState('')

  const filtered = emergencies
    .filter((e) => {
      if (filter === 'PENDING') return e.status === 'PENDING_ASSIGNMENT'
      if (filter === 'ACTIVE') return e.status === 'IN_PROGRESS' || e.status === 'DISPATCHED' || e.status === 'ON_SCENE'
      if (filter === 'RESCUED') return e.status === 'RESCUED' || e.status === 'CLOSED'
      return true
    })
    .filter(
      (e) =>
        e.location.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase()) ||
        e.id.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))

  const handleDispatch = (e) => {
    e.preventDefault()
    if (!selectedSos || !selectedTeam) return

    assignEmergency(selectedSos.id, selectedTeam)
    showToast({
      title: 'Rescue Squad Dispatched!',
      message: `${selectedTeam} assigned to ${selectedSos.id} (${selectedSos.location}).`,
      type: 'success',
    })
    setSelectedSos(null)
    setSelectedTeam('')
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Top Filter Bar */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            <span>Master SOS Triage & Tactical Allocation</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-victim distress queue ordered by AI Priority Severity Score
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search location or ID..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            {['ALL', 'PENDING', 'ACTIVE', 'RESCUED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filter === f ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-bold">Priority</th>
              <th className="py-3.5 px-4 font-bold">Request ID & Category</th>
              <th className="py-3.5 px-4 font-bold">Location & Depth</th>
              <th className="py-3.5 px-4 font-bold">Victims</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold">Assigned Unit</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No emergency requests match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((sos) => {
                const severity = getSeverityInfo(sos.priorityScore || 90)
                const isPending = sos.status === 'PENDING_ASSIGNMENT'
                return (
                  <tr key={sos.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${severity.bgClass} text-white shadow-xs`}>
                        {sos.priorityScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-400 text-[10px] block">{sos.id}</span>
                      <strong className="text-white text-xs">{sos.category}</strong>
                      <span className="text-[10px] text-slate-500 block">{formatTimeAgo(sos.timestamp)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-medium truncate max-w-[200px]">{sos.location}</div>
                      <div className="text-red-400 text-[11px]">Depth: {sos.waterDepth}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-white bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                        <Users className="w-3.5 h-3.5 text-brand-400" /> {sos.peopleCount}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isPending
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                          : sos.status === 'ON_SCENE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : sos.status === 'RESCUED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {sos.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-slate-300 font-medium">
                        {sos.assignedTeam || <em className="text-slate-500">Unassigned</em>}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isPending ? (
                        <button
                          onClick={() => setSelectedSos(sos)}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-md shadow-red-600/30"
                        >
                          Dispatch Team
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedSos(sos)}
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          Reassign
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Dispatch Modal Dialog */}
      {selectedSos && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h4 className="font-extrabold text-base flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-brand-400" />
                <span>Assign Rescue Squad to {selectedSos.id}</span>
              </h4>
              <button
                onClick={() => setSelectedSos(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-slate-400">Target Location:</p>
                <p className="text-white font-bold text-sm mt-0.5">{selectedSos.location}</p>
                <p className="text-slate-400 mt-2">Situation:</p>
                <p className="text-slate-200 mt-0.5">"{selectedSos.description}"</p>
                <p className="text-red-400 font-bold mt-2">Stranded: {selectedSos.peopleCount} individuals</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Select Field Unit / Battalion:
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Choose Rescue Team --</option>
                  {rescueTeams.map((team) => (
                    <option key={team.id} value={team.name}>
                      {team.name} ({team.unitType}) - Status: {team.status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedSos(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDispatch}
                disabled={!selectedTeam}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-red-600/30"
              >
                Confirm Dispatch & Alert Crew
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
