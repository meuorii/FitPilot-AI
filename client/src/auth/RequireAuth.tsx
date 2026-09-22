import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const AUTH_TOKEN_KEY = 'fitpilot_token'

export function RequireAuth({ children }: PropsWithChildren) {
  const location = useLocation()

  const token =
    window.localStorage.getItem(AUTH_TOKEN_KEY) ??
    window.sessionStorage.getItem(AUTH_TOKEN_KEY)

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return <>{children}</>
}