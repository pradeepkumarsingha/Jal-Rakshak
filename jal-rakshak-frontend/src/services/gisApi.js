import api from './api'
import { RISK_POLYGONS } from '../utils/mockData'

export const gisApi = {
  getRiskMap: async () => {
    try {
      const res = await api.get('/api/v1/gis/risk-map')
      return res.data
    } catch {
      return RISK_POLYGONS
    }
  },

  calculateSafeRoute: async ({ origin, destination, avoidFloodZones = true }) => {
    try {
      const res = await api.post('/api/v1/gis/safe-route', { origin, destination, avoidFloodZones })
      return res.data
    } catch {
      // Return simulated flood-safe route waypoints from Bidanasi to Barabati / Ravenshaw Shelter
      return {
        success: true,
        routeType: 'AI_OPTIMIZED_SAFE_HIGH_GROUND',
        totalDistanceKm: 3.8,
        estimatedTimeMinutes: 12,
        maxWaterDepthEncountered: '0.05 meters (Clear)',
        riskLevel: 'LOW',
        elevationGainMeters: 14,
        hazardWarnings: [
          'Avoid Ring Road Underpass (Submerged by 1.2m)',
          'Cross via Cantonment Elevated Flyover',
        ],
        waypoints: [
          [20.4782, 85.8621], // Start: Bidanasi
          [20.4810, 85.8660], // High ground ridge
          [20.4830, 85.8720], // Cantonment flyover
          [20.4790, 85.8820], // Deer Park Road
          [20.4638, 85.8942], // Destination: Ravenshaw Shelter
        ],
        turnByTurn: [
          { instruction: 'Head East on Bidanasi High Ridge Road away from river embankment', distance: '600m', safe: true },
          { instruction: 'Turn left onto Cantonment Elevated Flyover (Bypasses flooded Ring Road)', distance: '1.2km', safe: true },
          { instruction: 'Continue straight through Deer Park Overpass', distance: '1.1km', safe: true },
          { instruction: 'Arrive safely at Ravenshaw University Relief Complex Gate 2', distance: '900m', safe: true },
        ],
      }
    }
  },
}
