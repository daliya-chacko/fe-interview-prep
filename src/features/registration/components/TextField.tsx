import { Input, type InputProps } from '@/shared/components/ui';
import { cn } from '@/shared/lib/cn';

import { describedBy, errorIdOf, hintIdOf } from './field-ids';
import { FieldError } from './FieldError';

export type TextFieldProps = Omit<InputProps, 'id'> & {
  id: string;
  label: string;
  /** Guidance shown under the label, e.g. the format a value must follow. */
  hint?: string;
  error?: string;
};

/** A labelled text input whose hint and error are linked through `aria-describedby`. */
export function TextField({ id, label, hint, error, className, ...props }: TextFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {hint ? (
        <p id={hintIdOf(id)} className="text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      ) : null}
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint !== undefined, error !== undefined)}
        className={cn(error && 'ring-red-500 dark:ring-red-500', className)}
        {...props}
      />
      <FieldError id={errorIdOf(id)} message={error} />
    </div>
  );
}
