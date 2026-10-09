import { queryOptions } from '@tanstack/react-query';

import { searchProducts } from './search.api';

/** Hierarchical keys: `all` prefixes every search so the whole family can be invalidated. */
export const searchKeys = {
  all: ['search'] as const,
  products: (q: string) => [...searchKeys.all, 'products', q] as const,
};

/**
 * Query for one search term.
 *
 * Out-of-order responses cannot leak onto the screen: every term has its own key and cache entry,
 * and a component only ever reads the entry for the term it currently observes. A slow response
 * for an earlier term settles into that term's entry, never the current one. On top of that,
 * TanStack Query aborts the previous fetch through `signal` once no observer is left on its key.
 */
export function productSearchQuery(q: string) {
  const term = q.trim();
  return queryOptions({
    queryKey: searchKeys.products(term),
    queryFn: ({ signal }) => searchProducts(term, { signal }),
    enabled: term.length > 0,
  });
}
