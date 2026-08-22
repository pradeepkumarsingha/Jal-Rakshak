import React, { useState, useEffect, useCallback } from 'react'
import { emergencyApi } from '../../services/emergencyApi'
import { useAlert } from '../../context/AlertContext'
import { getSocket } from '../../services/socket'
import AssignmentCard from '../../components/rescue/AssignmentCard'
import RouteDisplay from '../../components/rescue/RouteDisplay'
import { LifeBuoy, Filter, Search, Flame, CheckCircle, Navigation, RefreshCw } from 'lucide-react'

export default function AssignedRequests() {
  const { showToast } = useAlert()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

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

  const filtered = assignments.filter((m) => {
    const st = m.assignmentStatus || m.status
    if (filter === 'ACTIVE') return ['ASSIGNED', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'IN_PROGRESS'].includes(st)
    if (filter === 'RESCUED') return st === 'RESCUED' || st === 'CLOSED'
    return true
  }).filter((m) => {
    const loc = m.emergency?.location?.address || m.emergency?.address || m.location || ''
    const reqId = m.emergency?.requestId || m.requestId || m.id || ''
    const cat = m.emergency?.requestType || m.category || ''
    return (
      loc.toLowerCase().includes(search.toLowerCase()) ||
      reqId.toLowerCase().includes(search.toLowerCase()) ||
      cat.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Tactical Operations Queue
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
            Assigned Field Rescue Missions
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Direct mission coordination, legal status transition logging, and victim extraction management.
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

          {/* Filter Pills */}
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
            {['ALL', 'ACTIVE', 'RESCUED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  filter === f ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
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
              <span>Loading rescue assignments...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-500">
              <LifeBuoy className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-bold text-slate-300">No missions match your search or filter.</p>
              <p className="text-xs text-slate-500 mt-1">Dispatches from State Disaster Command will appear in real time.</p>
            </div>
          ) : (
            filtered.map((mission) => (
              <AssignmentCard
                key={mission.assignmentId || mission.id}
                mission={mission}
                onUpdateStatus={handleUpdateStatus}
              />
            ))
          )}
        </div>

        {/* Tactical Navigation Route Display */}
        <div className="lg:col-span-5 space-y-4">
          <RouteDisplay />
        </div>
      </div>
    </div>
  )
}
