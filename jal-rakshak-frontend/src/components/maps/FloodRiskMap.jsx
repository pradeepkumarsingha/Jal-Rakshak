import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { useFloodData } from '../../context/FloodDataContext'
import MapLegend from './MapLegend'
import MapControls from './MapControls'
import {
  Navigation,
  Phone,
  Users,
  ShieldCheck,
  CheckCircle,
  Clock,
  AlertOctagon,
  ExternalLink,
} from 'lucide-react'

// Center adjuster component for Leaflet
function MapRecenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1.5 })
    }
  }, [center, zoom, map])
  return null
}

export default function FloodRiskMap({
  height = '600px',
  center = [20.4782, 85.8621], // Cuttack Default
  zoom = 13,
  showControls = true,
  routeWaypoints = null,
  highlightShelterId = null,
}) {
  const { riskZones, shelters, reports, emergencies, rescueTeams } = useFloodData()
  const [mapCenter, setMapCenter] = useState(center)
  const [mapZoom, setMapZoom] = useState(zoom)
  const [selectedTime, setSelectedTime] = useState('NOW')
  const [layers, setLayers] = useState({
    zones: true,
    shelters: true,
    emergencies: true,
    reports: true,
    rescue: true,
  })

  const userLocation = [20.4782, 85.8621]

  // Create custom DivIcons for Leaflet
  const createDivIcon = (htmlContent, className = 'custom-div-icon', iconSize = [32, 32]) => {
    return L.divIcon({
      html: htmlContent,
      className,
      iconSize,
      iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
      popupAnchor: [0, -iconSize[1] / 2],
    })
  }

  // Icons HTML
  const sosIcon = createDivIcon(
    `<div class="relative flex items-center justify-center w-8 h-8">
      <span class="absolute w-8 h-8 rounded-full bg-red-600 animate-ping opacity-75"></span>
      <span class="relative w-7 h-7 rounded-full bg-red-600 border-2 border-white text-white flex items-center justify-center shadow-lg font-bold text-[10px]">SOS</span>
    </div>`,
    'sos-marker',
    [32, 32]
  )

  const shelterIcon = createDivIcon(
    `<div class="w-8 h-8 rounded-xl bg-purple-600 border-2 border-white text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
    </div>`,
    'shelter-marker',
    [32, 32]
  )

  const reportIcon = createDivIcon(
    `<div class="w-7 h-7 rounded-full bg-amber-500 border-2 border-white text-white flex items-center justify-center shadow-md">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
    </div>`,
    'report-marker',
    [28, 28]
  )

  const rescueIcon = createDivIcon(
    `<div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-lg">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg>
    </div>`,
    'rescue-marker',
    [32, 32]
  )

  const userGpsIcon = createDivIcon(
    `<div class="relative flex items-center justify-center w-6 h-6">
      <span class="absolute w-6 h-6 rounded-full bg-brand-500 animate-ping opacity-60"></span>
      <span class="relative w-4 h-4 rounded-full bg-brand-600 border-2 border-white shadow-md"></span>
    </div>`,
    'user-marker',
    [24, 24]
  )

  const handleLocateMe = () => {
    setMapCenter(userLocation)
    setMapZoom(14)
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapRecenter center={mapCenter} zoom={mapZoom} />

        {/* Base OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Jal Rakshak AI'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User GPS Circle & Marker */}
        <Marker position={userLocation} icon={userGpsIcon}>
          <Popup>
            <div className="p-3 text-xs font-sans">
              <span className="text-[10px] font-bold uppercase text-brand-600">Your Detected Location</span>
              <h4 className="font-bold text-slate-800 text-sm mt-0.5">Bidanasi, Cuttack</h4>
              <p className="text-slate-500 mt-1">Estimated Inundation Risk: <strong className="text-red-600">CRITICAL (88%)</strong></p>
              <Link
                to="/route"
                className="mt-2 inline-flex items-center gap-1 w-full justify-center px-3 py-1.5 rounded-lg bg-brand-600 text-white font-semibold text-xs hover:bg-brand-700"
              >
                <Navigation className="w-3.5 h-3.5" /> Navigate to Safe Shelter
              </Link>
            </div>
          </Popup>
        </Marker>
        <Circle center={userLocation} radius={350} pathOptions={{ color: '#0284C7', fillColor: '#0EA5E9', fillOpacity: 0.15 }} />

        {/* Flood Risk Polygons */}
        {layers.zones &&
          riskZones.map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: selectedTime === '+6h' ? zone.fillOpacity + 0.2 : zone.fillOpacity,
                weight: 2,
              }}
            >
              <Popup>
                <div className="p-3 text-xs font-sans max-w-[240px]">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded text-white inline-block mb-1"
                    style={{ backgroundColor: zone.color }}
                  >
                    {zone.severity} ZONE
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{zone.name}</h4>
                  <div className="mt-2 space-y-1 text-slate-600">
                    <p>Water Depth: <strong className="text-slate-900">{zone.waterDepth}</strong></p>
                    <p>Population at Risk: <strong className="text-slate-900">{zone.populationAtRisk}</strong></p>
                    <p>Advisory Status: <strong className="text-red-600">{zone.status.replace(/_/g, ' ')}</strong></p>
                  </div>
                </div>
              </Popup>
            </Polygon>
          ))}

        {/* Relief Shelters Markers */}
        {layers.shelters &&
          shelters.map((shelter) => (
            <Marker key={shelter.id} position={[shelter.lat, shelter.lng]} icon={shelterIcon}>
              <Popup>
                <div className="p-3 text-xs font-sans max-w-[260px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      RELIEF SHELTER
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">{shelter.distanceKm} km</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{shelter.name}</h4>
                  <p className="text-slate-500 text-[11px]">{shelter.locationName}</p>

                  <div className="mt-2 p-2 bg-slate-50 rounded-lg space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Occupancy:</span>
                      <strong className="text-slate-800">{shelter.currentOccupancy} / {shelter.capacity}</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full"
                        style={{ width: `${(shelter.currentOccupancy / shelter.capacity) * 100}%` }}
                      />
                    </div>
                    <p className="text-emerald-700 font-medium mt-1">Elevation: {shelter.elevationMeters}m (Flood-Proof)</p>
                  </div>

                  <div className="mt-2 flex gap-1.5">
                    <Link
                      to={`/route?shelter=${shelter.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-600 text-white font-semibold text-[11px] hover:bg-brand-700"
                    >
                      <Navigation className="w-3 h-3" /> Safe Route
                    </Link>
                    <a
                      href={`tel:${shelter.phone}`}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                      title="Call Shelter"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* SOS Emergency Distress Markers */}
        {layers.emergencies &&
          emergencies.map((sos) => (
            <Marker key={sos.id} position={[sos.lat, sos.lng]} icon={sosIcon}>
              <Popup>
                <div className="p-3 text-xs font-sans max-w-[260px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase bg-red-600 text-white px-2 py-0.5 rounded">
                      PRIORITY {sos.priority} ({sos.priorityScore}/100)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{sos.id}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{sos.category}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">{sos.location}</p>

                  <div className="mt-2 bg-red-50 p-2 rounded-lg border border-red-100 text-[11px] text-red-900 space-y-1">
                    <p className="flex items-center gap-1 font-semibold">
                      <Users className="w-3.5 h-3.5 text-red-600" /> {sos.peopleCount} Stranded Persons
                    </p>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{sos.description}</p>
                    <p className="text-[10px] font-bold text-brand-700 mt-1">
                      Assigned: {sos.assignedTeam || 'Pending Team Dispatch'}
                    </p>
                  </div>

                  <div className="mt-2 flex gap-2">
                    <Link
                      to={`/rescue/assignments`}
                      className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-[11px] hover:bg-red-700"
                    >
                      Field Rescue Details &rarr;
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Citizen Hazard Reports */}
        {layers.reports &&
          reports.map((rep) => (
            <Marker key={rep.id} position={[rep.lat, rep.lng]} icon={reportIcon}>
              <Popup>
                <div className="p-2 text-xs font-sans max-w-[240px]">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    HAZARD REPORT ({rep.status})
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs mt-1">{rep.category}</h4>
                  <p className="text-slate-500 text-[10px]">{rep.location}</p>
                  <p className="text-slate-700 text-[11px] mt-1 italic">"{rep.description}"</p>
                  <div className="mt-1.5 text-[10px] text-slate-500 flex justify-between">
                    <span>Depth: <strong>{rep.waterDepth}</strong></span>
                    <span>AI Conf: <strong>{rep.aiConfidence}%</strong></span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Rescue Boats */}
        {layers.rescue &&
          rescueTeams.map((team) => (
            <Marker key={team.id} position={[team.lat, team.lng]} icon={rescueIcon}>
              <Popup>
                <div className="p-3 text-xs font-sans max-w-[240px]">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    RESCUE SQUAD ({team.status})
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{team.name}</h4>
                  <p className="text-slate-500 text-[11px]">Cmdr: {team.commander}</p>
                  <p className="text-slate-700 text-[11px] mt-1">Craft: {team.unitType}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Safe Route Polyline Overlay */}
        {routeWaypoints && routeWaypoints.length > 1 && (
          <Polyline
            positions={routeWaypoints}
            pathOptions={{
              color: '#0284C7',
              weight: 5,
              opacity: 0.9,
              dashArray: '8, 8',
              lineCap: 'round',
            }}
          />
        )}
      </MapContainer>

      {/* Floating Controls Overlay */}
      {showControls && (
        <div className="absolute top-4 right-4 z-[1000] w-64 sm:w-72 space-y-2 pointer-events-auto">
          <MapControls
            layers={layers}
            setLayers={setLayers}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            onLocateUser={handleLocateMe}
          />
        </div>
      )}

      {/* Floating Legend Overlay */}
      {showControls && (
        <div className="hidden md:block absolute bottom-6 left-4 z-[1000] max-w-xs pointer-events-auto">
          <MapLegend />
        </div>
      )}
    </div>
  )
}
