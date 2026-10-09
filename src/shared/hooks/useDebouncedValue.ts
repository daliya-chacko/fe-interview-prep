import { useEffect, useState } from 'react';

/**
 * Returns `value` once it has stayed unchanged for `delayMs`. Each change restarts the timer,
 * so rapid updates (typing) settle into a single trailing emission.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debounced;
}
