import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PreferencesStep } from './PreferencesStep';

function renderStep(skills: string[] = []) {
  const onNext = vi.fn();
  const onBack = vi.fn();
  render(
    <PreferencesStep defaultValues={{ plan: null, skills }} onNext={onNext} onBack={onBack} />,
  );
  return { user: userEvent.setup(), onNext, onBack };
}

function skillNames(): string[] {
  const list = screen.queryByRole('list', { name: 'Skills' });
  return list
    ? within(list)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    : [];
}

describe('PreferencesStep', () => {
  it('blocks Next until a plan is chosen and a skill is added, linking each error', async () => {
    const { user, onNext } = renderStep();

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(onNext).not.toHaveBeenCalled();
    expect(screen.getByText('Choose a plan')).toBeInTheDocument();
    const skillInput = screen.getByRole('textbox', { name: 'Skills' });
    expect(skillInput).toHaveAccessibleDescription('Add at least one skill');
    expect(skillInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('group', { name: 'Plan' })).toHaveAccessibleDescription(
      'Choose a plan',
    );
  });

  it('adds skills with the button or Enter, ignores duplicates and removes them again', async () => {
    const { user } = renderStep();
    const skillInput = screen.getByRole('textbox', { name: 'Skills' });

    await user.type(skillInput, '  React ');
    await user.click(screen.getByRole('button', { name: 'Add skill' }));
    await user.type(skillInput, 'TypeScript{Enter}');
    await user.type(skillInput, 'react{Enter}');

    expect(skillNames()).toEqual(['ReactRemove', 'TypeScriptRemove']);
    expect(skillInput).toHaveValue('');

    await user.click(screen.getByRole('button', { name: 'Remove React' }));

    expect(skillNames()).toEqual(['TypeScriptRemove']);
  });

  it('submits the chosen plan and skills', async () => {
    const { user, onNext } = renderStep(['React']);

    await user.click(screen.getByRole('radio', { name: 'Pro' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(onNext).toHaveBeenCalledWith({ plan: 'pro', skills: ['React'] });
  });

  it('hands the current values to Back even when the step is incomplete', async () => {
    const { user, onBack, onNext } = renderStep();

    await user.type(screen.getByRole('textbox', { name: 'Skills' }), 'CSS{Enter}');
    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(onNext).not.toHaveBeenCalled();
    expect(onBack).toHaveBeenCalledWith(expect.objectContaining({ skills: ['CSS'] }));
  });
});
