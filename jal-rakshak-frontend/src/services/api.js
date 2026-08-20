import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach Bearer token
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('jalrakshak_token')
    if (raw) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${raw}`
    }
  } catch (e) {
    // ignore
  }
  return config
})

// Response interceptor to handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('jalrakshak_refresh_token')

      if (refreshToken) {
        try {
          const res = await axios.post(`${baseURL}/api/v1/auth/refresh`, { refreshToken })
          const newToken = res.data?.data?.accessToken || res.data?.data?.token
          if (newToken) {
            localStorage.setItem('jalrakshak_token', newToken)
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          }
        } catch (refreshErr) {
          localStorage.removeItem('jalrakshak_token')
          localStorage.removeItem('jalrakshak_refresh_token')
          localStorage.removeItem('jalrakshak_user')
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
