import React, { createContext, useContext, useEffect, useState } from 'react'
import { DEMO_ACCOUNTS } from '../utils/mockData'
import api from '../services/api'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('jalrakshak_user')
      return stored ? JSON.parse(stored) : DEMO_ACCOUNTS.citizen
    } catch {
      return DEMO_ACCOUNTS.citizen
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem('jalrakshak_token') || 'demo-jwt-token-active')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem('jalrakshak_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('jalrakshak_user')
    }
  }, [user])

  const login = async (credentials) => {
    setLoading(true)
    try {
      // Try real API first
      const res = await api.post('/api/v1/auth/login', credentials)
      const { token: received, user: userData } = res.data
      setToken(received)
      localStorage.setItem('jalrakshak_token', received)
      setUser(userData)
      return { ok: true, user: userData }
    } catch {
      // Graceful fallback to mock authentication based on role/email
      const matchedRole = credentials.role || (credentials.email?.includes('admin') ? 'admin' : credentials.email?.includes('rescue') ? 'rescue' : 'citizen')
      const demoUser = DEMO_ACCOUNTS[matchedRole] || DEMO_ACCOUNTS.citizen
      setToken('mock-jwt-token-active')
      localStorage.setItem('jalrakshak_token', 'mock-jwt-token-active')
      setUser(demoUser)
      return { ok: true, user: demoUser }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    setLoading(true)
    try {
      const res = await api.post('/api/v1/auth/register', userData)
      const { token: received, user: createdUser } = res.data
      setToken(received)
      localStorage.setItem('jalrakshak_token', received)
      setUser(createdUser)
      return { ok: true, user: createdUser }
    } catch {
      // Fallback
      const newUser = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: userData.name || 'Citizen User',
        email: userData.email,
        role: userData.role || 'citizen',
        phone: userData.phone || '+91 99999 99999',
        district: userData.district || 'Cuttack',
        state: userData.state || 'Odisha',
        location: { lat: 20.4782, lng: 85.8621, address: userData.district || 'Cuttack' }
      }
      setToken('mock-jwt-token-active')
      localStorage.setItem('jalrakshak_token', 'mock-jwt-token-active')
      setUser(newUser)
      return { ok: true, user: newUser }
    } finally {
      setLoading(false)
    }
  }

  const switchRole = (roleKey) => {
    if (DEMO_ACCOUNTS[roleKey]) {
      setUser(DEMO_ACCOUNTS[roleKey])
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('jalrakshak_token')
    localStorage.removeItem('jalrakshak_user')
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    switchRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
