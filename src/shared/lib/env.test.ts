import { describe, expect, it } from 'vitest';

import { parseEnv } from './env';

describe('parseEnv', () => {
  it('applies defaults when variables are missing', () => {
    expect(parseEnv({})).toEqual({ VITE_API_BASE_URL: '/api', VITE_ENABLE_MOCKS: false });
  });

  it('coerces boolean-like strings', () => {
    expect(parseEnv({ VITE_ENABLE_MOCKS: 'true' }).VITE_ENABLE_MOCKS).toBe(true);
    expect(parseEnv({ VITE_ENABLE_MOCKS: 'false' }).VITE_ENABLE_MOCKS).toBe(false);
  });

  it('throws a readable error for invalid values', () => {
    expect(() => parseEnv({ VITE_API_BASE_URL: '' })).toThrow(/VITE_API_BASE_URL/);
  });
});
