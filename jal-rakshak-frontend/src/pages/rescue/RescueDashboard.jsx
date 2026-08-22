import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { emergencyApi } from '../../services/emergencyApi'
import { useAuth } from '../../context/AuthContext'
import { useAlert } from '../../context/AlertContext'
import { getSocket } from '../../services/socket'
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
  RefreshCw,
  Anchor,
  Layers,
  HeartPulse,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react'

export default function RescueDashboard() {
  const { user } = useAuth()
  const { showToast } = useAlert()
  const [assignments, setAssignments] = useState([])
  const [teamInfo, setTeamInfo] = useState(null)
  const [allTeams, setAllTeams] = useState([])
  const [switchingTeam, setSwitchingTeam] = useState(false)
  const [loading, setLoading] = useState(true)

  const teamInfoRef = useRef(teamInfo)
  useEffect(() => {
    teamInfoRef.current = teamInfo
  }, [teamInfo])

  const fetchData = useCallback(async () => {
    try {
      const [assignData, myTeamData, teamsData] = await Promise.all([
        emergencyApi.getRescueAssignments(),
        emergencyApi.getMyTeam(),
        emergencyApi.getAvailableRescueTeams(),
      ])

      const validAssignments = Array.isArray(assignData) ? assignData : []
      setAssignments(validAssignments)

      if (Array.isArray(teamsData)) {
        setAllTeams(teamsData)
      }

      if (myTeamData && myTeamData.teamName) {
        setTeamInfo(myTeamData)
      } else if (Array.isArray(teamsData) && teamsData.length > 0) {
        setTeamInfo(teamsData[0])
      }
    } catch (err) {
      console.warn('Error fetching rescue operational data:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchData()

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
          showToast({
            title: '🚨 NEW RESCUE MISSION DISPATCHED',
            message: `Mission ${newAssign.requestId || 'SOS'} assigned to your tactical unit.`,
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
  }, [fetchData, showToast])

  const handleUpdateStatus = async (assignmentId, targetStatus, note = '') => {
    try {
      await emergencyApi.updateAssignmentStatus(assignmentId, {
        status: targetStatus,
        note,
      })
      showToast({
        title: 'Mission Status Updated',
        message: `Mission transitioned to ${targetStatus}.`,
        type: targetStatus === 'RESCUED' ? 'success' : 'info',
      })
      fetchData()
    } catch (err) {
      showToast({
        title: 'Status Update Failed',
        message: err.response?.data?.error?.message || 'Failed to update mission status.',
        type: 'error',
      })
    }
  }

  const activeMissions = assignments.filter((a) => {
    const st = (a.assignmentStatus || a.status || '').toUpperCase()
    return ['ASSIGNED', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'IN_PROGRESS'].includes(st)
  })

  const completedMissions = assignments.filter((a) => {
    const st = (a.assignmentStatus || a.status || '').toUpperCase()
    return ['RESCUED', 'CLOSED'].includes(st)
  })

  const totalPeopleAtRisk = activeMissions.reduce(
    (acc, m) => acc + (Number(m.emergency?.totalPeople || m.totalPeople) || 1),
    0
  )

  const totalPeopleRescued = completedMissions.reduce(
    (acc, m) => acc + (Number(m.emergency?.totalPeople || m.totalPeople) || 1),
    0
  )

  const commanderName = user?.fullName || user?.name || teamInfo?.teamLead?.fullName || 'Tactical Officer'
  const squadTitle = teamInfo?.teamName || 'NDRF Tactical Rescue Unit'
  const squadBase = `${teamInfo?.district || 'Cuttack'}, ${teamInfo?.state || 'Odisha'} Basecamp`
  const squadStatus = activeMissions.length > 0 ? 'DEPLOYED ON MISSION' : 'AVAILABLE READY'
  const isAvailable = activeMissions.length === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Field Rescue Unit Operational Portal
            </span>
            <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE MONGODB SYNC</span>
            </span>
            {teamInfo && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
                Unit: {teamInfo.teamName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{squadTitle}</h1>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Commander: <strong className="text-slate-200">{commanderName}</strong> • Base: {squadBase} • Status:{' '}
            <span className={`font-bold uppercase ${isAvailable ? 'text-emerald-400' : 'text-amber-400'}`}>
              {squadStatus}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Refresh assignments"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Missions</span>
          </button>
          <Link
            to="/rescue/assignments"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Assigned Missions ({activeMissions.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] font-semibold">Active Dispatched Missions</span>
            <Flame className={`w-4 h-4 ${activeMissions.length > 0 ? 'text-red-400' : 'text-slate-500'}`} />
          </div>
          <p className="text-2xl font-extrabold text-white mt-1">{activeMissions.length}</p>
          <span className="text-[10px] text-amber-400 mt-0.5 block">
            {totalPeopleAtRisk} victims awaiting extraction
          </span>
        </div>

        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] font-semibold">Total Missions for Squad</span>
            <Layers className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-1">{assignments.length}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Assigned to {teamInfo?.teamName || 'this squad'}</span>
        </div>

        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] font-semibold">Victims Safely Extracted</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">{totalPeopleRescued}</p>
          <span className="text-[10px] text-emerald-300 mt-0.5 block">
            {completedMissions.length} completed operations
          </span>
        </div>

        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] font-semibold">Squad Operational Status</span>
            <Anchor className={`w-4 h-4 ${isAvailable ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <p className={`text-base font-extrabold mt-1.5 uppercase ${isAvailable ? 'text-emerald-400' : 'text-amber-400'}`}>
            {squadStatus}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">VHF Ch 16 (156.8 MHz) Active</span>
        </div>
      </div>

      {/* Equipment & Unit Readiness Card */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Tactical Squad Manifest & Readiness ({teamInfo?.teamName || 'Tactical Unit'})
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Primary Craft</span>
            <strong className="text-white text-xs mt-0.5 block">
              {teamInfo?.vehicles?.[0]?.vehicleType || '40HP Inflatable Motor Boat (IRB)'}
            </strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Boat Extraction Capacity</span>
            <strong className="text-white text-xs mt-0.5 block">
              {teamInfo?.vehicles?.[0]?.capacity || 12} Persons / Trip
            </strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Life Jackets & Gear</span>
            <strong className="text-emerald-400 font-mono text-xs mt-0.5 block">
              {teamInfo?.resources?.lifeJackets || 20} Jackets / {teamInfo?.resources?.firstAidKits || 5} FirstAid
            </strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Helpline & Comms</span>
            <strong className="text-cyan-400 text-xs mt-0.5 block">
              {teamInfo?.phone || user?.phone || '+91 98110 54321'}
            </strong>
          </div>
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

          <FloodRiskMap height="500px" zoom={13} showControls={true} />
        </div>

        {/* Assigned Missions Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              <span>Assigned Extraction Missions</span>
            </h3>
            <Link to="/rescue/assignments" className="text-xs font-bold text-emerald-400 hover:underline">
              All Missions ({assignments.length}) &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              <span>Loading rescue assignments for {teamInfo?.teamName || 'squad'}...</span>
            </div>
          ) : activeMissions.length === 0 ? (
            <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-slate-300">All current missions resolved for {teamInfo?.teamName || 'this squad'}.</p>
              <p className="text-slate-500 mt-1">Dispatches assigned to this team by State Command Center will appear here in real time.</p>
            </div>
          ) : (
            activeMissions.slice(0, 3).map((m) => (
              <AssignmentCard key={m.assignmentId || m.id || m._id} mission={m} onUpdateStatus={handleUpdateStatus} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
