import { describe, expect, it } from 'vitest';

import { http, isHttpError } from '@/shared/lib/http';

import { adminAccount, adminStatsFixture, issueSession, regularAccount } from './mocks';
import { ordersResponseSchema, type Session, sessionSchema } from './model/auth.schema';
import { decodeToken } from './model/token';

function bearer(accessToken: string) {
  return { headers: { Authorization: `Bearer ${accessToken}` } };
}

async function statusOf(promise: Promise<unknown>): Promise<number | undefined> {
  const error = await promise.catch((caught: unknown) => caught);
  return isHttpError(error) ? error.status : undefined;
}

describe('auth mock backend', () => {
  it('logs a seeded account in and issues a token pair for it', async () => {
    const { user, password } = regularAccount;
    const payload = await http<unknown>('/auth/login', {
      method: 'POST',
      body: { email: user.email, password },
    });

    const session = sessionSchema.parse(payload);
    expect(session.user).toEqual(user);
    expect(decodeToken(session.accessToken)?.kind).toBe('access');
    expect(decodeToken(session.refreshToken)?.kind).toBe('refresh');
  });

  it('rejects wrong credentials with 401', async () => {
    const request = http('/auth/login', {
      method: 'POST',
      body: { email: regularAccount.user.email, password: 'nope' },
    });

    await expect(statusOf(request)).resolves.toBe(401);
  });

  it('rotates both tokens on refresh and rejects an expired refresh token', async () => {
    const expired = issueSession(regularAccount.user, { refreshTtlMs: -1 });
    const live = issueSession(regularAccount.user);

    await expect(
      statusOf(
        http('/auth/refresh', {
          method: 'POST',
          body: { refreshToken: expired.refreshToken },
        }),
      ),
    ).resolves.toBe(401);

    const rotated = sessionSchema.parse(
      await http<Session>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken: live.refreshToken },
      }),
    );
    expect(rotated.accessToken).not.toBe(live.accessToken);
    expect(rotated.refreshToken).not.toBe(live.refreshToken);
    expect(rotated.user).toEqual(regularAccount.user);
  });

  it('serves protected resources only to a valid access token', async () => {
    const expired = issueSession(regularAccount.user, { accessTtlMs: -1 });
    const live = issueSession(regularAccount.user);

    await expect(statusOf(http('/me'))).resolves.toBe(401);
    await expect(statusOf(http('/me', bearer(expired.accessToken)))).resolves.toBe(401);
    await expect(http('/me', bearer(live.accessToken))).resolves.toEqual(regularAccount.user);
    const orders = ordersResponseSchema.parse(await http('/orders', bearer(live.accessToken)));
    expect(orders.orders.map((order) => order.item)).toContain('Blue Mug');
  });

  it('serves admin stats to admins only', async () => {
    const user = issueSession(regularAccount.user);
    const admin = issueSession(adminAccount.user);

    await expect(statusOf(http('/admin/stats', bearer(user.accessToken)))).resolves.toBe(403);
    await expect(http('/admin/stats', bearer(admin.accessToken))).resolves.toEqual(
      adminStatsFixture,
    );
  });
});
