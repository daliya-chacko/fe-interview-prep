import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { resetSessionStore, useSessionStore } from '@/features/auth';
import { adminAccount, regularAccount } from '@/features/auth/mocks';
import { renderWithRouter } from '@/test/test-utils';

async function fillAndSubmit(user: UserEvent, email: string, password: string) {
  await user.type(screen.getByRole('textbox', { name: 'Email' }), email);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Log in' }));
}

describe('LoginPage', () => {
  afterEach(() => {
    resetSessionStore();
  });

  it('is linked from the header while signed out', async () => {
    renderWithRouter({ initialEntries: ['/'] });
    await screen.findByRole('heading', { level: 1, name: /fe interview prep/i });

    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
  });

  it('sends a signed-out visitor to login and back to the page they wanted', async () => {
    const { user, router } = renderWithRouter({ initialEntries: ['/orders'] });

    expect(await screen.findByRole('heading', { level: 1, name: 'Log in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(screen.queryByRole('heading', { name: 'Orders' })).not.toBeInTheDocument();

    await fillAndSubmit(user, regularAccount.user.email, regularAccount.password);

    expect(await screen.findByRole('heading', { level: 1, name: 'Orders' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/orders');
    expect(useSessionStore.getState().user).toEqual(regularAccount.user);
    expect(screen.getByText(/signed in as/i, { selector: 'span' })).toHaveTextContent(
      regularAccount.user.name,
    );
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('honours a redirectTo search param', async () => {
    const { user, router } = renderWithRouter({ initialEntries: ['/login?redirectTo=/admin'] });
    await screen.findByRole('heading', { level: 1, name: 'Log in' });

    await fillAndSubmit(user, adminAccount.user.email, adminAccount.password);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Admin statistics' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/admin');
  });

  it('lands on the orders page when nothing asked for a specific destination', async () => {
    const { user, router } = renderWithRouter({ initialEntries: ['/login'] });
    await screen.findByRole('heading', { level: 1, name: 'Log in' });

    await fillAndSubmit(user, regularAccount.user.email, regularAccount.password);

    expect(await screen.findByRole('heading', { level: 1, name: 'Orders' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/orders');
  });

  it('announces a failed login and keeps the visitor on the form', async () => {
    const { user, router } = renderWithRouter({ initialEntries: ['/login'] });
    await screen.findByRole('heading', { level: 1, name: 'Log in' });

    await fillAndSubmit(user, regularAccount.user.email, 'wrong-password');

    expect(await screen.findByRole('alert')).toHaveTextContent(/incorrect email or password/i);
    expect(router.state.location.pathname).toBe('/login');
    expect(useSessionStore.getState().user).toBeNull();
  });

  it('links field errors to their inputs', async () => {
    const { user } = renderWithRouter({ initialEntries: ['/login'] });
    await screen.findByRole('heading', { level: 1, name: 'Log in' });

    await user.click(screen.getByRole('button', { name: 'Log in' }));

    const email = await screen.findByRole('textbox', { name: 'Email' });
    expect(email).toBeInvalid();
    expect(email).toHaveAccessibleDescription('Enter a valid email address');
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Enter your password');
  });

  it('shows the demo credentials as a hint', async () => {
    renderWithRouter({ initialEntries: ['/login'] });
    const form = await screen.findByRole('button', { name: 'Log in' });

    const hint = within(form.closest('form')!).getByText(/demo accounts/i);
    expect(hint).toHaveTextContent(regularAccount.user.email);
    expect(hint).toHaveTextContent(regularAccount.password);
  });
});
