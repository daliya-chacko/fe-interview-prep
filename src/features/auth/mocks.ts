import { http, HttpResponse, type RequestHandler } from 'msw';

import { env } from '@/shared/lib/env';

import {
  type AdminStats,
  loginRequestSchema,
  type Order,
  refreshRequestSchema,
  type Session,
  type User,
} from './model/auth.schema';
import {
  ACCESS_TOKEN_TTL_MS,
  encodeToken,
  REFRESH_TOKEN_TTL_MS,
  type TokenKind,
  verifyToken,
} from './model/token';

/**
 * Same prefixing as `api()` in `src/mocks/handlers.ts`. Redefined here because that module
 * spreads this one in, so importing it back would create a cycle.
 */
const api = (path: string) => `${env.VITE_API_BASE_URL.replace(/\/+$/, '')}${path}`;

export type SeededAccount = {
  user: User;
  /** Demo credential for a mocked backend; it is shown on the login page on purpose. */
  password: string;
};

/** Two demo accounts: one admin, one regular user. Passwords are printed on the login page. */
export const adminAccount: SeededAccount = {
  user: { id: 'u-admin', name: 'Ada Admin', email: 'admin@example.com', role: 'admin' },
  password: 'admin123',
};

export const regularAccount: SeededAccount = {
  user: { id: 'u-user', name: 'Uma User', email: 'user@example.com', role: 'user' },
  password: 'user123',
};

export const seededAccounts: readonly SeededAccount[] = [adminAccount, regularAccount];

const ordersByUser: Record<string, Order[]> = {
  'u-admin': [
    { id: 'o-1001', item: 'Mechanical keyboard', total: 149, placedAt: '2026-09-02' },
    { id: 'o-1002', item: 'Monitor arm', total: 79, placedAt: '2026-09-18' },
  ],
  'u-user': [
    { id: 'o-2001', item: 'React Handbook', total: 29, placedAt: '2026-08-11' },
    { id: 'o-2002', item: 'Blue Mug', total: 12, placedAt: '2026-09-25' },
    { id: 'o-2003', item: 'Red Notebook', total: 9, placedAt: '2026-10-01' },
  ],
};

export const adminStatsFixture: AdminStats = { users: 2, orders: 5, revenue: 278 };

export type IssueSessionOptions = {
  /** Override the access token lifetime; negative values issue an already-expired token. */
  accessTtlMs?: number;
  refreshTtlMs?: number;
  now?: number;
};

/** Issues a fresh token pair for `user`. Exported so tests can mint tokens with chosen lifetimes. */
export function issueSession(
  user: User,
  {
    accessTtlMs = ACCESS_TOKEN_TTL_MS,
    refreshTtlMs = REFRESH_TOKEN_TTL_MS,
    now = Date.now(),
  }: IssueSessionOptions = {},
): Session {
  const issue = (kind: TokenKind, ttlMs: number) =>
    encodeToken({ sub: user.id, kind, exp: now + ttlMs, jti: crypto.randomUUID() });
  return {
    accessToken: issue('access', accessTtlMs),
    refreshToken: issue('refresh', refreshTtlMs),
    user,
  };
}

function findUser(id: string): User | undefined {
  return seededAccounts.find((account) => account.user.id === id)?.user;
}

function unauthorized(message = 'Unauthorized') {
  return HttpResponse.json({ message }, { status: 401 });
}

/** Resolves the bearer of an `Authorization` header to a seeded user, or `undefined`. */
function authenticate(request: Request): User | undefined {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  const claims = token ? verifyToken(token, 'access') : null;
  return claims ? findUser(claims.sub) : undefined;
}

async function readJson(request: Request): Promise<unknown> {
  return request.json().catch(() => undefined);
}

/**
 * Stateless mock backend: tokens carry everything the handlers need, so a refresh token is valid
 * until it expires and nothing is revoked on logout. Each refresh rotates both tokens.
 */
export const authHandlers: RequestHandler[] = [
  http.post(api('/auth/login'), async ({ request }) => {
    const body = loginRequestSchema.safeParse(await readJson(request));
    if (!body.success) {
      return HttpResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }
    const account = seededAccounts.find(
      ({ user, password }) => user.email === body.data.email && password === body.data.password,
    );
    if (!account) return unauthorized('Incorrect email or password');
    return HttpResponse.json(issueSession(account.user));
  }),

  http.post(api('/auth/refresh'), async ({ request }) => {
    const body = refreshRequestSchema.safeParse(await readJson(request));
    const claims = body.success ? verifyToken(body.data.refreshToken, 'refresh') : null;
    const user = claims ? findUser(claims.sub) : undefined;
    if (!user) return unauthorized('Refresh token is invalid or expired');
    return HttpResponse.json(issueSession(user));
  }),

  http.get(api('/me'), ({ request }) => {
    const user = authenticate(request);
    if (!user) return unauthorized();
    return HttpResponse.json(user);
  }),

  http.get(api('/orders'), ({ request }) => {
    const user = authenticate(request);
    if (!user) return unauthorized();
    return HttpResponse.json({ orders: ordersByUser[user.id] ?? [] });
  }),

  http.get(api('/admin/stats'), ({ request }) => {
    const user = authenticate(request);
    if (!user) return unauthorized();
    if (user.role !== 'admin') {
      return HttpResponse.json({ message: 'Admins only' }, { status: 403 });
    }
    return HttpResponse.json(adminStatsFixture);
  }),
];
