import { delay, http, HttpResponse, type RequestHandler } from 'msw';

import { buildUrl } from '@/shared/lib/http';

import { REGISTRATIONS_PATH } from './api/registration.api';
import { registrationSchema } from './model/registration.schema';

/** Long enough for the pending state to be visible in the demo, short enough for tests. */
const RESPONSE_DELAY_MS = 400;

/**
 * Accepts a registration the way a real API would: the body is validated against the same
 * schema the wizard uses, a malformed one is rejected with 400, and a valid one is "created".
 */
export const registrationHandlers: RequestHandler[] = [
  http.post(buildUrl(REGISTRATIONS_PATH), async ({ request }) => {
    const body: unknown = await request.json().catch(() => undefined);
    const result = registrationSchema.safeParse(body);
    await delay(RESPONSE_DELAY_MS);

    if (!result.success) {
      return HttpResponse.json(
        { message: 'Invalid registration', issues: result.error.issues },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      {
        id: crypto.randomUUID(),
        email: result.data.personal.email,
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),
];
