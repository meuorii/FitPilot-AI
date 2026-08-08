import axios, { type AxiosInstance } from 'axios';
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
    const baseURL = env.HF_AI_SERVICE_URL.replace(/\/+$/, '');
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-internal-api-key': env.INTERNAL_API_KEY, // 👈 In-update dito mula 'x-internal-key'
      },
    });
  }

  async parseMeal(text: string): Promise<MealParseResponse> {
    try {
      return (await this.client.post<MealParseResponse>('/api/v1/ai/parse-meal', { text })).data;
    } catch (error) {
      const detail = axios.isAxiosError(error) ? error.response?.data : null;
      console.error('🔥 [AI Client - Meal Error]:', JSON.stringify(detail || (error instanceof Error ? error.message : error), null, 2));
      throw new Error(detail?.detail?.[0]?.msg || detail?.detail || 'Failed to parse meal input via AI service');
    }
  }

  async parseWorkout(text: string): Promise<WorkoutParseResponse> {
    try {
      return (await this.client.post<WorkoutParseResponse>('/api/v1/ai/parse-workout', { text })).data;
    } catch (error) {
      const detail = axios.isAxiosError(error) ? error.response?.data : null;
      console.error('🔥 [AI Client - Workout Error]:', JSON.stringify(detail || (error instanceof Error ? error.message : error), null, 2));
      throw new Error(detail?.detail?.[0]?.msg || detail?.detail || 'Failed to parse workout input via AI service');
    }
  }

  async coachChat(payload: CoachChatRequest): Promise<CoachChatResponse> {
    try {
      return (await this.client.post<CoachChatResponse>('/api/v1/ai/coach-chat', payload)).data;
    } catch (error) {
      const detail = axios.isAxiosError(error) ? error.response?.data : null;
      console.error('🔥 [AI Client - Coach Error]:', JSON.stringify(detail || (error instanceof Error ? error.message : error), null, 2));
      throw new Error(detail?.detail?.[0]?.msg || detail?.detail || 'Failed to generate response from AI Coach');
    }
  }
}

export const aiServiceClient = new AIServiceClient();