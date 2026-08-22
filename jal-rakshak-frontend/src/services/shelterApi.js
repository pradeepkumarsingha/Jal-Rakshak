import api from './api'

export const shelterApi = {
  getAllShelters: async () => {
    const res = await api.get('/api/v1/shelters')
    return res.data?.data || res.data || []
  },

  getNearbyShelters: async (lat, lng) => {
    const res = await api.get('/api/v1/shelters/nearby', { params: { lat, lng } })
    return res.data?.data || res.data || []
  },

  updateOccupancy: async (shelterId, occupancy) => {
    const res = await api.patch(`/api/v1/shelters/${shelterId}`, { currentOccupancy: occupancy })
    return res.data
  },
}
