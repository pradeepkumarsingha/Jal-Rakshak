import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useAlert } from '../../context/AlertContext'
import { useFloodData } from '../../context/FloodDataContext'
import JalRakshakLogo from './JalRakshakLogo'
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
  LogIn,
  UserPlus,
  AlertTriangle,
  FileCheck2,
  BarChart3,
  ClipboardList,
  Shield,
  Activity,
} from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const { activeCriticalAlert } = useAlert()
  const { dataMode, changeDataMode } = useFloodData()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [simMenuOpen, setSimMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const simRef = useRef(null)
  const userRef = useRef(null)

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (simRef.current && !simRef.current.contains(e.target)) {
        setSimMenuOpen(false)
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isAdmin = user?.role === 'admin' || location.pathname.startsWith('/admin')
  const isRescue = user?.role === 'rescue' || location.pathname.startsWith('/rescue')
  const isDarkPortal = isAdmin || isRescue

  // Role-aware Navigation Links
  const getNavLinks = () => {
    if (user?.role === 'admin') {
      return [
        { name: 'Command HQ', path: '/admin', icon: LayoutDashboard },
        { name: 'SOS Triage', path: '/admin/emergencies', icon: AlertTriangle },
        { name: 'Report Review', path: '/admin/reports', icon: FileCheck2 },
        { name: 'Shelter Network', path: '/admin/shelters', icon: Home },
        { name: 'Predictive Analytics', path: '/admin/analytics', icon: BarChart3 },
        { name: 'GIS Flood Map', path: '/map', icon: MapPin },
      ]
    }

    if (user?.role === 'rescue') {
      return [
        { name: 'Operations HQ', path: '/rescue', icon: LifeBuoy },
        { name: 'Assigned Missions', path: '/rescue/assignments', icon: ClipboardList },
        { name: 'Tactical GIS Map', path: '/map', icon: MapPin },
        { name: 'AI Flood Advisor', path: '/chat', icon: Bot },
      ]
    }

    return [
      { name: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
      { name: t('nav.floodMap'), path: '/map', icon: MapPin },
      { name: t('nav.shelters'), path: '/shelters', icon: Home },
      { name: t('nav.safeRoute'), path: '/route', icon: Navigation },
      { name: t('nav.reportFlood'), path: '/report', icon: FilePlus2 },
      { name: t('nav.aiChat'), path: '/chat', icon: Bot },
    ]
  }

  const navLinks = getNavLinks()
  const isActive = (p) => location.pathname === p

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-xs transition-colors duration-200 ${
        isDarkPortal
          ? 'bg-slate-900/95 border-slate-800 text-slate-100'
          : 'bg-white/90 border-slate-200/80 text-slate-900'
      }`}
    >
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
          {/* Official Logo with dark theme support */}
          <Link to="/" className="flex items-center group">
            <JalRakshakLogo
              variant="horizontal"
              size="sm"
              theme={isDarkPortal ? 'dark' : 'light'}
              showTagline={true}
            />
          </Link>

          {/* Desktop Navigation Links - Shown on Citizen & Public pages, removed on Admin/Rescue to avoid duplication with Sidebar */}
          {!isDarkPortal ? (
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
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold shadow-xs ${
                  isAdmin
                    ? 'bg-purple-950/40 border-purple-800/60 text-purple-200'
                    : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    isAdmin ? 'bg-purple-400' : 'bg-emerald-400'
                  }`}
                />
                <span className="font-bold tracking-wide">
                  {isAdmin
                    ? 'State Disaster Management Control Center (SEOC)'
                    : 'NDRF & ODRAF Field Operations HQ'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[11px] text-cyan-400">Telemetry Active</span>
              </div>
            </div>
          )}

          {/* Action Bar Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Data Mode & Simulation Scenario Switcher */}
            <div className="relative" ref={simRef}>
              <button
                type="button"
                onClick={() => setSimMenuOpen(!simMenuOpen)}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  dataMode === 'simulation-mahanadi'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : dataMode === 'simulation-monsoon'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : dataMode === 'simulation-normal'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isDarkPortal
                    ? 'bg-slate-800 text-cyan-400 border-slate-700'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
                title="Data Mode: Live GPS Telemetry vs Simulation Presets"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Mode:</span>
                <span className="font-bold">
                  {dataMode === 'simulation-mahanadi'
                    ? '⚡ Sim: Red Alert'
                    : dataMode === 'simulation-monsoon'
                    ? '🌧️ Sim: Monsoon'
                    : dataMode === 'simulation-normal'
                    ? '☀️ Sim: Normal'
                    : '🛰️ Live Telemetry'}
                </span>
              </button>

              {simMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl border py-2 z-50 animate-in fade-in zoom-in duration-150 ${
                    isDarkPortal
                      ? 'bg-slate-900 border-slate-700 text-slate-200'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Live vs Simulation Modes
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      changeDataMode('live')
                      setSimMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-500/10 flex items-center justify-between font-semibold cursor-pointer"
                  >
                    <span>🛰️ Live Real-Time (Device GPS)</span>
                    {dataMode === 'live' && <span className="text-xs">✓</span>}
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Demonstration Scenarios
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      changeDataMode('simulation-mahanadi')
                      setSimMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 flex items-center justify-between font-semibold cursor-pointer"
                  >
                    <span>⚡ Flash Flood Red Alert (Mahanadi)</span>
                    {dataMode === 'simulation-mahanadi' && <span className="text-xs">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      changeDataMode('simulation-monsoon')
                      setSimMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-amber-500 hover:bg-amber-500/10 flex items-center justify-between font-semibold cursor-pointer"
                  >
                    <span>🌧️ Monsoon Surge Warning</span>
                    {dataMode === 'simulation-monsoon' && <span className="text-xs">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      changeDataMode('simulation-normal')
                      setSimMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-emerald-500 hover:bg-emerald-500/10 flex items-center justify-between font-semibold cursor-pointer"
                  >
                    <span>☀️ Normal Baseline Levels</span>
                    {dataMode === 'simulation-normal' && <span className="text-xs">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <LanguageSelector />

            {/* User Profile or Login/Register Links */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isDarkPortal
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-brand-500" />
                  <span className="font-bold max-w-[120px] truncate">{user.fullName || user.name || user.email}</span>
                </button>

                {userMenuOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border py-1.5 z-50 animate-in fade-in zoom-in duration-150 ${
                      isDarkPortal
                        ? 'bg-slate-900 border-slate-700 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className={`px-3.5 py-2.5 border-b ${isDarkPortal ? 'border-slate-800' : 'border-slate-100'}`}>
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{user.fullName || user.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize font-medium">{user.role || 'Citizen'}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false)
                        logout()
                        navigate('/')
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold flex items-center gap-2 transition cursor-pointer`}
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>{t('nav.logout') || 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Emergency SOS Quick Button */}
            <Link
              to="/emergency"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold shadow-md shadow-red-600/30 hover:from-red-700 hover:to-rose-700 transition transform active:scale-95 animate-pulse"
            >
              <Flame className="w-4 h-4" />
              <span>SOS</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg ${
                isDarkPortal ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className={`lg:hidden py-4 px-2 border-t animate-in slide-in-from-top-4 duration-200 space-y-4 ${
              isDarkPortal ? 'border-slate-800 bg-slate-900/98' : 'border-slate-200 bg-white/98'
            }`}
          >
            {/* Quick Language Selector for Mobile */}
            <div className={`p-2.5 rounded-2xl border ${isDarkPortal ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/80'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                Choose Language / ଭାଷା / भाषा
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'or', label: 'ଓଡ଼ିଆ' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage(l.code)
                      localStorage.setItem('jalrakshak_lang', l.code)
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                      i18n.language === l.code
                        ? 'bg-brand-600 text-white shadow-sm'
                        : isDarkPortal
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Grid */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                Navigation Modules
              </span>
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive(item.path)
                          ? isDarkPortal
                            ? 'bg-brand-600 text-white font-bold'
                            : 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                          : isDarkPortal
                          ? 'text-slate-300 hover:bg-slate-800'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-brand-500 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Quick Data Mode Selector */}
            <div className={`p-2.5 rounded-2xl border ${isDarkPortal ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/80'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                Data Feed Telemetry
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    changeDataMode('live')
                    setMobileMenuOpen(false)
                  }}
                  className={`py-1.5 px-2 rounded-xl font-bold transition text-left cursor-pointer ${
                    dataMode === 'live'
                      ? 'bg-cyan-600 text-white'
                      : isDarkPortal
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  🛰️ Live GPS Mode
                </button>
                <button
                  type="button"
                  onClick={() => {
                    changeDataMode('simulation-mahanadi')
                    setMobileMenuOpen(false)
                  }}
                  className={`py-1.5 px-2 rounded-xl font-bold transition text-left cursor-pointer ${
                    dataMode === 'simulation-mahanadi'
                      ? 'bg-red-600 text-white'
                      : isDarkPortal
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  ⚡ Red Alert Sim
                </button>
              </div>
            </div>

            {/* Footer Row */}
            <div
              className={`pt-2 border-t flex items-center justify-between text-xs ${
                isDarkPortal ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}
            >
              <a
                href="tel:1078"
                className="flex items-center gap-1 font-bold text-red-500 hover:underline"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call NDRF: <strong>1078</strong>
              </a>
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                    navigate('/')
                  }}
                  className="text-red-500 font-bold cursor-pointer"
                >
                  Sign Out
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-brand-600 font-bold"
                  >
                    Sign In
                  </Link>
                  <span>•</span>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-brand-600 font-bold"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
