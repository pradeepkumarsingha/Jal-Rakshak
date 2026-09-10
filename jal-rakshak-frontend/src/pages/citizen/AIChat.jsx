import React, { useState } from 'react'
import ChatInterface from '../../components/ai/ChatInterface'
import {
  Bot,
  Sparkles,
  PhoneCall,
  Activity,
  ShieldCheck,
  Droplets,
  AlertTriangle,
  Flame,
  MapPin,
  ExternalLink,
  MessageSquare,
  Radio,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AIChat() {
  const [activeMobileTab, setActiveMobileTab] = useState('chat') // 'chat' | 'intel'

  const hotlines = [
    { label: 'NDRF Disaster Helpline', number: '1078', badge: 'National', color: 'bg-red-600' },
    { label: 'Unified Emergency SOS', number: '112', badge: '24/7 Police/Medical', color: 'bg-rose-600' },
    { label: 'Odisha State EOC', number: '1070', badge: 'State Control', color: 'bg-amber-600' },
    { label: 'Flood Control Room', number: '0671-2410777', badge: 'Cuttack/Mahanadi', color: 'bg-brand-600' },
  ]

  const riverBasins = [
    { name: 'Mahanadi Basin (Mundali)', status: 'Elevated Watch', level: '11.8m', discharge: '5.2L cusec', alert: 'amber' },
    { name: 'Brahmani River (Jenapur)', status: 'Safe Normal', level: '19.4m', discharge: '1.1L cusec', alert: 'emerald' },
    { name: 'Baitarani (Akhuapada)', status: 'Approaching Warning', level: '17.2m', discharge: '2.4L cusec', alert: 'amber' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 flex flex-col min-h-[calc(100dvh-4.5rem)] lg:min-h-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 sm:mb-5 shrink-0">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-2xl bg-gradient-to-tr from-brand-700 to-cyan-500 text-white shadow-md shadow-brand-500/20 shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight">
                  Jal Rakshak AI Advisor
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold tracking-wide uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active RAG
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1 sm:line-clamp-none">
                Real-time flood intelligence with CWC river sensors, NDMA guidelines & shelter routing.
              </p>
            </div>
          </div>
        </div>

        {/* Quick SOS Shortcut */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/emergency"
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-[11px] sm:text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-600/30 transition transform active:scale-95 shrink-0"
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Launch SOS Beacon</span>
          </Link>
        </div>
      </div>

      {/* Mobile Tab Switcher (< lg screens) */}
      <div className="flex lg:hidden items-center p-1 bg-slate-200/70 backdrop-blur-xs rounded-2xl mb-3 shrink-0">
        <button
          type="button"
          onClick={() => setActiveMobileTab('chat')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
            activeMobileTab === 'chat'
              ? 'bg-white text-brand-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
          <span>AI Advisor Chat</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('intel')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
            activeMobileTab === 'intel'
              ? 'bg-white text-red-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5 text-red-600" />
          <span>Helplines & Intel</span>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-0.5"></span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 min-h-0 lg:grid lg:grid-cols-12 lg:gap-5 lg:h-[calc(100vh-13rem)] lg:min-h-[640px] lg:max-h-[920px]">
        {/* Chat Interface Column */}
        <div
          className={`h-[calc(100dvh-13.5rem)] sm:h-[calc(100dvh-14rem)] lg:h-full min-h-0 lg:col-span-8 flex flex-col ${
            activeMobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <ChatInterface onOpenIntel={() => setActiveMobileTab('intel')} />
        </div>

        {/* Emergency Tactical Intelligence Sidebar */}
        <div
          className={`h-full min-h-0 lg:col-span-4 flex flex-col gap-3.5 overflow-y-auto pr-0.5 ${
            activeMobileTab === 'intel' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* 1-Click Emergency Helplines */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-3.5 sm:p-4 shadow-sm shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                <span>Emergency Hotlines</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">24/7 Toll-Free</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {hotlines.map((h, i) => (
                <a
                  key={i}
                  href={`tel:${h.number.replace(/[^0-9]/g, '')}`}
                  className="group p-2.5 rounded-2xl bg-slate-50 hover:bg-red-50/80 border border-slate-200 hover:border-red-300 transition flex items-center justify-between cursor-pointer active:scale-[0.99]"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-red-700">{h.label}</span>
                      <span className="text-[9px] font-semibold text-slate-500 bg-slate-200/70 group-hover:bg-red-100 group-hover:text-red-800 px-1.5 py-0.2 rounded-full">
                        {h.badge}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-black text-red-600">{h.number}</span>
                  </div>
                  <span className="p-2 rounded-xl bg-red-600 group-hover:bg-red-700 text-white shadow-xs">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Live River Discharge Gauge Glance */}
          <div className="bg-slate-950 text-white rounded-3xl p-3.5 sm:p-4 border border-slate-800 shadow-md shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>CWC River Gauges</span>
              </h3>
              <Link to="/dashboard" className="text-[10px] text-slate-400 hover:text-cyan-300 underline">
                View Live Map &rarr;
              </Link>
            </div>

            <div className="space-y-2">
              {riverBasins.map((rb, idx) => (
                <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-[11px]">{rb.name}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        rb.alert === 'amber'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {rb.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-800/80">
                    <span>Level: <strong className="text-white">{rb.level}</strong></span>
                    <span>Discharge: <strong className="text-cyan-400">{rb.discharge}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Life Safety Protocol Card */}
          <div className="bg-gradient-to-br from-cyan-900/20 via-brand-900/10 to-slate-50 rounded-3xl border border-cyan-200/80 p-3.5 sm:p-4 shadow-sm flex-1">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-950 flex items-center gap-1.5 mb-2.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-600" />
              <span>Safe Drinking Water Formula</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                <strong className="text-slate-900 block text-[11px]">1. Rolling Boil:</strong>
                <p className="text-[11px] text-slate-600 mt-0.5">Boil water vigorously for minimum <strong>3 minutes</strong> before consuming.</p>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                <strong className="text-slate-900 block text-[11px]">2. Chlorine Disinfection:</strong>
                <p className="text-[11px] text-slate-600 mt-0.5">Add <strong>2 drops</strong> of 5% chlorine bleach per liter. Wait 30 mins before use.</p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-cyan-100 flex items-center justify-between text-[11px]">
              <Link to="/shelters" className="text-brand-700 hover:text-brand-900 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Find Safe Shelters</span>
              </Link>
              <Link to="/map" className="text-cyan-700 hover:text-cyan-900 font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Flood Map</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
