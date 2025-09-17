"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import API_ENDPOINTS from '@/lib/api-config'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'superadmin' | 'vendor' | 'ops'
  phone: string
  balance: string
  is_verified: boolean
  referral_code: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  loading: boolean
  error: string | null
  checkToken: () => Promise<boolean>
}

interface RegisterData {
  username: string
  email: string
  password: string
  password2: string
  first_name: string
  last_name: string
  phone: string
  referral_code?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const checkTokenWithServer = useCallback(async (tokenToCheck: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        headers: {
          'Authorization': `Bearer ${tokenToCheck}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setLoading(false)
      } else if (response.status === 401) {
        // Token is invalid, logout only on 401
        logout()
        setLoading(false)
      } else {
        // Server error, but keep user logged in
        console.warn('Server error during token check:', response.status)
        setLoading(false)
      }
    } catch (error) {
      console.error('Token check failed:', error)
      // Network error, keep user logged in but show warning
      console.warn('Network error during token check, keeping user logged in')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = localStorage.getItem('access_token') || localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      // Verify token with server
      checkTokenWithServer(storedToken)
    } else {
      setLoading(false)
    }
  }, [checkTokenWithServer])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()
      
      setUser(data.user)
      setToken(data.access)
      
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('token', data.access) // Keep both for compatibility
      localStorage.setItem('user', JSON.stringify(data.user))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      const data = await response.json()
      
      setUser(data.user)
      setToken(data.access)
      
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('token', data.access) // Keep both for compatibility
      localStorage.setItem('user', JSON.stringify(data.user))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const checkToken = async (): Promise<boolean> => {
    if (!token) {
      return false
    }
    
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        localStorage.setItem('user', JSON.stringify(data))
        return true
      } else if (response.status === 401) {
        // Token is invalid, logout only on 401
        logout()
        return false
      } else {
        // Server error, but keep user logged in
        console.warn('Server error during token check:', response.status)
        return true
      }
    } catch (error) {
      console.error('Token check failed:', error)
      // Network error, keep user logged in
      console.warn('Network error during token check, keeping user logged in')
      return true
    }
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    error,
    checkToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
