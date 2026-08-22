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
      if (res.data?.newPasswordPreview) {
        setGeneratedPassword(res.data.newPasswordPreview)
      }
      showToast({
        title: 'Password Reset Initiated',
        message: 'A temporary access password has been created and sent to your email.',
        type: 'success',
      })
    } else {
      setForgotError(res.error || 'Failed to send password reset. Please check your email.')
    }
  }

  const handleUseNewPassword = () => {
    setEmail(forgotEmail.trim())
    if (generatedPassword) {
      setPassword(generatedPassword)
    }
    setShowForgotModal(false)
  }

  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-50 via-slate-100 to-sky-50/40 relative">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="transition hover:scale-105">
            <JalRakshakLogo variant="stacked" size="lg" />
          </Link>
          <div className="pt-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to access flood intelligence and emergency response tools.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Main Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={openForgotPassword}
                className="text-[11px] font-semibold text-cyan-600 hover:text-cyan-700 transition cursor-pointer"
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
                placeholder="Enter your account password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 w-3.5 h-3.5"
              />
              <span>Remember this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-brand-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Jal Rakshak</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center text-xs text-slate-500 pt-2">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="font-bold text-cyan-600 hover:text-cyan-700 underline underline-offset-2"
          >
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
                  Enter your registered account email. We will generate and securely deliver a temporary password to your inbox.
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500"
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
                    {forgotLoading ? 'Processing...' : 'Send Temporary Password'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Password Reset Initiated</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    A temporary login password has been generated for <strong>{forgotEmail}</strong>.
                  </p>
                </div>

                {generatedPassword && (
                  <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Temporary Access Password:
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {generatedPassword}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] flex items-center gap-1 text-slate-300"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleUseNewPassword}
                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow"
                  >
                    Apply & Sign In
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
