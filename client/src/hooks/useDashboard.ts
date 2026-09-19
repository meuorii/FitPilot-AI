import { useQuery } from '@tanstack/react-query'

import { getDashboardSummary } from '../services/api/dashboard'
import type { DashboardResponse } from '../services/types/dashboard'

export const dashboardQueryKey = ['dashboard-summary'] as const

export const useDashboard = () => {
  return useQuery<DashboardResponse, Error>({
    queryKey: dashboardQueryKey,
    queryFn: getDashboardSummary,
    staleTime: 30_000,
  })
}
