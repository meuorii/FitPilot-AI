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
  if (!raw) throw new ApiError('EXPO_PUBLIC_API_BASE_URL is missing.', 0, undefined, 'API_CONFIGURATION_ERROR');
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new ApiError('EXPO_PUBLIC_API_BASE_URL must be a valid absolute URL.', 0, undefined, 'API_CONFIGURATION_ERROR');
  }
  const normalizedPath = parsed.pathname.replace(/\/+$/, '');
  if (!normalizedPath.endsWith('/api/v1') || parsed.search || parsed.hash || parsed.username || parsed.password) {
    throw new ApiError('EXPO_PUBLIC_API_BASE_URL must be a credential-free Express API URL ending in /api/v1, without query or fragment.', 0, undefined, 'API_CONFIGURATION_ERROR');
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
    throw new ApiError('The API base URL must use HTTPS, except for local or private-LAN development hosts.', 0, undefined, 'API_CONFIGURATION_ERROR');
  }
  return `${parsed.origin}${normalizedPath}`;
}

function diagnosticPath(path: string) {
  return path.split(/[?#]/, 1)[0] || '/';
}

function logApiDiagnostic(details: { category: string; path: string; origin?: string; status?: number; reason?: string }) {
  if (!__DEV__) return;
  console.warn('[FitPilot API]', details);
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
  // Validate configuration before entering the transport catch; a bad URL is not a network failure.
  let baseUrl: string;
  try {
    baseUrl = apiBaseUrl();
  } catch (error) {
    logApiDiagnostic({
      category: 'configuration',
      path: diagnosticPath(path),
      reason: error instanceof Error ? error.message : 'Invalid API configuration',
    });
    throw error;
  }
  const requestUrl = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
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
      response = await fetch(requestUrl, {
        ...requestOptions,
        headers,
        body: requestBody,
        signal: controller.signal,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      const reason = error instanceof Error ? error.name : 'UnknownError';
      if (timedOut) {
        logApiDiagnostic({ category: 'timeout', origin: new URL(baseUrl).origin, path: diagnosticPath(path), reason });
        throw new ApiError('The request timed out.', 0, undefined, 'TIMEOUT');
      }
      logApiDiagnostic({ category: 'transport', origin: new URL(baseUrl).origin, path: diagnosticPath(path), reason });
      throw new ApiError('The request could not reach the configured server.', 0, undefined, 'NETWORK_ERROR');
    }
    let responseText: string;
    try {
      responseText = await response.text();
    } catch (error) {
      if (signal?.aborted) throw error;
      const reason = error instanceof Error ? error.name : 'UnknownError';
      if (timedOut) {
        logApiDiagnostic({ category: 'timeout', origin: new URL(baseUrl).origin, path: diagnosticPath(path), reason });
        throw new ApiError('The request timed out.', 0, undefined, 'TIMEOUT');
      }
      logApiDiagnostic({ category: 'transport', origin: new URL(baseUrl).origin, path: diagnosticPath(path), reason });
      throw new ApiError('The server response could not be received completely.', 0, undefined, 'NETWORK_ERROR');
    }
    let responseBody: unknown;
    if (responseText) {
      try { responseBody = JSON.parse(responseText) as unknown; }
      catch { responseBody = responseText; }
    }

    if (!response.ok) {
      const fields = getErrorFields(responseBody);
      logApiDiagnostic({ category: 'http', origin: new URL(baseUrl).origin, path: diagnosticPath(path), status: response.status });
      if (response.status === 401 && requestToken && unauthorizedHandler) {
        await Promise.resolve(unauthorizedHandler(requestToken)).catch(() => undefined);
      }
      throw new ApiError(fields.message ?? `The request failed (${response.status}).`, response.status, responseBody, fields.code);
    }
    if (!responseText) return undefined as T;
    if (typeof responseBody === 'string') {
      logApiDiagnostic({ category: 'response', origin: new URL(baseUrl).origin, path: diagnosticPath(path), status: response.status });
      throw new ApiError('The server returned an unreadable response.', response.status, responseBody, 'INVALID_RESPONSE');
    }
    return responseBody as T;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', relayAbort);
  }
}
