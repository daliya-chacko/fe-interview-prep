import { z } from 'zod';

/** Lifetimes fixed by the assignment: a short access token and a longer refresh token. */
export const ACCESS_TOKEN_TTL_MS = 30 * 1000;
export const REFRESH_TOKEN_TTL_MS = 10 * 60 * 1000;

/**
 * Treat an access token as expired this long before its real expiry, so a request that leaves
 * the browser just before the deadline is not rejected by the server a few milliseconds later.
 */
export const ACCESS_TOKEN_EXPIRY_LEEWAY_MS = 2 * 1000;

export const tokenKindSchema = z.enum(['access', 'refresh']);

export const tokenClaimsSchema = z.object({
  /** Subject: the id of the user the token was issued to. */
  sub: z.string().min(1),
  kind: tokenKindSchema,
  /** Expiry as epoch milliseconds. */
  exp: z.number().int().nonnegative(),
  /** Unique id so two tokens issued in the same millisecond never compare equal. */
  jti: z.string().min(1),
});

export type TokenKind = z.infer<typeof tokenKindSchema>;
export type TokenClaims = z.infer<typeof tokenClaimsSchema>;

/**
 * Tokens are `<base64url claims>.<checksum>`: readable like a JWT so the client can see `exp`,
 * tamper-evident so the mock backend can reject edited tokens. The checksum is deliberately not
 * a secret-keyed signature: this codec ships to the browser because the backend is mocked in
 * the same bundle. A real backend keeps its signing key server-side and the client only decodes.
 */
const CHECKSUM_SALT = 'fe-interview-prep-mock-token';

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): string {
  const padded = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');
  return atob(padded);
}

/** djb2 over the payload: tiny, deterministic and good enough to detect edits to a mock token. */
function checksum(payload: string): string {
  let hash = 5381;
  const input = `${payload}.${CHECKSUM_SALT}`;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(index)) | 0;
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function encodeToken(claims: TokenClaims): string {
  const payload = toBase64Url(JSON.stringify(claims));
  return `${payload}.${checksum(payload)}`;
}

/**
 * Reads the claims of a token without checking the checksum. Clients use this to learn when a
 * token expires; they never trust it for authorisation, which only the backend decides.
 */
export function decodeToken(token: string): TokenClaims | null {
  const [payload] = token.split('.');
  if (!payload) return null;
  try {
    const result = tokenClaimsSchema.safeParse(JSON.parse(fromBase64Url(payload)));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/** Backend-side check: the checksum must match, the kind must be right and the token unexpired. */
export function verifyToken(token: string, kind: TokenKind, now = Date.now()): TokenClaims | null {
  const [payload, signature, ...rest] = token.split('.');
  if (!payload || !signature || rest.length > 0 || checksum(payload) !== signature) return null;
  const claims = decodeToken(token);
  if (claims?.kind !== kind || claims.exp <= now) return null;
  return claims;
}

/** True when the token is unreadable or expires within the leeway window. */
export function isTokenExpired(token: string, now = Date.now(), leewayMs = 0): boolean {
  const claims = decodeToken(token);
  return claims === null || claims.exp - leewayMs <= now;
}
