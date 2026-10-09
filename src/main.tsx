import '@/styles/globals.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { env } from '@/shared/lib/env';

/**
 * Start the Mock Service Worker before rendering so the first requests are intercepted.
 * The worker module is imported dynamically to keep it out of the bundle when mocks are off.
 */
async function enableMocking(): Promise<void> {
  if (!env.VITE_ENABLE_MOCKS) return;
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root was not found in index.html');
}

void enableMocking().then(() => {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
