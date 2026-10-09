import { http, HttpResponse, type RequestHandler } from 'msw';

import { searchHandlers } from '@/features/search/mocks';
import { usersHandlers } from '@/features/users/mocks';
import { env } from '@/shared/lib/env';

/** Prefixes a path with the configured API base so handlers follow `VITE_API_BASE_URL`. */
export const api = (path: string) => `${env.VITE_API_BASE_URL.replace(/\/+$/, '')}${path}`;

/**
 * Request handlers shared by the browser worker (development) and the Node server (tests).
 * Keep feature handlers next to their feature (e.g. `src/features/<name>/mocks.ts`) and
 * spread them into this list.
 */
export const handlers: RequestHandler[] = [
  http.get(api('/health'), () => HttpResponse.json({ status: 'ok' })),
  ...searchHandlers,
  ...usersHandlers,
];
