import type { AbandonWorkoutResponse, CompleteWorkoutInput, CompleteWorkoutResponse, CreateWorkoutExerciseInput, CreateWorkoutExerciseResponse, CreateWorkoutRoutineInput, CreateWorkoutSplitInput, DeleteWorkoutSetResponse, DuplicateWorkoutRoutineInput, DuplicateWorkoutSplitDayInput, DuplicateWorkoutSplitDayResponse, DuplicateWorkoutSplitInput, LogWorkoutSessionInput, LogWorkoutSessionResponse, LogWorkoutSetInput, LogWorkoutSetResponse, PreviousPerformanceResponse, RequiredWorkoutSessionResponse, StartWorkoutInput, UpdateWorkoutRoutineInput, UpdateWorkoutSetInput, UpdateWorkoutSetResponse, UpdateWorkoutSplitInput, WorkoutHistoryItemResponse, WorkoutHistoryQuery, WorkoutHistoryResponse, WorkoutMessageResponse, WorkoutOverviewResponse, WorkoutProgressResponse, WorkoutRoutineResponse, WorkoutRoutinesResponse, WorkoutSessionResponse, WorkoutSplitResponse, WorkoutSplitsResponse, WorkoutTodayResponse, WorkoutExercisesResponse } from '../types/workout'

export const BASE_URL = 'http://localhost:5000/api/v1'

const AUTH_TOKEN_KEY = 'fitpilot_token'

const getAuthToken = (): string => {
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY) ?? window.sessionStorage.getItem(AUTH_TOKEN_KEY)
  if (!token) throw new Error('Authentication token not found. Please log in again.')
  return token
}

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken()
  const isFormData = options.body instanceof FormData
  const headers = new Headers(options.headers)
  if (!isFormData && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('x-timezone-offset-minutes', String(-new Date().getTimezoneOffset()))
  const response = await fetch(`${BASE_URL}/workouts${endpoint}`, { ...options, headers })
  const result = (await response.json().catch(() => null)) as (T & { success?: boolean; message?: string }) | null
  if (!response.ok || !result?.success) throw new Error(result?.message || `Workout request failed with status ${response.status}.`)
  return result
}

const toQueryString = (params: Record<string, string | number | undefined>): string => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined) searchParams.set(key, String(value)) })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export const getExercises = async (): Promise<WorkoutExercisesResponse> => request<WorkoutExercisesResponse>('/exercises')

export const createExercise = async (input: CreateWorkoutExerciseInput): Promise<CreateWorkoutExerciseResponse> => {
  const formData = new FormData()
  formData.append('name', input.name)
  formData.append('category', input.category)
  formData.append('equipment', input.equipment)
  if (input.difficulty) formData.append('difficulty', input.difficulty)
  if (input.instructions) formData.append('instructions', JSON.stringify(input.instructions))
  if (input.image) formData.append('image', input.image)
  return request<CreateWorkoutExerciseResponse>('/exercises', { method: 'POST', body: formData })
}

export const getPreviousPerformance = async (exerciseId: string, excludeSessionId?: string): Promise<PreviousPerformanceResponse> => {
  const query = toQueryString({ exclude_session_id: excludeSessionId })
  return request<PreviousPerformanceResponse>(`/exercises/${encodeURIComponent(exerciseId)}/previous-performance${query}`)
}

export const getRoutines = async (): Promise<WorkoutRoutinesResponse> => request<WorkoutRoutinesResponse>('/routines')

export const getRoutine = async (routineId: string): Promise<WorkoutRoutineResponse> => request<WorkoutRoutineResponse>(`/routines/${encodeURIComponent(routineId)}`)

export const createRoutine = async (input: CreateWorkoutRoutineInput): Promise<WorkoutRoutineResponse> => request<WorkoutRoutineResponse>('/routines', { method: 'POST', body: JSON.stringify(input) })

export const updateRoutine = async (routineId: string, input: UpdateWorkoutRoutineInput): Promise<WorkoutRoutineResponse> => request<WorkoutRoutineResponse>(`/routines/${encodeURIComponent(routineId)}`, { method: 'PATCH', body: JSON.stringify(input) })

export const duplicateRoutine = async (routineId: string, input: DuplicateWorkoutRoutineInput = {}): Promise<WorkoutRoutineResponse> => request<WorkoutRoutineResponse>(`/routines/${encodeURIComponent(routineId)}/duplicate`, { method: 'POST', body: JSON.stringify(input) })

export const deleteRoutine = async (routineId: string): Promise<WorkoutMessageResponse> => request<WorkoutMessageResponse>(`/routines/${encodeURIComponent(routineId)}`, { method: 'DELETE' })

export const getWorkoutSplits = async (): Promise<WorkoutSplitsResponse> => request<WorkoutSplitsResponse>('/splits')

export const getWorkoutSplit = async (splitId: string): Promise<WorkoutSplitResponse> => request<WorkoutSplitResponse>(`/splits/${encodeURIComponent(splitId)}`)

