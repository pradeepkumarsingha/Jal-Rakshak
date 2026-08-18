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
      const res = await api.get('/api/v1/flood/rivers')
      return res.data
    } catch {
      return INITIAL_RIVERS
    }
  },
}
