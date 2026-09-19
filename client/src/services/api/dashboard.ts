import type { DashboardResponse } from '../types/dashboard';

export const BASE_URL = 'http://localhost:5000/api/v1';

export const getDashboardSummary = async (): Promise<DashboardResponse> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/dashboard/summary`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-timezone-offset-minutes': String(-new Date().getTimezoneOffset()) } });
  const result = (await response.json().catch(() => null)) as DashboardResponse | null;
  if (!response.ok || !result?.success) throw new Error(result?.message || `Failed to fetch dashboard summary with status ${response.status}.`);
  return result;
};