import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createValidatedStorage } from './storage';

const schema = z.object({ count: z.number().int(), label: z.string() });
const KEY = 'storage-test';

function setup() {
  return createValidatedStorage({ schema, version: 1 });
}

describe('createValidatedStorage', () => {
  it('round-trips a valid value through localStorage', async () => {
    const storage = setup();
    const value = { state: { count: 2, label: 'two' }, version: 1 };

    storage.setItem(KEY, value);

    expect(JSON.parse(localStorage.getItem(KEY) ?? '')).toEqual(value);
    expect(await storage.getItem(KEY)).toEqual(value);
  });

  it('returns null when nothing is stored', async () => {
    expect(await setup().getItem(KEY)).toBeNull();
  });

  it('falls back to null on corrupt JSON', async () => {
    localStorage.setItem(KEY, '{"state":{"count":');

    expect(await setup().getItem(KEY)).toBeNull();
  });

  it('falls back to null when the stored state fails the schema', async () => {
    localStorage.setItem(KEY, JSON.stringify({ state: { count: 'nope' }, version: 1 }));

    expect(await setup().getItem(KEY)).toBeNull();
  });

  it('falls back to null when the stored version does not match', async () => {
    localStorage.setItem(KEY, JSON.stringify({ state: { count: 1, label: 'one' }, version: 0 }));

    expect(await setup().getItem(KEY)).toBeNull();
  });

  it('removes an entry', async () => {
    const storage = setup();
    storage.setItem(KEY, { state: { count: 1, label: 'one' }, version: 1 });

    storage.removeItem(KEY);

    expect(localStorage.getItem(KEY)).toBeNull();
    expect(await storage.getItem(KEY)).toBeNull();
  });
});
