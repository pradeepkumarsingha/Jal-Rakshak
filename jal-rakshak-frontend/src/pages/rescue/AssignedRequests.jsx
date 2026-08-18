import React, { useState } from 'react'
import { useFloodData } from '../../context/FloodDataContext'
import { useAlert } from '../../context/AlertContext'
import AssignmentCard from '../../components/rescue/AssignmentCard'
import RouteDisplay from '../../components/rescue/RouteDisplay'
import { LifeBuoy, Filter, Search, Flame, CheckCircle, Navigation } from 'lucide-react'

export default function AssignedRequests() {
  const { emergencies, updateEmergencyStatus } = useFloodData()
  const { showToast } = useAlert()
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const handleUpdateStatus = (id, newStatus) => {
    updateEmergencyStatus(id, newStatus)
    showToast({
      title: 'Mission Status Updated',
      message: `SOS ${id} marked as ${newStatus}.`,
      type: newStatus === 'RESCUED' ? 'success' : 'info',
    })
  }

  const filtered = emergencies.filter((m) => {
    if (filter === 'ACTIVE') return m.status === 'IN_PROGRESS' || m.status === 'DISPATCHED' || m.status === 'ON_SCENE'
    if (filter === 'RESCUED') return m.status === 'RESCUED' || m.status === 'CLOSED'
    return true
  }).filter((m) =>
    m.location.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  )

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
            Direct mission coordination, victim extraction management, and status logging.
          </p>
        </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Mission Cards List */}
        <div className="lg:col-span-7 space-y-4">
          {filtered.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-500">
              <LifeBuoy className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-bold text-slate-300">No missions match your search or filter.</p>
            </div>
          ) : (
            filtered.map((mission) => (
              <AssignmentCard
                key={mission.id}
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
