import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/mocks/server';
import { env } from '@/shared/lib/env';

import { USERS_FIXTURE_SIZE, usersFixture } from '../mocks';
import { fetchUsers } from './users.api';

describe('fetchUsers', () => {
  it('loads the whole dataset in one request and validates it', async () => {
    const response = await fetchUsers();

    expect(response.users).toHaveLength(USERS_FIXTURE_SIZE);
    expect(response.users.length).toBeGreaterThan(500);
    expect(response.total).toBe(usersFixture.length);
    expect(new Set(response.users.map((user) => user.id)).size).toBe(USERS_FIXTURE_SIZE);
  });

  it('rejects a payload that does not match the schema', async () => {
    server.use(
      http.get(env.VITE_USERS_API_URL, () => HttpResponse.json({ users: [{ id: 'nope' }] })),
    );

    await expect(fetchUsers()).rejects.toThrow();
  });
});
