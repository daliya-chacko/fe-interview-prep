import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { createMemoryRouter, type RouteObject, RouterProvider } from 'react-router';

import { routes as appRoutes } from '@/app/router/routes';

/** A client with retries off so failing requests surface immediately in tests. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

type ProviderOptions = Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient };

/** Renders `ui` inside the app's providers and returns a ready `userEvent` instance. */
export function renderWithProviders(ui: ReactElement, options: ProviderOptions = {}) {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return {
    user: userEvent.setup(),
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

type RouterOptions = ProviderOptions & { initialEntries?: string[]; routes?: RouteObject[] };

/** Mounts the real route tree (or a custom one) in a memory router at the given URL. */
export function renderWithRouter(options: RouterOptions = {}) {
  const { initialEntries = ['/'], routes = appRoutes, ...providerOptions } = options;
  const router = createMemoryRouter(routes, { initialEntries });

  return {
    router,
    ...renderWithProviders(<RouterProvider router={router} />, providerOptions),
  };
}
