import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAlert } from '../../context/AlertContext'
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import JalRakshakLogo from '../../components/common/JalRakshakLogo'

export default function Login() {
  const { user, isAuthenticated, login, forgotPassword } = useAuth()
  const { showToast } = useAlert()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [copied, setCopied] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const fromPath = location.state?.from?.pathname
      if (fromPath && fromPath !== '/login') {
        navigate(fromPath, { replace: true })
      } else {
        const userRole = String(user.role).toLowerCase()
        const dest = userRole === 'admin' ? '/admin' : userRole === 'rescue' ? '/rescue' : '/dashboard'
        navigate(dest, { replace: true })
      }
    }
  }, [isAuthenticated, user?.role, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.')
      return
    }

    setLoading(true)
    const res = await login({
      email: email.trim(),
      password,
    })
    setLoading(false)

    if (res.ok) {
      const userRole = (res.user?.role || 'citizen').toLowerCase()
      showToast({
        title: 'Sign In Successful',
        message: `Welcome back, ${res.user?.fullName || res.user?.name || 'User'}!`,
        type: 'success',
      })

      const fromPath = location.state?.from?.pathname
      if (fromPath) {
        navigate(fromPath, { replace: true })
      } else if (userRole === 'admin') {
        navigate('/admin', { replace: true })
      } else if (userRole === 'rescue') {
        navigate('/rescue', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } else {
      setErrorMessage(res.error || 'Invalid credentials. Please verify your email and password.')
    }
  }

  const handleFillDemo = (demo) => {
    setEmail(demo.email)
    setPassword(demo.pass)
    setErrorMessage('')
  }

  const openForgotPassword = () => {
    setForgotEmail(email.trim())
    setForgotError('')
    setForgotSuccess(false)
    setGeneratedPassword('')
    setCopied(false)
    setShowForgotModal(true)
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setForgotError('')
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address.')
      return
    }

    setForgotLoading(true)
    const res = await forgotPassword({
      email: forgotEmail.trim(),
    })
    setForgotLoading(false)

    if (res.ok) {
      setForgotSuccess(true)
      showToast({
        title: 'Reset Link Sent',
        message: 'A secure password reset link has been dispatched to your email inbox.',
        type: 'success',
      })
    } else {
      setForgotError(res.error || 'Failed to send password reset. Please check your email.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-50 via-slate-100 to-sky-50/40 relative">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <JalRakshakLogo size={56} className="drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Sign in to access real-time flood monitoring & disaster response
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 outline-none transition focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={openForgotPassword}
                className="text-xs font-bold text-cyan-600 hover:text-cyan-700 transition"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 outline-none transition focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-600 border-slate-300 focus:ring-cyan-500"
              />
              <span>Remember this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-950/20 flex items-center justify-center gap-2 transition duration-200 active:scale-[0.98] disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Jal Rakshak</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Pill Box */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Demo Accounts</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('citizen')}
              className="px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-cyan-50 hover:border-cyan-300 text-[11px] font-bold text-slate-700 hover:text-cyan-800 transition text-center"
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('rescue')}
              className="px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-[11px] font-bold text-slate-700 hover:text-emerald-800 transition text-center"
            >
              Rescue NDRF
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-[11px] font-bold text-slate-700 hover:text-indigo-800 transition text-center"
            >
              State Admin
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-cyan-600 hover:text-cyan-700 transition">
            Register as Citizen
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-cyan-600" />
                <span>Reset Account Password</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {!forgotSuccess ? (
              <form onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
                <p className="text-slate-500 leading-relaxed">
                  Enter your registered account email. We will send a secure, personalized password reset link straight to your inbox.
                </p>

                {forgotError && (
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-700 font-medium">
                    {forgotError}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold disabled:opacity-60 flex items-center gap-1.5 shadow"
                  >
                    {forgotLoading ? 'Sending Link...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-black text-sm text-emerald-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Reset Link Sent!</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    We have dispatched a secure password reset link to <strong>{forgotEmail}</strong>.
                  </p>
                </div>

                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 text-sky-800 text-[11px] leading-relaxed space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <span>📩 Next Steps:</span>
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    <li>Open your email inbox and click <strong>"Reset Your Password"</strong>.</li>
                    <li>The link is active for <strong>30 minutes</strong>.</li>
                    <li>If you don't see it, please check your <strong>Spam/Junk</strong> folder.</li>
                  </ul>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSuccess(false)
                      setForgotError('')
                    }}
                    className="text-cyan-700 hover:underline font-bold text-[11px]"
                  >
                    Resend link
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow"
                  >
                    Got It, Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
