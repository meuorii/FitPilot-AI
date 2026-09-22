import type {
  CoachChatErrorResponse,
  CoachChatRequest,
  CoachChatResponse,
  CoachContextErrorResponse,
  CoachContextResponse,
} from '../types/coach';

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

const getCoachHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`,
  'x-timezone-offset-minutes': String(
    -new Date().getTimezoneOffset(),
  ),
});

// -----------------------------------------------------------------------------
// Coach Context
// -----------------------------------------------------------------------------

export const getCoachContext = async (): Promise<CoachContextResponse> => {
  const response = await fetch(`${BASE_URL}/coach/context`, {
    method: 'GET',
    headers: getCoachHeaders(),
  });

  const result = (await response.json().catch(() => null)) as
    | CoachContextResponse
    | CoachContextErrorResponse
    | null;

  if (!response.ok || !result?.success) {
    const errorMessage =
      result && 'error' in result
        ? result.error
        : `Coach context request failed with status ${response.status}.`;

    throw new Error(errorMessage);
  }

  return result;
};

// -----------------------------------------------------------------------------
// Coach Chat
// -----------------------------------------------------------------------------

export const sendCoachMessage = async (
  input: CoachChatRequest,
): Promise<CoachChatResponse> => {
  const message = input.message.trim();

  if (!message) {
    throw new Error('Message is required.');
  }

  const response = await fetch(`${BASE_URL}/coach/chat`, {
    method: 'POST',
    headers: getCoachHeaders(),
    body: JSON.stringify({
      message,
      history: input.history ?? [],
    }),
  });

  const result = (await response.json().catch(() => null)) as
    | CoachChatResponse
    | CoachChatErrorResponse
    | null;

  if (!response.ok) {
    const errorMessage =
      result && 'error' in result
        ? result.error
        : `Coach request failed with status ${response.status}.`;

    throw new Error(errorMessage);
  }

  if (!result || !('reply' in result) || typeof result.reply !== 'string') {
    throw new Error('Invalid response received from the AI Coach.');
  }

  return result;
};