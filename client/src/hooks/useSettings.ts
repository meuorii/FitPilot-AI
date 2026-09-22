import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  changePassword,
  getSettings,
  updateGoalSettings,
  removeSettingsAvatar,
  updatePreferenceSettings,
  updateProfileSettings,
  uploadSettingsAvatar,
} from '../services/api/settings'
import type {
  ChangePasswordInput,
  SettingsAvatarUpdateResponse,
  SettingsMessageResponse,
  SettingsResponse,
  SettingsUpdateResponse,
  UpdateGoalSettingsInput,
  UpdatePreferenceSettingsInput,
  UpdateProfileSettingsInput,
  UploadSettingsAvatarInput,
} from '../services/types/settings'
import { coachQueryKeys } from './useCoach'
import { dashboardQueryKey } from './useDashboard'
import { mealQueryKeys } from './useMeal'
import { progressQueryKeys } from './useProgress'
import { workoutQueryKeys } from './useWorkout'

export const settingsQueryKeys = {
  all: ['settings'] as const,
  detail: () =>
    [
      ...settingsQueryKeys.all,
      'detail',
    ] as const,
}

export const useSettings = () =>
  useQuery<SettingsResponse, Error>({
    queryKey:
      settingsQueryKeys.detail(),
    queryFn: getSettings,
    staleTime: 30_000,
  })

const updateSettingsCache = (
  queryClient: ReturnType<
    typeof useQueryClient
  >,
  response: SettingsUpdateResponse,
) => {
  queryClient.setQueryData<SettingsResponse>(
    settingsQueryKeys.detail(),
    {
      success: true,
      data: response.data,
    },
  )
}

export const useUpdateProfileSettings =
  () => {
    const queryClient =
      useQueryClient()

    return useMutation<
      SettingsUpdateResponse,
      Error,
      UpdateProfileSettingsInput
    >({
      mutationFn:
        updateProfileSettings,
      onSuccess: async (
        response,
        input,
      ) => {
        updateSettingsCache(
          queryClient,
          response,
        )

        const invalidations = [
          queryClient.invalidateQueries({
            queryKey:
              dashboardQueryKey,
          }),
          queryClient.invalidateQueries({
            queryKey:
              coachQueryKeys.context(),
          }),
        ]

        if (
          input.current_weight_kg !==
          undefined
        ) {
          invalidations.push(
            queryClient.invalidateQueries({
              queryKey:
                progressQueryKeys.overview(),
            }),
            queryClient.invalidateQueries({
              queryKey:
                progressQueryKeys.logsRoot(),
            }),
          )
        }

        await Promise.all(
          invalidations,
        )
      },
    })
  }


const syncAvatarMutation = async (
  queryClient: ReturnType<
    typeof useQueryClient
  >,
  response: SettingsAvatarUpdateResponse,
) => {
  updateSettingsCache(
    queryClient,
    response,
  )

  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: dashboardQueryKey,
    }),
    queryClient.invalidateQueries({
      queryKey:
        coachQueryKeys.context(),
    }),
  ])
}

export const useUploadSettingsAvatar =
  () => {
    const queryClient =
      useQueryClient()

    return useMutation<
      SettingsAvatarUpdateResponse,
      Error,
      UploadSettingsAvatarInput
    >({
      mutationFn:
        uploadSettingsAvatar,
      onSuccess: async (
        response,
      ) =>
        syncAvatarMutation(
          queryClient,
          response,
        ),
    })
  }

export const useRemoveSettingsAvatar =
  () => {
    const queryClient =
      useQueryClient()

    return useMutation<
      SettingsAvatarUpdateResponse,
      Error,
      void
    >({
      mutationFn:
        removeSettingsAvatar,
      onSuccess: async (
        response,
      ) =>
        syncAvatarMutation(
          queryClient,
          response,
        ),
    })
  }

export const useUpdateGoalSettings =
  () => {
    const queryClient =
      useQueryClient()

    return useMutation<
      SettingsUpdateResponse,
      Error,
      UpdateGoalSettingsInput
    >({
      mutationFn:
        updateGoalSettings,
      onSuccess: async (
        response,
      ) => {
        updateSettingsCache(
          queryClient,
          response,
        )

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey:
              dashboardQueryKey,
          }),
          queryClient.invalidateQueries({
            queryKey:
              coachQueryKeys.context(),
          }),
          queryClient.invalidateQueries({
            queryKey:
              mealQueryKeys.today(),
          }),
          queryClient.invalidateQueries({
            queryKey:
              progressQueryKeys.overview(),
          }),
        ])
      },
    })
  }

export const useUpdatePreferenceSettings =
  () => {
    const queryClient =
      useQueryClient()

    return useMutation<
      SettingsUpdateResponse,
      Error,
      UpdatePreferenceSettingsInput
    >({
      mutationFn:
        updatePreferenceSettings,
      onSuccess: async (
        response,
      ) => {
        updateSettingsCache(
          queryClient,
          response,
        )

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey:
              dashboardQueryKey,
          }),
          queryClient.invalidateQueries({
            queryKey:
              coachQueryKeys.context(),
          }),
          queryClient.invalidateQueries({
            queryKey:
              workoutQueryKeys.all,
          }),
          queryClient.invalidateQueries({
            queryKey:
              progressQueryKeys.overview(),
          }),
        ])
      },
    })
  }

export const useChangePassword =
  () =>
    useMutation<
      SettingsMessageResponse,
      Error,
      ChangePasswordInput
    >({
      mutationFn: changePassword,
    })