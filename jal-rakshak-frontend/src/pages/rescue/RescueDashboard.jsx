import React, { useState, useEffect, useCallback } from 'react'
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
} from 'lucide-react'

export default function RescueDashboard() {
  const { user } = useAuth()
  const { showToast } = useAlert()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAssignments = useCallback(async () => {
    setLoading(true)
    try {
      const data = await emergencyApi.getRescueAssignments()
      setAssignments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('Error fetching rescue assignments:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssignments()

    const socket = getSocket()
    if (socket) {
      const handleNewAssignment = (newAssign) => {
        setAssignments((prev) => [newAssign, ...prev])
        showToast({
          title: '🚨 NEW RESCUE MISSION DISPATCHED',
          message: `Mission ${newAssign.requestId || 'SOS'} assigned to your unit.`,
          type: 'error',
        })
      }

      const handleAssignmentUpdated = (updated) => {
        setAssignments((prev) =>
          prev.map((a) =>
            String(a.assignmentId || a.id) === String(updated.assignmentId)
              ? { ...a, assignmentStatus: updated.status, status: updated.status }
              : a
          )
        )
      }

      socket.on('rescue:assignment-created', handleNewAssignment)
      socket.on('rescue:assignment-updated', handleAssignmentUpdated)

      return () => {
        socket.off('rescue:assignment-created', handleNewAssignment)
        socket.off('rescue:assignment-updated', handleAssignmentUpdated)
      }
    }
  }, [fetchAssignments, showToast])

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
      fetchAssignments()
    } catch (err) {
      showToast({
        title: 'Status Update Failed',
        message: err.response?.data?.error?.message || 'Failed to update mission status.',
        type: 'error',
      })
    }
  }

  const activeMissions = assignments.filter(
    (a) => !['CLOSED', 'CANCELLED'].includes(a.assignmentStatus || a.status)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Field Rescue Unit Operational Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
            03rd NDRF Battalion Unit (Mundali)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Commander: <strong className="text-slate-200">{user?.fullName || 'Cmdr. Vikram Rathore'}</strong> • Base: Mundali NDRF Basecamp • Status: <span className="text-emerald-400 font-bold">DEPLOYED READY</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAssignments}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/rescue/assignments"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Active Missions ({activeMissions.length})</span>
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
            <strong className="text-white text-xs mt-0.5 block">40HP Inflatable Motor Boat (IRB)</strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Boat Extraction Capacity</span>
            <strong className="text-white text-xs mt-0.5 block">12 Persons / Trip</strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Comms Channel</span>
            <strong className="text-emerald-400 font-mono text-xs mt-0.5 block">VHF Ch 16 (156.8 MHz)</strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Helpline Callback</span>
            <strong className="text-cyan-400 text-xs mt-0.5 block">+91 98110 54321</strong>
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
              All Missions &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              <span>Loading assignments...</span>
            </div>
          ) : activeMissions.length === 0 ? (
            <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs">
              No active distress missions currently assigned to this unit.
            </div>
          ) : (
            activeMissions.slice(0, 2).map((m) => (
              <AssignmentCard key={m.assignmentId || m.id} mission={m} onUpdateStatus={handleUpdateStatus} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
