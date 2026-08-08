import axios, { type  AxiosInstance } from 'axios';
import { env } from '../config/env.js';

export interface MealItem { name: string; quantity: number; unit: string; calories: number; protein: number; carbs: number; fat: number; }
export interface MealParseResponse { foods: MealItem[]; totalCalories: number; protein: number; carbs: number; fat: number; }

export interface ExerciseSet { reps: number; weightKg: number; }
export interface ExerciseItem { exerciseName: string; sets: ExerciseSet[]; }
export interface WorkoutParseResponse { exercises: ExerciseItem[]; estimatedDurationMinutes: number; }

export interface UserContext { dailyCalorieGoal?: number; dailyProteinGoal?: number; consumedCaloriesToday?: number; consumedProteinToday?: number; recentWorkoutsSummary?: string; fitnessGoal?: string; }
export interface CoachChatMessage { role: 'user' | 'assistant'; content: string; }
export interface CoachChatRequest { message: string; history?: CoachChatMessage[]; context?: UserContext; }
export interface CoachChatResponse { reply: string; }

class AIServiceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({ baseURL: env.HF_AI_SERVICE_URL, timeout: 30000, headers: { 'Content-Type': 'application/json', 'x-internal-key': env.INTERNAL_API_KEY } });
  }

  async parseMeal(text: string): Promise<MealParseResponse> {
    try {
      return (await this.client.post<MealParseResponse>('/api/v1/ai/parse-meal', { text })).data;
    } catch (error) {
      console.error('🔥 [AI Client - Meal Error]:', axios.isAxiosError(error) ? error.response?.data : error);
      throw new Error(axios.isAxiosError(error) ? error.response?.data?.detail : 'Failed to parse meal input via AI service');
    }
  }

  async parseWorkout(text: string): Promise<WorkoutParseResponse> {
    try {
      return (await this.client.post<WorkoutParseResponse>('/api/v1/ai/parse-workout', { text })).data;
    } catch (error) {
      console.error('🔥 [AI Client - Workout Error]:', axios.isAxiosError(error) ? error.response?.data : error);
      throw new Error(axios.isAxiosError(error) ? error.response?.data?.detail : 'Failed to parse workout input via AI service');
    }
  }

  async coachChat(payload: CoachChatRequest): Promise<CoachChatResponse> {
    try {
      return (await this.client.post<CoachChatResponse>('/api/v1/ai/coach-chat', payload)).data;
    } catch (error) {
      console.error('🔥 [AI Client - Coach Error]:', axios.isAxiosError(error) ? error.response?.data : error);
      throw new Error(axios.isAxiosError(error) ? error.response?.data?.detail : 'Failed to generate response from AI Coach');
    }
  }
}

export const aiServiceClient = new AIServiceClient();