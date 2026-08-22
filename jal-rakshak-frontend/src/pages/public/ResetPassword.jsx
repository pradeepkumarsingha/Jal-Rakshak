import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAlert } from '../../context/AlertContext'
import {
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Check,
} from 'lucide-react'
import JalRakshakLogo from '../../components/common/JalRakshakLogo'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const { showToast } = useAlert()

  // Token can come from query param (?token=xyz) or path param (/reset-password/xyz)
  const token = searchParams.get('token') || params.token || ''
  const emailParam = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Password validation rules
  const hasMinLength = password.length >= 6
  const hasMixedChars = /[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password)
  const passwordsMatch = password && confirmPassword && password === confirmPassword

  useEffect(() => {
    if (!token) {
      setErrorMessage('No password reset token was provided. Please use the link sent to your email.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!token) {
      setErrorMessage('Invalid or missing password reset token. Please request a new link.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.')
      return
    }

    setLoading(true)
    const res = await resetPassword({
      token,
      password,
    })
    setLoading(false)

    if (res.ok) {
      setIsSuccess(true)
      showToast({
        title: 'Password Reset Complete',
        message: 'Your new password has been set! You can now log in.',
        type: 'success',
      })
    } else {
      setErrorMessage(res.error || 'Failed to reset password. The link may have expired.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-50 via-slate-100 to-sky-50/40 relative">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <JalRakshakLogo size={56} className="drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Set New Password</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {emailParam ? `Choose a secure new password for ${emailParam}` : 'Choose a secure new password for your account'}
          </p>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="text-center space-y-5 py-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900">Password Updated Successfully!</h2>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                Your account password has been updated. You can now use your new credentials to sign in.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-950/20 flex items-center justify-center gap-2 transition duration-200 active:scale-[0.98] cursor-pointer"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Global Error Banner */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {!token ? (
              <div className="text-center space-y-4 py-3">
                <p className="text-xs text-slate-500">
                  Please check the password reset link you received in your email or request a fresh link from the login screen.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow transition"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 outline-none transition focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Checklist */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] space-y-1.5">
                  <div className="font-bold text-slate-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Password Security Guidelines:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-slate-500 pt-0.5">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-bold' : ''}`}>
                      {hasMinLength ? <Check className="w-3 h-3 text-emerald-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5" />}
                      <span>At least 6 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600 font-bold' : ''}`}>
                      {passwordsMatch ? <Check className="w-3 h-3 text-emerald-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5" />}
                      <span>Passwords match</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !hasMinLength || !passwordsMatch}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-950/20 flex items-center justify-center gap-2 transition duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Update & Save Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back to Login */}
            <div className="mt-6 text-center text-xs text-slate-500">
              Remember your password?{' '}
              <Link to="/login" className="font-bold text-cyan-600 hover:text-cyan-700 transition">
                Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
