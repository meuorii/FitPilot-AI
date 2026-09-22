import { useMutation, useQuery } from '@tanstack/react-query'

import {
  getCoachContext,
  sendCoachMessage,
} from '../services/api/coach'
import type {
  CoachChatRequest,
  CoachChatResponse,
  CoachContextResponse,
} from '../services/types/coach'

export const coachQueryKeys = {
  all: ['coach'] as const,
  context: () => [...coachQueryKeys.all, 'context'] as const,
}

export const useCoachContext = () =>
  useQuery<CoachContextResponse, Error>({
    queryKey: coachQueryKeys.context(),
    queryFn: getCoachContext,
    staleTime: 30_000,
  })

export const useSendCoachMessage = () =>
  useMutation<CoachChatResponse, Error, CoachChatRequest>({
    mutationFn: sendCoachMessage,
  })
