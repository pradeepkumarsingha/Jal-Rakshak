import React, { useMemo } from 'react'
import {
  Navigation,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Compass,
  Radio,
  Footprints,
} from 'lucide-react'

// Haversine distance calculator
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 2.4
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(1))
}

export default function RouteDisplay({ activeMission = null, teamInfo = null }) {
  const missionDetails = useMemo(() => {
    if (!activeMission) return null

    const emergency = activeMission.emergency || activeMission

    // Squad Coordinates (Origin)
    let originLat = 20.4782
    let originLng = 85.8621
    if (teamInfo?.currentLocation?.coordinates) {
      originLng = teamInfo.currentLocation.coordinates[0] || 85.8621
      originLat = teamInfo.currentLocation.coordinates[1] || 20.4782
    }

    // Victim / Target Coordinates (Destination)
    let destLat = 20.4850
    let destLng = 85.8420
    if (emergency?.location?.coordinates) {
      destLng = emergency.location.coordinates[0]
      destLat = emergency.location.coordinates[1]
    } else if (emergency?.location?.latitude || emergency?.lat) {
      destLat = emergency.location?.latitude || emergency.lat
      destLng = emergency.location?.longitude || emergency.lng
    }

    const distanceKm = calculateDistanceKm(originLat, originLng, destLat, destLng)
    // Flood tactical ETA (boat/vehicle ~ 15-20 km/h in water terrain)
    const etaMinutes = activeMission.estimatedEtaMinutes || Math.max(4, Math.round((distanceKm / 18) * 60))

    const targetAddress =
      emergency?.address ||
      emergency?.location?.address ||
      (typeof emergency?.location === 'string' ? emergency.location : 'Hazard Extraction Point')

    const waterSeverity = (emergency?.waterSeverity || 'HIGH').toUpperCase()
    const roadAccess = (emergency?.roadAccess || 'BLOCKED').toUpperCase()
    const totalPeople = emergency?.totalPeople || emergency?.peopleCount || 1
    const craft = teamInfo?.vehicles?.[0]?.vehicleType || '40HP Inflatable Rescue Boat'

    // Dynamic Waypoints from Unit to Target
    const waypoints = [
      {
        step: 1,
        instruction: `Depart ${teamInfo?.teamName || 'Basecamp'} (${originLat.toFixed(4)}° N, ${originLng.toFixed(4)}° E)`,
        distance: `${(distanceKm * 0.15).toFixed(1)} km`,
        safe: true,
        type: 'DEPART',
      },
      {
        step: 2,
        instruction: `Deploy ${craft} via sector elevated waterway`,
        distance: `${(distanceKm * 0.45).toFixed(1)} km`,
        safe: true,
        type: 'WATERWAY',
      },
      {
        step: 3,
        instruction:
          roadAccess === 'BLOCKED'
            ? 'Hazard: Submerged roadway & debris — maintain low draft boat navigation'
            : 'Navigate approach route with radar depth sounding',
        distance: `${(distanceKm * 0.25).toFixed(1)} km`,
        safe: roadAccess !== 'BLOCKED',
        type: 'HAZARD_ZONE',
      },
      {
        step: 4,
        instruction: `Arrive at Target Site: ${targetAddress} — Extract ${totalPeople} victim${totalPeople > 1 ? 's' : ''}`,
        distance: `${(distanceKm * 0.15).toFixed(1)} km`,
        safe: true,
        type: 'EXTRACTION',
      },
    ]

    // Dynamic Sector Warnings
    const warnings = []
    if (waterSeverity === 'SEVERE' || waterSeverity === 'HIGH') {
      warnings.push(`High water velocity (${waterSeverity}) & submerged obstacles along channel`)
    }
    if (roadAccess === 'BLOCKED') {
      warnings.push('Ground roads completely submerged — amphibious / boat transit required')
    }
    if (emergency?.medicalEmergency) {
      warnings.push('🚨 Critical Medical Emergency reported on site — Trauma kit required')
    }
    if (emergency?.elderlyCount > 0 || emergency?.childrenCount > 0) {
      warnings.push(`Special care extraction: ${emergency.childrenCount || 0} children, ${emergency.elderlyCount || 0} elderly`)
    }
    if (warnings.length === 0) {
      warnings.push('Maintain VHF Ch 16 radio telemetry link with State Command')
    }

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`

    return {
      requestId: emergency?.requestId || activeMission.requestId || 'SOS-MISSION',
      status: activeMission.assignmentStatus || activeMission.status || 'ASSIGNED',
      distanceKm,
      etaMinutes,
      originLat,
      originLng,
      destLat,
      destLng,
      targetAddress,
      waypoints,
      warnings,
      mapsUrl,
      totalPeople,
    }
  }, [activeMission, teamInfo])

  if (!missionDetails) {
    return (
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 text-xs text-slate-400 text-center shadow-xl">
        <Compass className="w-10 h-10 text-emerald-400/60 mx-auto animate-pulse" />
        <div>
          <h4 className="font-extrabold text-white text-sm">Tactical GPS Route Navigation</h4>
          <p className="text-slate-500 mt-1">
            Select an assigned distress mission from the queue to plot live waypoint routing from{' '}
            <strong className="text-slate-300">{teamInfo?.teamName || 'your unit'}</strong> to the victim's GPS location.
          </p>
        </div>
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Unit Standby Location</span>
          <strong className="text-slate-300 block font-mono text-[11px]">
            {teamInfo?.district || 'Cuttack'}, Odisha Basecamp (20.4782° N, 85.8621° E)
          </strong>
        </div>
      </div>
    )
  }

  const { requestId, status, distanceKm, etaMinutes, targetAddress, waypoints, warnings, mapsUrl, totalPeople } =
    missionDetails

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 space-y-4 text-xs text-slate-300 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-bold">
            {requestId}
          </span>
          <h4 className="font-extrabold text-white text-sm mt-1 flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>Tactical Waypoint Navigation</span>
          </h4>
        </div>

        <div className="text-right">
          <span className="text-base font-extrabold text-emerald-400 font-mono block">{distanceKm} km</span>
          <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1 justify-end">
            <Clock className="w-3 h-3 text-brand-400" /> ETA ~{etaMinutes} mins
          </span>
        </div>
      </div>

      {/* Target Address Banner */}
      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-2.5">
        <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Victim Extraction Site</span>
          <strong className="text-white text-xs block leading-tight">{targetAddress}</strong>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">
            Target Headcount: <strong>{totalPeople} Individuals</strong>
          </span>
        </div>
      </div>

      {/* Warnings Banner */}
      {warnings && warnings.length > 0 && (
        <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-[11px] text-amber-300 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Route Hazard & Field Warnings:</span>
          </div>
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-1.5 pl-1">
              <span className="text-amber-400 font-bold">•</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Turn By Turn Waypoints */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
          Turn-by-Turn GPS Waypoints
        </span>
        {waypoints.map((t, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 transition hover:border-slate-700"
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              {t.step}
            </span>
            <div className="flex-1">
              <p className="text-white font-semibold text-xs leading-snug">{t.instruction}</p>
              <span className="text-[10px] text-slate-400 font-mono">{t.distance}</span>
            </div>
            {t.safe ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" title="Safe sector" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" title="Caution zone" />
            )}
          </div>
        ))}
      </div>

      {/* Action Button: Live GPS in Google Maps */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
      >
        <ExternalLink className="w-4 h-4" />
        <span>Open Live GPS in Google Maps</span>
      </a>
    </div>
  )
}
