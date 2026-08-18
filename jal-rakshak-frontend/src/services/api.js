import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach token when available
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

export default api
