import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { reportApi } from '../../services/reportApi'
import { useAlert } from '../../context/AlertContext'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import ImageUpload from './ImageUpload'
import ImageUploadProgress from './ImageUploadProgress'
import {
  MapPin,
  Locate,
  Send,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Clock,
  Info,
} from 'lucide-react'

const reportSchema = z.object({
  address: z.string().min(3, 'Address / location must be at least 3 characters'),
  waterLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'SEVERE']),
  roadStatus: z.enum(['OPEN', 'PARTIALLY_BLOCKED', 'BLOCKED', 'UNKNOWN']),
  description: z.string().min(6, 'Please provide brief details of the situation'),
})

export default function ReportForm({ onSuccess }) {
  const { t } = useLanguage()
  const { showToast } = useAlert()
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState('uploading')
  const [submittedReport, setSubmittedReport] = useState(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [coords, setCoords] = useState({ lat: 20.2961, lng: 85.8245 })

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      address: user?.location?.address || 'Bhubaneswar, Odisha',
      waterLevel: 'HIGH',
      roadStatus: 'BLOCKED',
      description: 'Flood water entering residential street. Vehicles unable to pass.',
    },
  })

  const selectedWaterLevel = watch('waterLevel')
  const selectedRoadStatus = watch('roadStatus')

  const handleLocateMe = () => {
    setGpsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(5))
          const lng = Number(pos.coords.longitude.toFixed(5))
          setCoords({ lat, lng })
          setValue('address', `GPS: ${lat}° N, ${lng}° E (${pos.coords.accuracy.toFixed(0)}m accuracy)`)
          setGpsLoading(false)
        },
        (err) => {
          console.warn('GPS location error:', err.message)
          setGpsLoading(false)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      )
    } else {
      setGpsLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    setUploadProgress(15)
    setUploadStage('uploading')

    try {
      const formData = new FormData()
      formData.append('latitude', coords.lat)
      formData.append('longitude', coords.lng)
      formData.append('address', data.address)
      formData.append('waterLevel', data.waterLevel)
      formData.append('roadStatus', data.roadStatus)
      formData.append('description', data.description)

      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      setUploadProgress(50)
      if (selectedImage) {
        setTimeout(() => {
          setUploadStage('analyzing')
          setUploadProgress(85)
        }, 600)
      }

      const response = await reportApi.submitReport(formData)
      const reportResult = response.data || response

      setUploadProgress(100)
      setUploadStage('complete')
      setSubmittedReport(reportResult)

      showToast({
        title: 'Report Submitted for Verification',
        message: 'Your flood observation has been stored and queued for admin verification.',
        type: 'success',
      })

      if (onSuccess) onSuccess(reportResult)
    } catch (err) {
      setUploadStage('error')
      showToast({
        title: 'Report Submission Failed',
        message: err.response?.data?.error?.message || 'Failed to submit report. Please try again.',
        type: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-5">
      {submittedReport ? (
        /* Submission Success / Result Card */
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm text-emerald-900">
                Flood Hazard Report Queued (Status: PENDING)
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Report ID: <strong className="font-mono">{submittedReport.reportId || submittedReport.id}</strong>
              </p>
            </div>
          </div>

          {submittedReport.image?.secureUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950">
              <img
                src={submittedReport.image.secureUrl}
                alt="Uploaded report"
                className="w-full h-48 object-cover"
              />
              <div className="p-2.5 text-[11px] text-slate-300 flex items-center justify-between">
                <span>Cloudinary Verified Storage</span>
                <span className="font-mono text-emerald-400">Secure HTTPS</span>
              </div>
            </div>
          )}

          {submittedReport.aiAnalysis && (
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Automated AI Depth Assessment</span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  {submittedReport.aiAnalysis.status}
                </span>
              </div>

              {submittedReport.aiAnalysis.floodDetected === false ? (
                <div className="p-3 bg-red-950/40 rounded-xl border border-red-500/20 text-xs space-y-1">
                  <span className="text-[10px] font-extrabold text-red-400 block uppercase tracking-wider">AI Image Verification Failed</span>
                  <p className="text-red-200 leading-relaxed font-medium">
                    {submittedReport.aiAnalysis.message || 'The submitted image could not be verified as a genuine flood situation.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 bg-slate-800/70 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">AI Severity</span>
                      <strong className="text-amber-400 font-bold text-xs">{submittedReport.aiAnalysis.severity || 'UNKNOWN'}</strong>
                    </div>
                    <div className="p-2.5 bg-slate-800/70 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Road Condition</span>
                      <strong className="text-rose-400 font-bold text-xs">{submittedReport.aiAnalysis.roadCondition || 'UNKNOWN'}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-300/90 italic flex items-center gap-1 pt-1">
                    <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>AI image analysis is an estimate and requires administrator verification.</span>
                  </p>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setSubmittedReport(null)
              setSelectedImage(null)
              reset()
            }}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            Submit Another Ground Report
          </button>
        </div>
      ) : (
        /* Report Form */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {t('report.title') || 'Report Flood Hazard & Road Waterlogging'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('report.subtitle') || 'Submit observed water levels and road obstructions to assist emergency teams and alert neighbours.'}
            </p>
          </div>

          {/* Location & GPS */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t('report.locationAddress') || 'Location / Landmark Address *'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register('address')}
                  placeholder="e.g., Bidanasi Embankment, Sluice Gate No. 3, Cuttack"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={gpsLoading}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                title="Detect GPS Pin"
              >
                <Locate className={`w-3.5 h-3.5 text-brand-600 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{t('sos.autoGpsPin') || 'GPS Pin'}</span>
              </button>
            </div>
            {errors.address && <p className="text-red-600 text-[11px] mt-1">{errors.address.message}</p>}
          </div>

          {/* Water Level Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">{t('report.waterDepth') || 'Water Level Severity *'}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'LOW', label: 'LOW', desc: 'Ankle deep (< 0.3m)' },
                { id: 'MEDIUM', label: 'MEDIUM', desc: 'Knee deep (~0.6m)' },
                { id: 'HIGH', label: 'HIGH', desc: 'Waist deep (~1.0m)' },
                { id: 'SEVERE', label: 'SEVERE', desc: 'Chest / Overhead (> 1.5m)' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setValue('waterLevel', lvl.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedWaterLevel === lvl.id
                      ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400 text-amber-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-bold">{lvl.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Road Status */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">{t('report.roadCondition') || 'Road Passability *'}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'OPEN', label: 'OPEN', color: 'emerald' },
                { id: 'PARTIALLY_BLOCKED', label: 'PARTIAL', color: 'amber' },
                { id: 'BLOCKED', label: 'BLOCKED', color: 'red' },
                { id: 'UNKNOWN', label: 'UNKNOWN', color: 'slate' },
              ].map((rd) => (
                <button
                  key={rd.id}
                  type="button"
                  onClick={() => setValue('roadStatus', rd.id)}
                  className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                    selectedRoadStatus === rd.id
                      ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-400 text-brand-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold">{rd.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t('report.hazardPhoto') || 'Hazard Photo (Cloudinary Upload & AI Image Verification)'}
            </label>
            <ImageUpload onFileSelect={(file) => setSelectedImage(file)} />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">{t('report.observationDetails') || 'Observation Details *'}</label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder={t('report.observationPlaceholder') || 'Provide context on water flow speed, impassable vehicles, trapped elderly, or downed electrical lines...'}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
            />
            {errors.description && <p className="text-red-600 text-[11px] mt-1">{errors.description.message}</p>}
          </div>

          {/* Upload Progress Display */}
          {submitting && (
            <ImageUploadProgress
              uploadProgress={uploadProgress}
              stage={uploadStage}
            />
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? (t('report.submittingReportBtn') || 'Uploading to Cloudinary & Analyzing...') : (t('report.submitReportBtn') || 'Transmit Verified Hazard Report')}</span>
          </button>
        </form>
      )}
    </div>
  )
}
