import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface UserProfile {
  id: number
  email: string
  phone: string | null
  firstName: string | null
  lastName: string | null
  role: string
  status: string
}

interface AuthState {
  accessToken: string | null
  user: UserProfile | null
  isAuthenticated: boolean
  isAdmin: boolean
}

interface AuthContextValue extends AuthState {
  login: (identifier: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  phone?: string
  firstName?: string
  lastName?: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('accessToken')
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    return {
      accessToken: token,
      user,
      isAuthenticated: !!token,
      isAdmin: user?.role === 'ADMIN',
    }
  })

  const setAuth = useCallback((token: string, user: UserProfile) => {
    localStorage.setItem('accessToken', token)
    localStorage.setItem('refreshToken', localStorage.getItem('refreshToken') || '')
    localStorage.setItem('user', JSON.stringify(user))
    setState({
      accessToken: token,
      user,
      isAuthenticated: true,
      isAdmin: user.role === 'ADMIN',
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setState({ accessToken: null, user: null, isAuthenticated: false, isAdmin: false })
  }, [])

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Неверные данные')
    }
    const tokens = await res.json()
    localStorage.setItem('refreshToken', tokens.refreshToken)

    const profileRes = await fetch('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })
    if (!profileRes.ok) throw new Error('Не удалось получить профиль')
    const user = await profileRes.json()
    setAuth(tokens.accessToken, user)
  }, [setAuth])

  const register = useCallback(async (data: RegisterData) => {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Ошибка регистрации')
    }
    const tokens = await res.json()
    localStorage.setItem('refreshToken', tokens.refreshToken)

    const profileRes = await fetch('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })
    if (!profileRes.ok) throw new Error('Не удалось получить профиль')
    const user = await profileRes.json()
    setAuth(tokens.accessToken, user)
  }, [setAuth])

  const fetchProfile = useCallback(async () => {
    if (!state.accessToken) return
    const res = await fetch('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${state.accessToken}` },
    })
    if (res.ok) {
      const user = await res.json()
      localStorage.setItem('user', JSON.stringify(user))
      setState(prev => ({ ...prev, user, isAdmin: user.role === 'ADMIN' }))
    }
  }, [state.accessToken])

  useEffect(() => {
    if (state.accessToken && !state.user) {
      fetchProfile()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
