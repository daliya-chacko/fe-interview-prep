import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/mocks/server';
import { buildUrl, isHttpError } from '@/shared/lib/http';

import type { Registration } from '../model/registration.schema';
import { REGISTRATIONS_PATH, submitRegistration } from './registration.api';

const registration: Registration = {
  personal: { name: 'Ada Lovelace', email: 'ada@example.com', phone: '+44 20 7946 0958' },
  address: { country: 'GB', city: 'London', postalCode: 'SW1A 1AA' },
  preferences: { plan: 'pro', skills: ['React'] },
};

describe('submitRegistration', () => {
  it('posts the registration and returns the parsed response', async () => {
    const response = await submitRegistration(registration);

    expect(response.email).toBe('ada@example.com');
    expect(response.id).not.toBe('');
    expect(new Date(response.createdAt).getTime()).not.toBeNaN();
  });

  it('rejects a payload the server does not accept', async () => {
    const invalid = { ...registration, address: { ...registration.address, postalCode: '' } };

    await expect(submitRegistration(invalid)).rejects.toSatisfy((error) => isHttpError(error, 400));
  });

  it('rejects a response that does not match the schema', async () => {
    server.use(
      http.post(buildUrl(REGISTRATIONS_PATH), () => HttpResponse.json({ id: 1 }), { once: true }),
    );

    await expect(submitRegistration(registration)).rejects.toThrow();
  });
});
