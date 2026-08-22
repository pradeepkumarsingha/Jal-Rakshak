import React, { useState } from 'react'
import { formatTimeAgo } from '../../utils/helpers'
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
} from 'lucide-react'

export default function ReportVerificationCard({ report, onVerify }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [verifyNotes, setVerifyNotes] = useState('')
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)

  if (!report) return null

  const imageUrl =
    report.image?.secureUrl ||
    report.imageUrl ||
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'

  const ai = report.aiAnalysis || {}
  const status = report.verificationStatus || report.status || 'PENDING'

  const handleActionClick = (action) => {
    setSelectedAction(action)
    setShowNotesModal(true)
  }

  const handleConfirmAction = () => {
    if (onVerify && selectedAction) {
      onVerify(report.reportId || report.id, selectedAction, verifyNotes)
    }
    setShowNotesModal(false)
    setVerifyNotes('')
    setSelectedAction(null)
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col md:flex-row gap-5 transition hover:border-slate-700">
      {/* Photo Preview & Lightbox Trigger */}
      <div className="w-full md:w-56 h-48 rounded-xl overflow-hidden bg-slate-950 shrink-0 relative border border-slate-800 group">
        <img
          src={imageUrl}
          alt="Ground verification"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={() => setModalOpen(true)}
        />
        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[10px] font-mono border flex items-center gap-1 ${
          ai.floodDetected === false 
            ? 'text-rose-400 border-rose-500/30' 
            : 'text-cyan-300 border-cyan-500/30'
        }`}>
          <Sparkles className="w-3 h-3" />
          <span>AI Severity: {ai.floodDetected === false ? 'FALSE' : (ai.severity || 'UNKNOWN')}</span>
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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                {report.reportId || report.id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  status === 'VERIFIED'
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
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatTimeAgo(report.submittedAt || report.createdAt)}
            </span>
          </div>

          <p className="text-xs text-slate-300 flex items-center gap-1 mt-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span>{report.location?.address || report.address || (typeof report.location === 'string' ? report.location : 'Location')}</span>
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
                <strong className="text-cyan-400">{ai.floodDetected === false ? 'N/A' : (ai.roadCondition || 'UNKNOWN')}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Confidence</span>
                <strong className="text-emerald-400">{ai.confidence ? `${(ai.confidence * 100).toFixed(0)}%` : 'N/A'}</strong>
              </div>
            </div>
          </div>

          {/* AI Estimate Disclaimer */}
          {ai.floodDetected === false ? (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-rose-300 bg-rose-950/40 px-2.5 py-1.5 rounded-lg border border-rose-500/30">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span><strong>AI Verification Failed:</strong> {ai.message || ai.rawResponse?.message || 'This image does not contain a genuine flood.'}</span>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-300/80 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>AI model output is an estimate. Administrator ground verification is required.</span>
            </div>
          )}
        </div>

        {/* Verification Actions */}
        {status === 'PENDING' && (
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 flex-wrap">
            <button
              onClick={() => handleActionClick('REJECT')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
            >
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Reject / False Report</span>
            </button>
            <button
              onClick={() => handleActionClick('ESCALATE')}
              className="px-3.5 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1 transition shadow"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Escalate Incident</span>
            </button>
            <button
              onClick={() => handleActionClick('VERIFY')}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-md shadow-emerald-600/20"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Verify & Broadcast</span>
            </button>
          </div>
        )}
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
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto bg-black flex items-center justify-center p-2">
              <img src={imageUrl} alt="Hazard full resolution" className="max-h-[65vh] object-contain rounded-xl" />
            </div>
            <div className="p-3 bg-slate-950 text-xs text-slate-300 flex items-center justify-between">
              <span>Cloudinary URL: {imageUrl.slice(0, 50)}...</span>
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

      {/* Confirmation & Note Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <h4 className="font-extrabold text-base flex items-center gap-2">
              {selectedAction === 'VERIFY' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : selectedAction === 'ESCALATE' ? (
                <ShieldAlert className="w-5 h-5 text-red-400" />
              ) : (
                <XCircle className="w-5 h-5 text-slate-400" />
              )}
              <span>Confirm {selectedAction} Action</span>
            </h4>

            <p className="text-xs text-slate-400">
              {selectedAction === 'VERIFY'
                ? 'Approving will make this hazard point visible on public risk layers and route guidance.'
                : selectedAction === 'ESCALATE'
                ? 'Escalating flags this report for immediate tactical rescue review.'
                : 'Rejecting will hide this report from public maps.'}
            </p>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Verification / Operator Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder="e.g., Confirmed with local ward volunteer; flood surge confirmed..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg ${
                  selectedAction === 'VERIFY'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : selectedAction === 'ESCALATE'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                Confirm {selectedAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
