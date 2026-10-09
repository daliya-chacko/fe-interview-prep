import { useEffect } from 'react';
import type { FieldValues, UseFormSubscribe } from 'react-hook-form';

/**
 * Mirrors every change of a step form into the caller's draft, so a refresh in the middle of a
 * step restores what was typed and not only what was saved by Next or Back. The subscription is
 * torn down when the step unmounts or the callback changes.
 */
export function useDraftSync<TValues extends FieldValues>(
  subscribe: UseFormSubscribe<TValues>,
  onChange: ((values: TValues) => void) | undefined,
): void {
  useEffect(() => {
    if (!onChange) {
      return;
    }
    return subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        onChange(values);
      },
    });
  }, [subscribe, onChange]);
}
