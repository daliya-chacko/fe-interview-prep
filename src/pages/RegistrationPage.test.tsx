import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  initialRegistrationState,
  REGISTRATIONS_PATH,
  useRegistrationStore,
} from '@/features/registration';
import { server } from '@/mocks/server';
import { buildUrl } from '@/shared/lib/http';
import { renderWithRouter } from '@/test/test-utils';

const REGISTER_URL = '/register';

async function renderRegistrationPage() {
  const result = renderWithRouter({ initialEntries: [REGISTER_URL] });
  await screen.findByRole('heading', { level: 1, name: 'Register' });
  return result;
}

function currentStep(): string {
  const progress = screen.getByRole('list', { name: 'Progress' });
  const items = within(progress).getAllByRole('listitem');
  const current = items.find((item) => item.getAttribute('aria-current') === 'step');
  return current?.textContent ?? '';
}

function field(name: string) {
  return screen.getByRole('textbox', { name });
}

async function clickNext(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: 'Next' }));
}

async function fillPersonal(user: UserEvent) {
  await user.type(field('Full name'), 'Ada Lovelace');
  await user.type(field('Email'), 'ada@example.com');
  await user.type(field('Phone'), '+44 20 7946 0958');
}

async function fillAddress(user: UserEvent, country: string, city: string, postalCode: string) {
  await user.selectOptions(screen.getByRole('combobox', { name: 'Country' }), country);
  await user.clear(field('City'));
  await user.type(field('City'), city);
  await user.clear(field('Postal code'));
  await user.type(field('Postal code'), postalCode);
}

async function fillPreferences(user: UserEvent) {
  await user.click(screen.getByRole('radio', { name: 'Pro' }));
  await user.type(field('Skills'), 'React{Enter}');
  await user.type(field('Skills'), 'TypeScript{Enter}');
}

async function completeToReview(user: UserEvent) {
  await fillPersonal(user);
  await clickNext(user);
  await fillAddress(user, 'IN', 'Kochi', '682001');
  await clickNext(user);
  await fillPreferences(user);
  await clickNext(user);
  await screen.findByRole('heading', { level: 2, name: 'Review and submit' });
}

