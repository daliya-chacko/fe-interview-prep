import type { ComponentPropsWithRef } from 'react';

import { inputClassName } from '@/shared/components/ui';
import { cn } from '@/shared/lib/cn';

import { describedBy, errorIdOf } from './field-ids';
import { FieldError } from './FieldError';

export type SelectFieldProps = Omit<ComponentPropsWithRef<'select'>, 'id'> & {
  id: string;
  label: string;
  error?: string;
};

/** A labelled native select styled like the text inputs, with its error linked. */
export function SelectField({ id, label, error, className, children, ...props }: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, false, error !== undefined)}
        className={inputClassName(cn(error && 'ring-red-500 dark:ring-red-500', className))}
        {...props}
      >
        {children}
      </select>
      <FieldError id={errorIdOf(id)} message={error} />
    </div>
  );
}
