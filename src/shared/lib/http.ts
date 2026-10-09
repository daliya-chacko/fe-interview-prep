import { env } from './env';

/** Thrown for any non-2xx response. `body` is the parsed JSON payload when available. */
export class HttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, statusText: string, body: unknown) {
    super(`Request failed with status ${status}${statusText ? ` (${statusText})` : ''}`);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

export function isHttpError(error: unknown, status?: number): error is HttpError {
  return error instanceof HttpError && (status === undefined || error.status === status);
}

type SearchParamValue = string | number | boolean | undefined;

export type RequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  /** Serialised as JSON. */
  body?: unknown;
  headers?: Record<string, string>;
  /** `undefined` and empty-string values are omitted. */
  searchParams?: Record<string, SearchParamValue>;
};

function resolveBaseUrl(): string {
  const base = env.VITE_API_BASE_URL;
  if (/^https?:\/\//.test(base)) return base;
  // Relative base: resolve against the current origin so that `fetch` receives an absolute URL
  // in every runtime (browsers accept relative URLs, Node's fetch does not).
  return new URL(base, window.location.origin).toString();
}

export function buildUrl(path: string, searchParams?: Record<string, SearchParamValue>): string {
  const base = resolveBaseUrl().replace(/\/+$/, '');
  const url = new URL(`${base}/${path.replace(/^\/+/, '')}`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Minimal JSON-over-fetch client. Callers are expected to validate the returned payload
 * (for example with a zod schema) at the API boundary rather than trusting the `T` cast.
 */
export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, searchParams, ...init } = options;

  const response = await fetch(buildUrl(path, searchParams), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload: unknown =
    response.status === 204 ? undefined : await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new HttpError(response.status, response.statusText, payload);
  }

  return payload as T;
}
