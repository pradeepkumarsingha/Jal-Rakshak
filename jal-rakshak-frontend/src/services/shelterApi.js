import api from './api'
import { INITIAL_SHELTERS } from '../utils/mockData'

export const shelterApi = {
  getAllShelters: async () => {
    try {
      const res = await api.get('/api/v1/shelters')
      return res.data
    } catch {
      return INITIAL_SHELTERS
    }
  },

  getNearbyShelters: async (lat, lng) => {
    try {
      const res = await api.get('/api/v1/shelters/nearby', { params: { lat, lng } })
      return res.data
    } catch {
      return INITIAL_SHELTERS
    }
  },

  updateOccupancy: async (shelterId, occupancy) => {
    try {
      const res = await api.patch(`/api/v1/shelters/${shelterId}`, { currentOccupancy: occupancy })
      return res.data
    } catch {
      return { success: true, shelterId, currentOccupancy: occupancy }
    }
  },
}
