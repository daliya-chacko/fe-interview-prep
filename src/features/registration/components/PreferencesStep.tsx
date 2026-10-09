import { zodResolver } from '@hookform/resolvers/zod';
import { type KeyboardEvent, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button, Input } from '@/shared/components/ui';

import { useDraftSync } from '../hooks/useDraftSync';
import {
  PLAN_LABELS,
  PLANS,
  type Preferences,
  preferencesSchema,
  type PreferencesValues,
} from '../model/registration.schema';
import { describedBy, errorIdOf } from './field-ids';
import { FieldError } from './FieldError';
import { STEP_TITLES } from './step-labels';
import { StepActions } from './StepActions';

export type PreferencesStepProps = {
  /** `plan` may be unset when the user has not picked one yet. */
  defaultValues: { plan?: PreferencesValues['plan'] | null; skills: string[] };
  /** Called with the validated values; the form never submits while invalid. */
  onNext: (values: Preferences) => void;
  /** Called with whatever is currently entered, valid or not, so nothing is lost going back. */
  onBack: (values: PreferencesValues) => void;
  /** Called on every change so the draft survives a refresh mid-step. */
  onChange?: (values: PreferencesValues) => void;
};

const PLAN_GROUP_ID = 'preferences-plan';
const SKILLS_ID = 'preferences-skills';
const NEW_SKILL_ID = 'preferences-new-skill';

export function PreferencesStep({ defaultValues, onNext, onBack, onChange }: PreferencesStepProps) {
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
    subscribe,
    formState: { errors },
  } = useForm<PreferencesValues, unknown, Preferences>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: { plan: defaultValues.plan ?? undefined, skills: defaultValues.skills },
  });
  useDraftSync(subscribe, onChange);
  const skills = useWatch({ control, name: 'skills' });
  const [newSkill, setNewSkill] = useState('');

  function addSkill() {
    const skill = newSkill.trim();
    if (skill === '') {
      return;
    }
    const exists = skills.some((item) => item.toLowerCase() === skill.toLowerCase());
    if (!exists) {
      setValue('skills', [...skills, skill], { shouldValidate: true, shouldDirty: true });
    }
    setNewSkill('');
  }

  function removeSkill(index: number) {
    setValue(
      'skills',
      skills.filter((_, position) => position !== index),
      { shouldValidate: true, shouldDirty: true },
    );
  }

  function handleSkillKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Enter adds the skill instead of submitting the step.
    if (event.key === 'Enter') {
      event.preventDefault();
      addSkill();
    }
  }

  const planError = errors.plan?.message;
  const skillsError = errors.skills?.message;

  return (
    <form
      noValidate
      aria-labelledby="preferences-step-title"
      onSubmit={handleSubmit((values) => {
        onNext(values);
      })}
      className="space-y-6"
    >
      <h2 id="preferences-step-title" className="text-xl font-semibold">
        {STEP_TITLES.preferences}
      </h2>

      <fieldset
        aria-describedby={describedBy(PLAN_GROUP_ID, false, planError !== undefined)}
        className="space-y-2"
      >
        <legend className="text-sm font-medium">Plan</legend>
        <div className="flex flex-wrap gap-4">
          {PLANS.map((plan) => (
            <div key={plan} className="flex items-center gap-2">
              <input
                id={`${PLAN_GROUP_ID}-${plan}`}
                type="radio"
                value={plan}
                className="size-4 accent-indigo-600"
                {...register('plan')}
              />
              <label htmlFor={`${PLAN_GROUP_ID}-${plan}`} className="text-sm">
                {PLAN_LABELS[plan]}
              </label>
            </div>
          ))}
        </div>
        <FieldError id={errorIdOf(PLAN_GROUP_ID)} message={planError} />
      </fieldset>

      <div className="space-y-2">
        <label htmlFor={NEW_SKILL_ID} className="block text-sm font-medium">
          Skills
        </label>
        <div className="flex gap-2">
          <Input
            id={NEW_SKILL_ID}
            value={newSkill}
            placeholder="e.g. React"
            autoComplete="off"
            aria-invalid={skillsError ? true : undefined}
            aria-describedby={describedBy(SKILLS_ID, false, skillsError !== undefined)}
            onChange={(event) => {
              setNewSkill(event.target.value);
            }}
            onKeyDown={handleSkillKeyDown}
          />
          <Button type="button" variant="secondary" onClick={addSkill}>
            Add skill
          </Button>
        </div>
        <FieldError id={errorIdOf(SKILLS_ID)} message={skillsError} />
        {skills.length > 0 ? (
          <ul aria-label="Skills" className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <li
                key={skill}
                className="flex items-center gap-1 rounded-full bg-zinc-100 py-1 pr-1 pl-3 text-sm dark:bg-zinc-800"
              >
                <span>{skill}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove ${skill}`}
                  className="h-6 rounded-full px-2"
                  onClick={() => {
                    removeSkill(index);
                  }}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No skills added yet.</p>
        )}
      </div>

      <StepActions
        onBack={() => {
          onBack(getValues());
        }}
      />
    </form>
  );
}
