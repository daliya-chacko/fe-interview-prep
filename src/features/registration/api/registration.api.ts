import { z } from 'zod';

import { http } from '@/shared/lib/http';

import type { Registration } from '../model/registration.schema';

/** Relative to `VITE_API_BASE_URL`; the mock handler builds its URL from the same path. */
export const REGISTRATIONS_PATH = '/registrations';

/** What the server returns once a registration has been created. */
export const registrationResponseSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  createdAt: z.iso.datetime(),
});

export type RegistrationResponse = z.infer<typeof registrationResponseSchema>;

/** Submits a complete registration and validates the payload at the boundary. */
export async function submitRegistration(
  registration: Registration,
): Promise<RegistrationResponse> {
  const payload = await http<unknown>(REGISTRATIONS_PATH, {
    method: 'POST',
    body: registration,
  });
  return registrationResponseSchema.parse(payload);
}
