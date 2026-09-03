import type { DashboardSummaryResponse } from '../types/dashboard';

export const BASE_URL = 'http://localhost:5000/api/v1';

export const getDashboardSummary = async (token: string): Promise<DashboardSummaryResponse> => {
  const response = await fetch(`${BASE_URL}/dashboard/summary`, {
    method: 'GET',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  const result = (await response.json().catch(() => null)) as DashboardSummaryResponse | null;
  if (!response.ok || !result?.success) {
    throw new Error(result?.message || `Retrieving dashboard data failed with status ${response.status}.`);
  }
  return result;
};