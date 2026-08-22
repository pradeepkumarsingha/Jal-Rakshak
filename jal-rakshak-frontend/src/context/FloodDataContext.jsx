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
  const [shelters, setShelters] = useState([])
  const [reports, setReports] = useState([])
  const [emergencies, setEmergencies] = useState([])
  const [rescueTeams, setRescueTeams] = useState([])
  const [riskZones] = useState(RISK_POLYGONS)
  const [loadingData, setLoadingData] = useState(false)

  // Fetch real-time river telemetry helper
  const fetchLiveRivers = useCallback(async (isSim = false) => {
    try {
      const liveRivers = await floodApi.getRiversTelemetry({ simulationMode: false })
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
      if (shRes.status === 'fulfilled' && Array.isArray(shRes.value)) {
        setShelters(shRes.value)
      }
      if (tmRes.status === 'fulfilled' && Array.isArray(tmRes.value)) {
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
      // Force live database telemetry only
      setDataMode('live')
      setScenario('LIVE')
      fetchLiveRivers(false)
      fetchLiveDatabaseData()
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
