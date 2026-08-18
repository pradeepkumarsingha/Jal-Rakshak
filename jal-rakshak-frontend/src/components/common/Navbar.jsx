import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useAlert } from '../../context/AlertContext'
import { useFloodData } from '../../context/FloodDataContext'
import LanguageSelector from './LanguageSelector'
import {
  ShieldAlert,
  Radio,
  MapPin,
  Home,
  Navigation,
  FilePlus2,
  Bot,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Bell,
  Sliders,
  UserCheck,
  Flame,
  Menu,
  X,
  PhoneCall,
} from 'lucide-react'

export default function Navbar() {
  const { user, logout, switchRole } = useAuth()
  const { t } = useLanguage()
  const { alerts, activeCriticalAlert } = useAlert()
  const { scenario, changeScenario } = useFloodData()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [simMenuOpen, setSimMenuOpen] = useState(false)
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)

  const navLinks = [
    { name: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.floodMap'), path: '/map', icon: MapPin },
    { name: t('nav.shelters'), path: '/shelters', icon: Home },
    { name: t('nav.safeRoute'), path: '/route', icon: Navigation },
    { name: t('nav.reportFlood'), path: '/report', icon: FilePlus2 },
    { name: t('nav.aiChat'), path: '/chat', icon: Bot },
  ]

  const isActive = (p) => location.pathname === p

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top emergency live alert strip if critical alert exists */}
      {activeCriticalAlert && (
        <div className="bg-red-600 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 max-w-5xl truncate mx-auto">
            <span className="flex h-2.5 w-2.5 rounded-full bg-white animate-ping" />
            <span className="uppercase tracking-wider font-extrabold bg-red-800 px-1.5 py-0.5 rounded text-[10px]">
              CRITICAL FLOOD ALERT
            </span>
            <span className="truncate">{activeCriticalAlert.title}: {activeCriticalAlert.message}</span>
          </div>
          <Link
            to="/emergency"
            className="ml-2 whitespace-nowrap bg-white text-red-700 hover:bg-red-50 text-[11px] font-bold px-2.5 py-0.5 rounded shadow"
          >
            SOS Broadcast &rarr;
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Jal <span className="text-brand-600">Rakshak</span>
                </span>
                <span className="text-[10px] font-bold uppercase bg-brand-100 text-brand-700 px-1.5 py-0.2 rounded border border-brand-200">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                National Flood Intelligence
              </p>
            </div>
          </Link>

          {/* Desktop Nav for Citizen */}
          {user?.role === 'citizen' && (
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      active
                        ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200/60 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Action Bar Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Simulation Scenario Switcher */}
            <div className="relative">
              <button
                onClick={() => setSimMenuOpen(!simMenuOpen)}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  scenario === 'FLASH_FLOOD_RED_ALERT'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : scenario === 'MONSOON_WARNING'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
                title="Scenario Simulator: Test different flood severities"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Sim:</span>
                <span className="font-bold">
                  {scenario === 'FLASH_FLOOD_RED_ALERT'
                    ? '⚡ Red Alert'
                    : scenario === 'MONSOON_WARNING'
                    ? '🌧️ Warning'
                    : '☀️ Normal'}
                </span>
              </button>

              {simMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Simulation Scenarios
                  </div>
                  <button
                    onClick={() => {
                      changeScenario('FLASH_FLOOD_RED_ALERT')
                      setSimMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center justify-between font-semibold"
                  >
                    <span>⚡ Flash Flood Red Alert</span>
                    {scenario === 'FLASH_FLOOD_RED_ALERT' && <span className="text-xs">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      changeScenario('MONSOON_WARNING')
                      setSimMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center justify-between font-semibold"
                  >
                    <span>🌧️ Monsoon Surge Warning</span>
                    {scenario === 'MONSOON_WARNING' && <span className="text-xs">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      changeScenario('NORMAL')
                      setSimMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center justify-between font-semibold"
                  >
                    <span>☀️ Normal Baseline Levels</span>
                    {scenario === 'NORMAL' && <span className="text-xs">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Portal Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                <span className="capitalize font-bold">{user?.role || 'Citizen'}</span>
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Portal
                  </div>
                  <button
                    onClick={() => {
                      switchRole('citizen')
                      setRoleMenuOpen(false)
                      navigate('/dashboard')
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand-600" />
                    <div>
                      <div className="font-semibold">Citizen Portal</div>
                      <div className="text-[10px] text-slate-400">Mobile-first public interface</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      switchRole('admin')
                      setRoleMenuOpen(false)
                      navigate('/admin')
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 flex items-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-semibold">Admin Command</div>
                      <div className="text-[10px] text-slate-400">Disaster Ops Room</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      switchRole('rescue')
                      setRoleMenuOpen(false)
                      navigate('/rescue')
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 flex items-center gap-2"
                  >
                    <LifeBuoy className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold">Rescue Field Unit</div>
                      <div className="text-[10px] text-slate-400">Tactical NDRF/SDRF</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Emergency SOS Button */}
            <Link
              to="/emergency"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold shadow-md shadow-red-600/30 hover:from-red-700 hover:to-rose-700 transition transform active:scale-95 animate-pulse"
            >
              <Flame className="w-4 h-4" />
              <span>SOS</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 bg-white/95 animate-in slide-in-from-top-4 duration-200">
            <div className="grid grid-cols-2 gap-1.5 pb-2">
              {navLinks.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive(item.path)
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-brand-600" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-brand-600" /> NDRF: <strong>1078</strong>
              </span>
              <button
                onClick={() => {
                  logout()
                  setMobileMenuOpen(false)
                }}
                className="text-red-600 font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
