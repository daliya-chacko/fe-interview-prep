import type { UseMutationResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { Button, Spinner } from '@/shared/components/ui';

import type { RegistrationResponse } from '../api/registration.api';
import {
  COUNTRY_NAMES,
  PLAN_LABELS,
  type Registration,
  type RegistrationDraft,
  registrationSchema,
  type RegistrationStep,
} from '../model/registration.schema';
import { STEP_TITLES } from './step-labels';

export type ReviewStepProps = {
  draft: RegistrationDraft;
  onEdit: (step: RegistrationStep) => void;
  /** Called with the validated payload when the user confirms. */
  onSubmit: (registration: Registration) => void;
  mutation: UseMutationResult<RegistrationResponse, Error, Registration>;
};

type ReviewSectionProps = {
  step: Exclude<RegistrationStep, 'review'>;
  onEdit: (step: RegistrationStep) => void;
  children: ReactNode;
};

function ReviewSection({ step, onEdit, children }: ReviewSectionProps) {
  const title = STEP_TITLES[step];
  return (
    <section
      aria-labelledby={`review-${step}-title`}
      className="space-y-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 id={`review-${step}-title`} className="font-semibold">
          {title}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Edit ${title.toLowerCase()}`}
          onClick={() => {
            onEdit(step);
          }}
        >
          Edit
        </Button>
      </div>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

/** The step before submission: everything entered so far, with a way back into each step. */
export function ReviewStep({ draft, onEdit, onSubmit, mutation }: ReviewStepProps) {
  const parsed = registrationSchema.safeParse(draft);

  if (!parsed.success) {
    // Only reachable when a stored draft was edited outside the wizard: Next never lets an
    // invalid step through. Send the user to the first step that needs attention.
    const [firstPath] = parsed.error.issues;
    const step = firstPath?.path[0];
    const target: RegistrationStep =
      step === 'address' || step === 'preferences' ? step : 'personal';
    return (
      <div role="alert" className="space-y-3">
        <p className="text-sm">Some details are missing or invalid. Please complete every step.</p>
        <Button
          onClick={() => {
            onEdit(target);
          }}
        >
          Go to {STEP_TITLES[target].toLowerCase()}
        </Button>
      </div>
    );
  }

  const registration = parsed.data;
  const { personal, address, preferences } = registration;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{STEP_TITLES.review}</h2>

      <ReviewSection step="personal" onEdit={onEdit}>
        <Row label="Full name" value={personal.name} />
        <Row label="Email" value={personal.email} />
        <Row label="Phone" value={personal.phone} />
      </ReviewSection>

      <ReviewSection step="address" onEdit={onEdit}>
        <Row label="Country" value={COUNTRY_NAMES[address.country]} />
        <Row label="City" value={address.city} />
        <Row label="Postal code" value={address.postalCode} />
      </ReviewSection>

      <ReviewSection step="preferences" onEdit={onEdit}>
        <Row label="Plan" value={PLAN_LABELS[preferences.plan]} />
        <Row label="Skills" value={preferences.skills.join(', ')} />
      </ReviewSection>

      {mutation.isError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <span>Something went wrong while submitting. Please try again.</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onSubmit(registration);
            }}
          >
            Retry
          </Button>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          variant="secondary"
          disabled={mutation.isPending}
          onClick={() => {
            onEdit('preferences');
          }}
        >
          Back
        </Button>
        <div className="flex items-center gap-3">
          {mutation.isPending ? (
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Spinner size="sm" label="Submitting your registration" />
              <span aria-hidden="true">Submitting…</span>
            </div>
          ) : null}
          <Button
            disabled={mutation.isPending}
            onClick={() => {
              onSubmit(registration);
            }}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
