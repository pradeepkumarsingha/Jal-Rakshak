import React from 'react'
import EmergencyTable from '../../components/admin/EmergencyTable'
import { Flame, ShieldAlert, LifeBuoy, Users } from 'lucide-react'

export default function EmergencyManagement() {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
          Tactical Incident Orchestration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
          Emergency SOS Incident Management
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Triage citizen distress beacons prioritized by vulnerability score, medical conditions, and rising water rates.
        </p>
      </div>

      <EmergencyTable />
    </div>
  )
}
