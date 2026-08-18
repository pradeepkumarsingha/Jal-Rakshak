import api from './api'
import { INITIAL_RIVERS, INITIAL_FORECAST_TIMELINE } from '../utils/mockData'

export const floodApi = {
  getRiskPrediction: async (location = 'Cuttack') => {
    try {
      const res = await api.get(`/api/v1/flood/risk/${encodeURIComponent(location)}`)
      return res.data
    } catch {
      return {
        location,
        riskScore: 88,
        riskLevel: 'CRITICAL',
        predictedInundationDepth: '1.45 meters',
        rainfallForecastMm: 45.2,
        soilSaturationPct: 92,
        damDischargeRateCusecs: '11.45 Lakh',
        factors: [
          { name: 'Upstream Inflow (Hirakud Reservoir)', value: 'Heavy (+14%)', impact: 'HIGH' },
          { name: 'Catchment Saturation', value: '92% Saturated', impact: 'HIGH' },
          { name: 'High Tide Backflow Surge', value: '+0.8m Backwater', impact: 'MEDIUM' },
          { name: 'Drainage Channel Siltation', value: '45% Choked', impact: 'MEDIUM' },
        ],
        lastUpdated: new Date().toISOString(),
      }
    }
  },

  getForecast: async () => {
    try {
      const res = await api.get('/api/v1/flood/forecast')
      return res.data
    } catch {
      return INITIAL_FORECAST_TIMELINE
    }
  },

  getRiversTelemetry: async () => {
    try {
      // Query Open-Meteo Global Flood API for coordinates matching the 5 major gauge locations:
      // 1. Mahanadi (Cuttack): 20.4782, 85.8621
      // 2. Brahmani (Jenapur): 20.85, 86.20
      // 3. Baitarani (Akhuapada): 20.70, 86.50
      // 4. Ganga (Patna): 25.61, 85.12
      // 5. Yamuna (Delhi): 28.66, 77.30
      const url = 'https://flood-api.open-meteo.com/v1/flood?latitude=20.4782,20.85,20.70,25.61,28.66&longitude=85.8621,86.20,86.50,85.12,77.30&daily=river_discharge&forecast_days=1'
      const response = await fetch(url)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        return INITIAL_RIVERS.map((river, idx) => {
          const apiData = data[idx]
          if (!apiData || !apiData.daily || !apiData.daily.river_discharge) return river
          
          const discharge = apiData.daily.river_discharge[0] || 0 // Current day discharge in m3/s
          
          // Map discharge volume to gauge height relative to CWC warning and danger markers
          let calculatedLevel = river.currentLevel
          if (river.id === 'mahanadi-naraj') {
            calculatedLevel = Number((river.warningLevel - 1.0 + (discharge / 15000) * 2.5).toFixed(2))
          } else if (river.id === 'brahmani-jenapur') {
            calculatedLevel = Number((river.warningLevel - 1.5 + (discharge / 6000) * 3.0).toFixed(2))
          } else if (river.id === 'baitarani-akhua') {
            calculatedLevel = Number((river.warningLevel - 1.0 + (discharge / 8000) * 2.0).toFixed(2))
          } else if (river.id === 'ganga-patna') {
            calculatedLevel = Number((river.warningLevel - 1.5 + (discharge / 30000) * 3.5).toFixed(2))
          } else if (river.id === 'yamuna-delhi') {
            calculatedLevel = Number((river.warningLevel - 1.5 + (discharge / 200) * 3.0).toFixed(2))
          }

          // Determine critical severity thresholds
          const isDanger = calculatedLevel >= river.dangerLevel
          const isWarning = calculatedLevel >= river.warningLevel
          const status = isDanger ? 'CRITICAL' : isWarning ? 'HIGH' : 'LOW'
          
          // Convert m3/s to Lakh Cusecs (1 m3/s = 35.3147 cusecs)
          const lakhCusecs = ((discharge * 35.3147) / 100000).toFixed(2)
          const outflowLakh = (lakhCusecs * 0.98).toFixed(2)

          return {
            ...river,
            currentLevel: calculatedLevel,
            status,
            inflow: `${lakhCusecs} Lakh Cusecs`,
            outflow: `${outflowLakh} Lakh Cusecs`,
          }
        })
      }
      return INITIAL_RIVERS
    } catch (err) {
      console.warn('Failed to fetch real-time river telemetry from Open-Meteo:', err)
      return INITIAL_RIVERS
    }
  },
}
