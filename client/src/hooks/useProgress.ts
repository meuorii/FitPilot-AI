import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createProgressLog,
  deleteProgressLog,
  getProgressLogs,
  getProgressOverview,
} from '../services/api/progress'
import type {
  CreateProgressLogInput,
  CreateProgressLogResponse,
  DeleteProgressLogResponse,
  ProgressLogsQuery,
  ProgressLogsResponse,
  ProgressOverviewResponse,
} from '../services/types/progress'
import { dashboardQueryKey } from './useDashboard'

export const progressQueryKeys = {
  all: ['progress'] as const,
  overview: () => [...progressQueryKeys.all, 'overview'] as const,
  logsRoot: () => [...progressQueryKeys.all, 'logs'] as const,
  logs: (query?: ProgressLogsQuery) =>
    [...progressQueryKeys.logsRoot(), query ?? {}] as const,
}

export const useProgressOverview = () =>
  useQuery<ProgressOverviewResponse, Error>({
    queryKey: progressQueryKeys.overview(),
    queryFn: getProgressOverview,
    staleTime: 30_000,
  })

export const useProgressLogs = (query: ProgressLogsQuery = {}) =>
  useQuery<ProgressLogsResponse, Error>({
    queryKey: progressQueryKeys.logs(query),
    queryFn: () => getProgressLogs(query),
    staleTime: 15_000,
  })

const invalidateProgress = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: progressQueryKeys.overview(),
    }),
    queryClient.invalidateQueries({
      queryKey: progressQueryKeys.logsRoot(),
    }),
    queryClient.invalidateQueries({
      queryKey: dashboardQueryKey,
    }),
  ])
}

export const useCreateProgressLog = () => {
  const queryClient = useQueryClient()

  return useMutation<
    CreateProgressLogResponse,
    Error,
    CreateProgressLogInput
  >({
    mutationFn: (input) => createProgressLog(input),
    onSuccess: async () => invalidateProgress(queryClient),
  })
}

export const useDeleteProgressLog = () => {
  const queryClient = useQueryClient()

  return useMutation<
    DeleteProgressLogResponse,
    Error,
    string
  >({
    mutationFn: (progressId) => deleteProgressLog(progressId),
    onSuccess: async () => invalidateProgress(queryClient),
  })
}
