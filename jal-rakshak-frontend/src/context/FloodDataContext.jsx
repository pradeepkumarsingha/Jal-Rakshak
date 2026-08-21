import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { floodApi } from '../services/floodApi'
import {
  INITIAL_RIVERS,
  INITIAL_FORECAST_TIMELINE,
  INITIAL_SHELTERS,
  INITIAL_REPORTS,
  INITIAL_EMERGENCIES,
  INITIAL_RESCUE_TEAMS,
  RISK_POLYGONS,
} from '../utils/mockData'

const FloodDataContext = createContext(null)

export function useFloodData() {
  const ctx = useContext(FloodDataContext)
  if (!ctx) throw new Error('useFloodData must be used within FloodDataProvider')
  return ctx
}

export function FloodDataProvider({ children }) {
  // dataMode: "live" | "simulation-normal" | "simulation-monsoon" | "simulation-mahanadi"
  const [dataMode, setDataMode] = useState('live')

  // Backwards compatibility alias scenario string
  const [scenario, setScenario] = useState('LIVE')
  const [riskScore, setRiskScore] = useState(null) // null in live mode until computed
  const [rivers, setRivers] = useState([])
  const [forecastTimeline, setForecastTimeline] = useState([])
  const [shelters, setShelters] = useState(INITIAL_SHELTERS)
  const [reports, setReports] = useState(INITIAL_REPORTS)
  const [emergencies, setEmergencies] = useState(INITIAL_EMERGENCIES)
  const [rescueTeams, setRescueTeams] = useState(INITIAL_RESCUE_TEAMS)
  const [riskZones] = useState(RISK_POLYGONS)

  // Fetch real-time river telemetry helper
  const fetchLiveRivers = useCallback(async (isSim = false) => {
    try {
      const liveRivers = await floodApi.getRiversTelemetry({ simulationMode: isSim })
      setRivers(liveRivers)
    } catch (err) {
      console.warn('Error loading live rivers telemetry:', err)
    }
  }, [])

  // Switch global data mode
  const changeDataMode = useCallback(
    (mode) => {
      setDataMode(mode)

      if (mode === 'simulation-normal') {
        setScenario('NORMAL')
        setRiskScore(14)
        setRivers(
          INITIAL_RIVERS.map((r) => ({
            ...r,
            currentLevel: Number((r.warningLevel - 1.8).toFixed(2)),
            status: 'LOW',
            trend: 'STABLE',
            inflow: '0.02 Lakh Cusecs',
            outflow: '0.01 Lakh Cusecs',
            gatesOpen: '0 / 64 Gates',
            source: 'simulation',
            isSimulation: true,
          }))
        )
        setForecastTimeline([
          { time: 'Now', timeLabel: 'Current', rainMm: 2, waterLevel: 23.4, riskScore: 12, status: 'LOW', isSimulation: true },
          { time: '+3h', timeLabel: '21:00', rainMm: 0, waterLevel: 23.3, riskScore: 10, status: 'LOW', isSimulation: true },
          { time: '+6h', timeLabel: '00:00', rainMm: 0, waterLevel: 23.2, riskScore: 10, status: 'LOW', isSimulation: true },
          { time: '+12h', timeLabel: '06:00', rainMm: 4, waterLevel: 23.3, riskScore: 15, status: 'LOW', isSimulation: true },
          { time: '+18h', timeLabel: '12:00', rainMm: 6, waterLevel: 23.5, riskScore: 18, status: 'LOW', isSimulation: true },
          { time: '+24h', timeLabel: '18:00', rainMm: 2, waterLevel: 23.4, riskScore: 14, status: 'LOW', isSimulation: true },
        ])
      } else if (mode === 'simulation-monsoon') {
        setScenario('MONSOON_WARNING')
        setRiskScore(58)
        setRivers(
          INITIAL_RIVERS.map((r) => ({
            ...r,
            currentLevel: Number((r.warningLevel + 0.15).toFixed(2)),
            status: 'MEDIUM',
            trend: 'RISING',
            inflow: '1.45 Lakh Cusecs',
            outflow: '1.40 Lakh Cusecs',
            gatesOpen: '12 / 64 Gates',
            source: 'simulation',
            isSimulation: true,
          }))
        )
        setForecastTimeline([
          { time: 'Now', timeLabel: 'Current', rainMm: 18, waterLevel: 25.5, riskScore: 56, status: 'MEDIUM', isSimulation: true },
          { time: '+3h', timeLabel: '21:00', rainMm: 24, waterLevel: 25.8, riskScore: 62, status: 'HIGH', isSimulation: true },
          { time: '+6h', timeLabel: '00:00', rainMm: 30, waterLevel: 26.1, riskScore: 68, status: 'HIGH', isSimulation: true },
          { time: '+12h', timeLabel: '06:00', rainMm: 20, waterLevel: 25.9, riskScore: 60, status: 'MEDIUM', isSimulation: true },
          { time: '+18h', timeLabel: '12:00', rainMm: 12, waterLevel: 25.4, riskScore: 50, status: 'MEDIUM', isSimulation: true },
          { time: '+24h', timeLabel: '18:00', rainMm: 8, waterLevel: 24.8, riskScore: 35, status: 'MODERATE', isSimulation: true },
        ])
      } else if (mode === 'simulation-mahanadi') {
        setScenario('FLASH_FLOOD_RED_ALERT')
        setRiskScore(88)
        setRivers(
          INITIAL_RIVERS.map((r) => ({
            ...r,
            source: 'simulation',
            isSimulation: true,
          }))
        )
        setForecastTimeline(
          INITIAL_FORECAST_TIMELINE.map((item) => ({
            ...item,
            source: 'simulation',
            isSimulation: true,
          }))
        )
      } else {
        // LIVE MODE (Default)
        setScenario('LIVE')
        setDataMode('live')
        fetchLiveRivers(false)
      }
    },
    [fetchLiveRivers]
  )

  // Legacy changeScenario adapter
  const changeScenario = useCallback(
    (newScenario) => {
      if (newScenario === 'NORMAL') {
        changeDataMode('simulation-normal')
      } else if (newScenario === 'MONSOON_WARNING') {
        changeDataMode('simulation-monsoon')
      } else if (newScenario === 'FLASH_FLOOD_RED_ALERT') {
        changeDataMode('simulation-mahanadi')
      } else {
        changeDataMode('live')
      }
    },
    [changeDataMode]
  )

  // Fetch real-time river telemetry on mount for live mode
  useEffect(() => {
    if (dataMode === 'live') {
      fetchLiveRivers(false)
      const interval = setInterval(() => fetchLiveRivers(false), 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [dataMode, fetchLiveRivers])

  // Citizen adds new crowd hazard report
  const addReport = useCallback((newReport) => {
    const reportItem = {
      id: `REP-${Math.floor(500 + Math.random() * 500)}`,
      timestamp: new Date().toISOString(),
      verified: false,
      aiConfidence: Math.floor(82 + Math.random() * 16),
      aiDetectedDepth: newReport.waterDepth || '0.8 meters',
      status: 'PENDING_REVIEW',
      ...newReport,
    }
    setReports((prev) => [reportItem, ...prev])
    return reportItem
  }, [])

  // Admin verifies or rejects citizen report
  const verifyReport = useCallback((reportId, action = 'APPROVE') => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          if (action === 'APPROVE') return { ...r, verified: true, status: 'VERIFIED' }
          if (action === 'ESCALATE') return { ...r, verified: true, status: 'ESCALATED_TO_RESCUE' }
          if (action === 'REJECT') return { ...r, verified: false, status: 'REJECTED' }
        }
        return r
      })
    )
  }, [])

  // Citizen transmits SOS Emergency request
  const addEmergency = useCallback((newEmergency) => {
    const emergencyItem = {
      id: `SOS-${Math.floor(8800 + Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      assignedTeam: null,
      status: 'PENDING_ASSIGNMENT',
      etaMinutes: null,
      ...newEmergency,
    }
    setEmergencies((prev) => [emergencyItem, ...prev])
    return emergencyItem
  }, [])

  // Admin assigns rescue team to emergency request
  const assignEmergency = useCallback((emergencyId, teamName) => {
    setEmergencies((prev) =>
      prev.map((e) =>
        e.id === emergencyId
          ? { ...e, assignedTeam: teamName, status: 'DISPATCHED', etaMinutes: Math.floor(10 + Math.random() * 20) }
          : e
      )
    )
  }, [])

  // Rescue updates emergency mission status (DISPATCHED -> ON_SCENE -> RESCUED -> CLOSED)
  const updateEmergencyStatus = useCallback((emergencyId, nextStatus) => {
    setEmergencies((prev) =>
      prev.map((e) => (e.id === emergencyId ? { ...e, status: nextStatus } : e))
    )
  }, [])

  // Admin or Shelter manager updates shelter occupancy
  const updateShelterOccupancy = useCallback((shelterId, newOccupancy) => {
    setShelters((prev) =>
      prev.map((s) => {
        if (s.id === shelterId) {
          const occ = Math.max(0, Number(newOccupancy))
          return {
            ...s,
            currentOccupancy: occ,
            status: occ >= s.capacity ? 'FULL' : occ >= s.capacity * 0.9 ? 'NEAR_FULL' : 'ACTIVE',
          }
        }
        return s
      })
    )
  }, [])

  const isLive = dataMode === 'live'

  return (
    <FloodDataContext.Provider
      value={{
        dataMode,
        setDataMode,
        changeDataMode,
        scenario,
        isLive,
        changeScenario,
        riskScore,
        setRiskScore,
        rivers,
        setRivers,
        forecastTimeline,
        setForecastTimeline,
        shelters,
        reports,
        emergencies,
        rescueTeams,
        riskZones,
        addReport,
        verifyReport,
        addEmergency,
        assignEmergency,
        updateEmergencyStatus,
        updateShelterOccupancy,
      }}
    >
      {children}
    </FloodDataContext.Provider>
  )
}
