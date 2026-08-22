import api from './api'

export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/api/v1/auth/login', credentials)
    return res.data
  },

  register: async (userData) => {
    const res = await api.post('/api/v1/auth/register', userData)
    return res.data
  },

  getProfile: async () => {
    const res = await api.get('/api/v1/auth/me')
    return res.data
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

  resetPassword: async ({ token, password }) => {
    try {
      const res = await api.post('/api/v1/auth/reset-password', { token, password })
      return res.data
    } catch (err) {
      const errorMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to reset password. The link may have expired.'
      throw new Error(errorMsg)
    }
  },
}
