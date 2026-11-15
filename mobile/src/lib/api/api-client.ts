import { secureTokenStore } from '@/lib/auth/secure-token-store';

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly responseBody?: unknown;

  constructor(message: string, status: number, responseBody?: unknown, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.responseBody = responseBody;
    this.code = code;
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body' | 'signal'> & {
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  authenticated?: boolean;
};

type UnauthorizedHandler = (token: string) => Promise<void> | void;
let unauthorizedHandler: UnauthorizedHandler | undefined;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | undefined) {
  unauthorizedHandler = handler;
}

function apiBaseUrl() {
  const raw = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!raw) throw new Error('Set EXPO_PUBLIC_API_BASE_URL to the Express API base URL before making requests.');
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('EXPO_PUBLIC_API_BASE_URL must be a valid absolute URL.');
  }
  const normalizedPath = parsed.pathname.replace(/\/+$/, '');
  if (!normalizedPath.endsWith('/api/v1') || parsed.search || parsed.hash) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL must point to the Express API prefix and end in /api/v1.');
  }
  const host = parsed.hostname.replace(/^\[|\]$/g, '');
  const localHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const ipv4Parts = host.split('.').map(Number);
  const isIpv4 = ipv4Parts.length === 4 && ipv4Parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255);
  const privateIpv4 = isIpv4 && (
    ipv4Parts[0] === 10 ||
    (ipv4Parts[0] === 192 && ipv4Parts[1] === 168) ||
    (ipv4Parts[0] === 172 && ipv4Parts[1] >= 16 && ipv4Parts[1] <= 31)
  );
  if (parsed.protocol !== 'https:' && !(__DEV__ && (localHost || privateIpv4))) {
    throw new Error('The API base URL must use HTTPS, except for local or private-LAN development hosts.');
  }
  return `${parsed.origin}${normalizedPath}`;
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function getErrorFields(body: unknown): { message?: string; code?: string } {
  if (!body || typeof body !== 'object') return {};
  const value = body as Record<string, unknown>;
  const candidate = typeof value.message === 'string' ? value.message : undefined;
  return { message: candidate, code: typeof value.code === 'string' ? value.code : undefined };
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, signal, timeoutMs = 15_000, authenticated = true, headers: inputHeaders, ...requestOptions } = options;
  const controller = new AbortController();
  let requestToken: string | null = null;
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort(new Error('Request timed out.'));
  }, timeoutMs);
  const relayAbort = () => controller.abort(signal?.reason);
  if (signal?.aborted) controller.abort(signal.reason);
  else signal?.addEventListener('abort', relayAbort, { once: true });

  try {
    const headers = new Headers(inputHeaders);
    headers.set('Accept', 'application/json');
    headers.set('x-timezone-offset-minutes', String(-new Date().getTimezoneOffset()));
    if (authenticated) {
      requestToken = await secureTokenStore.get();
      if (requestToken) headers.set('Authorization', `Bearer ${requestToken}`);
    }

    let requestBody: BodyInit | undefined;
    if (body !== undefined && body !== null) {
      if (isFormData(body) || typeof body === 'string') {
        requestBody = body;
      } else {
        requestBody = JSON.stringify(body);
        headers.set('Content-Type', 'application/json');
      }
    }

    let response: Response;
    try {
      response = await fetch(`${apiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
        ...requestOptions,
        headers,
        body: requestBody,
        signal: controller.signal,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      if (timedOut) throw new ApiError('The request timed out. Try again when your connection is stable.', 0, undefined, 'TIMEOUT');
      throw new ApiError('Unable to reach FitPilot. Check your connection and try again.', 0, undefined, 'NETWORK_ERROR');
    }
    const responseText = await response.text();
    let responseBody: unknown;
    if (responseText) {
      try { responseBody = JSON.parse(responseText) as unknown; }
      catch { responseBody = responseText; }
    }

    if (!response.ok) {
      const fields = getErrorFields(responseBody);
      if (response.status === 401 && requestToken && unauthorizedHandler) {
        await Promise.resolve(unauthorizedHandler(requestToken)).catch(() => undefined);
      }
      throw new ApiError(fields.message ?? `The request failed (${response.status}).`, response.status, responseBody, fields.code);
    }
    if (!responseText) return undefined as T;
    if (typeof responseBody === 'string') throw new ApiError('The server returned an unreadable response.', response.status, responseBody);
    return responseBody as T;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', relayAbort);
  }
}
