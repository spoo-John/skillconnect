import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi, setUnauthorizedHandler } from '../api/client'
import { track } from '../lib/analytics'
import type { RegisterPayload, User } from '../types'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

interface Session {
  user: User | null
  token: string | null
}

interface AuthContextValue extends Session {
  login: (email: string, password: string) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/** Read synchronously so the first render already knows who is signed in (no login flash). */
function readSession(): Session {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const raw = localStorage.getItem(USER_KEY)
    if (token && raw) return { token, user: JSON.parse(raw) as User }
  } catch {
    clearSession()
  }
  return { token: null, user: null }
}

function saveSession(token: string, user: User) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch {
    /* storage unavailable (private mode) — the session still lives in memory */
  }
}

function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(readSession)

  const logout = useCallback(() => {
    clearSession()
    setSession({ token: null, user: null })
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  // Keep tabs in sync: signing out in one tab signs out the others.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === TOKEN_KEY || e.key === USER_KEY || e.key === null) setSession(readSession())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password)
    saveSession(data.token, data.user)
    setSession({ token: data.token, user: data.user })
    track('Login')
    return data.user
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const data = await authApi.register(payload)
    saveSession(data.token, data.user)
    setSession({ token: data.token, user: data.user })
    track('Signup', { role: payload.role })
    return data.user
  }, [])

  const value = useMemo(() => ({ ...session, login, register, logout }), [session, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
