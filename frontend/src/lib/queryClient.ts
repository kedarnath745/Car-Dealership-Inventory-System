import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api';

/**
 * Client errors (4xx) will not fix themselves, so only network and server errors are
 * retried, once, after a short pause; after that the UI shows its error state with Try Again.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 1;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        retryDelay: 800,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
      mutations: { retry: false },
    },
  });
}
