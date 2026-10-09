import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithRouter } from '@/test/test-utils';

describe('app routes', () => {
  it('renders the home page inside the shell at the root', async () => {
    renderWithRouter({ initialEntries: ['/'] });

    expect(
      await screen.findByRole('heading', { level: 1, name: /fe interview prep/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders the route error boundary for unknown URLs', async () => {
    renderWithRouter({ initialEntries: ['/nope/nothing-here'] });

    expect(
      await screen.findByRole('heading', { level: 1, name: /page not found/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
  });
});
