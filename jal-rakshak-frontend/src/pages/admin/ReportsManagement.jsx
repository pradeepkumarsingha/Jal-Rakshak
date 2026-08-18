import React, { useState } from 'react'
import { useFloodData } from '../../context/FloodDataContext'
import { useAlert } from '../../context/AlertContext'
import ReportVerificationCard from '../../components/admin/ReportVerificationCard'
import { FileCheck2, Filter, Search, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react'

export default function ReportsManagement() {
  const { reports, verifyReport } = useFloodData()
  const { showToast } = useAlert()
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const handleVerify = (reportId, action) => {
    verifyReport(reportId, action)
    showToast({
      title: action === 'APPROVE' ? 'Report Approved & Broadcasted' : action === 'ESCALATE' ? 'Escalated to NDRF Rescue' : 'Report Rejected',
      message: `Report ${reportId} updated to ${action}.`,
      type: action === 'APPROVE' ? 'success' : action === 'ESCALATE' ? 'error' : 'info',
    })
  }

  const filtered = reports.filter((r) => {
    if (filter === 'PENDING') return r.status === 'PENDING_REVIEW'
    if (filter === 'VERIFIED') return r.status === 'VERIFIED'
    if (filter === 'ESCALATED') return r.status === 'ESCALATED_TO_RESCUE'
    return true
  }).filter((r) =>
    r.location.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    r.user.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            Citizen Ground Intelligence Queue
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
            Citizen Hazard Report Verification
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review crowd-sourced flood photos, verify AI Computer Vision water depth estimations, and broadcast confirmed hazards to the public map.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
          {['ALL', 'PENDING', 'VERIFIED', 'ESCALATED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filter === f ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Feed */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-500">
            <FileCheck2 className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-bold text-slate-300">No reports match the current filter.</p>
          </div>
        ) : (
          filtered.map((rep) => (
            <ReportVerificationCard
              key={rep.id}
              report={rep}
              onVerify={handleVerify}
            />
          ))
        )}
      </div>
    </div>
  )
}
