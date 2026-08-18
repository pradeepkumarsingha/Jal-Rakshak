import React from 'react'
import ReportForm from '../../components/citizen/ReportForm'
import { useFloodData } from '../../context/FloodDataContext'
import { formatTimeAgo } from '../../utils/helpers'
import { FilePlus2, Sparkles, MapPin, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function ReportFlood() {
  const { reports } = useFloodData()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
            <FilePlus2 className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Report Flood Hazard & Waterlogging
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Crowd-source road blockages, submerged culverts, and stranded residents. All submissions are automatically processed through AI Computer Vision for depth assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Container */}
        <div className="lg:col-span-7">
          <ReportForm />
        </div>

        {/* Live Ground Reports Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Recent Community Ground Reports</span>
              </h3>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                LIVE FEED
              </span>
            </div>

            <div className="space-y-3.5 max-h-[620px] overflow-y-auto pr-1">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{rep.category}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTimeAgo(rep.timestamp)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand-600 shrink-0" />
                    <span>{rep.location}</span>
                  </p>

                  <p className="text-slate-700 italic text-[11px]">"{rep.description}"</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                    <span className="text-red-700 font-bold">Depth: {rep.waterDepth}</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> AI Conf: {rep.aiConfidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
