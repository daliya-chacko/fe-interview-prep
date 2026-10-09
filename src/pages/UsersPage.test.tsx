import { screen, within } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import type { User } from '@/features/users';
import { USERS_FIXTURE_SIZE, usersFixture } from '@/features/users/mocks';
import { server } from '@/mocks/server';
import { env } from '@/shared/lib/env';
import { renderWithRouter } from '@/test/test-utils';

const usersUrl = env.VITE_USERS_API_URL;
const AGE_COLUMN = 1;
const GENDER_COLUMN = 2;

const fullName = (user: User) => `${user.firstName} ${user.lastName}`;

/** Mirrors what the global search looks at: every value the table shows for a user. */
function shownText(user: User): string[] {
  return [
    fullName(user),
    String(user.age),
    user.gender,
    user.email,
    user.address.city,
    user.company.name,
  ];
}

function matchesSearch(user: User, term: string): boolean {
  return shownText(user).some((value) => value.toLowerCase().includes(term.toLowerCase()));
}

async function renderUsersPage(url = '/users') {
  const utils = renderWithRouter({ initialEntries: [url] });
  // The first test in the file also pays for the lazy route chunk, so allow for a busy machine.
  const table = await screen.findByRole('table', { name: 'Users' }, { timeout: 4000 });
  return { ...utils, table };
}

/** The body rows of the users table (the first row is the header). */
function bodyRows(): HTMLElement[] {
  return within(screen.getByRole('table', { name: 'Users' }))
    .getAllByRole('row')
    .slice(1);
}

function cellText(row: HTMLElement, index: number): string {
  return within(row).getAllByRole('cell')[index]!.textContent;
}

const summary = (from: number, to: number, total: number) =>
  `Showing ${from}–${to} of ${total} users`;

/** Waits for the live summary; the search path only settles after the 300 ms debounce. */
const findSummary = (from: number, to: number, total: number) =>
  screen.findByText(summary(from, to, total), undefined, { timeout: 4000 });

