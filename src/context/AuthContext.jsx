import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'
import { ADMIN_EMAIL } from '../utils/constants'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function bootstrap() {
      if (token) {
        try {
          const me = await authService.getMe(token)
          setUser(me)
        } catch (err) {
          console.error(err)
          setUser(null)
          setToken(null)
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }
    bootstrap()
  }, [token])

  const login = async (credentials) => {
    const { token: jwt, user: u } = await authService.login(credentials)
    setToken(jwt)
    localStorage.setItem('token', jwt)
    setUser(u)
    return u
  }

  const register = async (payload) => {
    const { token: jwt, user: u } = await authService.register(payload)
    setToken(jwt)
    localStorage.setItem('token', jwt)
    setUser(u)
    return u
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const updateUser = (patch) => setUser((u) => (u ? { ...u, ...patch } : u))

  const isAdmin = user?.email === ADMIN_EMAIL

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
