import { z } from 'zod';

export const COUNTRY_CODES = ['IN', 'US', 'GB', 'DE', 'AU'] as const;
export const countrySchema = z.enum(COUNTRY_CODES, { error: 'Select a country' });
export type CountryCode = z.infer<typeof countrySchema>;

export const COUNTRY_NAMES: Record<CountryCode, string> = {
  IN: 'India',
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  AU: 'Australia',
};

export const PLANS = ['free', 'pro', 'team'] as const;
export const planSchema = z.enum(PLANS, { error: 'Choose a plan' });
export type Plan = z.infer<typeof planSchema>;

export const PLAN_LABELS: Record<Plan, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
};

const INDIA_POSTAL_CODE = /^\d{6}$/;
const PHONE = /^\+?[\d\s()-]{7,20}$/;

/** Step 1: who the user is. */
export const personalSchema = z.object({
  name: z.string().trim().min(2, { error: 'Enter your full name' }),
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: 'Enter a valid email address' })),
  phone: z.string().trim().regex(PHONE, { error: 'Enter a valid phone number' }),
});

/**
 * Step 2: where the user lives. The postal code rule depends on the country, so it is checked
 * at object level where both fields are visible: India requires exactly six digits, every other
 * country accepts any non-empty value.
 */
export const addressSchema = z
  .object({
    country: countrySchema,
    city: z.string().trim().min(1, { error: 'Enter your city' }),
    postalCode: z.string().trim().min(1, { error: 'Enter your postal code' }),
  })
  .superRefine((address, ctx) => {
    if (address.country === 'IN' && !INDIA_POSTAL_CODE.test(address.postalCode)) {
      ctx.addIssue({
        code: 'custom',
        path: ['postalCode'],
        message: 'An Indian postal code is exactly six digits',
      });
    }
  });

/** Step 3: what the user wants. */
export const preferencesSchema = z.object({
  plan: planSchema,
  skills: z
    .array(z.string().trim().min(1, { error: 'A skill cannot be empty' }))
    .min(1, { error: 'Add at least one skill' }),
});

/** The payload submitted at the end of the wizard: every step, validated. */
export const registrationSchema = z.object({
  personal: personalSchema,
  address: addressSchema,
  preferences: preferencesSchema,
});

export type Personal = z.infer<typeof personalSchema>;
export type Address = z.infer<typeof addressSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type Registration = z.infer<typeof registrationSchema>;

/** What each step's form holds before validation (the schemas' input side). */
export type PersonalValues = z.input<typeof personalSchema>;
export type AddressValues = z.input<typeof addressSchema>;
export type PreferencesValues = z.input<typeof preferencesSchema>;

export const REGISTRATION_STEPS = ['personal', 'address', 'preferences', 'review'] as const;
export const registrationStepSchema = z.enum(REGISTRATION_STEPS);
export type RegistrationStep = z.infer<typeof registrationStepSchema>;

/**
 * The unvalidated draft of each step as it is kept between steps and across a page refresh.
 * It is deliberately loose (the strict rules live in the step schemas above) so that going back
 * keeps whatever the user typed, even when it is not valid yet. `plan` is nullish because an
 * untouched radio group has no value.
 */
export const registrationDraftSchema = z.object({
  personal: z.object({ name: z.string(), email: z.string(), phone: z.string() }),
  address: z.object({ country: countrySchema, city: z.string(), postalCode: z.string() }),
  preferences: z.object({ plan: planSchema.nullish(), skills: z.array(z.string()) }),
});

export type RegistrationDraft = z.infer<typeof registrationDraftSchema>;

export const emptyRegistrationDraft: RegistrationDraft = {
  personal: { name: '', email: '', phone: '' },
  address: { country: 'IN', city: '', postalCode: '' },
  preferences: { plan: null, skills: [] },
};

/** The slice of the wizard store that is written to storage and read back on load. */
export const persistedRegistrationSchema = registrationDraftSchema.extend({
  step: registrationStepSchema,
});

export type PersistedRegistration = z.infer<typeof persistedRegistrationSchema>;
