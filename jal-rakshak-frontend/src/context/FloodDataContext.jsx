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
  const [scenario, setScenario] = useState('FLASH_FLOOD_RED_ALERT') // 'NORMAL' | 'MONSOON_WARNING' | 'FLASH_FLOOD_RED_ALERT'
  const [riskScore, setRiskScore] = useState(88) // 0 - 100
  const [rivers, setRivers] = useState(INITIAL_RIVERS)
  const [forecastTimeline, setForecastTimeline] = useState(INITIAL_FORECAST_TIMELINE)
  const [shelters, setShelters] = useState(INITIAL_SHELTERS)
  const [reports, setReports] = useState(INITIAL_REPORTS)
  const [emergencies, setEmergencies] = useState(INITIAL_EMERGENCIES)
  const [rescueTeams, setRescueTeams] = useState(INITIAL_RESCUE_TEAMS)
  const [riskZones] = useState(RISK_POLYGONS)

  // Fetch real-time river telemetry helper
  const fetchLiveRivers = useCallback(async () => {
    try {
      const liveRivers = await floodApi.getRiversTelemetry()
      setRivers(liveRivers)
    } catch (err) {
      console.warn('Error loading live rivers telemetry:', err)
    }
  }, [])

  // Fetch real-time river telemetry on mount
  useEffect(() => {
    fetchLiveRivers()
    const interval = setInterval(fetchLiveRivers, 5 * 60 * 1000) // refresh every 5 min

    return () => {
      clearInterval(interval)
    }
  }, [fetchLiveRivers])

  // Simulation scenario switcher
  const changeScenario = useCallback((newScenario) => {
    setScenario(newScenario)
    if (newScenario === 'NORMAL') {
      setRiskScore(14)
      setRivers((prev) =>
        prev.map((r) => ({
          ...r,
          currentLevel: Number((r.warningLevel - 1.8).toFixed(2)),
          status: 'LOW',
          trend: 'STABLE',
          inflow: '0.02 Lakh Cusecs',
          outflow: '0.01 Lakh Cusecs',
          gatesOpen: '0 / 64 Gates',
        }))
      )
      setForecastTimeline([
        { time: 'Now', timeLabel: 'Current', rainMm: 2, waterLevel: 23.4, riskScore: 12, status: 'LOW' },
        { time: '+3h', timeLabel: '21:00', rainMm: 0, waterLevel: 23.3, riskScore: 10, status: 'LOW' },
        { time: '+6h', timeLabel: '00:00', rainMm: 0, waterLevel: 23.2, riskScore: 10, status: 'LOW' },
        { time: '+12h', timeLabel: '06:00', rainMm: 4, waterLevel: 23.3, riskScore: 15, status: 'LOW' },
        { time: '+18h', timeLabel: '12:00', rainMm: 6, waterLevel: 23.5, riskScore: 18, status: 'LOW' },
        { time: '+24h', timeLabel: '18:00', rainMm: 2, waterLevel: 23.4, riskScore: 14, status: 'LOW' },
      ])
    } else if (newScenario === 'MONSOON_WARNING') {
      setRiskScore(58)
      setRivers((prev) =>
        prev.map((r) => ({
          ...r,
          currentLevel: Number((r.warningLevel + 0.15).toFixed(2)),
          status: 'MEDIUM',
          trend: 'RISING',
          inflow: '1.45 Lakh Cusecs',
          outflow: '1.40 Lakh Cusecs',
          gatesOpen: '12 / 64 Gates',
        }))
      )
      setForecastTimeline([
        { time: 'Now', timeLabel: 'Current', rainMm: 18, waterLevel: 25.5, riskScore: 56, status: 'MEDIUM' },
        { time: '+3h', timeLabel: '21:00', rainMm: 24, waterLevel: 25.8, riskScore: 62, status: 'HIGH' },
        { time: '+6h', timeLabel: '00:00', rainMm: 30, waterLevel: 26.1, riskScore: 68, status: 'HIGH' },
        { time: '+12h', timeLabel: '06:00', rainMm: 20, waterLevel: 25.9, riskScore: 60, status: 'MEDIUM' },
        { time: '+18h', timeLabel: '12:00', rainMm: 12, waterLevel: 25.4, riskScore: 50, status: 'MEDIUM' },
        { time: '+24h', timeLabel: '18:00', rainMm: 8, waterLevel: 24.8, riskScore: 35, status: 'MODERATE' },
      ])
    } else {
      // FLASH_FLOOD_RED_ALERT
      setRiskScore(88)
      fetchLiveRivers()
      setForecastTimeline(INITIAL_FORECAST_TIMELINE)
    }
  }, [fetchLiveRivers])

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

  const isLive = scenario === 'FLASH_FLOOD_RED_ALERT'

  return (
    <FloodDataContext.Provider
      value={{
        scenario,
        isLive,
        changeScenario,
        riskScore,
        setRiskScore,
        rivers,
        forecastTimeline,
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
