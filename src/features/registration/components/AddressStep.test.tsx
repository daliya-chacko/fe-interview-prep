import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { AddressValues } from '../model/registration.schema';
import { AddressStep } from './AddressStep';

const empty: AddressValues = { country: 'IN', city: '', postalCode: '' };

function renderStep(defaultValues: AddressValues = empty) {
  const onNext = vi.fn();
  const onBack = vi.fn();
  render(<AddressStep defaultValues={defaultValues} onNext={onNext} onBack={onBack} />);
  return { user: userEvent.setup(), onNext, onBack };
}

describe('AddressStep', () => {
  it('accepts an Indian postal code only when it is six digits', async () => {
    const { user, onNext } = renderStep();
    const postalCode = screen.getByRole('textbox', { name: 'Postal code' });

    await user.type(screen.getByRole('textbox', { name: 'City' }), 'Kochi');
    await user.type(postalCode, '6820');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(onNext).not.toHaveBeenCalled();
    expect(postalCode).toHaveAttribute('aria-invalid', 'true');
    expect(postalCode).toHaveAccessibleDescription(
      'Six digits, e.g. 682001 An Indian postal code is exactly six digits',
    );

    await user.type(postalCode, '01');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(onNext).toHaveBeenCalledWith({ country: 'IN', city: 'Kochi', postalCode: '682001' });
  });

  it('accepts any non-empty postal code for another country', async () => {
    const { user, onNext } = renderStep();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Country' }), 'GB');
    await user.type(screen.getByRole('textbox', { name: 'City' }), 'London');
    await user.type(screen.getByRole('textbox', { name: 'Postal code' }), 'SW1A 1AA');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(onNext).toHaveBeenCalledWith({ country: 'GB', city: 'London', postalCode: 'SW1A 1AA' });
  });

  it('shows the fields pre-filled and hands them back untouched on Back', async () => {
    const saved: AddressValues = { country: 'DE', city: 'Berlin', postalCode: '10115' };
    const { user, onBack } = renderStep(saved);

    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveValue('DE');
    expect(screen.getByRole('textbox', { name: 'City' })).toHaveValue('Berlin');

    await user.clear(screen.getByRole('textbox', { name: 'Postal code' }));
    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalledWith({ country: 'DE', city: 'Berlin', postalCode: '' });
  });
});
