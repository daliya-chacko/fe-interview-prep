import { z } from 'zod';

/** Router `location.state` written by `RequireAuth` when it sends someone to the login page. */
export const redirectStateSchema = z.object({ from: z.string().min(1) });

export const REDIRECT_SEARCH_PARAM = 'redirectTo';

/**
 * Only same-origin, path-style targets are followed: `/orders?page=2` yes, `https://evil`
 * and protocol-relative `//evil` no. Anything else falls back to `fallback`.
 */
export function isSafeRedirectTarget(target: string): boolean {
  return target.startsWith('/') && !target.startsWith('//');
}

export type ResolveRedirectTargetInput = {
  /** Unknown because router state is whatever the previous page put there. */
  state: unknown;
  searchParams: URLSearchParams;
  fallback: string;
};

/** Picks the page to land on after login: router state first, then `?redirectTo=`, then fallback. */
export function resolveRedirectTarget({
  state,
  searchParams,
  fallback,
}: ResolveRedirectTargetInput): string {
  const fromState = redirectStateSchema.safeParse(state);
  const candidates = [
    fromState.success ? fromState.data.from : null,
    searchParams.get(REDIRECT_SEARCH_PARAM),
  ];
  return (
    candidates.find((candidate) => candidate !== null && isSafeRedirectTarget(candidate)) ??
    fallback
  );
}
