import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createValidatedStorage } from '@/shared/lib/storage';

import {
  type PersistedSession,
  persistedSessionSchema,
  type Session,
  type User,
} from '../model/auth.schema';

export type SessionState = PersistedSession & {
  accessToken: string | null;
  user: User | null;
  /** Replaces the whole session after a login or a refresh. */
  setSession: (session: Session) => void;
  /** Forgets every token and the user; the persisted refresh token is removed as well. */
  clearSession: () => void;
};

export const SESSION_STORAGE_KEY = 'session';
const SESSION_STORAGE_VERSION = 1;

export const initialSessionState: Pick<SessionState, 'accessToken' | 'refreshToken' | 'user'> = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

/**
 * Where the tokens live, and why.
 *
 * The access token stays in memory only: it is short-lived (30 s), it is what every protected
 * request carries, and keeping it out of storage means a script injected into the page cannot
 * simply read it back later. Losing it on reload costs nothing because it is replaced on demand.
 *
 * The refresh token is persisted in `localStorage` so a reload can silently mint a new access
 * token and restore the session instead of flashing the login page. That is the trade-off: a
 * token in `localStorage` is readable by any script on the origin, whereas an `httpOnly` cookie
 * is not. A cookie is the better home for a refresh token, but it needs a real backend that sets
 * and reads cookies; the mocked backend here runs in the same bundle and cannot, so storage is
 * the honest choice for this exercise. The entry is validated with a schema on read, like every
 * other persisted slice, and the token itself is still checked by the backend on every refresh.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...initialSessionState,

      setSession: ({ accessToken, refreshToken, user }) => {
        set({ accessToken, refreshToken, user });
      },

      clearSession: () => {
        set(initialSessionState);
      },
    }),
    {
      name: SESSION_STORAGE_KEY,
      version: SESSION_STORAGE_VERSION,
      storage: createValidatedStorage({
        schema: persistedSessionSchema,
        version: SESSION_STORAGE_VERSION,
      }),
      partialize: (state) => ({ refreshToken: state.refreshToken }),
    },
  ),
);

export function selectUser(state: SessionState): User | null {
  return state.user;
}

/**
 * True between a reload and the refresh that follows it: a refresh token was restored from
 * storage but no user has been loaded yet. Guards show a neutral loading state meanwhile.
 */
export function selectIsRestoring(state: SessionState): boolean {
  return state.refreshToken !== null && state.user === null;
}

/** Resets the store to a signed-out state; for tests, which share one module-level store. */
export function resetSessionStore(): void {
  useSessionStore.setState(initialSessionState);
}
