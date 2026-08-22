import React from 'react'
import { AlertTriangle, RefreshCw, PhoneCall } from 'lucide-react'

export default function LoadingErrorState({
  title = 'Flood information temporarily unavailable',
  description = 'We could not load current flood intelligence. Please retry or follow official local disaster-management instructions.',
  onRetry = null,
  retryLabel = 'Retry Loading',
  className = '',
}) {
  return (
    <section
      className={`flex w-full items-center justify-center px-4 py-8 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="w-full max-w-md rounded-3xl border border-amber-200/90 bg-amber-50/90 p-6 text-center shadow-lg text-amber-950 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-sm">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h3 className="mt-4 text-base font-extrabold text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          {description}
        </p>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-95 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{retryLabel}</span>
            </button>
          )}

          <a
            href="tel:1078"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
          >
            <PhoneCall className="h-3.5 w-3.5 text-red-600" />
            <span>NDRF Hotline: 1078</span>
          </a>
        </div>
      </div>
    </section>
  )
}
