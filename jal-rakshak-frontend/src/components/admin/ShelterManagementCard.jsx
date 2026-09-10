import React, { useState } from 'react'
import { Home, Users, Check, Edit2, Phone, Sparkles, ShieldCheck } from 'lucide-react'

export default function ShelterManagementCard({ shelter, onUpdateOccupancy }) {
  if (!shelter) return null

  const capacity = Number(shelter.capacity || shelter.totalCapacity || 0)
  const currentOccupancy = Number(shelter.currentOccupancy || 0)
  const [editing, setEditing] = useState(false)
  const [occ, setOcc] = useState(currentOccupancy)

  const occPct = capacity > 0 ? Math.min(100, Math.round((currentOccupancy / capacity) * 100)) : 0
  const phone = shelter.phone || shelter.contact?.phone || ''
  const elevation = Number(shelter.elevationMeters || 30)
  const road = shelter.roadCondition || 'Safe & Clear'
  const shelterId = shelter.id || shelter.shelterId || shelter._id

  const handleSave = () => {
    onUpdateOccupancy(shelterId, Number(occ) || 0)
    setEditing(false)
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded">
            {shelterId}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              shelter.status === 'ACTIVE'
                ? 'bg-emerald-500/20 text-emerald-300'
                : shelter.status === 'NEAR_FULL'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-red-500/20 text-red-300'
            }`}
          >
            {shelter.status || 'ACTIVE'}
          </span>
        </div>

        <h4 className="font-extrabold text-base text-white mt-2 leading-snug">{shelter.name}</h4>
        <p className="text-xs text-slate-400 mt-0.5">{shelter.locationName || shelter.address}</p>

        {/* Occupancy Counter & Modifier */}
        <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Users className="w-3.5 h-3.5 text-brand-400" /> Current Population:
            </span>
            <div className="flex items-center gap-1.5 font-bold text-white">
              {editing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={occ}
                    onChange={(e) => setOcc(e.target.value)}
                    className="w-20 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white text-xs text-center"
                  />
                  <button
                    onClick={handleSave}
                    className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span>{currentOccupancy.toLocaleString()} / {capacity.toLocaleString()} ({occPct}%)</span>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Update Headcount"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                occPct >= 95 ? 'bg-red-500' : occPct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${occPct}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Elevation: <strong className="text-slate-200">{elevation}m</strong></span>
            <span>Road: <strong className="text-slate-200">{road}</strong></span>
          </div>
        </div>

        {/* Facilities checklist */}
        <div className="mt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
            On-Site Facilities
          </span>
          <div className="flex flex-wrap gap-1">
            {shelter.facilities?.map((f, i) => (
              <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                ✓ {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Helpdesk: <strong className="text-slate-200">{phone || 'N/A'}</strong></span>
        <button
          onClick={() => {
            const added = Math.min(capacity, currentOccupancy + 25)
            onUpdateOccupancy(shelterId, added)
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-300 text-[11px] font-semibold"
        >
          +25 Admitted
        </button>
      </div>
    </div>
  )
}
