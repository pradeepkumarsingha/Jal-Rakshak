import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useFloodData } from '../../context/FloodDataContext'
import { useAlert } from '../../context/AlertContext'
import { useLanguage } from '../../context/LanguageContext'
import RiskCard from '../../components/citizen/RiskCard'
import AlertBanner from '../../components/citizen/AlertBanner'
import ForecastTimeline from '../../components/citizen/ForecastTimeline'
import ShelterCard from '../../components/citizen/ShelterCard'
import {
  Flame,
  FilePlus2,
  Home,
  Navigation,
  Bot,
  MapPin,
  Activity,
  Phone,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react'

export default function CitizenDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { riskScore, rivers, forecastTimeline, shelters, reports, isLive, scenario } = useFloodData()
  const { alerts, activeCriticalAlert, dismissAlert } = useAlert()

  const quickActions = [
    {
      title: 'Broadcast SOS Beacon',
      desc: 'Instant GPS distress alert to NDRF & Local Control Room.',
      link: '/emergency',
      icon: Flame,
      color: 'bg-red-600 text-white shadow-red-600/30',
      urgent: true,
    },
    {
      title: 'Report Waterlogging',
      desc: 'Crowd-source road blocks & water depth with photo analysis.',
      link: '/report',
      icon: FilePlus2,
      color: 'bg-amber-500 text-white shadow-amber-500/20',
    },
    {
      title: 'Nearest Safe Shelter',
      desc: 'Verified relief camps with food, medical & power backup.',
      link: '/shelters',
      icon: Home,
      color: 'bg-purple-600 text-white shadow-purple-600/20',
    },
    {
      title: 'Safe Evacuation Route',
      desc: 'AI-computed elevated path avoiding submerged streets.',
      link: '/route',
      icon: Navigation,
      color: 'bg-emerald-600 text-white shadow-emerald-600/20',
    },
    {
      title: 'AI Flood Advisor',
      desc: 'Ask questions in English, Hindi, or Odia about safety & water.',
      link: '/chat',
      icon: Bot,
      color: 'bg-brand-600 text-white shadow-brand-600/20',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Active Alert Banner */}
      {activeCriticalAlert && (
        <AlertBanner alert={activeCriticalAlert} onDismiss={() => dismissAlert(activeCriticalAlert.id)} />
      )}

      {/* Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
            Citizen Emergency Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
            Welcome back, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            District: <strong className="text-slate-800">{user?.district || 'Cuttack, Odisha'}</strong> • Status: Live Satellite & River Gauge Link
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/emergency"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition transform active:scale-95 animate-pulse"
          >
            <Flame className="w-4 h-4" />
            <span>Emergency SOS</span>
          </Link>
          <Link
            to="/map"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition"
          >
            <MapPin className="w-4 h-4 text-brand-600" />
            <span>Full GIS Map</span>
          </Link>
        </div>
      </div>

      {/* Primary Flood Risk Gauge Card */}
      <RiskCard
        riskScore={riskScore}
        location={`${user?.district || 'Cuttack'}, Odisha Basin`}
        lastUpdated={new Date()}
      />

      {/* Quick Life-Saving Actions Grid */}
      <div>
        <h3 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Quick Life-Saving Actions</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {quickActions.map((action, idx) => {
            const Icon = action.icon
            return (
              <Link
                key={idx}
                to={action.link}
                className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-brand-500 hover:shadow-lg transition flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 shadow-md ${action.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-brand-600 transition">
                    {action.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {action.desc}
                  </p>
                </div>
                <div className="mt-3 text-[11px] font-bold text-brand-600 flex items-center gap-1">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 24h Predictive Hydrograph Timeline */}
      <ForecastTimeline forecast={forecastTimeline} />

      {/* Catchment River Gauges Telemetry */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-base font-extrabold text-slate-900 flex flex-wrap items-center gap-2">
            <Activity className="w-4 h-4 text-red-500 animate-pulse" />
            <span>Major River Catchment Gauges</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
              isLive 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-amber-100 text-amber-700 border border-amber-200'
            }`}>
              {isLive ? 'GloFAS Model Forecast' : 'Simulation'}
            </span>
          </h3>
          <span className="text-xs text-slate-500">Live Auto-Refresh (every 5 min)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rivers.map((river) => {
            const isDanger = river.currentLevel >= river.dangerLevel
            const isWarning = river.currentLevel >= river.warningLevel
            return (
              <div
                key={river.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    isDanger
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : isWarning
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isDanger ? '▲ Above Danger' : isWarning ? '▲ Warning Level' : 'Normal'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">{river.state}</span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{river.name}</h4>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">{river.currentLevel}m</span>
                    <span className="text-xs text-slate-500">Danger Mark: <strong>{river.dangerLevel}m</strong></span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Inflow / Outflow:</span>
                    <strong className="text-slate-800">{river.inflow}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Dam Gates:</span>
                    <strong className="text-brand-700">{river.gatesOpen}</strong>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Safety Disclaimer and Source Box */}
        <div className="mt-4 p-4 rounded-3xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-slate-800">Operational Notice & Safety Advisory</p>
            <p className="mt-1 leading-normal">
              The catchment levels and values displayed above are estimates computed from real-time satellite runoff forecasting models (Open-Meteo GloFAS) or simulated scenario presets. They do <strong>not</strong> represent official real-time physical telemetry feeds from the Central Water Commission (CWC) or warnings from the National Disaster Management Authority (NDMA). Citizens must prioritize local warning sirens, announcements, and direct district administration orders for any critical safety or evacuation decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Nearby Shelters Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Nearby Verified Relief Shelters</h3>
            <p className="text-xs text-slate-500">High-ground camps with clean water, food rations, and medical aid</p>
          </div>
          <Link to="/shelters" className="text-xs font-bold text-brand-600 hover:underline">
            View All ({shelters.length}) &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shelters.slice(0, 3).map((shelter) => (
            <ShelterCard key={shelter.id} shelter={shelter} />
          ))}
        </div>
      </div>
    </div>
  )
}
