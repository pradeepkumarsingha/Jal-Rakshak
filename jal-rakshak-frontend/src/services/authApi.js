import api from './api'
import { DEMO_ACCOUNTS } from '../utils/mockData'

export const authApi = {
  login: async (credentials) => {
    try {
      const res = await api.post('/api/v1/auth/login', credentials)
      return res.data
    } catch {
      const role = credentials.role || 'citizen'
      return { token: 'mock-token', user: DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS.citizen }
    }
  },

  register: async (userData) => {
    try {
      const res = await api.post('/api/v1/auth/register', userData)
      return res.data
    } catch {
      return {
        token: 'mock-token',
        user: {
          id: `USR-${Date.now()}`,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'citizen',
          phone: userData.phone,
          district: userData.district || 'Cuttack',
        },
      }
    }
  },

  getProfile: async () => {
    try {
      const res = await api.get('/api/v1/auth/me')
      return res.data
    } catch {
      return DEMO_ACCOUNTS.citizen
    }
  },

  forgotPassword: async ({ email, portal = 'citizen' }) => {
    try {
      const res = await api.post('/api/v1/auth/forgot-password', { email, portal })
      return res.data
    } catch (err) {
      const errorMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to process password reset request.'
      throw new Error(errorMsg)
    }
  },
}
