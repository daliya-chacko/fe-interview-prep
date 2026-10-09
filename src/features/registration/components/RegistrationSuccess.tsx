import { Button } from '@/shared/components/ui';

import type { RegistrationResponse } from '../api/registration.api';

export type RegistrationSuccessProps = {
  name: string;
  response: RegistrationResponse;
  onRegisterAnother: () => void;
};

/** Shown in place of the wizard once the server has accepted the registration. */
export function RegistrationSuccess({
  name,
  response,
  onRegisterAnother,
}: RegistrationSuccessProps) {
  return (
    <div
      role="status"
      className="space-y-4 rounded-md border border-green-200 bg-green-50 px-5 py-6 dark:border-green-900 dark:bg-green-950"
    >
      <h2 className="text-xl font-semibold text-green-900 dark:text-green-100">
        You are registered, {name}
      </h2>
      <p className="text-sm text-green-900 dark:text-green-100">
        A confirmation is on its way to {response.email}. Your registration id is {response.id}.
      </p>
      <Button variant="secondary" onClick={onRegisterAnother}>
        Register another person
      </Button>
    </div>
  );
}
