import { screen } from '@testing-library/react';
import { http } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';

import { resetSessionStore, useSessionStore } from '@/features/auth';
import { adminAccount, issueSession, regularAccount } from '@/features/auth/mocks';
import { api } from '@/mocks/handlers';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/test-utils';

function countStatsRequests(): () => number {
  let calls = 0;
  server.use(
    http.get(api('/admin/stats'), () => {
      calls += 1;
      return undefined;
    }),
  );
  return () => calls;
}

describe('AdminStatsPage', () => {
  afterEach(() => {
    resetSessionStore();
  });

  it('shows the statistics to an admin', async () => {
    useSessionStore.getState().setSession(issueSession(adminAccount.user));
    renderWithRouter({ initialEntries: ['/admin'] });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Admin statistics' }),
    ).toBeInTheDocument();
    expect(
      (await screen.findByText('Users', { selector: 'dt' })).nextElementSibling,
    ).toHaveTextContent('2');
    expect(screen.getByText('Orders', { selector: 'dt' }).nextElementSibling).toHaveTextContent(
      '5',
    );
    expect(screen.getByText('Revenue', { selector: 'dt' }).nextElementSibling).toHaveTextContent(
      '$278',
    );
  });

  it('blocks a regular user with a forbidden message and fetches nothing', async () => {
    useSessionStore.getState().setSession(issueSession(regularAccount.user));
    const statsRequests = countStatsRequests();

    const { router } = renderWithRouter({ initialEntries: ['/admin'] });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/admins only/i);
    expect(router.state.location.pathname).toBe('/admin');
    expect(screen.queryByRole('heading', { name: 'Admin statistics' })).not.toBeInTheDocument();
    expect(statsRequests()).toBe(0);
  });

  it('sends a signed-out visitor to login', async () => {
    const { router } = renderWithRouter({ initialEntries: ['/admin'] });

    expect(await screen.findByRole('heading', { level: 1, name: 'Log in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });
});
