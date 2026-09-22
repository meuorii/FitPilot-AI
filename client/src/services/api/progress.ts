import type {
  CreateProgressLogInput,
  CreateProgressLogResponse,
  DeleteProgressLogResponse,
  ProgressLogsQuery,
  ProgressLogsResponse,
  ProgressOverviewResponse,
} from '../types/progress';

export const BASE_URL = 'http://localhost:5000/api/v1';

const AUTH_TOKEN_KEY = 'fitpilot_token';

const getAuthToken = (): string => {
  const token =
    window.localStorage.getItem(AUTH_TOKEN_KEY) ??
    window.sessionStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    throw new Error(
      'Authentication token not found. Please log in again.',
    );
  }

  return token;
};

const getProgressHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`,
  'x-timezone-offset-minutes': String(
    -new Date().getTimezoneOffset(),
  ),
});

const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(
    `${BASE_URL}/progress${endpoint}`,
    {
      ...options,
      headers: {
        ...getProgressHeaders(),
        ...(options.headers ?? {}),
      },
    },
  );

  const result = (await response
    .json()
    .catch(() => null)) as
    | (T & {
        success?: boolean;
        message?: string;
        error?: string;
      })
    | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
        result?.error ||
        `Progress request failed with status ${response.status}.`,
    );
  }

  return result;
};

// -----------------------------------------------------------------------------
// Overview
// -----------------------------------------------------------------------------

export const getProgressOverview =
  async (): Promise<ProgressOverviewResponse> =>
    request<ProgressOverviewResponse>('/overview');

// -----------------------------------------------------------------------------
// Logs
// -----------------------------------------------------------------------------

export const getProgressLogs = async (
  query: ProgressLogsQuery = {},
): Promise<ProgressLogsResponse> => {
  const params = new URLSearchParams();

  if (query.limit !== undefined) {
    params.set('limit', String(query.limit));
  }

  if (query.offset !== undefined) {
    params.set('offset', String(query.offset));
  }

  const queryString = params.toString();

  return request<ProgressLogsResponse>(
    `/logs${queryString ? `?${queryString}` : ''}`,
  );
};

export const createProgressLog = async (
  input: CreateProgressLogInput,
): Promise<CreateProgressLogResponse> =>
  request<CreateProgressLogResponse>('/logs', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const deleteProgressLog = async (
  progressId: string,
): Promise<DeleteProgressLogResponse> => {
  const id = progressId.trim();

  if (!id) {
    throw new Error('Progress log ID is required.');
  }

  return request<DeleteProgressLogResponse>(
    `/logs/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    },
  );
};
