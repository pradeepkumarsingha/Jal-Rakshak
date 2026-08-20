import React from 'react'
import { Link } from 'react-router-dom'
import { HELPLINE_NUMBERS } from '../../utils/constants'
import { ShieldCheck, Phone, Radio } from 'lucide-react'
import JalRakshakLogo from './JalRakshakLogo'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      {/* Emergency Helplines Bar */}
      <div className="bg-slate-950 border-b border-slate-800/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              24/7 National & State Emergency Helplines
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {HELPLINE_NUMBERS.map((h) => (
              <a
                key={h.number}
                href={`tel:${h.number.replace(/\s+/g, '')}`}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500 transition group flex flex-col justify-between"
              >
                <span className="text-[11px] font-medium text-slate-400 truncate">{h.name}</span>
                <span className="text-sm font-extrabold text-brand-400 group-hover:text-white flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3 text-red-400" /> {h.number}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link to="/" className="inline-block">
              <JalRakshakLogo variant="horizontal" size="sm" theme="dark" showTagline={true} />
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              India's Next-Generation AI-powered flood forecasting, localized inundation intelligence, and unified emergency rescue dispatch network.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>NDMA / CWC Certified Protocol</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Citizen Safety Portals</h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li><Link to="/dashboard" className="hover:text-brand-400 transition">Localized Flood Risk Index</Link></li>
              <li><Link to="/map" className="hover:text-brand-400 transition">Interactive GIS Inundation Map</Link></li>
              <li><Link to="/shelters" className="hover:text-brand-400 transition">Verified Relief Camps Finder</Link></li>
              <li><Link to="/route" className="hover:text-brand-400 transition">High-Ground Safe Route Finder</Link></li>
              <li><Link to="/report" className="hover:text-brand-400 transition">Crowd-Source Flood Hazard</Link></li>
              <li><Link to="/chat" className="hover:text-brand-400 transition">Jal Rakshak AI Advisor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Disaster Authorities</h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li><Link to="/admin" className="hover:text-brand-400 transition">State Disaster Command Center</Link></li>
              <li><Link to="/admin/emergencies" className="hover:text-brand-400 transition">Live SOS Triage & Allocation</Link></li>
              <li><Link to="/admin/reports" className="hover:text-brand-400 transition">AI Report Verification Queue</Link></li>
              <li><Link to="/rescue" className="hover:text-brand-400 transition">NDRF / SDRF Field Operations</Link></li>
              <li><Link to="/admin/analytics" className="hover:text-brand-400 transition">Hydrograph Telemetry Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Preparedness Guidelines</h4>
            <p className="text-slate-400 text-xs mb-3">
              Download the official NDMA Flood Safety Do's and Don'ts checklist and family evacuation playbook.
            </p>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-[11px] text-slate-300">
              <span className="font-semibold text-white">Emergency Offline SMS:</span>
              <p className="text-slate-400 mt-0.5">Send "HELP [PINCODE]" to <strong>51969</strong> for automated SMS shelter routing when cellular data is down.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
          <p>© {new Date().getFullYear()} Jal Rakshak AI Flood Intelligence Platform. Designed for Disaster Resilient Communities.</p>
          <div className="flex items-center gap-4">
            <span>English</span> • <span>हिन्दी</span> • <span>ଓଡ଼ିଆ</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
