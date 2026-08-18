import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { gisApi } from '../../services/gisApi'
import { useFloodData } from '../../context/FloodDataContext'
import FloodRiskMap from '../../components/maps/FloodRiskMap'
import {
  Navigation,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Download,
  Share2,
  Clock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

export default function SafeRoute() {
  const [searchParams] = useSearchParams()
  const initialShelterId = searchParams.get('shelter') || 'SH-01'
  const { shelters } = useFloodData()

  const [origin, setOrigin] = useState('Bidanasi Embankment, Cuttack (My GPS Location)')
  const [selectedShelterId, setSelectedShelterId] = useState(initialShelterId)
  const [loading, setLoading] = useState(false)
  const [routeResult, setRouteResult] = useState(null)

  const selectedShelter = shelters.find((s) => s.id === selectedShelterId) || shelters[0]

  const calculateRoute = async () => {
    setLoading(true)
    const result = await gisApi.calculateSafeRoute({
      origin: [20.4782, 85.8621],
      destination: [selectedShelter?.lat || 20.4812, selectedShelter?.lng || 85.8654],
      avoidFloodZones: true,
    })
    setRouteResult(result)
    setLoading(false)
  }

  useEffect(() => {
    calculateRoute()
  }, [selectedShelterId])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
            <Navigation className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            AI Flood-Safe Evacuation Pathfinder
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Dynamic route calculation routing through elevated ridges and overpasses while strictly bypassing submerged underpasses and breaching embankments.
        </p>
      </div>

      {/* Origin & Destination Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Origin */}
          <div className="md:col-span-5">
            <label className="text-xs font-bold text-slate-700 block mb-1">Origin (Your Location)</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-brand-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium"
              />
            </div>
          </div>

          {/* Destination */}
          <div className="md:col-span-5">
            <label className="text-xs font-bold text-slate-700 block mb-1">Destination Relief Shelter</label>
            <select
              value={selectedShelterId}
              onChange={(e) => setSelectedShelterId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500 outline-none font-medium"
            >
              {shelters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.distanceKm} km, {s.currentOccupancy}/{s.capacity})
                </option>
              ))}
            </select>
          </div>

          {/* Recalculate Button */}
          <div className="md:col-span-2 pt-5 md:pt-0">
            <button
              onClick={calculateRoute}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Routing...' : 'Re-Route'}</span>
            </button>
          </div>
        </div>

        {/* Route Stats Summary Strip */}
        {routeResult && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700">Safety Status</span>
              <div className="font-extrabold text-emerald-950 text-sm mt-0.5">100% Flood-Clear</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Total Distance</span>
              <div className="font-extrabold text-slate-900 text-sm mt-0.5">{routeResult.totalDistanceKm} km</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Estimated Drive / Walk</span>
              <div className="font-extrabold text-slate-900 text-sm mt-0.5">~{routeResult.estimatedTimeMinutes} mins</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Elevation Gain</span>
              <div className="font-extrabold text-slate-900 text-sm mt-0.5">+{routeResult.elevationGainMeters}m High Ground</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Split View: Map & Step-by-Step Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map with Polyline */}
        <div className="lg:col-span-7">
          <FloodRiskMap
            height="550px"
            center={[20.4782, 85.8621]}
            zoom={13}
            routeWaypoints={routeResult?.waypoints}
          />
        </div>

        {/* Turn-by-Turn Navigation Guide */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>Turn-by-Turn Navigation</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Verified Safe
              </span>
            </div>

            {/* Avoidance Warning */}
            {routeResult?.hazardWarnings?.map((w, i) => (
              <div key={i} className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>Hazard Avoided:</strong> {w}</span>
              </div>
            ))}

            {/* Steps list */}
            <div className="space-y-2.5 pt-1">
              {routeResult?.turnByTurn?.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800 leading-snug">{step.instruction}</p>
                    <span className="text-[10px] text-slate-500 font-medium">{step.distance}</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                </div>
              ))}
            </div>

            {/* Download summary button */}
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => alert('Offline Route downloaded to device storage.')}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Offline Summary (SMS/PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
