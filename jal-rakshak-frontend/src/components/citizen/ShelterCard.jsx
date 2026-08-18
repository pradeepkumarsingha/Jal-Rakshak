import React from 'react'
import { Link } from 'react-router-dom'
import {
  Home,
  Navigation,
  Phone,
  CheckCircle,
  AlertTriangle,
  Users,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'

export default function ShelterCard({ shelter, onSelect }) {
  if (!shelter) return null

  const occPct = Math.min(100, Math.round((shelter.currentOccupancy / shelter.capacity) * 100))
  const remaining = Math.max(0, shelter.capacity - shelter.currentOccupancy)

  const isFull = occPct >= 100
  const isNearFull = occPct >= 85

  return (
    <div className={`bg-white rounded-2xl p-5 border transition-all duration-200 hover:shadow-lg flex flex-col justify-between ${
      shelter.isRecommended ? 'border-purple-300 ring-1 ring-purple-100 shadow-md' : 'border-slate-200'
    }`}>
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {shelter.isRecommended && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                <Sparkles className="w-3 h-3 text-purple-600" />
                AI Recommended High-Ground
              </span>
            )}
            <span className="text-[11px] font-semibold text-slate-500">
              Elev: <strong className="text-emerald-700 font-bold">{shelter.elevationMeters}m</strong>
            </span>
          </div>
          <span className="text-xs font-extrabold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg">
            {shelter.distanceKm} km away
          </span>
        </div>

        {/* Shelter Name & Location */}
        <h3 className="font-extrabold text-base text-slate-900 leading-snug">
          {shelter.name}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">{shelter.locationName}</p>

        {/* Occupancy Progress Bar */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-600 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" /> Capacity
            </span>
            <span className="font-bold text-slate-900">
              {shelter.currentOccupancy} / {shelter.capacity} ({occPct}%)
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull ? 'bg-red-600' : isNearFull ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${occPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] mt-1.5 text-slate-500">
            <span>{isFull ? '⚠️ At Full Capacity' : `${remaining} slots currently vacant`}</span>
            <span className="text-emerald-700 font-semibold">{shelter.roadCondition}</span>
          </div>
        </div>

        {/* Facilities Pills */}
        <div className="mt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Verified Camp Facilities
          </span>
          <div className="flex flex-wrap gap-1.5">
            {shelter.facilities?.map((f, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80"
              >
                ✓ {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
        <Link
          to={`/route?shelter=${shelter.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition shadow-md shadow-brand-600/20"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Get Safe Route</span>
        </Link>

        {shelter.phone && (
          <a
            href={`tel:${shelter.phone.replace(/\s+/g, '')}`}
            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            title="Call Shelter Operations Desk"
          >
            <Phone className="w-4 h-4 text-slate-600" />
          </a>
        )}
      </div>
    </div>
  )
}
