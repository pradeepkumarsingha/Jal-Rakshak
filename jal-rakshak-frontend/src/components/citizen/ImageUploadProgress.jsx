import React from 'react'
import { CheckCircle2, CloudUpload, ScanSearch, AlertCircle } from 'lucide-react'

export default function ImageUploadProgress({
  uploadProgress = 0,
  stage = 'uploading',
}) {
  const stageConfig = {
    uploading: {
      icon: CloudUpload,
      title: 'Uploading hazard image securely…',
      description: 'Saving your image for report verification.',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      barColor: 'from-sky-500 to-blue-700',
    },

    analyzing: {
      icon: ScanSearch,
      title: 'Analysing flood image…',
      description: 'Preparing AI-assisted hazard verification.',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      barColor: 'from-violet-500 to-indigo-700',
    },

    complete: {
      icon: CheckCircle2,
      title: 'Image processing completed',
      description: 'AI output is an estimate and requires administrator verification.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      barColor: 'from-emerald-500 to-green-600',
    },

    error: {
      icon: AlertCircle,
      title: 'Image upload failed',
      description: 'Could not process the image. Please verify file format or retry.',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      barColor: 'from-rose-500 to-red-600',
    },
  }

  const current = stageConfig[stage] || stageConfig.uploading
  const Icon = current.icon

  return (
    <section
      className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"
      aria-live="polite"
      aria-busy={stage !== 'complete' && stage !== 'error'}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${current.bgColor}`}>
          <Icon className={`h-6 w-6 ${current.color}`} />
        </div>

        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800">
            {current.title}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {current.description}
          </p>
        </div>
      </div>

      {stage !== 'complete' && stage !== 'error' && (
        <>
          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={uploadProgress}
            aria-valuetext={`${uploadProgress}% complete`}
          >
            <div
              className={`h-full rounded-full bg-gradient-to-r ${current.barColor} transition-all duration-300`}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <p className="mt-2 text-right text-xs font-semibold text-sky-700">
            {uploadProgress}%
          </p>
        </>
      )}
    </section>
  )
}
