import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Highlight } from './Highlight';

describe('Highlight', () => {
  it('wraps the matched part in <mark> and leaves the rest as text', () => {
    const { container } = render(<Highlight text="React Handbook" query="React" />);

    const mark = screen.getByText('React');
    expect(mark.tagName).toBe('MARK');
    expect(container).toHaveTextContent('React Handbook');
    expect(container.querySelectorAll('mark')).toHaveLength(1);
  });

  it('matches case-insensitively and keeps the original casing', () => {
    render(<Highlight text="Reactive headphones that react" query="REACT" />);

    const marks = screen.getAllByText(/react/i, { selector: 'mark' });
    expect(marks.map((mark) => mark.textContent)).toEqual(['React', 'react']);
  });

  it('treats regex special characters in the query literally', () => {
    const { container } = render(<Highlight text="Price (USD) 10.5 vs 1035" query="(USD)" />);

    expect(screen.getByText('(USD)').tagName).toBe('MARK');
    expect(container.querySelectorAll('mark')).toHaveLength(1);

    const { container: dotted } = render(<Highlight text="10.5 vs 1035" query="10.5" />);
    expect(dotted.querySelectorAll('mark')).toHaveLength(1);
    expect(dotted.querySelector('mark')).toHaveTextContent('10.5');
  });

  it('renders no <mark> when the query is empty', () => {
    const { container } = render(<Highlight text="React Handbook" query="  " />);

    expect(container.querySelector('mark')).toBeNull();
    expect(container).toHaveTextContent('React Handbook');
  });
});
