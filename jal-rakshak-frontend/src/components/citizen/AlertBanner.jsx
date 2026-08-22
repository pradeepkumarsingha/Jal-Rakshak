import React, { useState } from 'react'
import { AlertTriangle, Bell, Volume2, VolumeX, X, ChevronRight } from 'lucide-react'
import { useAlert } from '../../context/AlertContext'
import { Link } from 'react-router-dom'
import { formatLocationText } from '../../utils/helpers'

export default function AlertBanner({
  alert,
  onDismiss,
}) {
  const { soundEnabled, setSoundEnabled, playAlertChime } = useAlert()
  const [expanded, setExpanded] = useState(false)

  if (!alert) return null

  const isCritical = alert.severity === 'CRITICAL'

  const toggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    if (next) playAlertChime()
  }

  return (
    <div
      className={`rounded-2xl p-4 transition shadow-lg border relative overflow-hidden ${
        isCritical
          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border-red-500 shadow-red-500/20 animate-pulse-slow'
          : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border-amber-400 shadow-amber-500/20'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white text-red-700">
                {alert.severity} WARNING
              </span>
              <span className="text-xs font-semibold opacity-90">{formatLocationText(alert.location || alert.address, 'Alert Area')}</span>
            </div>
            <h4 className="font-extrabold text-sm sm:text-base mt-1 text-white leading-tight">
              {alert.title}
            </h4>
            <p className="text-xs sm:text-sm text-white/90 mt-1 leading-relaxed">
              {expanded ? alert.message : `${alert.message.slice(0, 140)}...`}
            </p>

            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <Link
                to="/emergency"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-red-700 font-bold text-xs hover:bg-slate-100 transition shadow"
              >
                <span>Request Emergency SOS Assistance</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs font-medium underline text-white/80 hover:text-white"
              >
                {expanded ? 'Show Less' : 'Read Full Advisory'}
              </button>
            </div>
          </div>
        </div>

        {/* Right side controls (Mute / Dismiss) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition text-white"
            title={soundEnabled ? 'Mute Alert Sound' : 'Enable Siren Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-75" />}
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition text-white"
              title="Dismiss Alert"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
