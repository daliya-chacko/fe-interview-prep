import { describe, expect, it } from 'vitest';

import { decodeToken, encodeToken, isTokenExpired, type TokenClaims, verifyToken } from './token';

const NOW = 1_700_000_000_000;

function claims(overrides: Partial<TokenClaims> = {}): TokenClaims {
  return { sub: 'u1', kind: 'access', exp: NOW + 30_000, jti: 'one', ...overrides };
}

function base64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

describe('token codec', () => {
  it('round-trips claims through encode and decode', () => {
    const token = encodeToken(claims());

    expect(token).toMatch(/^[A-Za-z0-9_-]+\.[0-9a-f]{8}$/);
    expect(decodeToken(token)).toEqual(claims());
  });

  it('decodes nothing for garbage', () => {
    expect(decodeToken('')).toBeNull();
    expect(decodeToken('not-a-token')).toBeNull();
    expect(decodeToken(`${base64Url('{"sub":1}')}.deadbeef`)).toBeNull();
  });

  it('verifies a well-formed, unexpired token of the requested kind', () => {
    const token = encodeToken(claims());

    expect(verifyToken(token, 'access', NOW)).toEqual(claims());
    expect(verifyToken(token, 'refresh', NOW)).toBeNull();
    expect(verifyToken(token, 'access', NOW + 30_000)).toBeNull();
  });

  it('rejects a token whose claims were edited', () => {
    const token = encodeToken(claims({ sub: 'u1' }));
    const [, signature] = token.split('.');
    const forgedPayload = base64Url(JSON.stringify(claims({ sub: 'admin' })));

    expect(verifyToken(`${forgedPayload}.${signature!}`, 'access', NOW)).toBeNull();
  });

  it('reports expiry with an optional leeway', () => {
    const token = encodeToken(claims({ exp: NOW + 1_000 }));

    expect(isTokenExpired(token, NOW)).toBe(false);
    expect(isTokenExpired(token, NOW, 1_000)).toBe(true);
    expect(isTokenExpired(token, NOW + 1_000)).toBe(true);
    expect(isTokenExpired('junk', NOW)).toBe(true);
  });
});
