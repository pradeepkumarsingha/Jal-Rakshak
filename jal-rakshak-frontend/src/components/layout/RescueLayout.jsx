import React from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../common/Navbar'
import Sidebar from '../common/Sidebar'
import Footer from '../common/Footer'

export default function RescueLayout() {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || user?.role !== 'rescue') {
    return <Navigate to="/login?portal=rescue" state={{ from: location }} replace />
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-900/40 overflow-x-hidden min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
