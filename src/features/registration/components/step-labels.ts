import type { RegistrationStep } from '../model/registration.schema';

/** Short names for the progress indicator. */
export const STEP_LABELS: Record<RegistrationStep, string> = {
  personal: 'Personal',
  address: 'Address',
  preferences: 'Preferences',
  review: 'Review',
};

/** Headings for the step panels and the review sections. */
export const STEP_TITLES: Record<RegistrationStep, string> = {
  personal: 'Personal details',
  address: 'Address',
  preferences: 'Preferences',
  review: 'Review and submit',
};
