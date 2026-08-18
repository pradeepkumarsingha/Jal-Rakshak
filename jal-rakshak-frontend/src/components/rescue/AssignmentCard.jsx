import React from 'react'
import PriorityBadge from './PriorityBadge'
import { formatTimeAgo } from '../../utils/helpers'
import {
  Flame,
  Users,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Navigation,
  LifeBuoy,
  HeartPulse,
} from 'lucide-react'

export default function AssignmentCard({ mission, onUpdateStatus }) {
  if (!mission) return null

  const statusList = ['DISPATCHED', 'ON_SCENE', 'RESCUED', 'CLOSED']

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
              {mission.id}
            </span>
            <PriorityBadge priority={mission.priority} score={mission.priorityScore} />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white mt-1.5">{mission.category}</h3>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatTimeAgo(mission.timestamp)}
          </span>
          {mission.etaMinutes && (
            <span className="text-xs font-bold text-emerald-400 font-mono block mt-0.5">
              ETA: ~{mission.etaMinutes} mins
            </span>
          )}
        </div>
      </div>

      {/* Victim & Hazard Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Location</span>
          <strong className="text-white text-xs mt-0.5 block truncate">{mission.location}</strong>
          <span className="text-[10px] text-slate-500 font-mono">{mission.lat?.toFixed(4)}° N, {mission.lng?.toFixed(4)}° E</span>
        </div>

        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Headcount</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Users className="w-4 h-4 text-brand-400" />
            <strong className="text-white text-sm">{mission.peopleCount} Trapped</strong>
          </div>
          {mission.victims && (
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {mission.victims.infants > 0 && `👶 ${mission.victims.infants} Infant `}
              {mission.victims.elderly > 0 && `👴 ${mission.victims.elderly} Elderly`}
            </span>
          )}
        </div>

        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Water Depth</span>
          <strong className="text-red-400 text-xs mt-0.5 block">{mission.waterDepth}</strong>
          <span className="text-[10px] text-emerald-400 block mt-0.5">Craft: 40HP Inflatable Boat</span>
        </div>
      </div>

      {/* Description */}
      <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 text-xs text-slate-300">
        <p className="italic leading-relaxed">"{mission.description}"</p>
        <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
          <span>Contact: <strong className="text-white">{mission.contactName}</strong></span>
          {mission.contactPhone && (
            <a
              href={`tel:${mission.contactPhone}`}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <Phone className="w-3 h-3" /> {mission.contactPhone}
            </a>
          )}
        </div>
      </div>

      {/* Status Stepper Action Buttons */}
      <div className="pt-2 border-t border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
          Update Field Status:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onUpdateStatus(mission.id, 'DISPATCHED')}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs transition border ${
              mission.status === 'DISPATCHED'
                ? 'bg-cyan-600 border-cyan-500 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            1. Dispatched
          </button>
          <button
            onClick={() => onUpdateStatus(mission.id, 'ON_SCENE')}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs transition border ${
              mission.status === 'ON_SCENE'
                ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            2. On Scene
          </button>
          <button
            onClick={() => onUpdateStatus(mission.id, 'RESCUED')}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs transition border ${
              mission.status === 'RESCUED'
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            3. Rescued Safe
          </button>
          <button
            onClick={() => onUpdateStatus(mission.id, 'CLOSED')}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs transition border ${
              mission.status === 'CLOSED'
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            4. Mission Closed
          </button>
        </div>
      </div>
    </div>
  )
}
