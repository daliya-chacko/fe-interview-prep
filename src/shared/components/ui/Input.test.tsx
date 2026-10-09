import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from './Input';

describe('Input', () => {
  it('renders a text input reachable by its label', () => {
    render(
      <>
        <label htmlFor="name">Name</label>
        <Input id="name" />
      </>,
    );

    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveAttribute('type', 'text');
  });

  it('merges extra classes with the base styling', () => {
    render(<Input aria-label="Search" className="w-32" />);

    const input = screen.getByRole('textbox', { name: 'Search' });
    expect(input).toHaveClass('w-32', 'rounded-md');
    expect(input).not.toHaveClass('w-full');
  });
});
