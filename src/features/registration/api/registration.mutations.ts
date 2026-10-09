import { useMutation } from '@tanstack/react-query';

import { submitRegistration } from './registration.api';

/** Hierarchical keys: `all` prefixes every registration mutation. */
export const registrationKeys = {
  all: ['registration'] as const,
  submit: () => [...registrationKeys.all, 'submit'] as const,
};

/**
 * Creates a registration. Nothing is read back from this resource anywhere in the app, so there
 * is no query to invalidate; the caller owns the pending, error and success presentation.
 */
export function useSubmitRegistration() {
  return useMutation({
    mutationKey: registrationKeys.submit(),
    mutationFn: submitRegistration,
  });
}
