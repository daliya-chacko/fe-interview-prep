import { createBrowserRouter, type RouteObject } from 'react-router';

import { RootLayout } from '@/app/layouts/RootLayout';
import { HydrateFallback } from '@/app/router/HydrateFallback';
import { paths } from '@/app/router/paths';
import { RouteErrorBoundary } from '@/app/router/RouteErrorBoundary';

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
        path: paths.register,
        lazy: () =>
          import('@/pages/RegistrationPage').then((m) => ({ Component: m.RegistrationPage })),
      },
      {
        path: paths.users,
        lazy: () => import('@/pages/UsersPage').then((m) => ({ Component: m.UsersPage })),
      },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
