import { useSubmitRegistration } from '../api/registration.mutations';
import { useRegistrationStore } from '../store/registration.store';
import { AddressStep } from './AddressStep';
import { PersonalStep } from './PersonalStep';
import { PreferencesStep } from './PreferencesStep';
import { RegistrationSuccess } from './RegistrationSuccess';
import { ReviewStep } from './ReviewStep';
import { StepIndicator } from './StepIndicator';

/**
 * Three validated steps, a review, then a submit. The current step and every step's draft live
 * in the persisted store, so a refresh lands the user where they left off; the submission itself
 * is server state owned by the mutation.
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
          onNext={(values) => {
            saveDraft({ personal: values });
            next();
          }}
        />
      ) : null}

      {step === 'address' ? (
        <AddressStep
          defaultValues={address}
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
