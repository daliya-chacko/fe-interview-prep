import { Button } from '@/shared/components/ui';

export type LoadFailureProps = {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
};

/** Error state shared by the protected data views: an announced message with a retry. */
export function LoadFailure({ message, isRetrying, onRetry }: LoadFailureProps) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
    >
      <span>{message}</span>
      <Button variant="secondary" size="sm" isLoading={isRetrying} onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
