import { Button } from '@/shared/components/ui';

export type StepActionsProps = {
  /** Omitted on the first step, which has nowhere to go back to. */
  onBack?: () => void;
  nextLabel?: string;
};

/** The Back and Next buttons under a step form; Next submits the enclosing form. */
export function StepActions({ onBack, nextLabel = 'Next' }: StepActionsProps) {
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      {onBack ? (
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
      ) : (
        <span />
      )}
      <Button type="submit">{nextLabel}</Button>
    </div>
  );
}
