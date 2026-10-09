import { Spinner } from '@/shared/components/ui';

/** Shown while the first route's lazy chunk is loading, before the shell can render. */
export function HydrateFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner size="lg" label="Loading application" />
    </div>
  );
}
