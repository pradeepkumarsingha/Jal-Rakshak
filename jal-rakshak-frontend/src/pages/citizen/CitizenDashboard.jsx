import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLocation } from '../../context/LocationContext'
import { useFloodData } from '../../context/FloodDataContext'
import { useAlert } from '../../context/AlertContext'
import { useLanguage } from '../../context/LanguageContext'
import { useGeolocation } from '../../hooks/useGeolocation'
import { floodApi } from '../../services/floodApi'
import RiskCard from '../../components/citizen/RiskCard'
import AlertBanner from '../../components/citizen/AlertBanner'
import ForecastTimeline from '../../components/citizen/ForecastTimeline'
import ShelterCard from '../../components/citizen/ShelterCard'
import LocationPickerModal from '../../components/citizen/LocationPickerModal'
import {
  Flame,
  FilePlus2,
  Home,
  Navigation,
  Bot,
  MapPin,
  Activity,
  RefreshCw,
  Sliders,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Info,
} from 'lucide-react'

export default function CitizenDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { selectedLocation, updateLocation, setManualLocation, useCurrentGpsLocation } = useLocation()
  const { dataMode, rivers, forecastTimeline, setForecastTimeline, shelters, isLive } = useFloodData()
  const { alerts, activeCriticalAlert, dismissAlert } = useAlert()

  // GPS Geolocation Hook
  const {
    latitude: gpsLat,
    longitude: gpsLng,
    accuracy: gpsAcc,
    timestamp: gpsTimestamp,
    loading: gpsLoading,
    error: gpsError,
    refreshLocation: refreshGps,
  } = useGeolocation()

  // Local state for dashboard data
  const [riskData, setRiskData] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [loadingRisk, setLoadingRisk] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const lastFetchedKeyRef = React.useRef('')

  // Determine active coordinates to use
  const activeLat = selectedLocation?.latitude ?? gpsLat
  const activeLng = selectedLocation?.longitude ?? gpsLng

  // Initial trigger for GPS if no manual location is active
  useEffect(() => {
    if (!selectedLocation && !gpsLat && !gpsLoading && !gpsError) {
      refreshGps().catch(() => {})
    }
  }, [selectedLocation, gpsLat, gpsLoading, gpsError, refreshGps])

  // Sync GPS updates to LocationContext if in GPS mode
  useEffect(() => {
    if (gpsLat && gpsLng && (!selectedLocation || selectedLocation.source === 'gps')) {
      if (selectedLocation?.latitude !== gpsLat || selectedLocation?.longitude !== gpsLng) {
        updateLocation({
          latitude: gpsLat,
          longitude: gpsLng,
          accuracy: gpsAcc,
          source: 'gps',
          updatedAt: new Date(gpsTimestamp || Date.now()).toISOString(),
        })
      }
    }
  }, [gpsLat, gpsLng, gpsAcc, gpsTimestamp, selectedLocation, updateLocation])

  // Load telemetry data whenever active coordinates or dataMode changes
  const fetchDashboardTelemetry = useCallback(
    async (lat, lng, locName = null, force = false) => {
      if (lat === null || lat === undefined || lng === null || lng === undefined) {
        return
      }

      const key = `${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}_${dataMode}_${locName || ''}`
      if (!force && lastFetchedKeyRef.current === key) {
        return
      }
      lastFetchedKeyRef.current = key

      setLoadingRisk(true)
      const isSim = dataMode !== 'live'

      try {
        // Parallel requests for Risk, Forecast, and Unified Dashboard
        const [riskRes, forecastRes, unifiedRes] = await Promise.allSettled([
          floodApi.getRiskPrediction({
            latitude: lat,
            longitude: lng,
            locationName: locName || 'Current location',
            simulationMode: isSim,
          }),
          floodApi.getForecast({
            latitude: lat,
            longitude: lng,
            hours: 24,
            simulationMode: isSim,
          }),
          floodApi.getLocationDashboard({
            latitude: lat,
            longitude: lng,
          }),
        ])

        if (riskRes.status === 'fulfilled' && riskRes.value) {
          setRiskData(riskRes.value)
        }

        if (forecastRes.status === 'fulfilled' && Array.isArray(forecastRes.value) && forecastRes.value.length > 0) {
          setForecastTimeline(forecastRes.value)
        }

        if (unifiedRes.status === 'fulfilled' && unifiedRes.value) {
          setDashboardData(unifiedRes.value)
        }
      } catch (err) {
        console.warn('Dashboard telemetry fetch error:', err)
      } finally {
        setLoadingRisk(false)
        setLastUpdated(new Date())
      }
    },
    [dataMode, setForecastTimeline]
  )

  // Fetch telemetry whenever active coordinates or simulation mode change
  useEffect(() => {
    if (activeLat !== null && activeLat !== undefined && activeLng !== null && activeLng !== undefined) {
      fetchDashboardTelemetry(activeLat, activeLng, selectedLocation?.name)
    }
  }, [activeLat, activeLng, dataMode, fetchDashboardTelemetry, selectedLocation?.name])

  // Handle manual refresh button
  const handleManualRefresh = async () => {
    setRefreshing(true)
    if (selectedLocation?.source === 'gps' || !selectedLocation) {
      try {
        const coords = await refreshGps()
        useCurrentGpsLocation(coords)
        await fetchDashboardTelemetry(coords.latitude, coords.longitude, null, true)
      } catch (e) {
        if (activeLat && activeLng) {
          await fetchDashboardTelemetry(activeLat, activeLng, selectedLocation?.name, true)
        }
      }
    } else if (activeLat && activeLng) {
      await fetchDashboardTelemetry(activeLat, activeLng, selectedLocation?.name, true)
    }
    setRefreshing(false)
  }

  // Quick Action Buttons
  const quickActions = [
    {
      title: 'Broadcast SOS Beacon',
      desc: 'Instant GPS distress alert to NDRF & Local Control Room.',
      link: '/emergency',
      icon: Flame,
      color: 'bg-red-600 text-white shadow-red-600/30',
      urgent: true,
    },
    {
      title: 'Report Waterlogging',
      desc: 'Crowd-source road blocks & water depth with photo analysis.',
      link: '/report',
      icon: FilePlus2,
      color: 'bg-amber-500 text-white shadow-amber-500/20',
    },
    {
      title: 'Nearest Safe Shelter',
      desc: 'Verified relief camps with food, medical & power backup.',
      link: '/shelters',
      icon: Home,
      color: 'bg-purple-600 text-white shadow-purple-600/20',
    },
    {
      title: 'Safe Evacuation Route',
      desc: 'AI-computed elevated path avoiding submerged streets.',
      link: '/route',
      icon: Navigation,
      color: 'bg-emerald-600 text-white shadow-emerald-600/20',
    },
    {
      title: 'AI Flood Advisor',
      desc: 'Ask questions in English, Hindi, or Odia about safety & water.',
      link: '/chat',
      icon: Bot,
      color: 'bg-brand-600 text-white shadow-brand-600/20',
    },
  ]

  // Location display resolution
  const resolvedLocationName =
    dashboardData?.location?.name ||
    selectedLocation?.name ||
    (activeLat ? `Coordinates (${activeLat.toFixed(4)}°N, ${activeLng.toFixed(4)}°E)` : 'Acquiring GPS...')

  const resolvedDistrict =
    dashboardData?.location?.district ||
    selectedLocation?.district ||
    user?.district ||
    null

  const resolvedState =
    dashboardData?.location?.state ||
    selectedLocation?.state ||
    user?.state ||
    'Odisha'

  const locationSource =
    dataMode !== 'live'
      ? 'Simulation'
      : selectedLocation?.source === 'manual'
      ? 'Manual Selection'
      : 'Device GPS'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Active Critical Alert Banner */}
      {activeCriticalAlert && (
        <AlertBanner alert={activeCriticalAlert} onDismiss={() => dismissAlert(activeCriticalAlert.id)} />
      )}

      {/* GPS Error / Prompt Banner if location is unavailable and no manual location is picked */}
      {gpsError && !selectedLocation && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">
              We could not access your live GPS location ({gpsError}). Search your district/city or select a location on the map.
            </p>
          </div>
          <button
            onClick={() => setLocationModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shrink-0 transition cursor-pointer"
          >
            Choose Location Manually &rarr;
          </button>
        </div>
      )}

      {/* Greeting & Header with Dynamic Location Details */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
              Citizen Emergency Dashboard
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                dataMode !== 'live'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : selectedLocation?.source === 'manual'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              Source: {locationSource}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Welcome back, {user?.name || 'Citizen'}
          </h1>

          {/* Location details row */}
          <div className="text-xs sm:text-sm text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="flex items-center gap-1 font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>{resolvedLocationName}</span>
              {resolvedDistrict && <span className="text-slate-500 font-normal">• District: <strong className="text-slate-800">{resolvedDistrict}</strong></span>}
              {resolvedState && <span className="text-slate-500 font-normal">({resolvedState})</span>}
            </div>

            {/* Development coordinates view */}
            {import.meta.env.DEV && activeLat && activeLng && (
              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                [{activeLat.toFixed(4)}, {activeLng.toFixed(4)}]
                {selectedLocation?.accuracy ? ` ±${Math.round(selectedLocation.accuracy)}m` : ''}
              </span>
            )}

            <span className="text-slate-400 text-xs">
              • Last updated: {new Date(lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Location Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing || gpsLoading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
            title="Refresh current location & flood telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-600 ${refreshing || gpsLoading ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Current Location'}</span>
          </button>

          <button
            type="button"
            onClick={() => setLocationModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-brand-50 border border-brand-200 hover:bg-brand-100 text-brand-700 font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span>Choose Location Manually</span>
          </button>

          <Link
            to="/emergency"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition transform active:scale-95 animate-pulse"
          >
            <Flame className="w-4 h-4" />
            <span>Emergency SOS</span>
          </Link>
        </div>
      </div>

      {/* Primary Flood Risk Gauge Card */}
      <RiskCard
        riskScore={riskData?.riskScore}
        riskLevel={riskData?.riskLevel}
        location={resolvedLocationName}
        predictedInundationDepth={riskData?.predictedInundationDepth}
        factors={riskData?.factors || riskData?.contributingFactors || []}
        lastUpdated={lastUpdated}
        isSimulation={dataMode !== 'live' || riskData?.isSimulation}
        message={riskData?.message}
      />

      {/* Quick Life-Saving Actions Grid */}
      <div>
        <h3 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Quick Life-Saving Actions</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {quickActions.map((action, idx) => {
            const Icon = action.icon
            return (
              <Link
                key={idx}
                to={action.link}
                className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-brand-500 hover:shadow-lg transition flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 shadow-md ${action.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-brand-600 transition">
                    {action.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {action.desc}
                  </p>
                </div>
                <div className="mt-3 text-[11px] font-bold text-brand-600 flex items-center gap-1">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 24h Predictive Hydrograph Timeline */}
      <ForecastTimeline forecast={forecastTimeline} />

      {/* Regional River Discharge Telemetry Widget */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-base font-extrabold text-slate-900 flex flex-wrap items-center gap-2">
            <Activity className="w-4 h-4 text-brand-600 animate-pulse" />
            <span>Regional River Discharge Forecast</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                dataMode === 'live'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}
            >
              {dataMode === 'live' ? 'GloFAS Model Forecast' : 'Simulation Mode'}
            </span>
          </h3>
          <span className="text-xs text-slate-500">Live Auto-Refresh (every 5 min)</span>
        </div>

        {rivers && rivers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rivers.map((river) => {
              const isDanger = river.currentLevel >= river.dangerLevel
              const isWarning = river.currentLevel >= river.warningLevel
              return (
                <div
                  key={river.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isDanger
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : isWarning
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isDanger ? '▲ Above Danger' : isWarning ? '▲ Warning Level' : 'Normal'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">{river.state}</span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{river.name}</h4>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl font-black text-slate-900">
                        {river.currentLevel !== undefined ? `${river.currentLevel}m` : '--'}
                      </span>
                      <span className="text-xs text-slate-500">
                        Danger Mark: <strong>{river.dangerLevel}m</strong>
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Inflow / Outflow:</span>
                      <strong className="text-slate-800">{river.inflow}</strong>
                    </div>
                    {river.dischargeM3PerSecond !== null && river.dischargeM3PerSecond !== undefined && (
                      <div className="flex justify-between">
                        <span>Discharge Volume:</span>
                        <strong className="text-cyan-700">{river.dischargeM3PerSecond} m³/s</strong>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Dam Gates:</span>
                      <strong className="text-brand-700">{river.gatesOpen || 'Monitoring'}</strong>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-500">
            Regional river discharge telemetry is currently updating from GloFAS forecast stations.
          </div>
        )}

        {/* Safety Disclaimer and Source Box */}
        <div className="mt-4 p-4 rounded-3xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-slate-800">Operational Notice & Safety Advisory</p>
            <p className="mt-1 leading-normal">
              Forecast river discharge only. Official gauge height and danger status require authorized government gauge data. The catchment levels and values displayed above are estimates computed from real-time satellite runoff forecasting models (Open-Meteo GloFAS) or simulated scenario presets. They do <strong>not</strong> represent official real-time physical telemetry feeds from the Central Water Commission (CWC) or warnings from the National Disaster Management Authority (NDMA). Citizens must prioritize local warning sirens, announcements, and direct district administration orders for any critical safety or evacuation decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Nearby Shelters Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Nearby Verified Relief Shelters</h3>
            <p className="text-xs text-slate-500">High-ground camps with clean water, food rations, and medical aid</p>
          </div>
          <Link to="/shelters" className="text-xs font-bold text-brand-600 hover:underline">
            View All ({shelters.length}) &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shelters.slice(0, 3).map((shelter) => (
            <ShelterCard key={shelter.id || shelter._id} shelter={shelter} />
          ))}
        </div>
      </div>

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        currentLocation={selectedLocation}
        onSelectLocation={(newLocation) => {
          setManualLocation(newLocation)
          fetchDashboardTelemetry(newLocation.latitude, newLocation.longitude, newLocation.name)
        }}
        onUseGps={async () => {
          try {
            const coords = await refreshGps()
            useCurrentGpsLocation(coords)
            fetchDashboardTelemetry(coords.latitude, coords.longitude)
          } catch (e) {
            // error handled by hook
          }
        }}
      />
    </div>
  )
}
