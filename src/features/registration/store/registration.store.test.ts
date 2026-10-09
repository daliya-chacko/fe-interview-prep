import { beforeEach, describe, expect, it } from 'vitest';

import {
  initialRegistrationState,
  REGISTRATION_STORAGE_KEY,
  selectDraft,
  useRegistrationStore,
} from './registration.store';

const { getState, setState } = useRegistrationStore;

const personal = { name: 'Ada Lovelace', email: 'ada@example.com', phone: '+44 20 7946 0958' };

describe('registration store', () => {
  beforeEach(() => {
    setState(initialRegistrationState);
  });

  it('starts on the personal step with an empty draft', () => {
    expect(getState().step).toBe('personal');
    expect(selectDraft(getState())).toEqual({
      personal: { name: '', email: '', phone: '' },
      address: { country: 'IN', city: '', postalCode: '' },
      preferences: { plan: null, skills: [] },
    });
  });

  it('saves a step draft without touching the others', () => {
    getState().saveDraft({ personal });

    expect(getState().personal).toEqual(personal);
    expect(getState().address).toEqual(initialRegistrationState.address);
    expect(getState().preferences).toEqual(initialRegistrationState.preferences);
  });

  it('walks forward and back through the steps and stops at both ends', () => {
    getState().back();
    expect(getState().step).toBe('personal');

    getState().next();
    expect(getState().step).toBe('address');
    getState().next();
    expect(getState().step).toBe('preferences');
    getState().next();
    expect(getState().step).toBe('review');
    getState().next();
    expect(getState().step).toBe('review');

    getState().back();
    expect(getState().step).toBe('preferences');
  });

  it('jumps to any step', () => {
    getState().goTo('review');
    expect(getState().step).toBe('review');

    getState().goTo('address');
    expect(getState().step).toBe('address');
  });

  it('resets the draft and the step', () => {
    getState().saveDraft({ personal });
    getState().goTo('review');

    getState().reset();

    expect(getState().step).toBe('personal');
    expect(getState().personal).toEqual(initialRegistrationState.personal);
  });

  it('writes the step and the draft to localStorage under a version', () => {
    getState().saveDraft({ personal });
    getState().next();

    const stored: unknown = JSON.parse(localStorage.getItem(REGISTRATION_STORAGE_KEY) ?? 'null');

    expect(stored).toEqual({
      version: 1,
      state: {
        step: 'address',
        personal,
        address: initialRegistrationState.address,
        preferences: initialRegistrationState.preferences,
      },
    });
  });

  it('restores a valid entry from localStorage and ignores a corrupt one', async () => {
    localStorage.setItem(
      REGISTRATION_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: { ...initialRegistrationState, step: 'address', personal },
      }),
    );
    await useRegistrationStore.persist.rehydrate();
    expect(getState().step).toBe('address');
    expect(getState().personal).toEqual(personal);

    setState(initialRegistrationState);
    localStorage.setItem(
      REGISTRATION_STORAGE_KEY,
      JSON.stringify({ version: 1, state: { step: 'nowhere' } }),
    );
    await useRegistrationStore.persist.rehydrate();
    expect(getState().step).toBe('personal');
  });
});
