import api from './api'

export const adminApi = {
  /**
   * Get Admin Command Center live dashboard statistics
   */
  getDashboardStats: async () => {
    try {
      const res = await api.get('/api/v1/admin/dashboard')
      return res.data?.data || res.data
    } catch (err) {
      console.warn('Failed to fetch admin dashboard stats from backend:', err.message)
      return null
    }
  },

  /**
   * Get Disaster Analytics
   */
  getAnalytics: async (params = {}) => {
    try {
      const res = await api.get('/api/v1/admin/analytics', { params })
      return res.data?.data || res.data
    } catch (err) {
      console.warn('Failed to fetch disaster analytics:', err.message)
      return null
    }
  },

  /**
   * Broadcast emergency alert
   */
  broadcastAlert: async (alertData) => {
    try {
      const res = await api.post('/api/v1/admin/alerts/broadcast', alertData)
      return res.data?.data || res.data
    } catch (err) {
      console.error('Broadcast alert error:', err.response?.data || err.message)
      throw err
    }
  },
}

export default adminApi
