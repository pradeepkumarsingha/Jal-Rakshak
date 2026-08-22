import React from 'react'
import { MapPin, Radio, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function SosTransmissionLoader({
  status = 'transmitting', // 'transmitting' | 'confirmed'
  priority = null, // 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  requestId = null,
  message = 'Transmitting emergency request…',
  subMessage = 'Sending your location and emergency details securely.',
}) {
  if (status === 'confirmed') {
    const isCritical = priority === 'CRITICAL'
    const isHigh = priority === 'HIGH'

    const badgeClass = isCritical
      ? 'bg-red-600 text-white'
      : isHigh
      ? 'bg-orange-500 text-white'
      : 'bg-emerald-600 text-white'

    const borderClass = isCritical
      ? 'border-red-500 bg-red-50/90 text-red-950'
      : isHigh
      ? 'border-orange-400 bg-orange-50/90 text-orange-950'
      : 'border-emerald-400 bg-emerald-50/90 text-emerald-950'

    return (
      <section
        className={`w-full max-w-md rounded-3xl border p-6 text-center shadow-xl ${borderClass}`}
        role="status"
        aria-live="assertive"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md">
          {isCritical || isHigh ? (
            <ShieldAlert className={`h-8 w-8 ${isCritical ? 'text-red-600' : 'text-orange-500'}`} />
          ) : (
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          )}
        </div>

        <span className={`mt-3 inline-block rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-wider ${badgeClass}`}>
          {priority ? `Priority ${priority}` : 'Confirmed'}
        </span>

        <h3 className="mt-2 text-base font-extrabold">
          Emergency Distress Beacon Registered
        </h3>

        {requestId && (
          <p className="mt-1 font-mono text-xs font-bold text-slate-700">
            Reference ID: {requestId}
          </p>
        )}

        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Your location and distress classification have been forwarded to the State Emergency Operations Center and NDRF rescue grid.
        </p>
      </section>
    )
  }

  return (
    <section
      className="w-full max-w-sm rounded-3xl border border-sky-100 bg-white/95 p-8 text-center shadow-2xl shadow-sky-950/10 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
        {/* Beacon Pulse Rings (Blue / Cyan) */}
        <span className="absolute h-32 w-32 rounded-full border border-sky-300/50 animate-radar-expand pointer-events-none" />
        <span className="absolute h-20 w-20 rounded-full border border-sky-400/60 animate-radar-expand-delayed pointer-events-none" />

        {/* Central Location Pin Beacon */}
        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-lg shadow-blue-500/30">
          <MapPin className="h-7 w-7 text-white animate-bounce" />
          <Radio className="absolute -top-1 -right-1 h-4 w-4 text-cyan-200" />
        </div>

        {/* Active Uplink Pulsing Dot */}
        <span className="absolute bottom-2 right-4 flex h-3.5 w-3.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
        </span>
      </div>

      <h2 className="mt-4 text-base font-bold text-slate-800">
        {message}
      </h2>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {subMessage}
      </p>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-sky-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Secure Disaster Uplink Active</span>
      </div>

      <span className="sr-only">
        {message}
      </span>
    </section>
  )
}
