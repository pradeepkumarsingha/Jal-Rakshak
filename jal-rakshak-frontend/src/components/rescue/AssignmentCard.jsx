import React, { useState } from 'react'
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
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'

const NEXT_STATUS_MAP = {
  ASSIGNED: 'DISPATCHED',
  DISPATCHED: 'EN_ROUTE',
  EN_ROUTE: 'ON_SCENE',
  ON_SCENE: 'RESCUED',
  RESCUED: 'CLOSED',
  CLOSED: null,
  CANCELLED: null,
}

export default function AssignmentCard({ mission, onUpdateStatus, isSelected = false, onSelect = null }) {
  const [confirmModal, setConfirmModal] = useState(null)
  const [statusNote, setStatusNote] = useState('')

  if (!mission) return null

  const assignmentId = mission.assignmentId || mission.id || mission._id
  const emergency = mission.emergency || mission
  const currentStatus = mission.assignmentStatus || mission.status || 'ASSIGNED'
  const nextStatus = NEXT_STATUS_MAP[currentStatus]

  const handleNextClick = (targetStatus) => {
    if (targetStatus === 'RESCUED' || targetStatus === 'CLOSED') {
      setConfirmModal(targetStatus)
    } else {
      if (onUpdateStatus) {
        onUpdateStatus(assignmentId, targetStatus)
      }
    }
  }

  const handleConfirmSubmit = () => {
    if (onUpdateStatus && confirmModal) {
      onUpdateStatus(assignmentId, confirmModal, statusNote)
    }
    setConfirmModal(null)
    setStatusNote('')
  }

  const locationText =
    emergency.location?.address || emergency.address || (typeof emergency.location === 'string' ? emergency.location : 'Target Location')

  const totalPeople = emergency.totalPeople || emergency.peopleCount || 1

  return (
    <div
      onClick={() => onSelect && onSelect(mission)}
      className={`bg-slate-900 rounded-3xl border p-6 shadow-xl space-y-4 transition cursor-pointer ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-slate-900 shadow-emerald-500/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800 font-bold">
              {emergency.requestId || mission.requestId || mission.id}
            </span>
            <PriorityBadge priority={emergency.priorityLevel || mission.priority || 'HIGH'} score={emergency.priorityScore || mission.priorityScore || 80} />
            {isSelected && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                <span>GPS Route Active</span>
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white mt-1.5">
            {emergency.requestType || mission.category || 'Distress Rescue Mission'}
          </h3>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 justify-end">
            <Clock className="w-3 h-3" /> {formatTimeAgo(mission.assignedAt || mission.timestamp || emergency.createdAt)}
          </span>
          {mission.estimatedEtaMinutes && (
            <span className="text-xs font-bold text-emerald-400 font-mono block mt-0.5">
              ETA: ~{mission.estimatedEtaMinutes} mins
            </span>
          )}
        </div>
      </div>

      {/* Victim & Hazard Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Target Location</span>
          <strong className="text-white text-xs mt-0.5 block truncate">{locationText}</strong>
          {emergency.location?.latitude && (
            <span className="text-[10px] text-slate-500 font-mono">
              {emergency.location.latitude.toFixed(4)}° N, {emergency.location.longitude?.toFixed(4)}° E
            </span>
          )}
        </div>

        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Victim Headcount</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Users className="w-4 h-4 text-brand-400" />
            <strong className="text-white text-sm">{totalPeople} Individuals</strong>
          </div>
          <span className="text-[10px] text-amber-400 block mt-0.5">
            {emergency.childrenCount > 0 && `👶 ${emergency.childrenCount} Children `}
            {emergency.elderlyCount > 0 && `👴 ${emergency.elderlyCount} Elderly `}
            {emergency.medicalEmergency && '🚨 Medical Emergency'}
          </span>
        </div>

        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Water Severity</span>
          <strong className="text-red-400 text-xs mt-0.5 block">{emergency.waterSeverity || 'HIGH'}</strong>
          <span className="text-[10px] text-emerald-400 block mt-0.5">Road: {emergency.roadAccess || 'BLOCKED'}</span>
        </div>
      </div>

      {/* Description & Contact */}
      <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 text-xs text-slate-300">
        <p className="italic leading-relaxed">"{emergency.description || 'Rescue assistance required.'}"</p>
        <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
          <span>Contact: <strong className="text-white">{emergency.contact?.name || 'Citizen'}</strong></span>
          {emergency.contact?.phone && (
            <a
              href={`tel:${emergency.contact.phone}`}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <Phone className="w-3 h-3" /> {emergency.contact.phone}
            </a>
          )}
        </div>
      </div>

      {/* Status Transition Control Flow */}
      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Current Mission State:
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold inline-block mt-0.5 ${
            currentStatus === 'ASSIGNED'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : currentStatus === 'DISPATCHED'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : currentStatus === 'EN_ROUTE'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : currentStatus === 'ON_SCENE'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
              : currentStatus === 'RESCUED'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {currentStatus}
          </span>
        </div>

        {nextStatus && (
          <button
            onClick={() => handleNextClick(nextStatus)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white shadow-lg transition ${
              nextStatus === 'DISPATCHED'
                ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/30'
                : nextStatus === 'EN_ROUTE'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                : nextStatus === 'ON_SCENE'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                : nextStatus === 'RESCUED'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <span>Proceed to {nextStatus.replace('_', ' ')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Confirmation Modal for RESCUED and CLOSED */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <h4 className="font-extrabold text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Confirm {confirmModal === 'RESCUED' ? 'Extraction Complete (RESCUED)' : 'Close Mission (CLOSED)'}</span>
            </h4>

            <p className="text-xs text-slate-300">
              {confirmModal === 'RESCUED'
                ? 'Are all victims safely evacuated onto the rescue boat? The citizen will receive a safety confirmation notification immediately.'
                : 'Closing this mission will mark the assignment complete and make your rescue unit available for new dispatches.'}
            </p>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Rescue Log / Field Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g., Evacuated 3 adults and 1 infant to Naraj Relief Camp; all in stable condition..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-lg shadow-emerald-600/30"
              >
                Confirm {confirmModal}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
