import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/** Service-worker based mocking for the browser (development only). */
export const worker = setupWorker(...handlers);
