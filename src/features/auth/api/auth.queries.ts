import { queryOptions } from '@tanstack/react-query';

import { fetchAdminStats, fetchMe, fetchOrders } from './auth.api';

/**
 * Hierarchical keys. Every protected read is keyed by the user it was fetched for, so switching
 * accounts in the same tab never serves the previous user's data from the cache.
 */
export const authKeys = {
  all: ['auth'] as const,
  me: (userId: string) => [...authKeys.all, 'me', userId] as const,
  orders: (userId: string) => [...authKeys.all, 'orders', userId] as const,
  adminStats: (userId: string) => [...authKeys.all, 'admin-stats', userId] as const,
};

export function meQuery(userId: string) {
  return queryOptions({
    queryKey: authKeys.me(userId),
    queryFn: ({ signal }) => fetchMe(signal),
  });
}

export function ordersQuery(userId: string) {
  return queryOptions({
    queryKey: authKeys.orders(userId),
    queryFn: ({ signal }) => fetchOrders(signal),
  });
}

export function adminStatsQuery(userId: string) {
  return queryOptions({
    queryKey: authKeys.adminStats(userId),
    queryFn: ({ signal }) => fetchAdminStats(signal),
  });
}
