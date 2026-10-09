import { createBrowserRouter, type RouteObject } from 'react-router';

import { RootLayout } from '@/app/layouts/RootLayout';
import { HydrateFallback } from '@/app/router/HydrateFallback';
import { paths } from '@/app/router/paths';
import { RouteErrorBoundary } from '@/app/router/RouteErrorBoundary';
import { RequireAdmin, RequireAuth } from '@/features/auth';

/**
 * Route tree. Pages are code-split with `lazy` so the initial bundle only contains the shell.
 * Exported separately from the router so tests can mount it in a memory router.
 * Unmatched URLs surface as a 404 route error, rendered by `RouteErrorBoundary`.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteErrorBoundary,
    HydrateFallback,
    children: [
      {
        index: true,
        lazy: () => import('@/pages/HomePage').then((m) => ({ Component: m.HomePage })),
      },
      {
        path: paths.todos,
        lazy: () => import('@/pages/TodosPage').then((m) => ({ Component: m.TodosPage })),
      },
      {
        path: paths.search,
        lazy: () => import('@/pages/SearchPage').then((m) => ({ Component: m.SearchPage })),
      },
      {
        path: paths.login,
        lazy: () => import('@/pages/LoginPage').then((m) => ({ Component: m.LoginPage })),
      },
      {
        // Layout route: everything below needs a session; the guard redirects or waits for restore.
        element: <RequireAuth loginPath={paths.login} />,
        children: [
          {
            path: paths.orders,
            lazy: () => import('@/pages/OrdersPage').then((m) => ({ Component: m.OrdersPage })),
          },
          {
            Component: RequireAdmin,
            children: [
              {
                path: paths.admin,
                lazy: () =>
                  import('@/pages/AdminStatsPage').then((m) => ({ Component: m.AdminStatsPage })),
              },
            ],
          },
        ],
      },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