export const createWorkoutSplit = async (input: CreateWorkoutSplitInput): Promise<WorkoutSplitResponse> => request<WorkoutSplitResponse>('/splits', { method: 'POST', body: JSON.stringify(input) })

export const updateWorkoutSplit = async (splitId: string, input: UpdateWorkoutSplitInput): Promise<WorkoutSplitResponse> => request<WorkoutSplitResponse>(`/splits/${encodeURIComponent(splitId)}`, { method: 'PATCH', body: JSON.stringify(input) })

export const activateWorkoutSplit = async (splitId: string): Promise<WorkoutSplitResponse> => request<WorkoutSplitResponse>(`/splits/${encodeURIComponent(splitId)}/activate`, { method: 'POST' })

export const duplicateWorkoutSplit = async (splitId: string, input: DuplicateWorkoutSplitInput = {}): Promise<WorkoutSplitResponse> => request<WorkoutSplitResponse>(`/splits/${encodeURIComponent(splitId)}/duplicate`, { method: 'POST', body: JSON.stringify(input) })

export const duplicateWorkoutSplitDay = async (splitId: string, dayId: string, input: DuplicateWorkoutSplitDayInput): Promise<DuplicateWorkoutSplitDayResponse> => request<DuplicateWorkoutSplitDayResponse>(`/splits/${encodeURIComponent(splitId)}/days/${encodeURIComponent(dayId)}/duplicate`, { method: 'POST', body: JSON.stringify(input) })

export const deleteWorkoutSplit = async (splitId: string): Promise<WorkoutMessageResponse> => request<WorkoutMessageResponse>(`/splits/${encodeURIComponent(splitId)}`, { method: 'DELETE' })

export const getTodayWorkout = async (dayOfWeek?: number): Promise<WorkoutTodayResponse> => {
  const query = toQueryString({ day_of_week: dayOfWeek })
  return request<WorkoutTodayResponse>(`/today${query}`)
}

export const getWorkoutOverview = async (dayOfWeek?: number): Promise<WorkoutOverviewResponse> => {
  const query = toQueryString({ day_of_week: dayOfWeek })
  return request<WorkoutOverviewResponse>(`/overview${query}`)
}

export const getActiveWorkout = async (): Promise<WorkoutSessionResponse> => request<WorkoutSessionResponse>('/sessions/active')

export const startWorkout = async (input: StartWorkoutInput = {}): Promise<RequiredWorkoutSessionResponse> => request<RequiredWorkoutSessionResponse>('/sessions/start', { method: 'POST', body: JSON.stringify(input) })

export const getWorkoutSession = async (sessionId: string): Promise<RequiredWorkoutSessionResponse> => request<RequiredWorkoutSessionResponse>(`/sessions/${encodeURIComponent(sessionId)}`)

export const logWorkoutSet = async (sessionId: string, input: LogWorkoutSetInput): Promise<LogWorkoutSetResponse> => request<LogWorkoutSetResponse>(`/sessions/${encodeURIComponent(sessionId)}/sets`, { method: 'POST', body: JSON.stringify(input) })

export const updateWorkoutSet = async (sessionId: string, setId: string, input: UpdateWorkoutSetInput): Promise<UpdateWorkoutSetResponse> => request<UpdateWorkoutSetResponse>(`/sessions/${encodeURIComponent(sessionId)}/sets/${encodeURIComponent(setId)}`, { method: 'PATCH', body: JSON.stringify(input) })

export const deleteWorkoutSet = async (sessionId: string, setId: string): Promise<DeleteWorkoutSetResponse> => request<DeleteWorkoutSetResponse>(`/sessions/${encodeURIComponent(sessionId)}/sets/${encodeURIComponent(setId)}`, { method: 'DELETE' })

export const getWorkoutProgress = async (sessionId: string): Promise<WorkoutProgressResponse> => request<WorkoutProgressResponse>(`/sessions/${encodeURIComponent(sessionId)}/progress`)

export const completeWorkout = async (sessionId: string, input: CompleteWorkoutInput = {}): Promise<CompleteWorkoutResponse> => request<CompleteWorkoutResponse>(`/sessions/${encodeURIComponent(sessionId)}/complete`, { method: 'POST', body: JSON.stringify(input) })

export const abandonWorkout = async (sessionId: string): Promise<AbandonWorkoutResponse> => request<AbandonWorkoutResponse>(`/sessions/${encodeURIComponent(sessionId)}/abandon`, { method: 'POST' })

export const logWorkoutSession = async (input: LogWorkoutSessionInput): Promise<LogWorkoutSessionResponse> => request<LogWorkoutSessionResponse>('/sessions', { method: 'POST', body: JSON.stringify(input) })

export const getWorkoutHistory = async (query: WorkoutHistoryQuery = {}): Promise<WorkoutHistoryResponse> => {
  const queryString = toQueryString({ status: query.status, limit: query.limit, offset: query.offset })
  return request<WorkoutHistoryResponse>(`/history${queryString}`)
}

export const getWorkoutHistoryItem = async (sessionId: string): Promise<WorkoutHistoryItemResponse> => request<WorkoutHistoryItemResponse>(`/history/${encodeURIComponent(sessionId)}`)