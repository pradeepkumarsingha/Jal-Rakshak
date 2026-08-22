import api from './api'
import { INITIAL_REPORTS } from '../utils/mockData'

export const reportApi = {
  getAllReports: async (params = {}) => {
    try {
      const res = await api.get('/api/v1/reports', { params })
      return res.data?.data || res.data || []
    } catch (err) {
      console.warn('Fallback to mock reports:', err.message)
      return INITIAL_REPORTS
    }
  },

  getMyReports: async () => {
    try {
      const res = await api.get('/api/v1/reports/my')
      return res.data?.data || res.data || []
    } catch (err) {
      console.warn('Failed to fetch my reports:', err.message)
      return []
    }
  },

  getPendingReports: async (page = 1, limit = 50) => {
    try {
      const res = await api.get(`/api/v1/admin/reports/pending?page=${page}&limit=${limit}`)
      return res.data?.data?.reports || res.data?.data || res.data || []
    } catch (err) {
      console.warn('Failed to fetch pending admin reports:', err.message)
      return []
    }
  },

  submitReport: async (reportData) => {
    try {
      let res
      if (reportData instanceof FormData) {
        res = await api.post('/api/v1/reports', reportData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        res = await api.post('/api/v1/reports', reportData)
      }
      return res.data
    } catch (err) {
      console.error('Report submission error:', err.response?.data || err.message)
      throw err
    }
  },

  verifyReport: async (reportId, action, notes = '', options = {}) => {
    try {
      const payload = {
        action,
        notes,
        rescueTeamId: options.rescueTeamId,
        estimatedEtaMinutes: options.estimatedEtaMinutes,
      }
      const res = await api.post(`/api/v1/reports/${reportId}/verify`, payload)
      return res.data
    } catch (err) {
      console.error(`Verify report ${reportId} failed:`, err.response?.data || err.message)
      throw err
    }
  },

  assignRescueTeam: async (reportId, { rescueTeamId, estimatedEtaMinutes = 15, notes = '' }) => {
    try {
      const res = await api.post(`/api/v1/reports/${reportId}/assign-rescue`, {
        rescueTeamId,
        estimatedEtaMinutes,
        notes,
      })
      return res.data
    } catch (err) {
      console.error(`Assign rescue team to report ${reportId} failed:`, err.response?.data || err.message)
      throw err
    }
  },

  deleteReport: async (reportId) => {
    try {
      const res = await api.delete(`/api/v1/reports/${reportId}`)
      return res.data
    } catch (err) {
      console.error(`Delete report ${reportId} failed:`, err.message)
      throw err
    }
  },
}
