import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import {
  type Address,
  addressSchema,
  type AddressValues,
  COUNTRY_CODES,
  COUNTRY_NAMES,
} from '../model/registration.schema';
import { SelectField } from './SelectField';
import { STEP_TITLES } from './step-labels';
import { StepActions } from './StepActions';
import { TextField } from './TextField';

export type AddressStepProps = {
  defaultValues: AddressValues;
  /** Called with the validated values; the form never submits while invalid. */
  onNext: (values: Address) => void;
  /** Called with whatever is currently typed, valid or not, so nothing is lost going back. */
  onBack: (values: AddressValues) => void;
};

export function AddressStep({ defaultValues, onNext, onBack }: AddressStepProps) {
  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(addressSchema), defaultValues });
  const country = useWatch({ control, name: 'country' });

  return (
    <form
      noValidate
      aria-labelledby="address-step-title"
      onSubmit={handleSubmit((values) => {
        onNext(values);
      })}
      className="space-y-5"
    >
      <h2 id="address-step-title" className="text-xl font-semibold">
        {STEP_TITLES.address}
      </h2>
      <SelectField
        id="address-country"
        label="Country"
        autoComplete="country"
        error={errors.country?.message}
        {...register('country')}
      >
        {COUNTRY_CODES.map((code) => (
          <option key={code} value={code}>
            {COUNTRY_NAMES[code]}
          </option>
        ))}
      </SelectField>
      <TextField
        id="address-city"
        label="City"
        autoComplete="address-level2"
        error={errors.city?.message}
        {...register('city')}
      />
      <TextField
        id="address-postal-code"
        label="Postal code"
        autoComplete="postal-code"
        inputMode={country === 'IN' ? 'numeric' : undefined}
        hint={country === 'IN' ? 'Six digits, e.g. 682001' : undefined}
        error={errors.postalCode?.message}
        {...register('postalCode')}
      />
      <StepActions
        onBack={() => {
          onBack(getValues());
        }}
      />
    </form>
  );
}
