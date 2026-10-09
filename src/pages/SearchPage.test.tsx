import { screen, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { type Product, searchFixture } from '@/features/search';
import { server } from '@/mocks/server';
import { env } from '@/shared/lib/env';
import { renderWithRouter } from '@/test/test-utils';

const searchUrl = env.VITE_SEARCH_API_URL;

function resultsFor(q: string): { products: Product[]; total: number } {
  const products = searchFixture.filter((product) =>
    product.title.toLowerCase().includes(q.toLowerCase()),
  );
  return { products, total: products.length };
}

function queryOf(request: Request): string {
  return new URL(request.url).searchParams.get('q') ?? '';
}

async function renderSearchPage() {
  const utils = renderWithRouter({ initialEntries: ['/search'] });
  const input = await screen.findByRole('searchbox', { name: /search products/i });
  return { ...utils, input };
}

describe('SearchPage', () => {
  it('sends a single request when a term is typed quickly', async () => {
    const seen: string[] = [];
    server.use(
      http.get(searchUrl, ({ request }) => {
        const q = queryOf(request);
        seen.push(q);
        return HttpResponse.json(resultsFor(q));
      }),
    );
    const { user, input } = await renderSearchPage();

    await user.type(input, 'react');

    expect(
      await screen.findByRole('heading', { level: 2, name: 'React Handbook' }),
    ).toBeInTheDocument();
    expect(seen).toEqual(['react']);
  });

  it('shows a loading state while the request is in flight', async () => {
    server.use(
      http.get(searchUrl, async ({ request }) => {
        await delay(100);
        return HttpResponse.json(resultsFor(queryOf(request)));
      }),
    );
    const { user, input } = await renderSearchPage();

    await user.type(input, 'mug');

    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2, name: 'Blue Mug' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('keeps the latest results when an earlier response arrives late', async () => {
    // The "re" response is held back until the test releases it, so it always lands after
    // the "react" response regardless of timing.
    let earlyRequests = 0;
    let earlyResponded = false;
    let releaseEarly: (() => void) | undefined;
    const earlyGate = new Promise<void>((resolve) => {
      releaseEarly = resolve;
    });
    server.use(
      http.get(searchUrl, async ({ request }) => {
        const q = queryOf(request);
        if (q === 're') {
          earlyRequests += 1;
          await earlyGate;
          earlyResponded = true;
        }
        return HttpResponse.json(resultsFor(q));
      }),
    );
    const { user, input } = await renderSearchPage();

    await user.type(input, 're');
    await waitFor(() => {
      expect(earlyRequests).toBe(1);
    });
    await user.type(input, 'act');

    expect(
      await screen.findByRole('heading', { level: 2, name: 'React Handbook' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Red Notebook' })).not.toBeInTheDocument();

    releaseEarly?.();
    await waitFor(() => {
      expect(earlyResponded).toBe(true);
    });
    expect(screen.getByRole('heading', { level: 2, name: 'React Handbook' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Red Notebook' })).not.toBeInTheDocument();
  });

  it('shows an alert on failure and recovers when Retry is pressed', async () => {
    server.use(
      http.get(searchUrl, () => HttpResponse.json({ message: 'boom' }, { status: 500 }), {
        once: true,
      }),
    );
    const { user, input } = await renderSearchPage();

    await user.type(input, 'react');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/something went wrong/i);

    await user.click(screen.getByRole('button', { name: /retry/i }));

    expect(
      await screen.findByRole('heading', { level: 2, name: 'React Handbook' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows "No results for \'xyz\'" when nothing matches', async () => {
    const { user, input } = await renderSearchPage();

    await user.type(input, 'xyz');

    expect(await screen.findByText("No results for 'xyz'")).toBeInTheDocument();
  });
});
