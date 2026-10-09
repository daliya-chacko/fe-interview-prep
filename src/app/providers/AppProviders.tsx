import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

import { createQueryClient } from './query-client';

export type AppProvidersProps = { children: ReactNode };

/** Composes every app-wide provider in one place so `main.tsx` and tests stay simple. */
export function AppProviders({ children }: AppProvidersProps) {
  // Lazily initialised so a single client survives re-renders (and StrictMode double-mount).
  const [queryClient] = useState(createQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
