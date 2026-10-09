import { queryOptions } from '@tanstack/react-query';

import { fetchUsers } from './users.api';

/** Hierarchical keys: `all` prefixes every users query so the whole family can be invalidated. */
export const usersKeys = {
  all: ['users'] as const,
  list: () => [...usersKeys.all, 'list'] as const,
};

/**
 * The full users list. Sort, search, filters and paging happen on the client, so none of them is
 * part of the key: one cache entry serves every view.
 */
export function usersListQuery() {
  return queryOptions({
    queryKey: usersKeys.list(),
    queryFn: ({ signal }) => fetchUsers({ signal }),
  });
}
