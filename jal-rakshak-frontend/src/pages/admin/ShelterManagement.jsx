import React, { useState } from 'react'
import { useFloodData } from '../../context/FloodDataContext'
import { useAlert } from '../../context/AlertContext'
import ShelterManagementCard from '../../components/admin/ShelterManagementCard'
import { Home, Plus, Users, ShieldCheck, HeartPulse, X } from 'lucide-react'

export default function ShelterManagement() {
  const { shelters, updateShelterOccupancy } = useFloodData()
  const { showToast } = useAlert()
  const [modalOpen, setModalOpen] = useState(false)

  const totalCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0)
  const totalOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0)
  const totalSlotsLeft = totalCapacity - totalOccupancy
  const overallPct = Math.round((totalOccupancy / totalCapacity) * 100)

  const handleUpdateOccupancy = (id, occ) => {
    updateShelterOccupancy(id, occ)
    showToast({
      title: 'Occupancy Updated',
      message: `Shelter headcount adjusted.`,
      type: 'info',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
            Relief & Evacuation Network
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
            Relief Shelter & Camp Logistics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time shelter capacity, food rations, clean water supplies, and medical staff across all relief centers.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Emergency Camp</span>
        </button>
      </div>

      {/* Network Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Shelter Network</span>
          <div className="text-2xl font-extrabold text-white mt-1">{shelters.length} Facilities</div>
        </div>
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Evacuees Housed</span>
          <div className="text-2xl font-extrabold text-purple-400 mt-1">{totalOccupancy.toLocaleString()} People</div>
        </div>
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400">Remaining Vacancy</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{totalSlotsLeft.toLocaleString()} Beds Open</div>
        </div>
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400">Overall Network Load</span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{overallPct}% Full</div>
        </div>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shelters.map((shelter) => (
          <ShelterManagementCard
            key={shelter.id}
            shelter={shelter}
            onUpdateOccupancy={handleUpdateOccupancy}
          />
        ))}
      </div>
    </div>
  )
}
