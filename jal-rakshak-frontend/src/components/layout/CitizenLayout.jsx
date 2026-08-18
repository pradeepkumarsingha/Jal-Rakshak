import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import { LayoutDashboard, MapPin, Home, Navigation, FilePlus2, Flame, Bot } from 'lucide-react'

export default function CitizenLayout() {
  const location = useLocation()

  const mobileBottomNav = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Map', path: '/map', icon: MapPin },
    { label: 'SOS', path: '/emergency', icon: Flame, isUrgent: true },
    { label: 'Shelters', path: '/shelters', icon: Home },
    { label: 'Advisor', path: '/chat', icon: Bot },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {mobileBottomNav.map((item) => {
          const Icon = item.icon
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition ${
                item.isUrgent
                  ? 'text-white bg-red-600 px-3 py-1 -mt-3 shadow-md shadow-red-600/40 animate-pulse rounded-2xl font-bold'
                  : active
                  ? 'text-brand-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
