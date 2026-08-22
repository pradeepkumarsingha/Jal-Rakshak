import React, { useState, useEffect, useCallback } from 'react'
import { emergencyApi } from '../../services/emergencyApi'
import { useAlert } from '../../context/AlertContext'
import { getSocket } from '../../services/socket'
import { getSeverityInfo, formatTimeAgo, formatLocationText } from '../../utils/helpers'
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
  RefreshCw,
  X,
  AlertTriangle,
} from 'lucide-react'

export default function EmergencyTable() {
  const { showToast } = useAlert()
  const [emergencies, setEmergencies] = useState([])
  const [availableTeams, setAvailableTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedSos, setSelectedSos] = useState(null)
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [estimatedEta, setEstimatedEta] = useState(18)
  const [dispatchNote, setDispatchNote] = useState('')
  const [dispatching, setDispatching] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [emList, teamList] = await Promise.all([
        emergencyApi.getAllRequests(),
        emergencyApi.getAvailableRescueTeams(),
      ])
      setEmergencies(Array.isArray(emList) ? emList : [])
      setAvailableTeams(Array.isArray(teamList) ? teamList : [])
    } catch (err) {
      console.warn('Error fetching emergency management data:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    const socket = getSocket()
    if (socket) {
      const handleNewEmergency = (newSos) => {
        setEmergencies((prev) => [newSos, ...prev])
        showToast({
          title: '🚨 NEW EMERGENCY SOS BEACON',
          message: `${newSos.priorityLevel || 'CRITICAL'} priority from ${newSos.address || 'Field Location'}.`,
          type: 'error',
        })
      }

      const handleEmergencyUpdated = (updated) => {
        setEmergencies((prev) =>
          prev.map((e) => (String(e._id || e.id) === String(updated.emergencyId || updated.id) ? { ...e, ...updated } : e))
        )
      }

      socket.on('emergency:new', handleNewEmergency)
      socket.on('emergency:assigned', handleEmergencyUpdated)
      socket.on('emergency:status-updated', handleEmergencyUpdated)

      return () => {
        socket.off('emergency:new', handleNewEmergency)
        socket.off('emergency:assigned', handleEmergencyUpdated)
        socket.off('emergency:status-updated', handleEmergencyUpdated)
      }
    }
  }, [fetchData, showToast])

  const handleDispatch = async (e) => {
    e.preventDefault()
    if (!selectedSos || !selectedTeamId) return

    setDispatching(true)
    try {
      const targetId = selectedSos._id || selectedSos.id
      const res = await emergencyApi.assignTeam(targetId, {
        rescueTeamId: selectedTeamId,
        estimatedEtaMinutes: Number(estimatedEta) || 18,
        note: dispatchNote || 'Dispatched by State Command Center',
      })

      showToast({
        title: 'Rescue Squad Dispatched!',
        message: `Assigned rescue team to SOS ${selectedSos.requestId || selectedSos.id}.`,
        type: 'success',
      })

      // Update state locally
      setEmergencies((prev) =>
        prev.map((item) =>
          String(item._id || item.id) === String(targetId)
            ? {
                ...item,
                status: 'ASSIGNED',
                assignedTeam: res.data?.assignedTeam || selectedTeamId,
              }
            : item
        )
      )

      setSelectedSos(null)
      setSelectedTeamId('')
      setDispatchNote('')
    } catch (err) {
      showToast({
        title: 'Dispatch Failed',
        message: err.response?.data?.error?.message || 'Failed to assign rescue team.',
        type: 'error',
      })
    } finally {
      setDispatching(false)
    }
  }

  const filtered = emergencies
    .filter((e) => {
      if (filter === 'PENDING') return e.status === 'PENDING' || e.status === 'PENDING_ASSIGNMENT'
      if (filter === 'ACTIVE') return ['ASSIGNED', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'IN_PROGRESS'].includes(e.status)
      if (filter === 'RESCUED') return e.status === 'RESCUED' || e.status === 'CLOSED'
      return true
    })
    .filter((e) => {
      const loc = formatLocationText(e.address || e.location, '')
      const id = e.requestId || e._id || e.id || ''
      const desc = e.description || ''
      return (
        loc.toLowerCase().includes(search.toLowerCase()) ||
        id.toLowerCase().includes(search.toLowerCase()) ||
        desc.toLowerCase().includes(search.toLowerCase())
      )
    })
    .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Top Filter Bar */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            <span>Master SOS Distress Triage & Tactical Allocation</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time victim distress beacons from MongoDB ordered by Priority Severity Score
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Refresh */}
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

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
              <th className="py-3.5 px-4 font-bold">Request ID</th>
              <th className="py-3.5 px-4 font-bold">Location & Situation</th>
              <th className="py-3.5 px-4 font-bold">Victims</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold">Assigned Squad</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                    <span>Loading distress beacons from database...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No emergency requests match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((sos) => {
                const severity = getSeverityInfo(sos.priorityScore || 80)
                const isPending = sos.status === 'PENDING' || sos.status === 'PENDING_ASSIGNMENT'
                const assignedName =
                  sos.assignedTeam?.teamName ||
                  sos.assignedTeam?.name ||
                  (typeof sos.assignedTeam === 'string' ? sos.assignedTeam : null)

                return (
                  <tr key={sos._id || sos.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${severity.bgClass} text-white shadow-xs`}>
                        {sos.priorityScore || 75}/100
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-400 text-[10px] block font-bold">{sos.requestId || sos.id}</span>
                      <span className="text-[10px] text-slate-500 block">{formatTimeAgo(sos.createdAt)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-medium truncate max-w-[220px]">
                        {formatLocationText(sos.address || sos.location, 'Location coordinates')}
                      </div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[220px] italic">
                        "{sos.description}"
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-white bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                        <Users className="w-3.5 h-3.5 text-brand-400" /> {sos.totalPeople || sos.peopleCount || 1}
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
                        {sos.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-slate-300 font-medium">
                        {assignedName || <em className="text-slate-500">Unassigned</em>}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isPending ? (
                        <button
                          onClick={() => setSelectedSos(sos)}
                          className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-md shadow-red-600/30"
                        >
                          Assign Team
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

      {/* Dispatch Modal Dialog with Real MongoDB Rescue Teams */}
      {selectedSos && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-extrabold text-base flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-brand-400" />
                <span>Assign Real Rescue Squad to {selectedSos.requestId || selectedSos.id}</span>
              </h4>
              <button
                onClick={() => setSelectedSos(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Address:</span>
                <strong className="text-white">{selectedSos.address || 'GPS Coordinates'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Victim Count:</span>
                <strong className="text-red-400 font-bold">{selectedSos.totalPeople || selectedSos.peopleCount || 1} Individuals</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Priority Score:</span>
                <strong className="text-amber-400 font-mono">{selectedSos.priorityScore || 80}/100 ({selectedSos.priorityLevel})</strong>
              </div>
            </div>

            <form onSubmit={handleDispatch} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Select Active MongoDB Rescue Team *
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Choose Deployed / Available Team --</option>
                  {availableTeams.map((team) => (
                    <option key={team.id || team._id} value={team.id || team._id}>
                      {team.teamName} ({team.teamCode}) — Status: {team.status} ({team.district || 'Odisha'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Estimated ETA (Minutes) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={estimatedEta}
                    onChange={(e) => setEstimatedEta(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Operational Channel
                  </label>
                  <input
                    type="text"
                    disabled
                    value="VHF Ch 16 / Control Room"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Dispatch Operational Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  placeholder="e.g., Prioritize rescue boat deployment for elderly victim on 2nd floor..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedSos(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatching || !selectedTeamId}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center gap-1.5"
                >
                  <LifeBuoy className="w-4 h-4" />
                  <span>{dispatching ? 'Assigning...' : 'Confirm Assignment & Alert Crew'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
