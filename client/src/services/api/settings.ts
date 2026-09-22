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
} from '../types/settings';

export const BASE_URL =
  'http://localhost:5000/api/v1';

const AUTH_TOKEN_KEY =
  'fitpilot_token';

const getAuthToken = (): string => {
  const token =
    window.localStorage.getItem(
      AUTH_TOKEN_KEY,
    ) ??
    window.sessionStorage.getItem(
      AUTH_TOKEN_KEY,
    );

  if (!token) {
    throw new Error(
      'Authentication token not found. Please log in again.',
    );
  }

  return token;
};

const getAuthorizationHeaders =
  (): HeadersInit => ({
    Authorization: `Bearer ${getAuthToken()}`,
  });

const getJsonHeaders =
  (): HeadersInit => ({
    ...getAuthorizationHeaders(),
    'Content-Type':
      'application/json',
  });

interface ApiErrorBody {
  success?: boolean;
  message?: string;
  error?: string;
}

const parseResponse = async <T>(
  response: Response,
): Promise<T> => {
  const result = (await response
    .json()
    .catch(() => null)) as
    | (T & ApiErrorBody)
    | null;

  if (
    !response.ok ||
    !result?.success
  ) {
    throw new Error(
      result?.error ||
        result?.message ||
        `Settings request failed with status ${response.status}.`,
    );
  }

  return result;
};

const requestJson = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(
    `${BASE_URL}/settings${endpoint}`,
    {
      ...options,
      headers: {
        ...getJsonHeaders(),
        ...(options.headers ?? {}),
      },
    },
  );

  return parseResponse<T>(
    response,
  );
};

// -----------------------------------------------------------------------------
// Settings
// -----------------------------------------------------------------------------

export const getSettings =
  async (): Promise<SettingsResponse> =>
    requestJson<SettingsResponse>(
      '',
    );

// -----------------------------------------------------------------------------
// Profile
// -----------------------------------------------------------------------------

export const updateProfileSettings =
  async (
    input: UpdateProfileSettingsInput,
  ): Promise<SettingsUpdateResponse> =>
    requestJson<SettingsUpdateResponse>(
      '/profile',
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    );

// -----------------------------------------------------------------------------
// Avatar image
// -----------------------------------------------------------------------------

export const uploadSettingsAvatar =
  async (
    input: UploadSettingsAvatarInput,
  ): Promise<SettingsAvatarUpdateResponse> => {
    const formData = new FormData();

    formData.append(
      'avatar',
      input.file,
    );

    /*
     * Do not set Content-Type manually here.
     * The browser adds the multipart boundary.
     */
    const response = await fetch(
      `${BASE_URL}/settings/avatar`,
      {
        method: 'PATCH',
        headers:
          getAuthorizationHeaders(),
        body: formData,
      },
    );

    return parseResponse<SettingsAvatarUpdateResponse>(
      response,
    );
  };

export const removeSettingsAvatar =
  async (): Promise<SettingsAvatarUpdateResponse> => {
    const response = await fetch(
      `${BASE_URL}/settings/avatar`,
      {
        method: 'DELETE',
        headers:
          getAuthorizationHeaders(),
      },
    );

    return parseResponse<SettingsAvatarUpdateResponse>(
      response,
    );
  };

// -----------------------------------------------------------------------------
// Goals & nutrition
// -----------------------------------------------------------------------------

export const updateGoalSettings =
  async (
    input: UpdateGoalSettingsInput,
  ): Promise<SettingsUpdateResponse> =>
    requestJson<SettingsUpdateResponse>(
      '/goals',
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    );

// -----------------------------------------------------------------------------
// Preferences
// -----------------------------------------------------------------------------

export const updatePreferenceSettings =
  async (
    input: UpdatePreferenceSettingsInput,
  ): Promise<SettingsUpdateResponse> =>
    requestJson<SettingsUpdateResponse>(
      '/preferences',
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    );

// -----------------------------------------------------------------------------
// Password
// -----------------------------------------------------------------------------

export const changePassword =
  async (
    input: ChangePasswordInput,
  ): Promise<SettingsMessageResponse> =>
    requestJson<SettingsMessageResponse>(
      '/password',
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    );