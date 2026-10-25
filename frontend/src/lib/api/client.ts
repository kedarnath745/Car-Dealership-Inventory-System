import type { FieldError } from './types';

/** An error response from the API (or a network failure, with status 0). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: FieldError[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  getToken: () => string | null;
  /** Called when a request that carried a token is rejected with 401 (expired session). */
  onUnauthorized?: () => void;
}

export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  delete<T = void>(path: string): Promise<T>;
}

const NETWORK_MESSAGE = "Couldn't reach the server. Check your connection and try again.";

interface ErrorBody {
  error?: { code?: string; message?: string; details?: FieldError[] };
}

/** A small fetch wrapper: JSON in and out, bearer auth, and one error type for callers. */
export function createApiClient({
  baseUrl,
  getToken,
  onUnauthorized,
}: ApiClientOptions): ApiClient {
  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    let response: Response;
    try {
      response = await fetch(new URL(path, baseUrl), {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(0, 'NETWORK_ERROR', NETWORK_MESSAGE);
    }

    if (response.status === 204) return undefined as T;

    const data: unknown = await response.json().catch(() => null);
    if (response.ok) return data as T;

    if (response.status === 401 && token) onUnauthorized?.();
    const error = (data as ErrorBody | null)?.error;
    throw new ApiError(
      response.status,
      error?.code ?? 'HTTP_ERROR',
      error?.message ?? `Something went wrong (${response.status}). Please try again.`,
      error?.details,
    );
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    delete: (path) => request('DELETE', path),
  };
}
