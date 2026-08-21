import React, { useState } from 'react'
import FloodRiskMap from '../../components/maps/FloodRiskMap'
import { useFloodData } from '../../context/FloodDataContext'
import { useLocation } from '../../context/LocationContext'
import { useGeolocation } from '../../hooks/useGeolocation'
import { MapPin, ShieldAlert, Layers, Navigation, Home, Flame, Info, Locate } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FloodMap() {
  const { riskZones, shelters, emergencies, reports } = useFloodData()
  const { selectedLocation } = useLocation()
  const { latitude: gpsLat, longitude: gpsLng } = useGeolocation()

  const liveLat = selectedLocation?.latitude ?? gpsLat ?? 20.2218
  const liveLng = selectedLocation?.longitude ?? gpsLng ?? 85.6736
  const liveLocName = selectedLocation?.name || 'My Location'

  const [activeTab, setActiveTab] = useState('LIVE')

  const districtCoords = {
    LIVE: [liveLat, liveLng],
    Cuttack: [20.4782, 85.8621],
    Kendrapara: [20.5015, 86.4210],
    Bhubaneswar: [20.3541, 85.8192],
    Puri: [20.380, 85.890],
  }

  const mapCenter = activeTab === 'LIVE' ? [liveLat, liveLng] : districtCoords[activeTab]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-100 text-brand-700">
              <MapPin className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Live GIS Inundation & Hazard Map
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive multi-layer flood satellite model, verified relief camps, and active SOS rescue beacons.
          </p>
        </div>

        {/* District / Live Location Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('LIVE')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'LIVE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Locate className="w-3.5 h-3.5" />
            <span>{liveLocName} (GPS)</span>
          </button>
          {['Cuttack', 'Kendrapara', 'Bhubaneswar', 'Puri'].map((d) => (
            <button
              key={d}
              onClick={() => setActiveTab(d)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === d
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-red-50 rounded-2xl border border-red-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-red-600">Active SOS Distress</span>
            <div className="text-base font-extrabold text-red-950">{emergencies.length} Trapped Locations</div>
          </div>
        </div>

        <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-600">Verified Relief Camps</span>
            <div className="text-base font-extrabold text-purple-950">{shelters.length} Shelters Open</div>
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-600">Ground Hazard Reports</span>
            <div className="text-base font-extrabold text-amber-950">{reports.length} Road Points Pinned</div>
          </div>
        </div>

        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600">High-Ground Escape</span>
            <div className="text-base font-extrabold text-emerald-950">
              <Link to="/route" className="text-emerald-700 hover:underline">Calculate Route &rarr;</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <FloodRiskMap
        height="640px"
        center={mapCenter}
        zoom={activeTab === 'LIVE' ? 14 : 13}
        showControls={true}
      />
    </div>
  )
}
