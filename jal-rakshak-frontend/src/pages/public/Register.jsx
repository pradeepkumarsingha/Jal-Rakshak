import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAlert } from '../../context/AlertContext'
import {
  ShieldAlert,
  User,
  Mail,
  Phone,
  Lock,
  Users,
  ArrowRight,
  AlertTriangle,
  MapPin,
} from 'lucide-react'
import JalRakshakLogo from '../../components/common/JalRakshakLogo'

export default function Register() {
  const { register: registerUser } = useAuth()
  const { showToast } = useAlert()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    district: 'Cuttack',
    state: 'Odisha',
    role: 'citizen',
    password: '',
    familyCount: 4,
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const districts = [
    'Cuttack',
    'Bhubaneswar (Khurda)',
    'Kendrapara',
    'Puri',
    'Jagatsinghpur',
    'Jajpur',
    'Balasore',
    'Bhadrak',
    'Sambalpur',
    'Guwahati (Assam)',
    'Patna (Bihar)',
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    const payload = {
      ...formData,
      fullName: formData.name.trim(),
      email: formData.email.trim(),
      role: 'citizen',
    }

    const res = await registerUser(payload)
    setLoading(false)

    if (res.ok) {
      showToast({
        title: 'Registration Complete!',
        message: 'Your citizen emergency profile has been created successfully.',
        type: 'success',
      })
      navigate('/dashboard')
    } else {
      setErrorMessage(res.error || 'Registration failed. Please check the provided information.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <JalRakshakLogo variant="icon" size="lg" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Resident / Citizen Registration</h2>
          <p className="text-xs text-slate-500 mt-1">
            Register your household for localized early flood warnings & rapid emergency assistance
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Mohanty"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number (SMS Alerts) *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98610 XXXXX"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@domain.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">District / Flood Basin *</label>
              <div className="relative">
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 outline-none text-xs"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Household Members</label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  name="familyCount"
                  value={formData.familyCount}
                  onChange={handleChange}
                  min="1"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Creating Citizen Profile...' : 'Complete Resident Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  )
}
