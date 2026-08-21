import api from './api'
import { INITIAL_RIVERS, INITIAL_FORECAST_TIMELINE } from '../utils/mockData'

/**
 * Validate latitude and longitude values
 */
function validateCoordinates(lat, lng) {
  const latitude = Number(lat)
  const longitude = Number(lng)

  if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
    throw new Error(`Invalid latitude: ${lat}. Latitude must be between -90 and 90.`)
  }
  if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
    throw new Error(`Invalid longitude: ${lng}. Longitude must be between -180 and 180.`)
  }

  return { latitude, longitude }
}

export const floodApi = {
  /**
   * Fetch AI flood risk prediction for specific coordinates
   */
  getRiskPrediction: async ({
    latitude,
    longitude,
    locationName = 'Current location',
    simulationMode = false,
  } = {}) => {
    // Return explicit simulation data only when simulationMode is explicitly enabled
    if (simulationMode) {
      return {
        location: {
          name: locationName || 'Mahanadi Basin (Simulation)',
          latitude: latitude || 20.4625,
          longitude: longitude || 85.8830,
        },
        riskScore: 88,
        riskLevel: 'CRITICAL',
        predictedInundationDepth: '1.45 meters',
        rainfallForecastMm: 45.2,
        soilSaturationPct: 92,
        damDischargeRateCusecs: '11.45 Lakh',
        factors: [
          { name: 'Upstream Inflow (Hirakud Reservoir Simulation)', value: 'Heavy (+14%)', impact: 'HIGH' },
          { name: 'Catchment Saturation', value: '92% Saturated', impact: 'HIGH' },
          { name: 'High Tide Backflow Surge', value: '+0.8m Backwater', impact: 'MEDIUM' },
          { name: 'Drainage Channel Siltation', value: '45% Choked', impact: 'MEDIUM' },
        ],
        source: 'simulation',
        isSimulation: true,
        lastUpdated: new Date().toISOString(),
      }
    }

    // Validate coordinates for live prediction
    let coords
    try {
      coords = validateCoordinates(latitude, longitude)
    } catch (validationErr) {
      console.warn('Coordinate validation error for flood risk prediction:', validationErr.message)
      return {
        location: {
          name: locationName || 'Current location',
          latitude,
          longitude,
        },
        riskScore: null,
        riskLevel: 'UNKNOWN',
        factors: [],
        source: 'unavailable',
        isSimulation: false,
        message: validationErr.message,
      }
    }

    try {
      const response = await api.post('/api/v1/flood/predict', {
        latitude: coords.latitude,
        longitude: coords.longitude,
        locationName: locationName || 'Current location',
        simulationMode: false,
      })

      const data = response.data?.data || response.data
      return {
        ...data,
        source: data.source || 'live',
        isSimulation: false,
      }
    } catch (err) {
      console.warn('Live flood risk API error:', err.message)
      return {
        location: {
          name: locationName || 'Current location',
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        riskScore: null,
        riskLevel: 'UNKNOWN',
        factors: [],
        source: 'unavailable',
        isSimulation: false,
        message: 'Live flood prediction is currently unavailable for this location. Please follow official local advisories.',
      }
    }
  },

  /**
   * Fetch 24-hour predictive hydrograph forecast for specific coordinates
   */
  getForecast: async ({
    latitude,
    longitude,
    hours = 24,
    simulationMode = false,
  } = {}) => {
    if (simulationMode) {
      return INITIAL_FORECAST_TIMELINE.map((item) => ({
        ...item,
        source: 'simulation',
        isSimulation: true,
      }))
    }

    try {
      const coords = validateCoordinates(latitude, longitude)
      const params = new URLSearchParams({
        latitude: String(coords.latitude),
        longitude: String(coords.longitude),
        hours: String(hours),
        simulationMode: 'false',
      })

      const res = await api.get(`/api/v1/flood/forecast?${params.toString()}`)
      const forecast = res.data?.data || res.data
      return Array.isArray(forecast) ? forecast : []
    } catch (err) {
      console.warn('Live forecast API unavailable for coordinates:', err.message)
      return []
    }
  },

  /**
   * Fetch Unified Location Dashboard Data from Express backend
   */
  getLocationDashboard: async ({ latitude, longitude } = {}) => {
    try {
      const coords = validateCoordinates(latitude, longitude)
      const res = await api.get(
        `/api/v1/dashboard/location?latitude=${coords.latitude}&longitude=${coords.longitude}`
      )
      return res.data?.data || res.data
    } catch (err) {
      console.warn('Failed to load backend unified location dashboard:', err.message)
      return null
    }
  },

  /**
   * Fetch Regional River Catchment Telemetry & Open-Meteo Discharge Forecast
   */
  getRiversTelemetry: async ({ simulationMode = false } = {}) => {
    const displayNote =
      'Forecast river discharge only. Official gauge height and danger status require authorized government gauge data.'

    try {
      // Query Open-Meteo Global Flood API for 5 major regional river gauge reference coordinates
      const url =
        'https://flood-api.open-meteo.com/v1/flood?latitude=20.4782,20.85,20.70,25.61,28.66&longitude=85.8621,86.20,86.50,85.12,77.30&daily=river_discharge&forecast_days=1'
      const response = await fetch(url)
      const data = await response.json()

      if (Array.isArray(data)) {
        return INITIAL_RIVERS.map((river, idx) => {
          const apiData = data[idx]
          const dischargeM3PerSecond =
            apiData?.daily?.river_discharge && apiData.daily.river_discharge[0] !== undefined
              ? Number(apiData.daily.river_discharge[0])
              : null

          // Convert m3/s to Lakh Cusecs (1 m3/s = 35.3147 cusecs)
          const dischargeLakhCusecs =
            dischargeM3PerSecond !== null
              ? Number(((dischargeM3PerSecond * 35.3147) / 100000).toFixed(2))
              : null

          return {
            ...river,
            dischargeM3PerSecond,
            dischargeLakhCusecs,
            source: 'open-meteo-glofas',
            isSimulation: false,
            displayNote,
            inflow:
              dischargeLakhCusecs !== null
                ? `${dischargeLakhCusecs} Lakh Cusecs`
                : river.inflow,
            outflow:
              dischargeLakhCusecs !== null
                ? `${(dischargeLakhCusecs * 0.98).toFixed(2)} Lakh Cusecs`
                : river.outflow,
          }
        })
      }

      if (simulationMode) {
        return INITIAL_RIVERS.map((r) => ({
          ...r,
          source: 'simulation',
          isSimulation: true,
          displayNote,
        }))
      }

      return []
    } catch (err) {
      console.warn('Failed to fetch real-time river telemetry from Open-Meteo:', err)
      if (simulationMode) {
        return INITIAL_RIVERS.map((r) => ({
          ...r,
          source: 'simulation',
          isSimulation: true,
          displayNote,
        }))
      }
      return []
    }
  },
}

export default floodApi
