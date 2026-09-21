export type WorkoutId = string;

export type WorkoutSessionStatus =
  | 'in_progress'
  | 'completed'
  | 'abandoned'
  | string;

export type WorkoutRestReason =
  | 'before_next_set'
  | 'before_next_exercise'
  | 'workout_complete'
  | string;

export interface WorkoutApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface WorkoutMessageResponse {
  success: boolean;
  message: string;
}

export interface WorkoutExercise {
  id: WorkoutId;
  name: string;
  category: string;
  equipment: string;
  difficulty: string;
  instructions: string[];
  image_url: string | null;
  created_at: string;
}

export interface CreateWorkoutExerciseInput {
  name: string;
  category: string;
  equipment: string;
  difficulty?: string;
  instructions?: string[];
  image?: File | null;
}

export interface WorkoutRoutineExerciseInput {
  exercise_id: WorkoutId;
  target_sets?: number;
  target_reps_min?: number;
  target_reps_max?: number;
  rest_seconds?: number;
  notes?: string | null;
  order_index?: number;
}

export interface WorkoutRoutineExercise {
  id: WorkoutId;
  exercise_id: WorkoutId;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  rest_seconds: number;
  notes: string | null;
  order_index: number;
  created_at: string;
  exercises: WorkoutExercise | null;
}

export interface WorkoutRoutine {
  id: WorkoutId;
  user_id: WorkoutId | null;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  is_global: boolean;
  created_at: string;
  updated_at: string;
  routine_exercises: WorkoutRoutineExercise[];
}

export interface CreateWorkoutRoutineInput {
  name: string;
  description?: string;
  cover_image_url?: string;
  exercises?: WorkoutRoutineExerciseInput[];
}

export interface UpdateWorkoutRoutineInput {
  name?: string;
  description?: string | null;
  cover_image_url?: string | null;
  exercises?: WorkoutRoutineExerciseInput[];
}

export interface DuplicateWorkoutRoutineInput {
  name?: string;
}

export interface WorkoutSplitDayInput {
  day_of_week: number;
  routine_id?: WorkoutId | null;
  is_rest_day?: boolean;
  order_index?: number;
}

export interface WorkoutSplitDay {
  id: WorkoutId;
  split_id: WorkoutId;
  day_of_week: number;
  routine_id: WorkoutId | null;
  is_rest_day: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  routine: WorkoutRoutine | null;
}

export interface WorkoutSplit {
  id: WorkoutId;
  user_id: WorkoutId;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  days: WorkoutSplitDay[];
}

export interface CreateWorkoutSplitInput {
  name: string;
  description?: string;
  is_active?: boolean;
  days?: WorkoutSplitDayInput[];
}

export interface UpdateWorkoutSplitInput {
  name?: string;
  description?: string | null;
  is_active?: boolean;
  days?: WorkoutSplitDayInput[];
}

export interface DuplicateWorkoutSplitInput {
  name?: string;
}

export interface DuplicateWorkoutSplitDayInput {
  target_day_of_week: number;
  routine_name?: string;
  order_index?: number;
}

export interface DuplicateWorkoutSplitDayData extends Omit<WorkoutSplitDay, 'routine'> {
  routine: WorkoutRoutine | null;
}

export interface WorkoutSetExercise {
  id: WorkoutId;
  name: string;
  category: string;
  equipment?: string;
  difficulty?: string;
  image_url?: string | null;
}

export interface WorkoutSet {
  id: WorkoutId;
  session_id: WorkoutId;
  exercise_id: WorkoutId;
  set_number: number;
  weight_kg: number;
  reps: number;
  set_type: string;
  is_completed: boolean;
  created_at: string;
  completed_at: string | null;
  exercises?: WorkoutSetExercise | null;
}

export interface WorkoutExerciseProgress {
  routine_exercise_id: WorkoutId;
  exercise_id: WorkoutId;
  exercise: WorkoutExercise | null;
  target_sets: number;
  completed_sets: number;
  is_complete: boolean;
  next_set_number: number | null;
  target_reps_min: number;
  target_reps_max: number;
  rest_seconds: number;
  notes: string | null;
  order_index: number;
}

