import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { floodApi } from '../services/floodApi'
import { emergencyApi } from '../services/emergencyApi'
import { reportApi } from '../services/reportApi'
import { shelterApi } from '../services/shelterApi'
import { getSocket } from '../services/socket'
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
  const [reports, setReports] = useState([])
  const [emergencies, setEmergencies] = useState([])
  const [rescueTeams, setRescueTeams] = useState(INITIAL_RESCUE_TEAMS)
  const [riskZones] = useState(RISK_POLYGONS)
  const [loadingData, setLoadingData] = useState(false)

  // Fetch real-time river telemetry helper
  const fetchLiveRivers = useCallback(async (isSim = false) => {
    try {
      const liveRivers = await floodApi.getRiversTelemetry({ simulationMode: isSim })
      setRivers(liveRivers)
    } catch (err) {
      console.warn('Error loading live rivers telemetry:', err)
    }
  }, [])

  // Fetch real-time MongoDB entities (Emergencies, Reports, Shelters, Teams)
  const fetchLiveDatabaseData = useCallback(async () => {
    setLoadingData(true)
    try {
      const [emRes, repRes, shRes, tmRes] = await Promise.allSettled([
        emergencyApi.getAllRequests(),
        reportApi.getAllReports(),
        shelterApi.getAllShelters(),
        emergencyApi.getAvailableRescueTeams(),
      ])

      if (emRes.status === 'fulfilled' && Array.isArray(emRes.value)) {
        setEmergencies(emRes.value)
      }
      if (repRes.status === 'fulfilled' && Array.isArray(repRes.value)) {
        setReports(repRes.value)
      }
      if (shRes.status === 'fulfilled' && Array.isArray(shRes.value) && shRes.value.length > 0) {
        setShelters(shRes.value)
      }
      if (tmRes.status === 'fulfilled' && Array.isArray(tmRes.value) && tmRes.value.length > 0) {
        setRescueTeams(tmRes.value)
      }
    } catch (err) {
      console.warn('Error loading live MongoDB entities:', err)
    } finally {
      setLoadingData(false)
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
        setEmergencies(INITIAL_EMERGENCIES)
        setReports(INITIAL_REPORTS)
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
        setEmergencies(INITIAL_EMERGENCIES)
        setReports(INITIAL_REPORTS)
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
        setEmergencies(INITIAL_EMERGENCIES)
        setReports(INITIAL_REPORTS)
      } else {
        // LIVE MODE (Default)
        setScenario('LIVE')
        setDataMode('live')
        fetchLiveRivers(false)
        fetchLiveDatabaseData()
      }
    },
    [fetchLiveRivers, fetchLiveDatabaseData]
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

  // Fetch real-time data on mount for live mode
  useEffect(() => {
    if (dataMode === 'live') {
      fetchLiveRivers(false)
      fetchLiveDatabaseData()
      const riverInterval = setInterval(() => fetchLiveRivers(false), 5 * 60 * 1000)
      const dataInterval = setInterval(() => fetchLiveDatabaseData(), 30 * 1000)
      return () => {
        clearInterval(riverInterval)
        clearInterval(dataInterval)
      }
    }
  }, [dataMode, fetchLiveRivers, fetchLiveDatabaseData])

  // Real-time Socket.IO synchronization for Live SOS and Citizen Reports
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleNewEmergency = (newSos) => {
      setEmergencies((prev) => {
        const id = newSos._id || newSos.id || newSos.emergencyId
        const filtered = prev.filter((e) => String(e._id || e.id) !== String(id))
        return [newSos, ...filtered]
      })
    }

    const handleEmergencyUpdated = (updated) => {
      setEmergencies((prev) =>
        prev.map((e) => {
          const id = updated._id || updated.id || updated.emergencyId
          return String(e._id || e.id) === String(id) ? { ...e, ...updated } : e
        })
      )
    }

    const handleNewReport = (newReport) => {
      setReports((prev) => {
        const id = newReport.reportId || newReport._id || newReport.id
        const filtered = prev.filter((r) => String(r.reportId || r._id || r.id) !== String(id))
        return [newReport, ...filtered]
      })
    }

    const handleReportUpdated = (updatedReport) => {
      setReports((prev) =>
        prev.map((r) => {
          const id = updatedReport.reportId || updatedReport._id || updatedReport.id
          return String(r.reportId || r._id || r.id) === String(id)
            ? { ...r, ...updatedReport, verificationStatus: updatedReport.verificationStatus || updatedReport.status }
            : r
        })
      )
    }

    socket.on('emergency:new', handleNewEmergency)
    socket.on('emergency:assigned', handleEmergencyUpdated)
    socket.on('emergency:status-updated', handleEmergencyUpdated)
    socket.on('report:new', handleNewReport)
    socket.on('report:updated', handleReportUpdated)

    return () => {
      socket.off('emergency:new', handleNewEmergency)
      socket.off('emergency:assigned', handleEmergencyUpdated)
      socket.off('emergency:status-updated', handleEmergencyUpdated)
      socket.off('report:new', handleNewReport)
      socket.off('report:updated', handleReportUpdated)
    }
  }, [])

  // Citizen adds new crowd hazard report
  const addReport = useCallback((newReport) => {
    const reportItem = {
      id: newReport._id || `REP-${Math.floor(500 + Math.random() * 500)}`,
      reportId: newReport.reportId || newReport._id,
      timestamp: new Date().toISOString(),
      verified: false,
      verificationStatus: 'PENDING',
      aiConfidence: Math.floor(82 + Math.random() * 16),
      aiDetectedDepth: newReport.waterDepth || '0.8 meters',
      status: 'PENDING',
      ...newReport,
    }
    setReports((prev) => [reportItem, ...prev])
    return reportItem
  }, [])

  // Admin verifies or rejects citizen report
  const verifyReport = useCallback((reportId, action = 'APPROVE') => {
    setReports((prev) =>
      prev.map((r) => {
        if (String(r.id || r._id || r.reportId) === String(reportId)) {
          if (action === 'APPROVE' || action === 'VERIFY') return { ...r, verified: true, verificationStatus: 'VERIFIED', status: 'VERIFIED' }
          if (action === 'ESCALATE') return { ...r, verified: true, verificationStatus: 'ESCALATED', status: 'ESCALATED' }
          if (action === 'REJECT') return { ...r, verified: false, verificationStatus: 'REJECTED', status: 'REJECTED' }
        }
        return r
      })
    )
  }, [])

  // Citizen transmits SOS Emergency request
  const addEmergency = useCallback((newEmergency) => {
    const emergencyItem = {
      id: newEmergency._id || `SOS-${Math.floor(8800 + Math.random() * 1000)}`,
      requestId: newEmergency.requestId || newEmergency._id,
      timestamp: new Date().toISOString(),
      assignedTeam: null,
      status: 'PENDING',
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
        String(e.id || e._id || e.requestId) === String(emergencyId)
          ? { ...e, assignedTeam: teamName, status: 'DISPATCHED', etaMinutes: Math.floor(10 + Math.random() * 20) }
          : e
      )
    )
  }, [])

  // Rescue updates emergency mission status
  const updateEmergencyStatus = useCallback((emergencyId, nextStatus) => {
    setEmergencies((prev) =>
      prev.map((e) => (String(e.id || e._id || e.requestId) === String(emergencyId) ? { ...e, status: nextStatus } : e))
    )
  }, [])

  // Shelter manager updates shelter occupancy
  const updateShelterOccupancy = useCallback((shelterId, newOccupancy) => {
    setShelters((prev) =>
      prev.map((s) => {
        if (String(s.id || s._id || s.shelterId) === String(shelterId)) {
          const occ = Math.max(0, Number(newOccupancy))
          const cap = Number(s.totalCapacity || s.capacity || 1000)
          return {
            ...s,
            currentOccupancy: occ,
            status: occ >= cap ? 'FULL' : occ >= cap * 0.9 ? 'NEAR_FULL' : 'ACTIVE',
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
        setShelters,
        reports,
        setReports,
        emergencies,
        setEmergencies,
        rescueTeams,
        setRescueTeams,
        riskZones,
        loadingData,
        fetchLiveDatabaseData,
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

export default FloodDataContext
