import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAlert } from '../../context/AlertContext'
import {
  ShieldAlert,
  Lock,
  Mail,
  LifeBuoy,
  Users,
  Shield,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Radio,
  KeyRound,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react'
import JalRakshakLogo from '../../components/common/JalRakshakLogo'

export default function Login() {
  const { user, isAuthenticated, getUserHomePath, login, forgotPassword } = useAuth()
  const { showToast } = useAlert()
  const navigate = useNavigate()
  const location = useLocation()

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = getUserHomePath ? getUserHomePath(user) : (user.role === 'admin' ? '/admin' : user.role === 'rescue' ? '/rescue' : '/dashboard')
      navigate(destination, { replace: true })
    }
  }, [isAuthenticated, user, navigate, getUserHomePath])

  // Read portal from URL query parameter
  const searchParams = new URLSearchParams(location.search)
  const portalParam = searchParams.get('portal') || 'citizen'
  const [activePortal, setActivePortal] = useState(
    ['citizen', 'admin', 'rescue'].includes(portalParam) ? portalParam : 'citizen'
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const current = searchParams.get('portal')
    if (current && ['citizen', 'admin', 'rescue'].includes(current)) {
      setActivePortal(current)
    }
  }, [location.search])

  const handlePortalSwitch = (portalKey) => {
    setActivePortal(portalKey)
    setErrorMessage('')
    setShowForgotModal(false)
    navigate(`/login?portal=${portalKey}`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    const res = await login({
      email: email.trim(),
      password,
      portal: activePortal,
      role: activePortal,
    })
    setLoading(false)

    if (res.ok) {
      showToast({
        title: 'Authentication Successful',
        message: 'Signed into Jal Rakshak.',
        type: 'success',
      })
      const userRole = res.user?.role || activePortal
      if (userRole === 'admin') navigate('/admin')
      else if (userRole === 'rescue') navigate('/rescue')
      else navigate('/dashboard')
    } else {
      setErrorMessage(res.error || 'Invalid credentials or unauthorized for this portal.')
    }
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
      setForgotError('Please enter your registered citizen email address.')
      return
    }

    setForgotLoading(true)
    const res = await forgotPassword({
      email: forgotEmail.trim(),
      portal: 'citizen',
    })
    setForgotLoading(false)

    if (res.ok) {
      setForgotSuccess(true)
      if (res.data?.newPasswordPreview) {
        setGeneratedPassword(res.data.newPasswordPreview)
      }
      showToast({
        title: 'New Password Sent',
        message: 'A new password has been enabled and sent to your email address.',
        type: 'success',
      })
    } else {
      setForgotError(res.error || 'Failed to send new password. Please check your email address.')
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50 relative">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative z-10">
        {/* Portal Selector Tabs */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-6 border border-slate-200/80">
          <button
            type="button"
            onClick={() => handlePortalSwitch('citizen')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activePortal === 'citizen'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Citizen</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch('admin')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activePortal === 'admin'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Command</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch('rescue')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activePortal === 'rescue'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Rescue Unit</span>
          </button>
        </div>

        {/* Portal-Specific Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            {activePortal === 'citizen' ? (
              <JalRakshakLogo variant="icon" size="lg" />
            ) : (
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md ${
                  activePortal === 'admin'
                    ? 'bg-gradient-to-tr from-purple-700 to-indigo-600'
                    : 'bg-gradient-to-tr from-emerald-700 to-teal-500'
                }`}
              >
                {activePortal === 'admin' ? (
                  <Shield className="w-7 h-7" />
                ) : (
                  <LifeBuoy className="w-7 h-7" />
                )}
              </div>
            )}
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900">
            {activePortal === 'admin'
              ? 'Admin Command Login'
              : activePortal === 'rescue'
              ? 'Rescue Field Unit Login'
              : 'Citizen Portal Login'}
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {activePortal === 'admin'
              ? 'Official administrator credentials required'
              : activePortal === 'rescue'
              ? 'Authorized emergency rescue personnel only'
              : 'Sign in to access localized flood intelligence & response alerts'}
          </p>
        </div>

        {/* Official Banner for Admin / Rescue */}
        {activePortal === 'admin' && (
          <div className="mb-4 p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-purple-800 text-[11px] font-semibold flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Official Administrator Credentials Only. Public access restricted.</span>
          </div>
        )}

        {activePortal === 'rescue' && (
          <div className="mb-4 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Authorized NDRF / SDRF / ODRAF Field Personnel Only.</span>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {activePortal === 'rescue'
                ? 'Official Rescue Email'
                : activePortal === 'admin'
                ? 'Official Admin Email'
                : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  activePortal === 'rescue'
                    ? 'officer@ndrf.gov.in'
                    : activePortal === 'admin'
                    ? 'admin@disaster.gov.in'
                    : 'name@example.com'
                }
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
                placeholder="Enter your password"
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-xs"
              />
            </div>
          </div>

          {/* Forgot Password Link - Only for Citizen */}
          {activePortal === 'citizen' && (
            <div className="text-right">
              <button
                type="button"
                onClick={openForgotPassword}
                className="text-[11px] text-slate-500 hover:text-brand-600 font-semibold cursor-pointer transition"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              activePortal === 'admin'
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                : activePortal === 'rescue'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/30'
            }`}
          >
            <span>
              {loading
                ? 'Authenticating...'
                : activePortal === 'admin'
                ? 'Login to Admin Command'
                : activePortal === 'rescue'
                ? 'Login to Rescue Unit'
                : 'Login to Citizen Portal'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Public Citizen Registration Link */}
        {activePortal === 'citizen' && (
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            New to Jal Rakshak?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Create Citizen Account
            </Link>
          </div>
        )}
      </div>

      {/* Forgot Password Modal for Citizen */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative animate-in zoom-in-95 duration-200">
            {!forgotSuccess ? (
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mb-4 mx-auto shadow-xs">
                  <KeyRound className="w-6 h-6" />
                </div>

                <div className="text-center mb-5">
                  <h3 className="text-xl font-extrabold text-slate-900">Forgot Password?</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your registered citizen email. We will generate and enable a new secure password, then send it directly to your email inbox.
                  </p>
                </div>

                {forgotError && (
                  <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">{forgotError}</div>
                  </div>
                )}

                <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Registered Citizen Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. citizen@demo.jalrakshak.org"
                        required
                        autoFocus
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
                    >
                      {forgotLoading ? (
                        <span>Sending Mail...</span>
                      ) : (
                        <>
                          <span>Send New Password</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4 mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-extrabold text-slate-900">New Password Enabled!</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  We have enabled a new secure password on your account and dispatched an email to{' '}
                  <span className="font-bold text-slate-900">{forgotEmail}</span>.
                </p>

                {generatedPassword && (
                  <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                        <span>Generated Password (Active Now)</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer font-bold"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-sm font-bold text-brand-800 bg-white px-3 py-2 rounded-xl border border-slate-200 tracking-wider">
                      {generatedPassword}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleUseNewPassword}
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-2 text-slate-500 hover:text-slate-800 font-semibold text-xs transition cursor-pointer"
                  >
                    Close
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

