import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/api-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status > 0 && error.status < 500) return false;
        return failureCount < 1;
      },
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
    mutations: { retry: 0 },
  },
});

export const queryKeys = {
  all: ['fitpilot'] as const,
  session: () => [...queryKeys.all, 'session'] as const,
};
