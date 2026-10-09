import { afterEach, describe, expect, it } from 'vitest';

import { issueSession, regularAccount } from '../mocks';
import {
  resetSessionStore,
  selectIsRestoring,
  SESSION_STORAGE_KEY,
  useSessionStore,
} from './session.store';

const { getState } = useSessionStore;

function storedEntry(refreshToken: string | null): string {
  return JSON.stringify({ state: { refreshToken }, version: 1 });
}

describe('session store', () => {
  afterEach(() => {
    resetSessionStore();
  });

  it('starts signed out and not restoring', () => {
    expect(getState().user).toBeNull();
    expect(selectIsRestoring(getState())).toBe(false);
  });

  it('persists only the refresh token', () => {
    const session = issueSession(regularAccount.user);

    getState().setSession(session);

    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBe(
      storedEntry(session.refreshToken),
    );
  });

  it('is restoring after a reload until the user is loaded', async () => {
    const session = issueSession(regularAccount.user);
    window.localStorage.setItem(SESSION_STORAGE_KEY, storedEntry(session.refreshToken));

    await useSessionStore.persist.rehydrate();

    expect(getState().refreshToken).toBe(session.refreshToken);
    expect(getState().accessToken).toBeNull();
    expect(selectIsRestoring(getState())).toBe(true);

    getState().setSession(issueSession(regularAccount.user));
    expect(selectIsRestoring(getState())).toBe(false);
  });

  it('ignores a stored entry that does not match the schema', async () => {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ state: { refreshToken: 7 } }),
    );

    await useSessionStore.persist.rehydrate();

    expect(getState().refreshToken).toBeNull();
    expect(selectIsRestoring(getState())).toBe(false);
  });

  it('forgets everything, including the stored refresh token, on clear', () => {
    getState().setSession(issueSession(regularAccount.user));

    getState().clearSession();

    expect(getState()).toMatchObject({ accessToken: null, refreshToken: null, user: null });
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBe(storedEntry(null));
  });
});
