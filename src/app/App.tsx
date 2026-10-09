import { RouterProvider } from 'react-router';

import { AppProviders } from '@/app/providers/AppProviders';
import { createAppRouter } from '@/app/router/routes';

// Created once at module scope: the router owns browser history and must not be recreated.
const router = createAppRouter();

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
