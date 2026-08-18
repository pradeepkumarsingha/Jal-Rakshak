import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useFloodData } from '../../context/FloodDataContext'
import { useAlert } from '../../context/AlertContext'
import {
  ShieldAlert,
  Flame,
  Radio,
  MapPin,
  Home,
  Navigation,
  FilePlus2,
  Bot,
  Users,
  LifeBuoy,
  ChevronRight,
  Sparkles,
  PhoneCall,
  Activity,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

export default function Landing() {
  const { switchRole } = useAuth()
  const { rivers, riskScore } = useFloodData()
  const { activeCriticalAlert } = useAlert()

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-brand-950 text-white pt-12 pb-20 sm:pt-16 sm:pb-28">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/20 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Live Alert Ticker */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold mb-6 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span className="font-extrabold text-white">RED ALERT:</span>
            <span>Mahanadi basin at Naraj (26.85m) exceeds Danger mark. 28 sluice gates opened.</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-brand-300 to-blue-400">Flood Intelligence</span> & Emergency Response
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Hyper-localized inundation forecasting, crowd-sourced hazard verification, smart relief shelter routing, and unified rescue coordination for disaster-resilient communities across India.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/emergency"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 flex items-center gap-2 transition transform active:scale-95 animate-pulse"
                >
                  <Flame className="w-5 h-5" />
                  <span>Launch Emergency SOS</span>
                </Link>

                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/20 flex items-center gap-2 transition"
                >
                  <span>Citizen Flood Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/map"
                  className="px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center gap-2 transition"
                >
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Interactive Map</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>NDMA / CWC Certified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>AI Inundation Model</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-brand-400" />
                  <span>Offline SMS Ready</span>
                </div>
              </div>
            </div>

            {/* Right Live Telemetry Card Preview */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-400 animate-pulse" />
                    <span className="font-extrabold text-sm text-white">Live Catchment Telemetry</span>
                  </div>
                  <span className="text-[10px] font-mono bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30">
                    CWC SENSORS LIVE
                  </span>
                </div>

                {/* Rivers preview */}
                <div className="space-y-2">
                  {rivers.slice(0, 3).map((r) => (
                    <div key={r.id} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white text-xs">{r.name}</div>
                        <span className="text-[10px] text-slate-400">Danger: {r.dangerLevel}m • Inflow: {r.inflow}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-extrabold block ${
                          r.currentLevel >= r.dangerLevel ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {r.currentLevel}m
                        </span>
                        <span className="text-[9px] font-bold text-red-300 uppercase">
                          {r.currentLevel >= r.dangerLevel ? '▲ DANGER' : 'WARNING'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-brand-950/60 rounded-2xl border border-brand-800/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-300">Local Vulnerability Index</span>
                    <div className="font-extrabold text-base text-white mt-0.5">Cuttack District: {riskScore}/100</div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-500 transition"
                  >
                    View Radar &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Portal Selection Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Citizen Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col justify-between hover:-translate-y-1 transition duration-200">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Mobile-First Public Portal</span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">Citizen Life-Safety Hub</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Check personalized localized flood risk, find verified relief shelters with vacant capacity, navigate safe elevated routes, and report waterlogged streets.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                to="/dashboard"
                onClick={() => switchRole('citizen')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
              >
                <span>Enter Citizen Portal</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Admin Command Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col justify-between hover:-translate-y-1 transition duration-200">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/30">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Command & Control Operations</span>
              <h3 className="text-xl font-extrabold text-white mt-1">Disaster Command Center</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Live multi-district GIS situational map, AI-driven SOS triage prioritization, citizen hazard report verification queue, and emergency siren broadcasting.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                to="/admin"
                onClick={() => switchRole('admin')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
              >
                <span>Launch Admin Command</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Rescue Field Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col justify-between hover:-translate-y-1 transition duration-200">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Field Tactical Units</span>
              <h3 className="text-xl font-extrabold text-white mt-1">NDRF & Rescue Teams</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Field mission assignments, victim coordinates, medical priority flags, boat navigation avoidance routes, and step-by-step extraction workflow.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                to="/rescue"
                onClick={() => switchRole('rescue')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
              >
                <span>Open Tactical Portal</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Complete Disaster Intelligence Suite
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Built for Zero-Delay Emergency Response
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Every module is designed to save lives during critical pre-flood and active inundation windows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">GIS Inundation Map</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Interactive Leaflet maps with dynamic flood polygons, color-coded danger levels, and live time-lapse surge predictions.
            </p>
            <Link to="/map" className="text-xs font-bold text-brand-600 inline-flex items-center gap-1">
              Explore Map &rarr;
            </Link>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Home className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Relief Shelter Finder</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time occupancy tracking, elevation checks, and verification of medical aid, power backup, and food supplies.
            </p>
            <Link to="/shelters" className="text-xs font-bold text-brand-600 inline-flex items-center gap-1">
              Find Shelters &rarr;
            </Link>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Navigation className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">AI Safe Route Pathfinder</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calculates elevated, clear evacuation corridors while avoiding waterlogged roads, low underpasses, and broken bridges.
            </p>
            <Link to="/route" className="text-xs font-bold text-brand-600 inline-flex items-center gap-1">
              Test Route &rarr;
            </Link>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Crowd Hazard Reporting</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload photos with AI Computer Vision water depth analysis to alert authorities and pin hazard warnings on the live map.
            </p>
            <Link to="/report" className="text-xs font-bold text-brand-600 inline-flex items-center gap-1">
              Report Hazard &rarr;
            </Link>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Jal Rakshak AI Advisor</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Multilingual emergency assistant trained on NDMA protocols to guide you on drinking water purification and evacuation steps.
            </p>
            <Link to="/chat" className="text-xs font-bold text-brand-600 inline-flex items-center gap-1">
              Chat with AI &rarr;
            </Link>
          </div>

          <div className="p-6 bg-red-50/60 rounded-3xl border border-red-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-red-950">5-Step SOS Distress Wizard</h4>
            <p className="text-xs text-red-900/80 leading-relaxed">
              Broadcasts victim GPS coordinates, headcount, medical urgency, and water rise rate directly to NDRF rescue teams.
            </p>
            <Link to="/emergency" className="text-xs font-bold text-red-700 inline-flex items-center gap-1">
              Broadcast SOS &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