describe('UsersPage', () => {
  it('renders the first page of a dataset larger than five hundred rows', async () => {
    await renderUsersPage();

    expect(USERS_FIXTURE_SIZE).toBeGreaterThan(500);
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByRole('status')).toHaveTextContent(summary(1, 10, USERS_FIXTURE_SIZE));
    expect(screen.getByText('Page 1 of 60')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('href', '/users');
  });

  it('cycles a column sort through ascending, descending and none', async () => {
    const { user, router } = await renderUsersPage();
    const ageHeader = screen.getByRole('columnheader', { name: 'Age' });
    const ageButton = within(ageHeader).getByRole('button', { name: 'Age' });
    const ages = () => usersFixture.map((entry) => entry.age);

    await user.click(ageButton);
    expect(ageHeader).toHaveAttribute('aria-sort', 'ascending');
    expect(cellText(bodyRows()[0]!, AGE_COLUMN)).toBe(String(Math.min(...ages())));
    expect(router.state.location.search).toBe('?sort=age');

    await user.click(ageButton);
    expect(ageHeader).toHaveAttribute('aria-sort', 'descending');
    expect(cellText(bodyRows()[0]!, AGE_COLUMN)).toBe(String(Math.max(...ages())));
    expect(router.state.location.search).toBe('?sort=age&dir=desc');

    await user.click(ageButton);
    expect(ageHeader).toHaveAttribute('aria-sort', 'none');
    expect(bodyRows()[0]).toHaveTextContent(fullName(usersFixture[0]!));
    expect(router.state.location.search).toBe('');
  });

  it('narrows the rows with the global search and returns to page 1', async () => {
    const { user, router } = await renderUsersPage('/users?page=3');
    expect(screen.getByRole('status')).toHaveTextContent(summary(21, 30, USERS_FIXTURE_SIZE));
    const expected = usersFixture.filter((entry) => matchesSearch(entry, 'Phoenix')).length;

    await user.type(screen.getByRole('searchbox', { name: 'Search users' }), 'Phoenix');

    expect(await findSummary(1, 10, expected)).toBeInTheDocument();
    expect(bodyRows().every((row) => row.textContent.includes('Phoenix'))).toBe(true);
    expect(router.state.location.search).toBe('?q=Phoenix');
  });

  it('filters by gender and returns to page 1', async () => {
    const { user, router } = await renderUsersPage('/users?page=2');
    const expected = usersFixture.filter((entry) => entry.gender === 'female').length;

    await user.selectOptions(screen.getByRole('combobox', { name: 'Gender' }), 'Female');

    expect(await findSummary(1, 10, expected)).toBeInTheDocument();
    expect(bodyRows().every((row) => cellText(row, GENDER_COLUMN) === 'female')).toBe(true);
    expect(router.state.location.search).toBe('?gender=female');
  });

  it('changes the page size', async () => {
    const { user, router } = await renderUsersPage();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '25');

    expect(await findSummary(1, 25, USERS_FIXTURE_SIZE)).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(25);
    expect(screen.getByText('Page 1 of 24')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?pageSize=25');
  });

  it('restores the exact view from a shared link', async () => {
    const matching = usersFixture.filter(
      (entry) => entry.gender === 'female' && matchesSearch(entry, 'son'),
    );
    expect(matching.length).toBeGreaterThan(25);
    const pageCount = Math.ceil(matching.length / 25);
    const lastOnPage = Math.min(50, matching.length);

    await renderUsersPage('/users?sort=age&dir=desc&q=son&gender=female&page=2&pageSize=25');

    expect(screen.getByRole('searchbox', { name: 'Search users' })).toHaveValue('son');
    expect(screen.getByRole('combobox', { name: 'Gender' })).toHaveValue('female');
    expect(screen.getByRole('combobox', { name: 'Rows per page' })).toHaveValue('25');
    expect(screen.getByRole('columnheader', { name: 'Age' })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    expect(screen.getByRole('status')).toHaveTextContent(summary(26, lastOnPage, matching.length));
    expect(screen.getByText(`Page 2 of ${pageCount}`)).toBeInTheDocument();

    const rows = bodyRows();
    const firstAge = Number(cellText(rows[0]!, AGE_COLUMN));
    const lastAge = Number(cellText(rows[rows.length - 1]!, AGE_COLUMN));
    expect(firstAge).toBeGreaterThanOrEqual(lastAge);
    expect(rows.every((row) => cellText(row, GENDER_COLUMN) === 'female')).toBe(true);
  });

  it('moves between previous views with Back and Forward', async () => {
    const { user, router } = await renderUsersPage();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await findSummary(11, 20, USERS_FIXTURE_SIZE)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await findSummary(21, 30, USERS_FIXTURE_SIZE)).toBeInTheDocument();
    expect(router.state.location.search).toBe('?page=3');

    await router.navigate(-1);
    expect(await findSummary(11, 20, USERS_FIXTURE_SIZE)).toBeInTheDocument();
    expect(router.state.location.search).toBe('?page=2');

    await router.navigate(1);
    expect(await findSummary(21, 30, USERS_FIXTURE_SIZE)).toBeInTheDocument();
    expect(router.state.location.search).toBe('?page=3');
  });

  it('restores the previous search term when going Back', async () => {
    const { user, router } = await renderUsersPage();
    const input = screen.getByRole('searchbox', { name: 'Search users' });
    const expected = usersFixture.filter((entry) => matchesSearch(entry, 'Phoenix')).length;

    await user.type(input, 'Phoenix');
    expect(await findSummary(1, 10, expected)).toBeInTheDocument();

    await router.navigate(-1);
    expect(await findSummary(1, 10, USERS_FIXTURE_SIZE)).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(router.state.location.search).toBe('');
  });

  it('shows a loading state while the request is in flight', async () => {
    server.use(
      http.get(usersUrl, async () => {
        await delay(100);
        return HttpResponse.json({ users: usersFixture, total: usersFixture.length });
      }),
    );
    renderWithRouter({ initialEntries: ['/users'] });

    expect(await screen.findByText('Loading users')).toBeInTheDocument();
    expect(await screen.findByRole('table', { name: 'Users' })).toBeInTheDocument();
  });

  it('shows an alert on failure and recovers when Retry is pressed', async () => {
    server.use(
      http.get(usersUrl, () => HttpResponse.json({ message: 'boom' }, { status: 500 }), {
        once: true,
      }),
    );
    const { user } = renderWithRouter({ initialEntries: ['/users'] });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/something went wrong/i);

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('table', { name: 'Users' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an empty state when the dataset has no users', async () => {
    server.use(http.get(usersUrl, () => HttpResponse.json({ users: [], total: 0 })));

    await renderUsersPage();

    expect(screen.getByRole('cell', { name: 'No users to show.' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('No users to show');
  });

  it('tells the user when nothing matches the search', async () => {
    await renderUsersPage('/users?q=zzzz-no-such-user');

    expect(
      screen.getByRole('cell', { name: 'No users match the current search and filter.' }),
    ).toBeInTheDocument();
  });
});
