import React, { useState, useEffect, useCallback, useRef } from 'react'
import { emergencyApi } from '../../services/emergencyApi'
import { useAlert } from '../../context/AlertContext'
import { getSocket } from '../../services/socket'
import AssignmentCard from '../../components/rescue/AssignmentCard'
import RouteDisplay from '../../components/rescue/RouteDisplay'
import { LifeBuoy, Filter, Search, Flame, CheckCircle, Navigation, RefreshCw } from 'lucide-react'

export default function AssignedRequests() {
  const { showToast } = useAlert()
  const [assignments, setAssignments] = useState([])
  const [teamInfo, setTeamInfo] = useState(null)
  const [selectedMission, setSelectedMission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const teamInfoRef = useRef(teamInfo)
  useEffect(() => {
    teamInfoRef.current = teamInfo
  }, [teamInfo])

  const fetchAssignments = useCallback(async () => {
    try {
      const [data, myTeam] = await Promise.all([
        emergencyApi.getRescueAssignments(),
        emergencyApi.getMyTeam(),
      ])
      const validAssignments = Array.isArray(data) ? data : []
      setAssignments(validAssignments)
      if (myTeam) setTeamInfo(myTeam)

      // Auto-select first active mission if available
      if (validAssignments.length > 0) {
        setSelectedMission((prev) => {
          if (prev) {
            const found = validAssignments.find(
              (a) => String(a.assignmentId || a.id || a._id) === String(prev.assignmentId || prev.id || prev._id)
            )
            if (found) return found
          }
          const activeOne = validAssignments.find((a) =>
            ['ASSIGNED', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'IN_PROGRESS'].includes(
              (a.assignmentStatus || a.status || '').toUpperCase()
            )
          )
          return activeOne || validAssignments[0]
        })
      } else {
        setSelectedMission(null)
      }
    } catch (err) {
      console.warn('Error fetching rescue assignments:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchAssignments()

    const socket = getSocket()
    if (socket) {
      const handleNewAssignment = (newAssign) => {
        const assignedTeamId = newAssign.team?.id || newAssign.rescueTeam?._id || newAssign.rescueTeam
        const currentTeam = teamInfoRef.current
        if (!currentTeam || !assignedTeamId || String(assignedTeamId) === String(currentTeam._id)) {
          setAssignments((prev) => {
            const id = newAssign.assignmentId || newAssign.id || newAssign._id
            const filtered = prev.filter((a) => String(a.assignmentId || a.id || a._id) !== String(id))
            return [newAssign, ...filtered]
          })
          setSelectedMission(newAssign)
          showToast({
            title: '🚨 NEW RESCUE MISSION DISPATCHED',
            message: `Mission ${newAssign.requestId || 'SOS'} mapped for immediate tactical response.`,
            type: 'error',
          })
        }
      }

      const handleAssignmentUpdated = (updated) => {
        setAssignments((prev) =>
          prev.map((a) =>
            String(a.assignmentId || a.id || a._id) === String(updated.assignmentId || updated.id || updated._id)
              ? { ...a, ...updated, assignmentStatus: updated.status || updated.assignmentStatus || a.assignmentStatus }
              : a
          )
        )
        setSelectedMission((prev) => {
          if (String(prev?.assignmentId || prev?.id || prev?._id) === String(updated.assignmentId || updated.id || updated._id)) {
            return { ...prev, ...updated, assignmentStatus: updated.status || updated.assignmentStatus || prev.assignmentStatus }
          }
          return prev
        })
      }

      socket.on('rescue:assignment-created', handleNewAssignment)
      socket.on('rescue:assignment-updated', handleAssignmentUpdated)
      socket.on('emergency:assigned', handleNewAssignment)
      socket.on('emergency:status-updated', handleAssignmentUpdated)

      return () => {
        socket.off('rescue:assignment-created', handleNewAssignment)
        socket.off('rescue:assignment-updated', handleAssignmentUpdated)
        socket.off('emergency:assigned', handleNewAssignment)
        socket.off('emergency:status-updated', handleAssignmentUpdated)
      }
    }
  }, [fetchAssignments, showToast])

  const handleUpdateStatus = async (assignmentId, newStatus, note = '') => {
    try {
      await emergencyApi.updateAssignmentStatus(assignmentId, {
        status: newStatus,
        note,
      })
      showToast({
        title: 'Mission Status Updated',
        message: `SOS marked as ${newStatus}.`,
        type: newStatus === 'RESCUED' ? 'success' : 'info',
      })
      fetchAssignments()
    } catch (err) {
      showToast({
        title: 'Update Failed',
        message: err.response?.data?.error?.message || 'Failed to update mission status.',
        type: 'error',
      })
    }
  }

  const activeCount = assignments.filter((m) =>
    ['ASSIGNED', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'IN_PROGRESS'].includes(
      (m.assignmentStatus || m.status || '').toUpperCase()
    )
  ).length

  const rescuedCount = assignments.filter((m) =>
    ['RESCUED', 'CLOSED'].includes((m.assignmentStatus || m.status || '').toUpperCase())
  ).length

  const filtered = assignments
    .filter((m) => {
      const st = (m.assignmentStatus || m.status || '').toUpperCase()
      if (filter === 'ACTIVE') return ['ASSIGNED', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'IN_PROGRESS'].includes(st)
      if (filter === 'RESCUED') return ['RESCUED', 'CLOSED'].includes(st)
      return true
    })
    .filter((m) => {
      const loc = m.emergency?.location?.address || m.emergency?.address || m.location || ''
      const reqId = m.emergency?.requestId || m.requestId || m.id || ''
      const cat = m.emergency?.requestType || m.category || ''
      return (
        loc.toLowerCase().includes(search.toLowerCase()) ||
        reqId.toLowerCase().includes(search.toLowerCase()) ||
        cat.toLowerCase().includes(search.toLowerCase())
      )
    })

  const currentActiveMission = selectedMission || filtered[0] || null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Tactical Operations Queue
            </span>
            {teamInfo && (
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700 font-bold">
                Unit: {teamInfo.teamName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Assigned Field Rescue Missions
            </h1>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Direct mission coordination, legal status transition logging, and live GPS route mapping for{' '}
            <strong className="text-slate-200">{teamInfo?.teamName || 'Assigned Squad'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              fetchAssignments()
            }}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Missions</span>
          </button>

          {/* Filter Pills */}
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
            {[
              { key: 'ALL', label: 'ALL', count: assignments.length },
              { key: 'ACTIVE', label: 'ACTIVE', count: activeCount },
              { key: 'RESCUED', label: 'RESCUED', count: rescuedCount },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  filter === f.key ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    filter === f.key ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Mission Cards List */}
        <div className="lg:col-span-7 space-y-4">
          {loading ? (
            <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400 text-xs flex items-center justify-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              <span>Loading rescue assignments for {teamInfo?.teamName || 'squad'}...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-500">
              <LifeBuoy className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-bold text-slate-300">No missions assigned to {teamInfo?.teamName || 'this squad'}.</p>
              <p className="text-xs text-slate-500 mt-1">Dispatches assigned to this team by State Command Center will appear here in real time.</p>
            </div>
          ) : (
            filtered.map((mission) => {
              const mId = String(mission.assignmentId || mission.id || mission._id)
              const selectedId = String(currentActiveMission?.assignmentId || currentActiveMission?.id || currentActiveMission?._id)
              const isSelected = mId === selectedId

              return (
                <AssignmentCard
                  key={mId}
                  mission={mission}
                  onUpdateStatus={handleUpdateStatus}
                  isSelected={isSelected}
                  onSelect={(m) => setSelectedMission(m)}
                />
              )
            })
          )}
        </div>

        {/* Tactical Navigation Route Display (Dynamic mapping between Squad Location & Victim Target) */}
        <div className="lg:col-span-5 space-y-4 sticky top-6">
          <RouteDisplay activeMission={currentActiveMission} teamInfo={teamInfo} />
        </div>
      </div>
    </div>
  )
}
