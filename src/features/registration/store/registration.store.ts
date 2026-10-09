import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createValidatedStorage } from '@/shared/lib/storage';

import {
  emptyRegistrationDraft,
  type PersistedRegistration,
  persistedRegistrationSchema,
  REGISTRATION_STEPS,
  type RegistrationDraft,
  type RegistrationStep,
} from '../model/registration.schema';

export type RegistrationState = PersistedRegistration & {
  /** Merges the given step drafts into the stored ones; untouched steps are left alone. */
  saveDraft: (draft: Partial<RegistrationDraft>) => void;
  goTo: (step: RegistrationStep) => void;
  /** Moves one step forward; a no-op on the last step. */
  next: () => void;
  /** Moves one step back; a no-op on the first step. */
  back: () => void;
  /** Forgets the draft and returns to the first step (after a successful submission). */
  reset: () => void;
};

export const REGISTRATION_STORAGE_KEY = 'registration';
const REGISTRATION_STORAGE_VERSION = 1;

export const initialRegistrationState: PersistedRegistration = {
  step: 'personal',
  ...emptyRegistrationDraft,
};

function stepAt(offset: number, current: RegistrationStep): RegistrationStep {
  const index = REGISTRATION_STEPS.indexOf(current) + offset;
  return REGISTRATION_STEPS[index] ?? current;
}

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set) => ({
      ...initialRegistrationState,

      saveDraft: (draft) => {
        set(draft);
      },

      goTo: (step) => {
        set({ step });
      },

      next: () => {
        set((state) => ({ step: stepAt(1, state.step) }));
      },

      back: () => {
        set((state) => ({ step: stepAt(-1, state.step) }));
      },

      reset: () => {
        set(initialRegistrationState);
      },
    }),
    {
      name: REGISTRATION_STORAGE_KEY,
      version: REGISTRATION_STORAGE_VERSION,
      storage: createValidatedStorage({
        schema: persistedRegistrationSchema,
        version: REGISTRATION_STORAGE_VERSION,
      }),
      partialize: (state) => ({
        step: state.step,
        personal: state.personal,
        address: state.address,
        preferences: state.preferences,
      }),
    },
  ),
);

/** The draft of every step, without the navigation state. */
export function selectDraft(state: PersistedRegistration): RegistrationDraft {
  return { personal: state.personal, address: state.address, preferences: state.preferences };
}
