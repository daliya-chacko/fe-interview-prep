/**
 * Single source of truth for URLs. Components link via these helpers so a route change
 * is a one-line edit instead of a find-and-replace across the codebase.
 *
 * Add a function for parameterised routes, e.g. `item: (id: string) => \`/items/${id}\``.
 */
export const paths = {
  home: '/',
  todos: '/todos',
  search: '/search',
  login: '/login',
  orders: '/orders',
  admin: '/admin',
} as const;
