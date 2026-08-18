import React, { createContext, useContext, useState, useCallback } from 'react'

const AlertContext = createContext(null)

export function useAlert() {
  const ctx = useContext(AlertContext)
  if (!ctx) throw new Error('useAlert must be used within AlertProvider')
  return ctx
}

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([
    {
      id: 'ALT-101',
      severity: 'CRITICAL',
      title: 'RED ALERT: Mahanadi River Inundation Warning',
      message: 'Mahanadi water level at Naraj barrage has crossed 26.85m (0.44m above Danger Mark). Immediate evacuation advised for low-lying wards of Cuttack (Bidanasi, CDA Sector 1-6). 28 Sluice gates open.',
      location: 'Cuttack & Kendrapara Districts',
      timestamp: new Date().toISOString(),
      dismissible: true,
      active: true,
      audioAlert: true,
    },
    {
      id: 'ALT-102',
      severity: 'HIGH',
      title: 'ORANGE WARNING: Flash Flood Surge Forecast',
      message: 'Heavy cloudburst in upper catchment of Hirakud Reservoir. 8 Lakh Cusecs discharge expected in next 6 hours.',
      location: 'Banki, Athagarh & Cuttack Outer',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      dismissible: true,
      active: true,
      audioAlert: false,
    }
  ])

  const [toasts, setToasts] = useState([])
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Play synthetic browser audio alert (no mp3 needed)
  const playAlertChime = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(880, audioCtx.currentTime) // A5
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.4)
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.5)
    } catch {
      // ignore audio context restrictions
    }
  }, [])

  const addAlert = useCallback((newAlert) => {
    const alertItem = {
      id: `ALT-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      active: true,
      dismissible: true,
      ...newAlert,
    }
    setAlerts((prev) => [alertItem, ...prev])
    if (alertItem.severity === 'CRITICAL' && soundEnabled) {
      playAlertChime()
    }
    showToast({
      title: alertItem.title,
      message: alertItem.message,
      type: alertItem.severity === 'CRITICAL' ? 'error' : 'warning',
    })
  }, [playAlertChime, soundEnabled])

  const dismissAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  const showToast = useCallback(({ title, message, type = 'info' }) => {
    const toastId = `toast-${Date.now()}`
    const toast = { id: toastId, title, message, type }
    setToasts((prev) => [...prev, toast])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId))
    }, 4500)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <AlertContext.Provider
      value={{
        alerts,
        activeCriticalAlert: alerts.find((a) => a.severity === 'CRITICAL' && a.active),
        addAlert,
        dismissAlert,
        clearAlerts,
        toasts,
        showToast,
        removeToast,
        soundEnabled,
        setSoundEnabled,
        playAlertChime,
      }}
    >
      {children}
    </AlertContext.Provider>
  )
}
