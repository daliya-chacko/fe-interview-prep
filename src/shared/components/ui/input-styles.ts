import { cn } from '@/shared/lib/cn';

/** Text input styling as a class string, so native inputs outside `Input` can match it. */
export function inputClassName(className?: string): string {
  return cn(
    'h-10 w-full rounded-md bg-white px-3 text-sm text-zinc-900 ring-1 ring-zinc-300 ring-inset placeholder:text-zinc-400 disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700',
    className,
  );
}
