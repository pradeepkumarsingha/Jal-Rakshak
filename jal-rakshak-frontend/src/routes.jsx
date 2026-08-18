import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import CitizenLayout from './components/layout/CitizenLayout'
import AdminLayout from './components/layout/AdminLayout'
import RescueLayout from './components/layout/RescueLayout'
import PublicLayout from './components/layout/PublicLayout'
import Loading from './components/common/Loading'

// Public Pages
const Landing = lazy(() => import('./pages/public/Landing'))
const Login = lazy(() => import('./pages/public/Login'))
const Register = lazy(() => import('./pages/public/Register'))

// Citizen Pages
const CitizenDashboard = lazy(() => import('./pages/citizen/CitizenDashboard'))
const FloodMap = lazy(() => import('./pages/citizen/FloodMap'))
const ShelterFinder = lazy(() => import('./pages/citizen/ShelterFinder'))
const SafeRoute = lazy(() => import('./pages/citizen/SafeRoute'))
const ReportFlood = lazy(() => import('./pages/citizen/ReportFlood'))
const EmergencyRequest = lazy(() => import('./pages/citizen/EmergencyRequest'))
const AIChat = lazy(() => import('./pages/citizen/AIChat'))

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const ReportsManagement = lazy(() => import('./pages/admin/ReportsManagement'))
const EmergencyManagement = lazy(() => import('./pages/admin/EmergencyManagement'))
const ShelterManagement = lazy(() => import('./pages/admin/ShelterManagement'))
const Analytics = lazy(() => import('./pages/admin/Analytics'))

// Rescue Pages
const RescueDashboard = lazy(() => import('./pages/rescue/RescueDashboard'))
const AssignedRequests = lazy(() => import('./pages/rescue/AssignedRequests'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading message="Initializing Jal Rakshak AI Platform..." />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Citizen Portal Routes */}
        <Route element={<CitizenLayout />}>
          <Route path="/dashboard" element={<CitizenDashboard />} />
          <Route path="/map" element={<FloodMap />} />
          <Route path="/shelters" element={<ShelterFinder />} />
          <Route path="/route" element={<SafeRoute />} />
          <Route path="/report" element={<ReportFlood />} />
          <Route path="/emergency" element={<EmergencyRequest />} />
          <Route path="/chat" element={<AIChat />} />
        </Route>

        {/* Admin Command Center Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<ReportsManagement />} />
          <Route path="/admin/emergencies" element={<EmergencyManagement />} />
          <Route path="/admin/shelters" element={<ShelterManagement />} />
          <Route path="/admin/analytics" element={<Analytics />} />
        </Route>

        {/* Rescue Tactical Portal Routes */}
        <Route element={<RescueLayout />}>
          <Route path="/rescue" element={<RescueDashboard />} />
          <Route path="/rescue/assignments" element={<AssignedRequests />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
