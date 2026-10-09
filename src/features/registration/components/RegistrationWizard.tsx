import { useCallback } from 'react';

import { useSubmitRegistration } from '../api/registration.mutations';
import type {
  AddressValues,
  PersonalValues,
  PreferencesValues,
} from '../model/registration.schema';
import { useRegistrationStore } from '../store/registration.store';
import { AddressStep } from './AddressStep';
import { PersonalStep } from './PersonalStep';
import { PreferencesStep } from './PreferencesStep';
import { RegistrationSuccess } from './RegistrationSuccess';
import { ReviewStep } from './ReviewStep';
import { StepIndicator } from './StepIndicator';

/**
 * Three validated steps, a review, then a submit. The current step and every step's draft live
 * in the persisted store and the active step mirrors its values there as they change, so a
 * refresh lands the user where they left off with what they had typed; the submission itself is
 * server state owned by the mutation.
 */
export function RegistrationWizard() {
  const step = useRegistrationStore((state) => state.step);
  const personal = useRegistrationStore((state) => state.personal);
  const address = useRegistrationStore((state) => state.address);
  const preferences = useRegistrationStore((state) => state.preferences);
  const saveDraft = useRegistrationStore((state) => state.saveDraft);
  const next = useRegistrationStore((state) => state.next);
  const back = useRegistrationStore((state) => state.back);
  const goTo = useRegistrationStore((state) => state.goTo);
  const reset = useRegistrationStore((state) => state.reset);
  const mutation = useSubmitRegistration();

  // Stable callbacks so each step subscribes to its form once, not on every keystroke.
  const savePersonal = useCallback(
    (values: PersonalValues) => {
      saveDraft({ personal: values });
    },
    [saveDraft],
  );
  const saveAddress = useCallback(
    (values: AddressValues) => {
      saveDraft({ address: values });
    },
    [saveDraft],
  );
  const savePreferences = useCallback(
    (values: PreferencesValues) => {
      saveDraft({ preferences: values });
    },
    [saveDraft],
  );

  if (mutation.isSuccess) {
    return (
      <RegistrationSuccess
        name={mutation.variables.personal.name}
        response={mutation.data}
        onRegisterAnother={() => {
          mutation.reset();
        }}
      />
    );
  }

  return (
    <div className="max-w-xl space-y-8">
      <StepIndicator current={step} />

      {step === 'personal' ? (
        <PersonalStep
          defaultValues={personal}
          onChange={savePersonal}
          onNext={(values) => {
            saveDraft({ personal: values });
            next();
          }}
        />
      ) : null}

      {step === 'address' ? (
        <AddressStep
          defaultValues={address}
          onChange={saveAddress}
          onNext={(values) => {
            saveDraft({ address: values });
            next();
          }}
          onBack={(values) => {
            saveDraft({ address: values });
            back();
          }}
        />
      ) : null}

      {step === 'preferences' ? (
        <PreferencesStep
          defaultValues={preferences}
          onChange={savePreferences}
          onNext={(values) => {
            saveDraft({ preferences: values });
            next();
          }}
          onBack={(values) => {
            saveDraft({ preferences: values });
            back();
          }}
        />
      ) : null}

      {step === 'review' ? (
        <ReviewStep
          draft={{ personal, address, preferences }}
          onEdit={goTo}
          mutation={mutation}
          onSubmit={(registration) => {
            mutation.mutate(registration, {
              onSuccess: () => {
                reset();
              },
            });
          }}
        />
      ) : null}
    </div>
  );
}
