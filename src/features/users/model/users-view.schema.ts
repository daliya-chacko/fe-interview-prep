import { z } from 'zod';

import type { SortState } from '@/shared/components/data-table';

import { userGenderSchema } from './user.schema';

/** Columns the users table can be sorted by; the value stored in the URL's `sort` param. */
export const usersSortKeySchema = z.enum(['name', 'age', 'gender', 'email', 'city', 'company']);

export const USERS_PAGE_SIZES = [10, 25, 50] as const;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_DIRECTION = 'asc';

/**
 * The whole table view as it lives in the URL search params. Every field falls back to its
 * default on its own, so one bad value in a shared link does not throw the rest of the view away.
 */
export const usersViewSchema = z.object({
  sort: usersSortKeySchema.optional().catch(undefined),
  dir: z.enum(['asc', 'desc']).catch(DEFAULT_DIRECTION),
  q: z.string().catch(''),
  gender: userGenderSchema.optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(DEFAULT_PAGE),
  pageSize: z.coerce.number().pipe(z.literal(USERS_PAGE_SIZES)).catch(DEFAULT_PAGE_SIZE),
});

export type UsersSortKey = z.infer<typeof usersSortKeySchema>;
export type UsersView = z.infer<typeof usersViewSchema>;
export type UsersSort = SortState<UsersSortKey>;

export function parseUsersView(params: URLSearchParams): UsersView {
  return usersViewSchema.parse(Object.fromEntries(params));
}

/** The URL params for a view, leaving defaults out so shared links stay short. */
export function serializeUsersView(view: UsersView): Record<string, string> {
  const params: Record<string, string> = {};
  if (view.sort) {
    params.sort = view.sort;
    if (view.dir !== DEFAULT_DIRECTION) params.dir = view.dir;
  }
  if (view.q !== '') params.q = view.q;
  if (view.gender) params.gender = view.gender;
  if (view.page !== DEFAULT_PAGE) params.page = String(view.page);
  if (view.pageSize !== DEFAULT_PAGE_SIZE) params.pageSize = String(view.pageSize);
  return params;
}

export function toSortState(view: UsersView): UsersSort | undefined {
  return view.sort ? { key: view.sort, direction: view.dir } : undefined;
}
