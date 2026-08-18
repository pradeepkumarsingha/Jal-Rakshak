import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useFloodData } from '../../context/FloodDataContext'
import {
  LayoutDashboard,
  FileCheck2,
  AlertTriangle,
  Home,
  BarChart3,
  LifeBuoy,
  ClipboardList,
  Shield,
  Activity,
  PhoneCall,
  ExternalLink,
} from 'lucide-react'

export default function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()
  const { emergencies, reports } = useFloodData()

  const pendingEmergencies = emergencies.filter((e) => e.status === 'PENDING_ASSIGNMENT').length
  const pendingReports = reports.filter((r) => r.status === 'PENDING_REVIEW').length

  const adminLinks = [
    { name: 'Command Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Live SOS Triage', path: '/admin/emergencies', icon: AlertTriangle, badge: pendingEmergencies, badgeColor: 'bg-red-500 text-white' },
    { name: 'Citizen Report Review', path: '/admin/reports', icon: FileCheck2, badge: pendingReports, badgeColor: 'bg-amber-500 text-white' },
    { name: 'Shelter Network', path: '/admin/shelters', icon: Home },
    { name: 'Predictive Analytics', path: '/admin/analytics', icon: BarChart3 },
  ]

  const rescueLinks = [
    { name: 'Field Operations HQ', path: '/rescue', icon: LifeBuoy },
    { name: 'Assigned Missions', path: '/rescue/assignments', icon: ClipboardList, badge: emergencies.filter((e) => e.status === 'IN_PROGRESS' || e.status === 'DISPATCHED').length, badgeColor: 'bg-emerald-500 text-white' },
  ]

  const links = user?.role === 'rescue' ? rescueLinks : adminLinks
  const isRescue = user?.role === 'rescue'

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Portal Header Badge */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${isRescue ? 'bg-emerald-600' : 'bg-brand-600'}`}>
            {isRescue ? <LifeBuoy className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isRescue ? 'Tactical Unit Portal' : 'State Control Center'}
            </h2>
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Authorized Officer'}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] bg-slate-800/80 px-2.5 py-1.5 rounded-lg text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetry Link: Online</span>
          </span>
          <span className="font-mono text-emerald-400">99.8%</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Command Modules
        </div>
        {links.map((link) => {
          const Icon = link.icon
          const active = location.pathname === link.path
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                active
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </div>
              {link.badge !== undefined && link.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${link.badgeColor}`}>
                  {link.badge}
                </span>
              )}
            </Link>
          )
        })}

        <div className="pt-4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Quick Portals
        </div>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Switch to Citizen View</span>
        </Link>
        <Link
          to="/map"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Full GIS Tactical Map</span>
        </Link>
      </nav>

      {/* Emergency Comms Footer */}
      <div className="p-3 m-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
          <PhoneCall className="w-3.5 h-3.5 text-red-400" />
          <span>Priority Radio Comms</span>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">
          VHF Ch 16 / Sat-Phone: 1078 (Ext 401)
        </p>
      </div>
    </aside>
  )
}
