import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';

import { api } from '@/mocks/handlers';
import { server } from '@/mocks/server';
import { isHttpError } from '@/shared/lib/http';

import { adminAccount, adminStatsFixture, issueSession, regularAccount } from '../mocks';
import { ordersResponseSchema, type Session } from '../model/auth.schema';
import { decodeToken } from '../model/token';
import { resetSessionStore, SESSION_STORAGE_KEY, useSessionStore } from '../store/session.store';
import { authHttp, isSessionExpiredError, refreshSession } from './auth.client';

/** Counts `/auth/refresh` calls while letting them fall through to the real handler. */
function countRefreshCalls(): () => number {
  let calls = 0;
  server.use(
    http.post(api('/auth/refresh'), () => {
      calls += 1;
      return undefined;
    }),
  );
  return () => calls;
}

function signIn(session: Session): void {
  useSessionStore.getState().setSession(session);
}

/** A token whose claims look valid to the client but whose checksum the backend rejects. */
function corruptChecksum(token: string): string {
  const [payload] = token.split('.');
  return `${payload ?? ''}.00000000`;
}

async function failureOf(promise: Promise<unknown>): Promise<unknown> {
  return promise.then(
    () => undefined,
    (error: unknown) => error,
  );
}

describe('authHttp', () => {
  afterEach(() => {
    resetSessionStore();
  });

  it('sends the stored access token as a bearer and returns the payload', async () => {
    const session = issueSession(regularAccount.user);
    signIn(session);
    const refreshCalls = countRefreshCalls();
    let authorization: string | null = null;
    server.use(
      http.get(api('/me'), ({ request }) => {
        authorization = request.headers.get('authorization');
        return undefined;
      }),
    );

    await expect(authHttp('/me')).resolves.toEqual(regularAccount.user);

    expect(authorization).toBe(`Bearer ${session.accessToken}`);
    expect(refreshCalls()).toBe(0);
  });

  it('makes exactly one refresh call when three requests fire with an expired access token', async () => {
    const expired = issueSession(adminAccount.user, { accessTtlMs: -1 });
    signIn(expired);
    const refreshCalls = countRefreshCalls();

    const [me, orders, stats] = await Promise.all([
      authHttp('/me'),
      authHttp('/orders'),
      authHttp('/admin/stats'),
    ]);

    expect(refreshCalls()).toBe(1);
    expect(me).toEqual(adminAccount.user);
    expect(ordersResponseSchema.parse(orders).orders.length).toBeGreaterThan(0);
    expect(stats).toEqual(adminStatsFixture);

    const { accessToken, refreshToken, user } = useSessionStore.getState();
    expect(accessToken).not.toBe(expired.accessToken);
    expect(refreshToken).not.toBe(expired.refreshToken);
    expect(decodeToken(accessToken ?? '')?.exp).toBeGreaterThan(Date.now());
    expect(user).toEqual(adminAccount.user);
  });

  it('shares one refresh between concurrent 401s the client could not predict', async () => {
    const session = issueSession(regularAccount.user);
    signIn({ ...session, accessToken: corruptChecksum(session.accessToken) });
    const refreshCalls = countRefreshCalls();
    const bearers: string[] = [];
    server.use(
      http.get(api('/me'), ({ request }) => {
        bearers.push(request.headers.get('authorization') ?? '');
        return undefined;
      }),
      http.get(api('/orders'), ({ request }) => {
        bearers.push(request.headers.get('authorization') ?? '');
        return undefined;
      }),
    );

    const results = await Promise.all([authHttp('/me'), authHttp('/orders'), authHttp('/me')]);

    expect(refreshCalls()).toBe(1);
    expect(results[0]).toEqual(regularAccount.user);
    expect(results[2]).toEqual(regularAccount.user);
    // Three rejected attempts, then three retries that all carry the single rotated token.
    const fresh = useSessionStore.getState().accessToken;
    expect(bearers).toHaveLength(6);
    expect(bearers.slice(3)).toEqual(Array<string>(3).fill(`Bearer ${fresh ?? ''}`));
  });

  it('reuses a token another caller already rotated instead of refreshing again', async () => {
    const stale = issueSession(regularAccount.user);
    signIn({ ...stale, accessToken: corruptChecksum(stale.accessToken) });
    const refreshCalls = countRefreshCalls();

    await refreshSession();
    await expect(authHttp('/me')).resolves.toEqual(regularAccount.user);

    expect(refreshCalls()).toBe(1);
  });

  it('clears the session and throws when the refresh token is rejected', async () => {
    const session = issueSession(regularAccount.user, { accessTtlMs: -1, refreshTtlMs: -1 });
    signIn(session);
    const refreshCalls = countRefreshCalls();

    const error = await failureOf(authHttp('/me'));

    expect(isSessionExpiredError(error)).toBe(true);
    expect(isHttpError(error, 401)).toBe(true);
    expect(refreshCalls()).toBe(1);
    expect(useSessionStore.getState()).toMatchObject({
      accessToken: null,
      refreshToken: null,
      user: null,
    });
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).not.toContain(session.refreshToken);
  });

  it('fails without a network call when there is no refresh token at all', async () => {
    const refreshCalls = countRefreshCalls();

    const error = await failureOf(authHttp('/me'));

    expect(isSessionExpiredError(error)).toBe(true);
    expect(refreshCalls()).toBe(0);
  });

  it('passes a non-401 failure through untouched', async () => {
    signIn(issueSession(regularAccount.user));
    const refreshCalls = countRefreshCalls();

    const error = await failureOf(authHttp('/admin/stats'));

    expect(isHttpError(error, 403)).toBe(true);
    expect(refreshCalls()).toBe(0);
  });

  it('gives up after one retry when the backend keeps answering 401', async () => {
    signIn(issueSession(regularAccount.user));
    const refreshCalls = countRefreshCalls();
    let attempts = 0;
    server.use(
      http.get(api('/me'), () => {
        attempts += 1;
        return HttpResponse.json({ message: 'Nope' }, { status: 401 });
      }),
    );

    const error = await failureOf(authHttp('/me'));

    expect(isHttpError(error, 401)).toBe(true);
    expect(attempts).toBe(2);
    expect(refreshCalls()).toBe(1);
  });
});
