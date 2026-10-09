import { cn } from '@/shared/lib/cn';

import { REGISTRATION_STEPS, type RegistrationStep } from '../model/registration.schema';
import { STEP_LABELS } from './step-labels';

export type StepIndicatorProps = {
  current: RegistrationStep;
};

/** Ordered list of steps; the current one carries `aria-current="step"`. */
export function StepIndicator({ current }: StepIndicatorProps) {
  const currentIndex = REGISTRATION_STEPS.indexOf(current);

  return (
    <ol aria-label="Progress" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      {REGISTRATION_STEPS.map((step, index) => {
        const isCurrent = step === current;
        const isDone = index < currentIndex;
        return (
          <li
            key={step}
            aria-current={isCurrent ? 'step' : undefined}
            className={cn(
              'flex items-center gap-2',
              isCurrent
                ? 'font-semibold text-indigo-700 dark:text-indigo-300'
                : 'text-zinc-500 dark:text-zinc-400',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'inline-flex size-6 items-center justify-center rounded-full text-xs font-medium ring-1 ring-inset',
                isCurrent && 'bg-indigo-600 text-white ring-indigo-600',
                isDone && 'bg-indigo-100 text-indigo-700 ring-indigo-200',
                !isCurrent && !isDone && 'ring-zinc-300 dark:ring-zinc-700',
              )}
            >
              {index + 1}
            </span>
            <span>
              <span className="sr-only">Step {index + 1}: </span>
              {STEP_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
