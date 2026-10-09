import { describe, expect, it } from 'vitest';

import {
  addressSchema,
  personalSchema,
  preferencesSchema,
  registrationSchema,
} from './registration.schema';

function messagesOf(result: { success: boolean; error?: { issues: Array<{ message: string }> } }) {
  return result.success ? [] : (result.error?.issues.map((issue) => issue.message) ?? []);
}

describe('personalSchema', () => {
  it('accepts a complete entry and trims the text fields', () => {
    const result = personalSchema.safeParse({
      name: '  Ada Lovelace ',
      email: ' ada@example.com ',
      phone: ' +44 20 7946 0958 ',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+44 20 7946 0958',
    });
  });

  it('reports every empty or malformed field', () => {
    const result = personalSchema.safeParse({ name: 'A', email: 'nope', phone: '12' });

    expect(messagesOf(result)).toEqual([
      'Enter your full name',
      'Enter a valid email address',
      'Enter a valid phone number',
    ]);
  });
});

describe('addressSchema', () => {
  it('requires exactly six digits for an Indian postal code', () => {
    const base = { country: 'IN', city: 'Kochi' };

    expect(addressSchema.safeParse({ ...base, postalCode: '682001' }).success).toBe(true);
    expect(messagesOf(addressSchema.safeParse({ ...base, postalCode: '68200' }))).toEqual([
      'An Indian postal code is exactly six digits',
    ]);
    expect(messagesOf(addressSchema.safeParse({ ...base, postalCode: 'SW1A 1AA' }))).toEqual([
      'An Indian postal code is exactly six digits',
    ]);
  });

  it('accepts any non-empty postal code for other countries', () => {
    const base = { country: 'GB', city: 'London' };

    expect(addressSchema.safeParse({ ...base, postalCode: 'SW1A 1AA' }).success).toBe(true);
    expect(addressSchema.safeParse({ ...base, postalCode: '1' }).success).toBe(true);
    expect(messagesOf(addressSchema.safeParse({ ...base, postalCode: '  ' }))).toEqual([
      'Enter your postal code',
    ]);
  });

  it('rejects an unknown country', () => {
    const result = addressSchema.safeParse({ country: 'XX', city: 'X', postalCode: '1' });

    expect(messagesOf(result)).toEqual(['Select a country']);
  });
});

describe('preferencesSchema', () => {
  it('requires a plan and at least one skill', () => {
    expect(messagesOf(preferencesSchema.safeParse({ plan: null, skills: [] }))).toEqual([
      'Choose a plan',
      'Add at least one skill',
    ]);
    expect(preferencesSchema.safeParse({ plan: 'pro', skills: ['React'] }).success).toBe(true);
  });
});

describe('registrationSchema', () => {
  it('composes the three steps into one payload', () => {
    const result = registrationSchema.safeParse({
      personal: { name: 'Ada Lovelace', email: 'ada@example.com', phone: '+44 20 7946 0958' },
      address: { country: 'GB', city: 'London', postalCode: 'SW1A 1AA' },
      preferences: { plan: 'pro', skills: ['React', 'TypeScript'] },
    });

    expect(result.success).toBe(true);
  });
});
