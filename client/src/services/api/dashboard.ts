import type { DashboardResponse } from '../types/dashboard'

export const BASE_URL = 'https://fitpilot-api-rp3p.onrender.com/api/v1'

const AUTH_TOKEN_KEY = 'fitpilot_token'

export const getDashboardSummary = async (): Promise<DashboardResponse> => {
  const token =
    window.localStorage.getItem(AUTH_TOKEN_KEY) ??
    window.sessionStorage.getItem(AUTH_TOKEN_KEY)

  if (!token) {
    throw new Error('Authentication token not found. Please log in again.')
  }

  const response = await fetch(`${BASE_URL}/dashboard/summary`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-timezone-offset-minutes': String(
        -new Date().getTimezoneOffset()
      ),
    },
  })

  const result = (await response
    .json()
    .catch(() => null)) as DashboardResponse | null

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
        `Failed to fetch dashboard summary with status ${response.status}.`
    )
  }

  return result
}