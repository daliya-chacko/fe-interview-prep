import { createBrowserRouter, type RouteObject } from 'react-router';

import { RootLayout } from '@/app/layouts/RootLayout';
import { HydrateFallback } from '@/app/router/HydrateFallback';
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
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
