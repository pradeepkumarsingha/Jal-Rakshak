import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAlert } from '../../context/AlertContext'
import {
  ShieldAlert,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Users,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'

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
    emergencyContact: '',
  })
  const [loading, setLoading] = useState(false)

  const districts = ['Cuttack', 'Bhubaneswar (Khurda)', 'Kendrapara', 'Puri', 'Jagatsinghpur', 'Jajpur', 'Balasore', 'Guwahati (Assam)', 'Patna (Bihar)']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await registerUser(formData)
    setLoading(false)
    if (res.ok) {
      showToast({
        title: 'Registration Complete!',
        message: 'Your citizen emergency profile has been saved.',
        type: 'success',
      })
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-brand-700 to-cyan-500 flex items-center justify-center text-white shadow-md mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Citizen & Responder Registration</h2>
          <p className="text-xs text-slate-500 mt-1">
            Register your household for localized early flood warnings & rapid emergency assistance
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Role */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Registration Role</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'citizen', label: 'Resident / Citizen' },
                { key: 'admin', label: 'Disaster Officer' },
                { key: 'rescue', label: 'NDRF / Volunteer' },
              ].map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r.key })}
                  className={`py-2 px-2 rounded-xl font-bold border transition text-center text-xs ${
                    formData.role === r.key
                      ? 'bg-brand-600 border-brand-600 text-white shadow'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

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
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-xs"
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
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-xs"
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
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">District / Flood Basin *</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 outline-none text-xs"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
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
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-xs"
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
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Registering Profile...' : 'Complete Emergency Registration'}</span>
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
