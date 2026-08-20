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
  const { scenario, changeScenario } = useFloodData()
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
            {/* Simulation Scenario Switcher */}
            <div className="relative" ref={simRef}>
              <button
                type="button"
                onClick={() => setSimMenuOpen(!simMenuOpen)}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  scenario === 'FLASH_FLOOD_RED_ALERT'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : scenario === 'MONSOON_WARNING'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : isDarkPortal
                    ? 'bg-slate-800 text-emerald-400 border-slate-700'
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
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl border py-2 z-50 animate-in fade-in zoom-in duration-150 ${
                    isDarkPortal
                      ? 'bg-slate-900 border-slate-700 text-slate-200'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Simulation Scenarios
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      changeScenario('FLASH_FLOOD_RED_ALERT')
                      setSimMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 flex items-center justify-between font-semibold cursor-pointer"
                  >
                    <span>⚡ Flash Flood Red Alert</span>
                    {scenario === 'FLASH_FLOOD_RED_ALERT' && <span className="text-xs">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      changeScenario('MONSOON_WARNING')
                      setSimMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-amber-500 hover:bg-amber-500/10 flex items-center justify-between font-semibold cursor-pointer"
                  >
                    <span>🌧️ Monsoon Surge Warning</span>
                    {scenario === 'MONSOON_WARNING' && <span className="text-xs">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      changeScenario('NORMAL')
                      setSimMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-emerald-500 hover:bg-emerald-500/10 flex items-center justify-between font-semibold cursor-pointer"
                  >
                    <span>☀️ Normal Baseline Levels</span>
                    {scenario === 'NORMAL' && <span className="text-xs">✓</span>}
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
                    className={`absolute right-0 mt-2 w-52 rounded-2xl shadow-xl border py-2 z-50 animate-in fade-in zoom-in duration-150 ${
                      isDarkPortal
                        ? 'bg-slate-900 border-slate-700 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className={`px-3 py-2 border-b ${isDarkPortal ? 'border-slate-800' : 'border-slate-100'}`}>
                      <div className="font-bold text-xs truncate">{user.fullName || user.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize font-medium">{user.role} Portal</div>
                    </div>

                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className={`block px-3 py-2 text-xs font-semibold ${
                        isDarkPortal
                          ? 'hover:bg-purple-500/10 text-purple-400'
                          : 'text-slate-700 hover:bg-purple-50 hover:text-purple-700'
                      }`}
                    >
                      Admin Command Center
                    </Link>

                    <Link
                      to="/rescue"
                      onClick={() => setUserMenuOpen(false)}
                      className={`block px-3 py-2 text-xs font-semibold ${
                        isDarkPortal
                          ? 'hover:bg-emerald-500/10 text-emerald-400'
                          : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      Rescue Field Operations
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className={`block px-3 py-2 text-xs font-semibold ${
                        isDarkPortal
                          ? 'hover:bg-brand-500/10 text-brand-400'
                          : 'text-slate-700 hover:bg-brand-50 hover:text-brand-700'
                      }`}
                    >
                      Citizen Public Portal
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false)
                        logout()
                        navigate('/')
                      }}
                      className={`w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 font-semibold flex items-center gap-1.5 border-t mt-1 cursor-pointer ${
                        isDarkPortal ? 'border-slate-800' : 'border-slate-100'
                      }`}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
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
            className={`lg:hidden py-3 border-t animate-in slide-in-from-top-4 duration-200 ${
              isDarkPortal ? 'border-slate-800 bg-slate-900/95' : 'border-slate-200 bg-white/95'
            }`}
          >
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
                        ? isDarkPortal
                          ? 'bg-brand-600 text-white font-bold'
                          : 'bg-brand-50 text-brand-700 font-bold'
                        : isDarkPortal
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-brand-500" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
            <div
              className={`pt-2 border-t flex items-center justify-between text-xs ${
                isDarkPortal ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}
            >
              <span className="flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-brand-500" /> NDRF: <strong>1078</strong>
              </span>
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                    navigate('/')
                  }}
                  className="text-red-500 font-semibold cursor-pointer"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-brand-500 font-bold"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
