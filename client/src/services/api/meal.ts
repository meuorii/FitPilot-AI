import type {
  DeleteMealResponse,
  LogMealInput,
  LogMealResponse,
  LogParsedMealInput,
  MealHistoryQuery,
  MealHistoryResponse,
  MealsByDateResponse,
  ParseMealTextInput,
  ParseMealTextResponse,
  TodayMealsResponse,
  WeeklyMealsQuery,
  WeeklyMealsResponse,
  YesterdayMealsResponse,
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

const toQueryString = (
  params: Record<string, string | number | undefined>,
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

// -----------------------------------------------------------------------------
// AI meal parser — POST /meals/parse-ai
// -----------------------------------------------------------------------------

export const parseMealText = async (
  input: ParseMealTextInput,
): Promise<ParseMealTextResponse> =>
  request<ParseMealTextResponse>('/parse-ai', {
    method: 'POST',
    body: JSON.stringify(input),
  });

// -----------------------------------------------------------------------------
// Meal logging — POST /meals/log
//
// The backend accepts either a flat LogMealInput or a LogParsedMealInput
// with a nested `data` object (the shape returned by parse-ai). The response
// data is the raw inserted row (MealLogRecord), not the serialized shape
// used by the date/week/history endpoints.
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
// Daily meal views — GET /meals/today | /meals/yesterday | /meals/date/:date
// -----------------------------------------------------------------------------

export const getTodayMeals = async (): Promise<TodayMealsResponse> =>
  request<TodayMealsResponse>('/today');

export const getYesterdayMeals = async (): Promise<YesterdayMealsResponse> =>
  request<YesterdayMealsResponse>('/yesterday');

export const getMealsByDate = async (
  date: string,
): Promise<MealsByDateResponse> =>
  request<MealsByDateResponse>(`/date/${encodeURIComponent(date)}`);

// -----------------------------------------------------------------------------
// Weekly + historical nutrition — GET /meals/week | /meals/history
// -----------------------------------------------------------------------------

export const getWeeklyMeals = async (
  query: WeeklyMealsQuery = {},
): Promise<WeeklyMealsResponse> =>
  request<WeeklyMealsResponse>(`/week${toQueryString({ date: query.date })}`);

export const getMealHistory = async (
  query: MealHistoryQuery = {},
): Promise<MealHistoryResponse> =>
  request<MealHistoryResponse>(
    `/history${toQueryString({ days: query.days })}`,
  );

// -----------------------------------------------------------------------------
// Delete meal — DELETE /meals/:mealId
// -----------------------------------------------------------------------------

export const deleteMeal = async (
  mealId: string,
): Promise<DeleteMealResponse> =>
  request<DeleteMealResponse>(`/${encodeURIComponent(mealId)}`, {
    method: 'DELETE',
  });