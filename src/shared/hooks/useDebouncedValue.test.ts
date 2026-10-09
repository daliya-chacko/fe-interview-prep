import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 300));
    expect(result.current).toBe('a');
  });

  it('only updates after the delay has elapsed without further changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'r' },
    });

    rerender({ value: 're' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ value: 'rea' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    // 400 ms have passed, but each keystroke restarted the timer.
    expect(result.current).toBe('r');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('rea');
  });

  it('uses 300 ms by default', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe(1);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(2);
  });
});
