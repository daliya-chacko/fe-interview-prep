import { http, HttpError, isHttpError, type RequestOptions } from '@/shared/lib/http';

import { type Session, sessionSchema } from '../model/auth.schema';
import { ACCESS_TOKEN_EXPIRY_LEEWAY_MS, isTokenExpired } from '../model/token';
import { useSessionStore } from '../store/session.store';

/**
 * Thrown when the session cannot be refreshed: the refresh token is missing, expired or rejected.
 * The store has already been cleared when this is thrown, so route guards redirect to login.
 *
 * It is an `HttpError` with status 401 so the app-wide query client treats it like any other
 * 4xx and does not retry a request the backend will keep refusing.
 */
export class SessionExpiredError extends HttpError {
  constructor(cause?: unknown) {
    super(401, 'Session expired', undefined);
    this.name = 'SessionExpiredError';
    this.cause = cause;
  }
}

export function isSessionExpiredError(error: unknown): error is SessionExpiredError {
  return error instanceof SessionExpiredError;
}

/** The refresh token is sent in the body; this call must never carry an expired bearer. */
async function requestRefresh(refreshToken: string): Promise<Session> {
  const payload = await http<unknown>('/auth/refresh', { method: 'POST', body: { refreshToken } });
  return sessionSchema.parse(payload);
}

/**
 * Single-flight refresh. The first caller starts the request and parks the promise here; every
 * caller that arrives while it is in flight gets the same promise instead of a second request.
 * The slot is emptied once the promise settles, so a later expiry starts a fresh refresh.
 */
let refreshInFlight: Promise<string> | null = null;

/** True while the store still holds the refresh token this round trip was started with. */
function isCurrentRefreshToken(refreshToken: string): boolean {
  return useSessionStore.getState().refreshToken === refreshToken;
}

async function performRefresh(): Promise<string> {
  const { refreshToken, setSession, clearSession } = useSessionStore.getState();
  if (refreshToken === null) {
    throw new SessionExpiredError();
  }
  let session: Session;
  try {
    session = await requestRefresh(refreshToken);
  } catch (error) {
    // A refresh that fails for any reason ends the session: there is no token left to try.
    // Unless the session already changed underneath (a logout or a new login during the round
    // trip), in which case that newer state wins and is left alone.
    if (isCurrentRefreshToken(refreshToken)) {
      clearSession();
    }
    throw new SessionExpiredError(error);
  }
  // A logout or a new login that happened while the request was in flight wins: applying the
  // stale result would silently sign the user back in.
  if (!isCurrentRefreshToken(refreshToken)) {
    throw new SessionExpiredError();
  }
  setSession(session);
  return session.accessToken;
}

/**
 * Obtains a new access token, sharing one in-flight request between concurrent callers.
 * Resolves with the fresh access token; rejects with `SessionExpiredError` after clearing the
 * store when the refresh token is gone or the backend refuses it.
 */
export function refreshSession(): Promise<string> {
  refreshInFlight ??= performRefresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

function withBearer(options: RequestOptions, accessToken: string): RequestOptions {
  return { ...options, headers: { ...options.headers, Authorization: `Bearer ${accessToken}` } };
}

/**
 * `http` for protected endpoints. It attaches the bearer token and keeps the session alive
 * without the caller noticing:
 *
 * 1. If the stored access token is missing or known to be expired, refresh before sending.
 * 2. If the backend still answers 401, refresh once and retry the request with the new token.
 * 3. Concurrent 401s share one refresh (`refreshSession`), so a burst of expired requests
 *    produces exactly one `/auth/refresh` call.
 *
 * When a request fails with 401 after another caller has already rotated the token, the fresh
 * token in the store is used directly rather than refreshing again.
 */
export async function authHttp<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const stored = useSessionStore.getState().accessToken;
  const accessToken =
    stored !== null && !isTokenExpired(stored, Date.now(), ACCESS_TOKEN_EXPIRY_LEEWAY_MS)
      ? stored
      : await refreshSession();

  try {
    return await http<T>(path, withBearer(options, accessToken));
  } catch (error) {
    if (!isHttpError(error, 401)) throw error;
    const current = useSessionStore.getState().accessToken;
    const fresh = current !== null && current !== accessToken ? current : await refreshSession();
    return http<T>(path, withBearer(options, fresh));
  }
}
