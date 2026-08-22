import React, { useState, useEffect, useCallback } from 'react'
import { reportApi } from '../../services/reportApi'
import { emergencyApi } from '../../services/emergencyApi'
import { useAlert } from '../../context/AlertContext'
import { getSocket } from '../../services/socket'
import ReportVerificationCard from '../../components/admin/ReportVerificationCard'
import { formatLocationText } from '../../utils/helpers'
import { FileCheck2, Filter, Search, ShieldAlert, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react'

export default function ReportsManagement() {
  const { showToast } = useAlert()
  const [reports, setReports] = useState([])
  const [availableTeams, setAvailableTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all citizen reports & available rescue squads from MongoDB
      const [reportsData, teamsData] = await Promise.all([
        reportApi.getAllReports(),
        emergencyApi.getAvailableRescueTeams(),
      ])
      setReports(Array.isArray(reportsData) ? reportsData : [])
      setAvailableTeams(Array.isArray(teamsData) ? teamsData : [])
    } catch (err) {
      console.warn('Failed to load reports & rescue teams:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports()

    // Socket.IO Real-time updates
    const socket = getSocket()
    if (socket) {
      const handleNewReport = (newReport) => {
        setReports((prev) => [newReport, ...prev])
        showToast({
          title: 'New Hazard Report Submitted',
          message: `${newReport.waterLevel} water level reported near ${newReport.address || 'Ground Location'}.`,
          type: 'info',
        })
      }

      const handleReportUpdated = (updatedReport) => {
        setReports((prev) =>
          prev.map((r) =>
            String(r.reportId || r._id || r.id) === String(updatedReport.reportId || updatedReport._id || updatedReport.id)
              ? {
                  ...r,
                  ...updatedReport,
                  verificationStatus: updatedReport.verificationStatus || updatedReport.status,
                  assignedTeam: updatedReport.assignedTeam || r.assignedTeam,
                  assignedTeamName: updatedReport.assignedTeam?.teamName || updatedReport.assignedTeamName || r.assignedTeamName,
                }
              : r
          )
        )
      }

      socket.on('report:new', handleNewReport)
      socket.on('report:updated', handleReportUpdated)

      return () => {
        socket.off('report:new', handleNewReport)
        socket.off('report:updated', handleReportUpdated)
      }
    }
  }, [fetchReports, showToast])

  const handleVerify = async (reportId, action, notes, options = {}) => {
    try {
      const res = await reportApi.verifyReport(reportId, action, notes, options)
      const updatedData = res.data || res

      showToast({
        title:
          action === 'VERIFY'
            ? 'Report Verified & Published'
            : action === 'ESCALATE'
            ? 'Escalated to Rescue Fleet'
            : 'Report Marked Rejected',
        message: `Report ${reportId} successfully updated to ${action}.${
          options.rescueTeamId ? ' Rescue squad dispatched to location!' : ''
        }`,
        type: action === 'VERIFY' ? 'success' : action === 'ESCALATE' ? 'error' : 'info',
      })

      // Update the report in state with the new verification and rescue squad status
      setReports((prev) =>
        prev.map((r) =>
          String(r.reportId || r._id || r.id) === String(reportId)
            ? {
                ...r,
                verificationStatus: action === 'VERIFY' ? 'VERIFIED' : action === 'ESCALATE' ? 'ESCALATED' : 'REJECTED',
                status: action === 'VERIFY' ? 'VERIFIED' : action === 'ESCALATE' ? 'ESCALATED' : 'REJECTED',
                assignedTeam: updatedData.assignedTeam || r.assignedTeam,
                assignedTeamName: updatedData.assignedTeam?.teamName || r.assignedTeamName,
                verification: updatedData.verification || {
                  action,
                  notes,
                  verifiedAt: new Date().toISOString(),
                },
              }
            : r
        )
      )
    } catch (err) {
      showToast({
        title: 'Action Failed',
        message: err.response?.data?.error?.message || 'Failed to update report verification status.',
        type: 'error',
      })
    }
  }

  const handleAssignRescue = async (reportId, options) => {
    try {
      const res = await reportApi.assignRescueTeam(reportId, options)
      const data = res.data || res

      showToast({
        title: 'Rescue Squad Dispatched!',
        message: `Assigned rescue team to hazard site for report ${reportId}.`,
        type: 'success',
      })

      setReports((prev) =>
        prev.map((r) =>
          String(r.reportId || r._id || r.id) === String(reportId)
            ? {
                ...r,
                assignedTeam: data.assignedTeam,
                assignedTeamName: data.assignedTeam?.teamName,
                verificationStatus: 'VERIFIED',
                status: 'VERIFIED',
              }
            : r
        )
      )
    } catch (err) {
      showToast({
        title: 'Dispatch Failed',
        message: err.response?.data?.error?.message || 'Failed to dispatch rescue squad to report.',
        type: 'error',
      })
    }
  }

  const filtered = reports
    .filter((r) => {
      const st = (r.verificationStatus || r.status || 'PENDING').toUpperCase()
      if (filter === 'PENDING') return st === 'PENDING' || st === 'PENDING_REVIEW'
      if (filter === 'VERIFIED') return st === 'VERIFIED'
      if (filter === 'ESCALATED') return st === 'ESCALATED' || st === 'ESCALATED_TO_RESCUE'
      return true
    })
    .filter((r) => {
      const loc = formatLocationText(r.location || r.address, '')
      const desc = r.description || ''
      const user = r.user?.fullName || r.citizenName || r.user || ''
      const team = r.assignedTeam?.teamName || r.assignedTeamName || ''
      return (
        loc.toLowerCase().includes(search.toLowerCase()) ||
        desc.toLowerCase().includes(search.toLowerCase()) ||
        String(user).toLowerCase().includes(search.toLowerCase()) ||
        team.toLowerCase().includes(search.toLowerCase())
      )
    })

  const pendingCount = reports.filter((r) => (r.verificationStatus || r.status || 'PENDING').toUpperCase() === 'PENDING').length
  const verifiedCount = reports.filter((r) => (r.verificationStatus || r.status || '').toUpperCase() === 'VERIFIED').length
  const escalatedCount = reports.filter((r) => (r.verificationStatus || r.status || '').toUpperCase().includes('ESCALAT')).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Citizen Ground Intelligence Queue
            </span>
            <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
              TACTICAL RESCUE DISPATCH ENABLED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
            Hazard Report Verification & Dispatch
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review crowd-sourced flood photos, verify AI severity, and immediately deploy tactical rescue squads to verified hazard locations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchReports}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Filter Pills with Counts */}
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
            {[
              { key: 'ALL', label: 'ALL', count: reports.length },
              { key: 'PENDING', label: 'PENDING', count: pendingCount },
              { key: 'VERIFIED', label: 'VERIFIED', count: verifiedCount },
              { key: 'ESCALATED', label: 'ESCALATED', count: escalatedCount },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  filter === f.key ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    filter === f.key ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            <span>Loading citizen reports & rescue squads from MongoDB...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-500">
            <FileCheck2 className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-bold text-slate-300">No reports in the "{filter}" queue.</p>
            <p className="text-xs text-slate-500 mt-1">Select another filter tab or submit a new citizen report to view.</p>
          </div>
        ) : (
          filtered.map((rep) => (
            <ReportVerificationCard
              key={rep.reportId || rep._id || rep.id}
              report={rep}
              availableTeams={availableTeams}
              onVerify={handleVerify}
              onAssignRescue={handleAssignRescue}
            />
          ))
        )}
      </div>
    </div>
  )
}
