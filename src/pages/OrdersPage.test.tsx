import { screen, waitFor } from '@testing-library/react';
import { delay, http } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';

import { resetSessionStore, SESSION_STORAGE_KEY, useSessionStore } from '@/features/auth';
import { issueSession, regularAccount } from '@/features/auth/mocks';
import { api } from '@/mocks/handlers';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/test-utils';

/** Counts `/auth/refresh` calls while letting them fall through to the real handler. */
function countRefreshCalls(delayMs = 0): () => number {
  let calls = 0;
  server.use(
    http.post(api('/auth/refresh'), async () => {
      calls += 1;
      await delay(delayMs);
      return undefined;
    }),
  );
  return () => calls;
}

function loginHeading() {
  return screen.queryByRole('heading', { level: 1, name: 'Log in' });
}

describe('OrdersPage', () => {
  afterEach(() => {
    resetSessionStore();
  });

  it('shows the account and the orders to a signed-in user', async () => {
    useSessionStore.getState().setSession(issueSession(regularAccount.user));
    renderWithRouter({ initialEntries: ['/orders'] });

    expect(await screen.findByRole('heading', { level: 1, name: 'Orders' })).toBeInTheDocument();
    expect(
      await screen.findByText(regularAccount.user.email, { exact: false }),
    ).toBeInTheDocument();
    const table = await screen.findByRole('table', { name: 'Your orders' });
    expect(table).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Blue Mug' })).toBeInTheDocument();
  });

  it('restores the session after a reload without showing the login page', async () => {
    const { refreshToken } = issueSession(regularAccount.user);
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ state: { refreshToken }, version: 1 }),
    );
    await useSessionStore.persist.rehydrate();
    const refreshCalls = countRefreshCalls(200);

    const { router } = renderWithRouter({ initialEntries: ['/orders'] });

    expect(await screen.findByText('Restoring your session')).toBeInTheDocument();
    expect(loginHeading()).not.toBeInTheDocument();

    expect(await screen.findByRole('table', { name: 'Your orders' })).toBeInTheDocument();
    expect(loginHeading()).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/orders');
    expect(refreshCalls()).toBe(1);
    expect(useSessionStore.getState().user).toEqual(regularAccount.user);
  });

  it('recovers from an expired access token with a single refresh', async () => {
    useSessionStore.getState().setSession(issueSession(regularAccount.user, { accessTtlMs: -1 }));
    const refreshCalls = countRefreshCalls();

    renderWithRouter({ initialEntries: ['/orders'] });

    // `/me` and `/orders` go out together with the expired token; both must recover.
    expect(
      await screen.findByText(regularAccount.user.email, { exact: false }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('table', { name: 'Your orders' })).toBeInTheDocument();
    expect(refreshCalls()).toBe(1);
    expect(loginHeading()).not.toBeInTheDocument();
  });

  it('logs out and lands on the login page when the refresh is rejected', async () => {
    useSessionStore
      .getState()
      .setSession(issueSession(regularAccount.user, { accessTtlMs: -1, refreshTtlMs: -1 }));
    const refreshCalls = countRefreshCalls();

    const { router } = renderWithRouter({ initialEntries: ['/orders'] });

    expect(await screen.findByRole('heading', { level: 1, name: 'Log in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(refreshCalls()).toBe(1);
    expect(useSessionStore.getState()).toMatchObject({
      accessToken: null,
      refreshToken: null,
      user: null,
    });
  });

  it('sends the visitor to login when a restored refresh token is rejected', async () => {
    const { refreshToken } = issueSession(regularAccount.user, { refreshTtlMs: -1 });
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ state: { refreshToken }, version: 1 }),
    );
    await useSessionStore.persist.rehydrate();

    const { router } = renderWithRouter({ initialEntries: ['/orders'] });

    expect(await screen.findByRole('heading', { level: 1, name: 'Log in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('logs out from the header and forgets the persisted refresh token', async () => {
    useSessionStore.getState().setSession(issueSession(regularAccount.user));
    const { user, router } = renderWithRouter({ initialEntries: ['/orders'] });
    await screen.findByRole('table', { name: 'Your orders' });

    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Log in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    await waitFor(() => {
      expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBe(
        JSON.stringify({ state: { refreshToken: null }, version: 1 }),
      );
    });
    expect(screen.getByRole('link', { name: 'Log in' })).toBeInTheDocument();
  });
});
