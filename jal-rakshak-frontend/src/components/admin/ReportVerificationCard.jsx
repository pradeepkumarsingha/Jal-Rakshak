import React, { useState } from 'react'
import { formatTimeAgo, formatLocationText, formatReportImageUrl, DEFAULT_HAZARD_IMAGE } from '../../utils/helpers'
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  MapPin,
  Clock,
  ExternalLink,
  ShieldAlert,
  Info,
  Maximize2,
  X,
  LifeBuoy,
  Send,
  Users,
  Radio,
} from 'lucide-react'

export default function ReportVerificationCard({
  report,
  onVerify,
  onAssignRescue,
  availableTeams = [],
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [verifyNotes, setVerifyNotes] = useState('')
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [showDirectAssignModal, setShowDirectAssignModal] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)

  // Rescue dispatch options
  const [assignRescueSquad, setAssignRescueSquad] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [estimatedEta, setEstimatedEta] = useState(15)

  if (!report) return null

  const imageUrl = formatReportImageUrl(report.image || report.imageUrl)

  const ai = report.aiAnalysis || {}
  const status = (report.verificationStatus || report.status || 'PENDING').toUpperCase()
  const assignedTeamName = report.assignedTeam?.teamName || report.assignedTeamName

  const handleActionClick = (action) => {
    setSelectedAction(action)
    if (action === 'ESCALATE') {
      setAssignRescueSquad(true)
    } else {
      setAssignRescueSquad(false)
    }
    if (availableTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(availableTeams[0]._id || availableTeams[0].id)
    }
    setShowNotesModal(true)
  }

  const handleConfirmAction = () => {
    if (onVerify && selectedAction) {
      const options = {}
      if (assignRescueSquad && selectedTeamId) {
        options.rescueTeamId = selectedTeamId
        options.estimatedEtaMinutes = Number(estimatedEta) || 15
      }
      onVerify(report._id || report.id || report.reportId, selectedAction, verifyNotes, options)
    }
    setShowNotesModal(false)
    setVerifyNotes('')
    setSelectedAction(null)
    setAssignRescueSquad(false)
  }

  const handleDirectAssignConfirm = (e) => {
    e.preventDefault()
    if (onAssignRescue && selectedTeamId) {
      onAssignRescue(report._id || report.id || report.reportId, {
        rescueTeamId: selectedTeamId,
        estimatedEtaMinutes: Number(estimatedEta) || 15,
        notes: verifyNotes || 'Tactical team dispatched to verified ground report',
      })
    }
    setShowDirectAssignModal(false)
    setVerifyNotes('')
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col md:flex-row gap-5 transition hover:border-slate-700">
      {/* Photo Preview & Lightbox Trigger */}
      <div className="w-full md:w-56 h-48 rounded-xl overflow-hidden bg-slate-950 shrink-0 relative border border-slate-800 group">
        <img
          src={imageUrl}
          alt="Ground verification"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = DEFAULT_HAZARD_IMAGE
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={() => setModalOpen(true)}
        />
        <div
          className={`absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[10px] font-mono border flex items-center gap-1 ${ai.floodDetected === false
              ? 'text-rose-400 border-rose-500/30'
              : 'text-cyan-300 border-cyan-500/30'
            }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>AI Severity: {ai.floodDetected === false ? 'FALSE' : ai.severity || 'UNKNOWN'}</span>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black transition"
          title="Open Photo Lightbox"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Report Details */}
      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                {report.reportId || report.id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${status === 'VERIFIED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : status === 'ESCALATED' || status === 'ESCALATED_TO_RESCUE'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : status === 'REJECTED'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                  }`}
              >
                {status}
              </span>

              {assignedTeamName && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <LifeBuoy className="w-3 h-3 text-cyan-400" />
                  <span>Assigned: {assignedTeamName}</span>
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatTimeAgo(report.submittedAt || report.createdAt)}
            </span>
          </div>

          <p className="text-xs text-slate-300 flex items-center gap-1 mt-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span>
              {formatLocationText(report.location || report.address, 'Ground Location')}
            </span>
          </p>

          <div className="mt-2.5 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs space-y-2">
            <p className="text-slate-200 italic">"{report.description}"</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Citizen Water Level</span>
                <strong className="text-amber-400">{report.submittedWaterLevel || report.waterLevel}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Road Status</span>
                <strong className="text-rose-400">{report.submittedRoadStatus || report.roadStatus}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">AI Road Estimate</span>
                <strong className="text-cyan-400">
                  {ai.floodDetected === false ? 'N/A' : ai.roadCondition || 'UNKNOWN'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Confidence</span>
                <strong className="text-emerald-400">
                  {ai.confidence ? `${(ai.confidence * 100).toFixed(0)}%` : 'N/A'}
                </strong>
              </div>
            </div>
          </div>

          {/* AI Estimate Disclaimer */}
          {ai.floodDetected === false ? (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-rose-300 bg-rose-950/40 px-2.5 py-1.5 rounded-lg border border-rose-500/30">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>AI Verification Alert:</strong>{' '}
                {ai.message || ai.rawResponse?.message || 'This image does not contain genuine flood water.'}
              </span>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-300/80 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>AI output is estimated. Administrator verification & squad assignment enabled.</span>
            </div>
          )}
        </div>

        {/* Verification & Rescue Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div>
            {assignedTeamName ? (
              <span className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Rescue Unit Dispatched to Location</span>
              </span>
            ) : status === 'VERIFIED' || status === 'ESCALATED' ? (
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Location confirmed on Tactical GIS layer</span>
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {status === 'PENDING' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleActionClick('REJECT')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span>Reject</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleActionClick('ESCALATE')}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1 transition shadow cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Escalate & Dispatch</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleActionClick('VERIFY')}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verify & Assign Rescue</span>
                </button>
              </>
            ) : (
              !assignedTeamName &&
              (status === 'VERIFIED' || status === 'ESCALATED') && (
                <button
                  type="button"
                  onClick={() => {
                    if (availableTeams.length > 0 && !selectedTeamId) {
                      setSelectedTeamId(availableTeams[0]._id || availableTeams[0].id)
                    }
                    setShowDirectAssignModal(true)
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
                >
                  <LifeBuoy className="w-3.5 h-3.5" />
                  <span>Assign Rescue Squad</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-white">Hazard Evidence Photo Preview</h4>
                <p className="text-xs text-slate-400 font-mono">{report.reportId || report.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto bg-black flex items-center justify-center p-2">
              <img
                src={imageUrl}
                alt="Hazard full resolution"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = DEFAULT_HAZARD_IMAGE
                }}
                className="max-h-[65vh] object-contain rounded-xl"
              />
            </div>
            <div className="p-3 bg-slate-950 text-xs text-slate-300 flex items-center justify-between">
              <span>Cloudinary Storage: Verified Ground Intelligence</span>
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>Full Resolution</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Verification & Rescue Dispatch Confirmation Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-extrabold text-base flex items-center gap-2">
                {selectedAction === 'VERIFY' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : selectedAction === 'ESCALATE' ? (
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-400" />
                )}
                <span>
                  {selectedAction === 'VERIFY'
                    ? 'Verify Report & Dispatch Rescue'
                    : selectedAction === 'ESCALATE'
                      ? 'Escalate Incident & Dispatch Squad'
                      : 'Reject Report'}
                </span>
              </h4>
              <button
                type="button"
                onClick={() => setShowNotesModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              {selectedAction === 'VERIFY'
                ? 'Approving confirms this flood hazard on the live GIS situational map and allows assigning a rescue squad directly to this location.'
                : selectedAction === 'ESCALATE'
                  ? 'Escalates this report to high-priority disaster status and automatically dispatches a rescue team to the site.'
                  : 'Rejecting marks this report as invalid and excludes it from public warnings.'}
            </p>

            {/* Rescue Assignment Option for Verify and Escalate */}
            {selectedAction !== 'REJECT' && (
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-cyan-300">
                  <input
                    type="checkbox"
                    checked={assignRescueSquad}
                    onChange={(e) => setAssignRescueSquad(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-slate-800 border-slate-700"
                  />
                  <span>🚒 Assign & Dispatch Tactical Rescue Squad to this Location</span>
                </label>

                {assignRescueSquad && (
                  <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Select Rescue Squad *</label>
                      <select
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                      >
                        {availableTeams.length > 0 ? (
                          availableTeams.map((t) => (
                            <option key={t._id || t.id} value={t._id || t.id}>
                              {t.teamName} ({t.teamCode || 'SQUAD'}) - Status: {t.status || 'AVAILABLE'}
                            </option>
                          ))
                        ) : (
                          <option value="">No rescue squads loaded</option>
                        )}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Estimated ETA (Mins)</label>
                        <input
                          type="number"
                          min="1"
                          max="180"
                          value={estimatedEta}
                          onChange={(e) => setEstimatedEta(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Target Location</label>
                        <input
                          type="text"
                          disabled
                          value={formatLocationText(report.location || report.address, 'Hazard Location')}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs truncate"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Verification & Tactical Dispatch Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder="e.g. Ground inundation verified at 1.2m depth; NDRF squad dispatched for barrier evacuation..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer flex items-center gap-1.5 ${selectedAction === 'VERIFY'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : selectedAction === 'ESCALATE'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm {selectedAction}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Rescue Assignment Modal for Verified Reports */}
      {showDirectAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-extrabold text-base flex items-center gap-2 text-cyan-300">
                <LifeBuoy className="w-5 h-5 text-cyan-400" />
                <span>Dispatch Rescue Squad to Location</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowDirectAssignModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Assign an active rescue squad to the verified ground coordinates at{' '}
              <strong className="text-white">
                {formatLocationText(report.location || report.address, 'Hazard Location')}
              </strong>
              .
            </p>

            <form onSubmit={handleDirectAssignConfirm} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Rescue Squad *</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  required
                >
                  {availableTeams.length > 0 ? (
                    availableTeams.map((t) => (
                      <option key={t._id || t.id} value={t._id || t.id}>
                        {t.teamName} ({t.teamCode || 'SQUAD'}) - Status: {t.status || 'AVAILABLE'}
                      </option>
                    ))
                  ) : (
                    <option value="">No rescue squads available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Estimated ETA (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={estimatedEta}
                  onChange={(e) => setEstimatedEta(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Dispatch Operational Instructions</label>
                <textarea
                  rows={3}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="e.g. Approach from Sector 4 high embankment; evacuate 2 stranded households..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDirectAssignModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Rescue Squad</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
