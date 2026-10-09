import { env } from '@/shared/lib/env';
import { http } from '@/shared/lib/http';

import { type UsersResponse, usersResponseSchema } from '../model/user.schema';

export type FetchUsersOptions = {
  /** Aborts the in-flight request when the caller no longer needs its result. */
  signal?: AbortSignal;
};

/**
 * Loads the whole users dataset in one request (`limit=0` is DummyJSON's "no limit") so the
 * table can sort, filter and page on the client, and validates the payload at the boundary.
 */
export async function fetchUsers({ signal }: FetchUsersOptions = {}): Promise<UsersResponse> {
  const payload = await http<unknown>(env.VITE_USERS_API_URL, {
    searchParams: { limit: 0 },
    signal,
  });
  return usersResponseSchema.parse(payload);
}
