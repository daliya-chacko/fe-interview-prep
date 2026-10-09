import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/** Request interception for Node (Vitest). Started in `src/test/setup.ts`. */
export const server = setupServer(...handlers);
