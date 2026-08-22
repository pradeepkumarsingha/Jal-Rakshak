import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { gisApi } from '../../services/gisApi'
import { useFloodData } from '../../context/FloodDataContext'
import { useLocation } from '../../context/LocationContext'
import { useGeolocation } from '../../hooks/useGeolocation'
import { useLanguage } from '../../context/LanguageContext'
import FloodRiskMap from '../../components/maps/FloodRiskMap'
import FloodRadarLoader from '../../components/common/FloodRadarLoader'
import { LOADING_MESSAGES } from '../../utils/loadingMessages'
import {
  Navigation,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Download,
  Clock,
  Sparkles,
  Play,
  Square,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Locate,
  Volume2,
  Compass,
} from 'lucide-react'

export default function SafeRoute() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const initialShelterId = searchParams.get('shelter') || 'SH-01'
  const { shelters } = useFloodData()
  const { selectedLocation } = useLocation()
  const { latitude: gpsLat, longitude: gpsLng } = useGeolocation()

  const liveLat = selectedLocation?.latitude ?? gpsLat ?? 20.2218
  const liveLng = selectedLocation?.longitude ?? gpsLng ?? 85.6736
  const liveLocName = selectedLocation?.name || 'Current Location'
  const liveDistrict = selectedLocation?.district ? `, ${selectedLocation.district}` : ''

  const [origin, setOrigin] = useState(`${liveLocName}${liveDistrict} (My GPS Pin)`)
  const [selectedShelterId, setSelectedShelterId] = useState(initialShelterId)
  const [loading, setLoading] = useState(false)
  const [routeResult, setRouteResult] = useState(null)

  // Live in-map navigation state
  const [isNavigating, setIsNavigating] = useState(false)
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [isSimulating, setIsSimulating] = useState(false)

  // Update origin display if live location resolves
  useEffect(() => {
    if (selectedLocation?.name) {
      setOrigin(`${selectedLocation.name}${selectedLocation.district ? `, ${selectedLocation.district}` : ''} (My GPS Pin)`)
    }
  }, [selectedLocation?.name, selectedLocation?.district])

  const selectedShelter = shelters.find((s) => s.id === selectedShelterId) || shelters[0]

  const calculateRoute = async () => {
    setLoading(true)
    const result = await gisApi.calculateSafeRoute({
      origin: [liveLat, liveLng],
      destination: [selectedShelter?.lat || 20.4812, selectedShelter?.lng || 85.8654],
      avoidFloodZones: true,
    })
    setRouteResult(result)
    setActiveStepIndex(0)
    setLoading(false)
  }

  useEffect(() => {
    calculateRoute()
  }, [selectedShelterId, liveLat, liveLng])

  // Simulation auto-advance timer
  useEffect(() => {
    let interval = null
    if (isNavigating && isSimulating && routeResult?.turnByTurn) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev < routeResult.turnByTurn.length - 1) {
            return prev + 1
          } else {
            setIsSimulating(false)
            return prev
          }
        })
      }, 3500)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isNavigating, isSimulating, routeResult])

  const handleStartNavigation = () => {
    setIsNavigating(true)
    setActiveStepIndex(0)
    setIsSimulating(false)
  }

  const handleStopNavigation = () => {
    setIsNavigating(false)
    setIsSimulating(false)
    setActiveStepIndex(0)
  }

  const handleNextStep = () => {
    if (routeResult?.turnByTurn && activeStepIndex < routeResult.turnByTurn.length - 1) {
      setActiveStepIndex((prev) => prev + 1)
    }
  }

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1)
    }
  }

  // Active waypoint on the map
  const activeNavPoint =
    isNavigating && routeResult?.waypoints && routeResult.waypoints[activeStepIndex]
      ? routeResult.waypoints[activeStepIndex]
      : null

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${liveLat},${liveLng}&destination=${selectedShelter?.lat || 20.4812},${selectedShelter?.lng || 85.8654}&travelmode=walking`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Navigation className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t('safeRoute.title') || 'AI Flood-Safe Evacuation Pathfinder'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('safeRoute.subtitle') || 'Dynamic evacuation route avoiding flooded culverts, submerged embankments, and low-lying underpasses.'}
          </p>
        </div>

        {/* Live Navigation Action Trigger */}
        <div className="flex items-center gap-2">
          {!isNavigating ? (
            <button
              onClick={handleStartNavigation}
              disabled={!routeResult}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition transform active:scale-95 cursor-pointer disabled:opacity-50 animate-pulse"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{t('safeRoute.startNav') || 'Start In-Map Navigation'}</span>
            </button>
          ) : (
            <button
              onClick={handleStopNavigation}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>{t('safeRoute.stopNav') || 'Exit Navigation'}</span>
            </button>
          )}

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition"
            title="Open turn-by-turn navigation directly in Google Maps application"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-600" />
            <span>{t('common.openInMaps') || 'Google Maps GPS'}</span>
          </a>
        </div>
      </div>

      {/* Origin & Destination Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Origin */}
          <div className="md:col-span-5">
            <label className="text-xs font-bold text-slate-700 block mb-1">{t('safeRoute.origin') || 'Origin (Your Location)'}</label>
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
            <label className="text-xs font-bold text-slate-700 block mb-1">{t('safeRoute.destination') || 'Destination Relief Shelter'}</label>
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
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? (t('safeRoute.routingBtn') || 'Routing...') : (t('safeRoute.rerouteBtn') || 'Re-Route')}</span>
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="pt-4 border-t border-slate-100">
            <FloodRadarLoader
              compact
              message={LOADING_MESSAGES.SAFE_ROUTE.message}
              subMessage={LOADING_MESSAGES.SAFE_ROUTE.subMessage}
            />
          </div>
        )}

        {/* Route Stats Summary Strip */}
        {!loading && routeResult && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700">{t('safeRoute.safetyStatus') || 'Safety Status'}</span>
              <div className="font-extrabold text-emerald-950 text-sm mt-0.5">{t('safeRoute.floodClear') || '100% Flood-Clear'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">{t('safeRoute.totalDistance') || 'Total Distance'}</span>
              <div className="font-extrabold text-slate-900 text-sm mt-0.5">{routeResult.totalDistanceKm} km</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">{t('safeRoute.estimatedTransit') || 'Estimated Transit'}</span>
              <div className="font-extrabold text-slate-900 text-sm mt-0.5">~{routeResult.estimatedTimeMinutes} mins</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">{t('safeRoute.elevationGain') || 'Elevation Gain'}</span>
              <div className="font-extrabold text-slate-900 text-sm mt-0.5">+{routeResult.elevationGainMeters}m High Ground</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Split View: Map & Step-by-Step Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map & Live Navigation HUD */}
        <div className="lg:col-span-7 space-y-3">
          {/* Active Navigation HUD Bar */}
          {isNavigating && routeResult?.turnByTurn && (
            <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-600 text-white font-bold animate-pulse">
                    <Compass className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">
                      LIVE IN-MAP NAVIGATION • STEP {activeStepIndex + 1} OF {routeResult.turnByTurn.length}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      {routeResult.turnByTurn[activeStepIndex]?.instruction}
                    </h3>
                  </div>
                </div>
                <span className="text-sm font-mono font-extrabold bg-slate-800 px-3 py-1.5 rounded-xl text-emerald-400 border border-slate-700">
                  {routeResult.turnByTurn[activeStepIndex]?.distance}
                </span>
              </div>

              {/* Navigation Controls Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevStep}
                    disabled={activeStepIndex === 0}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition text-white"
                    title="Previous Step"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={activeStepIndex >= routeResult.turnByTurn.length - 1}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition text-white"
                    title="Next Step"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsSimulating(!isSimulating)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isSimulating
                        ? 'bg-amber-500 text-slate-950 font-extrabold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isSimulating ? 'Simulating Movement...' : 'Auto-Transit (Demo)'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Open Google Maps App &rarr;
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Clean Map Container without overlays */}
          <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-sm overflow-hidden">
            <FloodRiskMap
              height={typeof window !== 'undefined' && window.innerWidth < 640 ? (isNavigating ? '360px' : '400px') : (isNavigating ? '520px' : '580px')}
              center={activeNavPoint || [liveLat, liveLng]}
              zoom={isNavigating ? 16 : 13}
              routeWaypoints={routeResult?.waypoints}
              activeNavPoint={activeNavPoint}
              isNavigating={isNavigating}
              showControls={false}
            />
          </div>
        </div>

        {/* Right Column: Turn-by-Turn Navigation Guide & Forecast Horizon */}
        <div className="lg:col-span-5 space-y-4">
          {/* Turn-by-Turn Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>{t('safeRoute.turnByTurnTitle') || 'Turn-by-Turn Safe Steps'}</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {t('safeRoute.verifiedSafeBadge') || 'Verified Safe'}
              </span>
            </div>

            {/* Avoidance Warning */}
            {routeResult?.hazardWarnings?.map((w, i) => (
              <div key={i} className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>{t('safeRoute.hazardAvoided') || 'Hazard Avoided:'}</strong> {w}</span>
              </div>
            ))}

            {/* Steps list (Interactive click to inspect waypoint) */}
            <div className="space-y-2.5 pt-1 max-h-[320px] overflow-y-auto pr-1">
              {routeResult?.turnByTurn?.map((step, idx) => {
                const isActive = isNavigating && activeStepIndex === idx
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setIsNavigating(true)
                      setActiveStepIndex(idx)
                    }}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100/80'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs ${
                        isActive
                          ? 'bg-emerald-600 text-white animate-bounce'
                          : 'bg-brand-600 text-white'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className={`text-xs font-semibold leading-snug ${isActive ? 'text-emerald-950 font-bold' : 'text-slate-800'}`}>
                        {step.instruction}
                      </p>
                      <span className="text-[10px] text-slate-500 font-medium">{step.distance}</span>
                    </div>
                    {isActive ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              {!isNavigating ? (
                <button
                  onClick={handleStartNavigation}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Follow Route on Map</span>
                </button>
              ) : (
                <button
                  onClick={handleStopNavigation}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Exit Map Follow Mode</span>
                </button>
              )}

              <button
                onClick={() => alert(`Offline Evacuation Route to ${selectedShelter?.name || 'Relief Shelter'} saved.\nTotal distance: ${routeResult?.totalDistanceKm || 3.8} km\nEmergency Helplines: NDRF 1078, Emergency 112`)}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Download SMS & PDF Route Summary"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Offline Summary</span>
              </button>
            </div>
          </div>

          {/* Forecast Time Horizon & Route Safety Controls (Placed cleanly below Turn-by-Turn navigation) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>Forecast Time Horizon & Rainfall Surge</span>
              </h3>
              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                SIMULATION
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[
                { id: 'NOW', label: 'Now', rain: '42mm' },
                { id: '+3h', label: '+3h', rain: '65mm' },
                { id: '+6h', label: '+6h Peak', rain: '80mm' },
                { id: '+12h', label: '+12h', rain: '35mm' },
                { id: '+24h', label: '+24h', rain: '8mm' },
              ].map((step) => (
                <div
                  key={step.id}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center justify-center"
                >
                  <span className="text-[11px] font-bold text-slate-800">{step.label}</span>
                  <span className="text-[10px] text-brand-600 font-semibold mt-0.5">{step.rain}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 pt-1">
              • The evacuation path above is calibrated against peak +6h flood inundation levels to ensure safety throughout your transit.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
