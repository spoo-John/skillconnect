import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Sends signed-out visitors to log in, then back to where they were going. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()
  const location = useLocation()

  if (!user || !token) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return <>{children}</>
}
