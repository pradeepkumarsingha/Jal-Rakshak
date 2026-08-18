import api from './api'
import { INITIAL_EMERGENCIES } from '../utils/mockData'

export const emergencyApi = {
  createEmergencyRequest: async (data) => {
    try {
      const res = await api.post('/api/v1/emergency/request', data)
      return res.data
    } catch {
      return {
        id: `SOS-${Math.floor(8800 + Math.random() * 1000)}`,
        status: 'PENDING_ASSIGNMENT',
        priority: data.priority || 'CRITICAL',
        priorityScore: data.priorityScore || 95,
        timestamp: new Date().toISOString(),
        assignedTeam: null,
        etaMinutes: null,
        ...data,
      }
    }
  },

  getAllRequests: async () => {
    try {
      const res = await api.get('/api/v1/emergency/requests')
      return res.data
    } catch {
      return INITIAL_EMERGENCIES
    }
  },

  assignTeam: async (requestId, teamId) => {
    try {
      const res = await api.post(`/api/v1/emergency/${requestId}/assign`, { teamId })
      return res.data
    } catch {
      return { success: true, requestId, teamId, status: 'DISPATCHED' }
    }
  },
}
