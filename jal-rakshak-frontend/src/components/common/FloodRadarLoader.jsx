import React from 'react'
import { ShieldCheck, Waves } from 'lucide-react'

export default function FloodRadarLoader({
  message = 'Loading flood intelligence…',
  subMessage = 'Please wait while we process available data.',
  fullScreen = false,
  compact = false,
  className = '',
}) {
  const wrapperClass = fullScreen
    ? 'fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm'
    : 'flex w-full items-center justify-center px-4 py-10'

  const cardClass = compact
    ? 'flex flex-col items-center justify-center gap-3'
    : 'w-full max-w-sm rounded-3xl border border-sky-100 bg-white/95 p-8 text-center shadow-2xl shadow-sky-950/10 backdrop-blur-md'

  return (
    <section
      className={`${wrapperClass} ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      <div className={cardClass}>
        <div className="relative flex h-36 w-36 items-center justify-center mx-auto">
          {/* Radar Ring 1 */}
          <span className="absolute h-36 w-36 rounded-full border border-sky-300/50 animate-radar-expand pointer-events-none" />

          {/* Radar Ring 2 (Delayed) */}
          <span className="absolute h-24 w-24 rounded-full border border-sky-400/60 animate-radar-expand-delayed pointer-events-none" />

          {/* Rotating Radar Sweep */}
          <span className="absolute h-32 w-32 rounded-full border-t-2 border-r-2 border-sky-500/90 animate-radar-spin pointer-events-none" />

          {/* Central Protective Shield with Wave */}
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 shadow-lg shadow-blue-500/30">
            <ShieldCheck
              className="absolute h-9 w-9 text-white"
              strokeWidth={2.2}
            />
            <Waves
              className="absolute bottom-3 h-5 w-8 text-cyan-100"
              strokeWidth={2.2}
            />
          </div>

          {/* Live Processing Pulsing Indicator */}
          <span className="absolute bottom-1 right-4 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
          </span>
        </div>

        {!compact && (
          <>
            <h2 className="mt-5 text-base font-bold tracking-tight text-slate-800">
              {message}
            </h2>

            {subMessage && (
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {subMessage}
              </p>
            )}

            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Jal Rakshak Intelligence Engine
            </div>
          </>
        )}

        <span className="sr-only">
          {message}
        </span>
      </div>
    </section>
  )
}
