import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useFloodData } from '../../context/FloodDataContext'
import { useAlert } from '../../context/AlertContext'
import { useAuth } from '../../context/AuthContext'
import ImageUpload from './ImageUpload'
import { WATER_DEPTH_LEVELS } from '../../utils/constants'
import { MapPin, Locate, Send, AlertTriangle, Users, CheckCircle2 } from 'lucide-react'

const reportSchema = z.object({
  location: z.string().min(3, 'Location description must be at least 3 characters'),
  category: z.string().min(1, 'Please select a hazard category'),
  waterDepth: z.string().min(1, 'Please select water depth level'),
  description: z.string().min(10, 'Please provide details (at least 10 characters)'),
  trappedPeople: z.number().min(0),
  needsBoat: z.boolean().optional(),
})

export default function ReportForm({ onSuccess }) {
  const { addReport } = useFloodData()
  const { showToast } = useAlert()
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [selectedDepth, setSelectedDepth] = useState('0.8 meters (Knee Level)')
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [gpsLoading, setGpsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      location: user?.location?.address || '',
      category: 'Waterlogged Main Arterial Road',
      waterDepth: '0.8 meters (Knee Level)',
      description: '',
      trappedPeople: 0,
      needsBoat: false,
    },
  })

  const handleLocateMe = () => {
    setGpsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setValue('location', `GPS Pin: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`)
          setGpsLoading(false)
        },
        () => {
          setGpsLoading(false)
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      )
    } else {
      setGpsLoading(false)
    }
  }

  const handleAiAnalyzed = (analysis) => {
    setAiAnalysis(analysis)
    setValue('waterDepth', analysis.depthCategory)
    setSelectedDepth(analysis.depthCategory)
    if (analysis.detectedWaterDepthMeters >= 1.0) {
      setValue('needsBoat', true)
    }
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const newRep = addReport({
        ...data,
        user: user?.name || 'Concerned Citizen',
        lat: 20.4782 + (Math.random() - 0.5) * 0.02,
        lng: 85.8621 + (Math.random() - 0.5) * 0.02,
        imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      })

      showToast({
        title: 'Report Broadcasted Successfully!',
        message: 'Your hazard submission is transmitted to the Disaster Control Room.',
        type: 'success',
      })

      reset()
      if (onSuccess) onSuccess(newRep)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-5">
      <div>
        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Crowd-Source Flood Hazard Incident
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Help authorities and neighbours by reporting submerged roads, rising levels, and trapped residents.
        </p>
      </div>

      {/* Location Input */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">
          Hazard Location / Nearest Landmark *
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              {...register('location')}
              placeholder="e.g., Bidanasi Embankment, Sluice Gate No. 3"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={gpsLoading}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
            title="Detect current GPS location"
          >
            <Locate className={`w-3.5 h-3.5 text-brand-600 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span>GPS Pin</span>
          </button>
        </div>
        {errors.location && <p className="text-red-600 text-[11px] mt-1">{errors.location.message}</p>}
      </div>

      {/* Hazard Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Hazard Category *</label>
          <select
            {...register('category')}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="Waterlogged Main Arterial Road">Waterlogged Main Arterial Road</option>
            <option value="Embankment Seepage / Breach">Embankment Seepage / Breach</option>
            <option value="Residential Area Submerged">Residential Area Submerged</option>
            <option value="Bridge / Culvert Overtopping">Bridge / Culvert Overtopping</option>
            <option value="Fallen Electric Pole / Live Wire Hazard">Fallen Electric Pole / Live Wire Hazard</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Stranded People (if any)</label>
          <input
            type="number"
            {...register('trappedPeople', { valueAsNumber: true })}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
      </div>

      {/* Water Depth Level Selector */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1.5">Observed Water Depth *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {WATER_DEPTH_LEVELS.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => {
                setSelectedDepth(w.label)
                setValue('waterDepth', w.label)
              }}
              className={`p-2.5 rounded-xl border text-left transition ${
                selectedDepth.includes(w.id) || selectedDepth === w.label
                  ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-400 text-brand-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="text-[11px] font-bold">{w.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{w.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Image Upload with AI Analysis */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Upload Photo (Optional but Recommended)</label>
        <ImageUpload onImageAnalyzed={handleAiAnalyzed} />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Incident Details & Observations *</label>
        <textarea
          rows={3}
          {...register('description')}
          placeholder="Describe water flow rate, impassable vehicles, trapped elderly, or any specific hazard..."
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
        />
        {errors.description && <p className="text-red-600 text-[11px] mt-1">{errors.description.message}</p>}
      </div>

      {/* Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="needsBoat"
          {...register('needsBoat')}
          className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
        />
        <label htmlFor="needsBoat" className="text-xs font-semibold text-slate-700 cursor-pointer">
          Urgent motorized rescue boat / inflatable raft required at this spot
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30"
      >
        <Send className="w-4 h-4" />
        <span>{submitting ? 'Broadcasting Report...' : 'Submit Verified Hazard Report'}</span>
      </button>
    </form>
  )
}
