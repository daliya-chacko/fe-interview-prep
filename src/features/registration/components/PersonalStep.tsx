import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useDraftSync } from '../hooks/useDraftSync';
import { type Personal, personalSchema, type PersonalValues } from '../model/registration.schema';
import { STEP_TITLES } from './step-labels';
import { StepActions } from './StepActions';
import { TextField } from './TextField';

export type PersonalStepProps = {
  defaultValues: PersonalValues;
  /** Called with the validated values; the form never submits while invalid. */
  onNext: (values: Personal) => void;
  /** Called on every change so the draft survives a refresh mid-step. */
  onChange?: (values: PersonalValues) => void;
};

export function PersonalStep({ defaultValues, onNext, onChange }: PersonalStepProps) {
  const {
    register,
    handleSubmit,
    subscribe,
    formState: { errors },
  } = useForm({ resolver: zodResolver(personalSchema), defaultValues });
  useDraftSync(subscribe, onChange);

  return (
    <form
      noValidate
      aria-labelledby="personal-step-title"
      onSubmit={handleSubmit((values) => {
        onNext(values);
      })}
      className="space-y-5"
    >
      <h2 id="personal-step-title" className="text-xl font-semibold">
        {STEP_TITLES.personal}
      </h2>
      <TextField
        id="personal-name"
        label="Full name"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        id="personal-email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        id="personal-phone"
        label="Phone"
        type="tel"
        autoComplete="tel"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <StepActions />
    </form>
  );
}
