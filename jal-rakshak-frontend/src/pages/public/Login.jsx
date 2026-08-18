import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAlert } from '../../context/AlertContext'
import { DEMO_ACCOUNTS } from '../../utils/mockData'
import {
  ShieldAlert,
  Lock,
  Mail,
  UserCheck,
  LifeBuoy,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const { showToast } = useAlert()
  const navigate = useNavigate()

  const [selectedRole, setSelectedRole] = useState('citizen')
  const [email, setEmail] = useState('ramesh.citizen@jalrakshak.org')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)

  const handleRoleTabChange = (role) => {
    setSelectedRole(role)
    const demo = DEMO_ACCOUNTS[role]
    if (demo) {
      setEmail(demo.email)
    }
  }

  const handleQuickDemoLogin = async (role) => {
    const demo = DEMO_ACCOUNTS[role]
    setSelectedRole(role)
    setEmail(demo.email)
    setLoading(true)
    const res = await login({ email: demo.email, password: 'password', role })
    setLoading(false)
    if (res.ok) {
      showToast({
        title: `Welcome, ${demo.name}!`,
        message: `Signed in as ${role.toUpperCase()} successfully.`,
        type: 'success',
      })
      if (role === 'admin') navigate('/admin')
      else if (role === 'rescue') navigate('/rescue')
      else navigate('/dashboard')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await login({ email, password, role: selectedRole })
    setLoading(false)
    if (res.ok) {
      showToast({
        title: 'Authentication Successful',
        message: `Signed into Jal Rakshak AI.`,
        type: 'success',
      })
      if (selectedRole === 'admin') navigate('/admin')
      else if (selectedRole === 'rescue') navigate('/rescue')
      else navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-brand-700 to-cyan-500 flex items-center justify-center text-white shadow-md mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign In to Jal Rakshak</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access real-time localized flood intelligence & response networks
          </p>
        </div>

        {/* 1-Click Demo Quick Switchers */}
        <div className="mb-6 p-3 bg-brand-50/70 rounded-2xl border border-brand-100">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-700 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Test Persona Quick-Logins</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('citizen')}
              className={`p-2 rounded-xl text-center text-xs font-semibold transition border ${
                selectedRole === 'citizen'
                  ? 'bg-brand-600 text-white border-brand-600 shadow'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5 mx-auto mb-0.5" />
              <span>Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className={`p-2 rounded-xl text-center text-xs font-semibold transition border ${
                selectedRole === 'admin'
                  ? 'bg-purple-600 text-white border-purple-600 shadow'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5 mx-auto mb-0.5" />
              <span>Admin (IAS)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('rescue')}
              className={`p-2 rounded-xl text-center text-xs font-semibold transition border ${
                selectedRole === 'rescue'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5 mx-auto mb-0.5" />
              <span>NDRF Cmdr</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          New to Jal Rakshak?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Create an Emergency Citizen Account
          </Link>
        </div>
      </div>
    </div>
  )
}
