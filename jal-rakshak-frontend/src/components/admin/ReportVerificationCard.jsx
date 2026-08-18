import React from 'react'
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
} from 'lucide-react'

export default function ReportVerificationCard({ report, onVerify }) {
  if (!report) return null

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col md:flex-row gap-5">
      {/* Photo Preview */}
      <div className="w-full md:w-56 h-48 rounded-xl overflow-hidden bg-slate-950 shrink-0 relative border border-slate-800">
        <img
          src={report.imageUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'}
          alt="Ground verification"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] font-mono text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>AI Conf: {report.aiConfidence || 95}%</span>
        </div>
      </div>

      {/* Report Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                {report.id}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                report.status === 'VERIFIED'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : report.status === 'ESCALATED_TO_RESCUE'
                  ? 'bg-red-500/20 text-red-300'
                  : report.status === 'REJECTED'
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-amber-500/20 text-amber-300 animate-pulse'
              }`}>
                {report.status.replace(/_/g, ' ')}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatTimeAgo(report.timestamp)}
            </span>
          </div>

          <h4 className="font-extrabold text-base text-white mt-1.5">{report.category}</h4>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-brand-400" />
            <span>{report.location}</span>
          </p>

          <div className="mt-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs space-y-1">
            <p className="text-slate-300 italic">"{report.description}"</p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <span>Reported By: <strong className="text-slate-200">{report.user}</strong></span>
              <span>Observed Depth: <strong className="text-amber-400">{report.waterDepth}</strong></span>
            </div>
          </div>
        </div>

        {/* Verification Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-2 flex-wrap">
          <button
            onClick={() => onVerify(report.id, 'REJECT')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
          >
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Mark False / Reject</span>
          </button>
          <button
            onClick={() => onVerify(report.id, 'ESCALATE')}
            className="px-3.5 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1 transition shadow"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Escalate to NDRF</span>
          </button>
          <button
            onClick={() => onVerify(report.id, 'APPROVE')}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-md shadow-emerald-600/20"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Approve & Broadcast Map Pin</span>
          </button>
        </div>
      </div>
    </div>
  )
}
