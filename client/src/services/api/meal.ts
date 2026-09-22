import type {
  DeleteMealResponse,
  LogMealInput,
  LogMealResponse,
  LogParsedMealInput,
  ParseMealTextInput,
  ParseMealTextResponse,
  TodayMealsResponse,
} from '../types/meal';

export const BASE_URL = 'https://fitpilot-api-rp3p.onrender.com/api/v1';

const AUTH_TOKEN_KEY = 'fitpilot_token';

const getAuthToken = (): string => {
  const token =
    window.localStorage.getItem(AUTH_TOKEN_KEY) ??
    window.sessionStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    throw new Error('Authentication token not found. Please log in again.');
  }

  return token;
};

const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = getAuthToken();
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Authorization', `Bearer ${token}`);
  headers.set(
    'x-timezone-offset-minutes',
    String(-new Date().getTimezoneOffset()),
  );

  const response = await fetch(`${BASE_URL}/meals${endpoint}`, {
    ...options,
    headers,
  });

  const result = (await response.json().catch(() => null)) as
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
        `Meal request failed with status ${response.status}.`,
    );
  }

  return result;
};

// -----------------------------------------------------------------------------
// AI meal parser
// -----------------------------------------------------------------------------

export const parseMealText = async (
  input: ParseMealTextInput,
): Promise<ParseMealTextResponse> =>
  request<ParseMealTextResponse>('/parse-ai', {
    method: 'POST',
    body: JSON.stringify(input),
  });

// -----------------------------------------------------------------------------
// Meal logging
// -----------------------------------------------------------------------------

export const logMeal = async (
  input: LogMealInput,
): Promise<LogMealResponse> =>
  request<LogMealResponse>('/log', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const logParsedMeal = async (
  input: LogParsedMealInput,
): Promise<LogMealResponse> =>
  request<LogMealResponse>('/log', {
    method: 'POST',
    body: JSON.stringify(input),
  });

// -----------------------------------------------------------------------------
// Today's meals
// -----------------------------------------------------------------------------

export const getTodayMeals = async (): Promise<TodayMealsResponse> =>
  request<TodayMealsResponse>('/today');

// -----------------------------------------------------------------------------
// Delete meal
// -----------------------------------------------------------------------------

export const deleteMeal = async (
  mealId: string,
): Promise<DeleteMealResponse> =>
  request<DeleteMealResponse>(`/${encodeURIComponent(mealId)}`, {
    method: 'DELETE',
  });