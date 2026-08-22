import api from './api'

export const emergencyApi = {
  createEmergencyRequest: async (data) => {
    try {
      const res = await api.post('/api/v1/emergency/request', data)
      return res.data
    } catch (err) {
      console.error('Create emergency error:', err.response?.data || err.message)
      throw err
    }
  },

  getMyEmergencies: async () => {
    try {
      const res = await api.get('/api/v1/emergency/my')
      return res.data?.data || res.data || []
    } catch (err) {
      console.warn('Failed to fetch my emergencies:', err.message)
      return []
    }
  },

  getAllRequests: async (params = {}) => {
    const res = await api.get('/api/v1/emergency/requests', { params })
    return res.data?.data || res.data || []
  },

  getRequestById: async (id) => {
    const res = await api.get(`/api/v1/emergency/${id}`)
    return res.data?.data || res.data
  },

  getAvailableRescueTeams: async (params = {}) => {
    const res = await api.get('/api/v1/rescue/teams', { params })
    return res.data?.data || res.data || []
  },

  assignTeam: async (emergencyId, { rescueTeamId, estimatedEtaMinutes, note }) => {
    try {
      const res = await api.post(`/api/v1/emergency/${emergencyId}/assign`, {
        rescueTeamId,
        estimatedEtaMinutes,
        note,
      })
      return res.data
    } catch (err) {
      console.error(`Assign team error for ${emergencyId}:`, err.response?.data || err.message)
      throw err
    }
  },

  getRescueAssignments: async () => {
    try {
      const res = await api.get('/api/v1/rescue/assignments')
      return res.data?.data || res.data || []
    } catch (err) {
      console.warn('Failed to fetch assignments:', err.message)
      return []
    }
  },

  updateAssignmentStatus: async (assignmentId, { status, note, etaMinutes }) => {
    try {
      const res = await api.patch(`/api/v1/rescue/assignments/${assignmentId}/status`, {
        status,
        note,
        etaMinutes,
      })
      return res.data
    } catch (err) {
      console.error(`Update status failed for assignment ${assignmentId}:`, err.response?.data || err.message)
      throw err
    }
  },

  getMyTeam: async () => {
    try {
      const res = await api.get('/api/v1/rescue/my-team')
      return res.data?.data || res.data
    } catch (err) {
      console.warn('Failed to fetch my team:', err.message)
      return null
    }
  },

  switchMyTeam: async (teamId) => {
    try {
      const res = await api.post('/api/v1/rescue/switch-team', { teamId })
      return res.data?.data || res.data
    } catch (err) {
      console.error('Failed to switch team:', err.response?.data || err.message)
      throw err
    }
  },
}