describe('RegistrationPage', () => {
  beforeEach(() => {
    useRegistrationStore.setState(initialRegistrationState);
  });

  it('is linked from the primary navigation', async () => {
    renderWithRouter({ initialEntries: ['/'] });
    await screen.findByRole('heading', { level: 1, name: /fe interview prep/i });

    const nav = screen.getByRole('navigation', { name: /primary/i });
    expect(within(nav).getByRole('link', { name: 'Register' })).toHaveAttribute(
      'href',
      REGISTER_URL,
    );
  });

  it('starts on the personal step with the progress indicator marking it current', async () => {
    await renderRegistrationPage();

    expect(currentStep()).toMatch(/Personal/);
    expect(screen.getByRole('heading', { level: 2, name: 'Personal details' })).toBeInTheDocument();
  });

  it('blocks Next on an invalid step and links each error to its field', async () => {
    const { user } = await renderRegistrationPage();

    await user.type(field('Email'), 'not-an-email');
    await clickNext(user);

    expect(currentStep()).toMatch(/Personal/);
    expect(field('Full name')).toHaveAttribute('aria-invalid', 'true');
    expect(field('Full name')).toHaveAccessibleDescription('Enter your full name');
    expect(field('Email')).toHaveAccessibleDescription('Enter a valid email address');
    expect(field('Phone')).toHaveAccessibleDescription('Enter a valid phone number');

    await user.clear(field('Email'));
    await fillPersonal(user);
    await clickNext(user);

    expect(currentStep()).toMatch(/Address/);
    expect(screen.getByRole('heading', { level: 2, name: 'Address' })).toBeInTheDocument();
  });

  it('keeps what was entered when going back and forward again', async () => {
    const { user } = await renderRegistrationPage();
    await fillPersonal(user);
    await clickNext(user);

    await user.type(field('City'), 'Kochi');
    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(currentStep()).toMatch(/Personal/);
    expect(field('Full name')).toHaveValue('Ada Lovelace');
    expect(field('Email')).toHaveValue('ada@example.com');
    expect(field('Phone')).toHaveValue('+44 20 7946 0958');

    await clickNext(user);

    expect(currentStep()).toMatch(/Address/);
    expect(field('City')).toHaveValue('Kochi');
  });

  it('applies the six-digit postal code rule to India only', async () => {
    const { user } = await renderRegistrationPage();
    await fillPersonal(user);
    await clickNext(user);

    await fillAddress(user, 'IN', 'Kochi', '12345');
    await clickNext(user);

    expect(currentStep()).toMatch(/Address/);
    expect(field('Postal code')).toHaveAccessibleDescription(
      /An Indian postal code is exactly six digits/,
    );

    await fillAddress(user, 'GB', 'London', 'SW1A 1AA');
    await clickNext(user);

    expect(currentStep()).toMatch(/Preferences/);
  });

  it('requires a plan and a skill, and lets skills be removed', async () => {
    const { user } = await renderRegistrationPage();
    await fillPersonal(user);
    await clickNext(user);
    await fillAddress(user, 'IN', 'Kochi', '682001');
    await clickNext(user);

    await clickNext(user);
    expect(currentStep()).toMatch(/Preferences/);
    expect(screen.getByText('Choose a plan')).toBeInTheDocument();
    expect(field('Skills')).toHaveAccessibleDescription('Add at least one skill');

    await fillPreferences(user);
    await user.click(screen.getByRole('button', { name: 'Remove TypeScript' }));
    const skills = screen.getByRole('list', { name: 'Skills' });
    expect(within(skills).getAllByRole('listitem')).toHaveLength(1);

    await clickNext(user);
    expect(currentStep()).toMatch(/Review/);
  });

  it('reviews every step, lets each be edited, and submits to a success message', async () => {
    const { user } = await renderRegistrationPage();
    await completeToReview(user);

    const personal = screen.getByRole('region', { name: 'Personal details' });
    expect(personal).toHaveTextContent('Ada Lovelace');
    expect(personal).toHaveTextContent('ada@example.com');
    const address = screen.getByRole('region', { name: 'Address' });
    expect(address).toHaveTextContent('India');
    expect(address).toHaveTextContent('682001');
    const preferences = screen.getByRole('region', { name: 'Preferences' });
    expect(preferences).toHaveTextContent('Pro');
    expect(preferences).toHaveTextContent('React, TypeScript');

    await user.click(screen.getByRole('button', { name: 'Edit address' }));
    expect(currentStep()).toMatch(/Address/);
    await user.clear(field('City'));
    await user.type(field('City'), 'Chennai');
    await clickNext(user);
    await clickNext(user);
    expect(screen.getByRole('region', { name: 'Address' })).toHaveTextContent('Chennai');

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByRole('status')).toHaveTextContent(/submitting/i);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();

    await screen.findByRole('heading', { level: 2, name: 'You are registered, Ada Lovelace' });
    const success = screen.getByRole('status');
    expect(success).toHaveTextContent('ada@example.com');
    expect(useRegistrationStore.getState().step).toBe('personal');
    expect(useRegistrationStore.getState().personal.name).toBe('');

    await user.click(screen.getByRole('button', { name: 'Register another person' }));
    expect(currentStep()).toMatch(/Personal/);
    expect(field('Full name')).toHaveValue('');
  });

  it('shows an alert when the submission fails and succeeds on retry', async () => {
    server.use(
      http.post(buildUrl(REGISTRATIONS_PATH), () => HttpResponse.json({}, { status: 500 }), {
        once: true,
      }),
    );
    const { user } = await renderRegistrationPage();
    await completeToReview(user);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/something went wrong/i);
    expect(useRegistrationStore.getState().step).toBe('review');

    await user.click(within(alert).getByRole('button', { name: 'Retry' }));

    await screen.findByRole('heading', { level: 2, name: 'You are registered, Ada Lovelace' });
    expect(screen.getByRole('status')).toHaveTextContent('ada@example.com');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('restores the step and the entered data after a page refresh', async () => {
    const { user, unmount } = await renderRegistrationPage();
    await fillPersonal(user);
    await clickNext(user);
    // Typed on the current step and never saved with Next or Back: it must still come back.
    await user.type(field('City'), 'Kochi');
    await user.type(field('Postal code'), '6820');
    expect(currentStep()).toMatch(/Address/);
    unmount();

    // Simulate a refresh: the store singleton forgets everything and must read localStorage
    // again. Resetting the store also writes the empty state, so the saved entry is captured
    // first and put back before rehydration.
    const storageKey = useRegistrationStore.persist.getOptions().name;
    expect(storageKey).toBeDefined();
    const saved = localStorage.getItem(storageKey ?? '');
    expect(saved).not.toBeNull();
    useRegistrationStore.setState(initialRegistrationState);
    expect(useRegistrationStore.getState().step).toBe('personal');
    localStorage.setItem(storageKey ?? '', saved ?? '');
    await useRegistrationStore.persist.rehydrate();

    const { user: refreshedUser } = await renderRegistrationPage();

    expect(currentStep()).toMatch(/Address/);
    expect(field('City')).toHaveValue('Kochi');
    expect(field('Postal code')).toHaveValue('6820');

    await refreshedUser.click(screen.getByRole('button', { name: 'Back' }));
    expect(field('Full name')).toHaveValue('Ada Lovelace');
    expect(field('Email')).toHaveValue('ada@example.com');
  });
});
