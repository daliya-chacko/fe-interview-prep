import { cn } from '@/shared/lib/cn';

const sizeClasses = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-10 border-4',
} as const;

export type SpinnerProps = {
  size?: keyof typeof sizeClasses;
  /** Announced to assistive technology. */
  label?: string;
  className?: string;
};

export function Spinner({ size = 'md', label = 'Loading', className }: SpinnerProps) {
  return (
    <span role="status" className={cn('inline-flex items-center', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'animate-spin rounded-full border-current border-r-transparent',
          sizeClasses[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
