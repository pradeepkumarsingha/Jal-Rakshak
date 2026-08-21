import axios from 'axios'

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const baseURL = rawBaseURL.replace(/\/api\/v1\/?$/, '')

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

// Response interceptor to handle errors cleanly without broken refresh loops
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  }
)

export default api