export interface WorkoutProgress {
  planned_exercises: number;
  completed_exercises: number;
  planned_sets: number;
  completed_sets: number;
  percentage: number;
  current_exercise: WorkoutExerciseProgress | null;
  exercise_progress: WorkoutExerciseProgress[];
}

export interface WorkoutSession {
  id: WorkoutId;
  user_id: WorkoutId;
  routine_id: WorkoutId | null;
  split_id: WorkoutId | null;
  split_day_id: WorkoutId | null;
  workout_date: string;
  notes: string | null;
  total_volume_kg: number;
  status: WorkoutSessionStatus;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface WorkoutSessionDetails extends WorkoutSession {
  routine: WorkoutRoutine | null;
  sets: WorkoutSet[];
  progress: WorkoutProgress;
}

export interface WorkoutSummary {
  duration_seconds: number | null;
  exercises_completed: number;
  exercises_planned: number;
  sets_completed: number;
  sets_planned: number;
  total_volume_kg: number;
}

export interface CompletedWorkoutSession extends WorkoutSessionDetails {
  summary?: WorkoutSummary;
}

export interface PreviousWorkoutSession {
  id: WorkoutId;
  user_id: WorkoutId;
  workout_date: string;
  status: WorkoutSessionStatus;
  started_at: string;
  completed_at: string | null;
}

export interface PreviousPerformanceData {
  session: PreviousWorkoutSession;
  sets: Array<
    Pick<
      WorkoutSet,
      | 'id'
      | 'session_id'
      | 'exercise_id'
      | 'set_number'
      | 'weight_kg'
      | 'reps'
      | 'set_type'
      | 'completed_at'
    >
  >;
}

export interface WorkoutTodayData {
  day_of_week: number;
  split: Omit<WorkoutSplit, 'days'> | null;
  split_day: Omit<WorkoutSplitDay, 'routine'> | null;
  routine: WorkoutRoutine | null;
  scheduled: boolean;
  is_rest_day: boolean;
}

export interface RecentWorkoutRoutine {
  id: WorkoutId;
  name: string;
}

export interface RecentWorkout {
  id: WorkoutId;
  routine_id: WorkoutId | null;
  workout_date: string;
  notes: string | null;
  total_volume_kg: number;
  status: WorkoutSessionStatus;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  workout_routines: RecentWorkoutRoutine | null;
}

export interface WorkoutOverviewData {
  day_of_week: number;
  today: Omit<WorkoutTodayData, 'day_of_week'>;
  active_session: WorkoutSessionDetails | null;
  recent_workouts: RecentWorkout[];
}

export interface StartWorkoutInput {
  routine_id?: WorkoutId;
  split_id?: WorkoutId;
  split_day_id?: WorkoutId;
  day_of_week?: number;
  workout_date?: string;
  notes?: string;
}

export interface LogWorkoutSetInput {
  exercise_id: WorkoutId;
  set_number: number;
  weight_kg?: number;
  reps?: number;
  set_type?: string;
}

export interface UpdateWorkoutSetInput {
  weight_kg?: number;
  reps?: number;
  set_type?: string;
  is_completed?: boolean;
}

export interface WorkoutRestInstruction {
  should_start: boolean;
  rest_seconds: number;
  reason: WorkoutRestReason;
}

export interface NextWorkoutExercise {
  routine_exercise_id: WorkoutId;
  exercise_id: WorkoutId;
  exercise: WorkoutExercise | null;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  rest_seconds: number;
  notes: string | null;
}

export interface LogWorkoutSetData {
  set: WorkoutSet;
  rest: WorkoutRestInstruction;
  exercise: WorkoutExerciseProgress | null;
  next_exercise: NextWorkoutExercise | null;
  workout: WorkoutProgress;
  total_volume_kg: number;
}

export interface UpdateWorkoutSetData {
  set: WorkoutSet;
  total_volume_kg: number;
  progress: WorkoutProgress;
}

export interface DeleteWorkoutSetData {
  total_volume_kg: number;
  progress: WorkoutProgress;
}

export interface CompleteWorkoutInput {
  notes?: string | null;
}

export interface BulkWorkoutSetInput {
  exercise_id: WorkoutId;
  set_number: number;
  weight_kg?: number;
  reps?: number;
  set_type?: string;
}

export interface LogWorkoutSessionInput {
  routine_id?: WorkoutId;
  workout_date?: string;
  notes?: string;
  sets: BulkWorkoutSetInput[];
}

export interface LogWorkoutSessionData {
  session_id: WorkoutId;
  workout_date: string;
  total_sets: number;
  total_volume_kg: number;
}

export interface WorkoutHistoryExercise {
  id: WorkoutId;
  name: string;
  category: string;
}

export interface WorkoutHistorySet {
  id: WorkoutId;
  exercise_id: WorkoutId;
  set_number: number;
  weight_kg: number;
  reps: number;
  set_type: string;
  is_completed: boolean;
  completed_at: string | null;
  exercises: WorkoutHistoryExercise | null;
}

export interface WorkoutHistoryItem {
  id: WorkoutId;
  routine_id: WorkoutId | null;
  split_id: WorkoutId | null;
  split_day_id: WorkoutId | null;
  workout_date: string;
  notes: string | null;
  total_volume_kg: number;
  status: WorkoutSessionStatus;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  workout_routines: RecentWorkoutRoutine | null;
  workout_sets: WorkoutHistorySet[];
}

export interface WorkoutHistoryQuery {
  status?: WorkoutSessionStatus | 'all';
  limit?: number;
  offset?: number;
}

export interface WorkoutPagination {
  limit: number;
  offset: number;
}

export interface WorkoutHistoryResponse {
  success: boolean;
  message?: string;
  data: WorkoutHistoryItem[];
  pagination: WorkoutPagination;
}

export type WorkoutExercisesResponse = WorkoutApiResponse<WorkoutExercise[]>;
export type CreateWorkoutExerciseResponse = WorkoutApiResponse<WorkoutExercise>;
export type PreviousPerformanceResponse = WorkoutApiResponse<PreviousPerformanceData | null>;

export type WorkoutRoutinesResponse = WorkoutApiResponse<WorkoutRoutine[]>;
export type WorkoutRoutineResponse = WorkoutApiResponse<WorkoutRoutine>;

export type WorkoutSplitsResponse = WorkoutApiResponse<WorkoutSplit[]>;
export type WorkoutSplitResponse = WorkoutApiResponse<WorkoutSplit>;
export type DuplicateWorkoutSplitDayResponse =
  WorkoutApiResponse<DuplicateWorkoutSplitDayData>;

export type WorkoutTodayResponse = WorkoutApiResponse<WorkoutTodayData>;
export type WorkoutOverviewResponse = WorkoutApiResponse<WorkoutOverviewData>;

export type WorkoutSessionResponse =
  WorkoutApiResponse<WorkoutSessionDetails | null>;
export type RequiredWorkoutSessionResponse =
  WorkoutApiResponse<WorkoutSessionDetails>;
export type WorkoutProgressResponse = WorkoutApiResponse<WorkoutProgress>;

export type LogWorkoutSetResponse = WorkoutApiResponse<LogWorkoutSetData>;
export type UpdateWorkoutSetResponse =
  WorkoutApiResponse<UpdateWorkoutSetData>;
export type DeleteWorkoutSetResponse =
  WorkoutApiResponse<DeleteWorkoutSetData>;

export type CompleteWorkoutResponse =
  WorkoutApiResponse<CompletedWorkoutSession>;
export type AbandonWorkoutResponse = WorkoutApiResponse<WorkoutSession>;

export type LogWorkoutSessionResponse =
  WorkoutApiResponse<LogWorkoutSessionData>;

export type WorkoutHistoryItemResponse =
  WorkoutApiResponse<CompletedWorkoutSession>;
