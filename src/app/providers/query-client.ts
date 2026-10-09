import { QueryClient } from '@tanstack/react-query';

import { isHttpError } from '@/shared/lib/http';

/** Retry transient failures only; a 4xx will not fix itself on retry. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isHttpError(error) && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
