import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { initialTodosState, useTodosStore } from '@/features/todos';
import { renderWithRouter } from '@/test/test-utils';

async function renderTodosPage() {
  const result = renderWithRouter({ initialEntries: ['/todos'] });
  await screen.findByRole('heading', { level: 1, name: 'Todos' });
  return result;
}

async function addTodo(user: UserEvent, title: string) {
  await user.type(screen.getByRole('textbox', { name: 'New todo' }), title);
  await user.click(screen.getByRole('button', { name: 'Add' }));
}

function visibleTitles(): string[] {
  const list = screen.queryByRole('list', { name: 'Todos' });
  if (!list) {
    return [];
  }
  return within(list)
    .getAllByRole<HTMLInputElement>('checkbox')
    .map((checkbox) => checkbox.labels?.[0]?.textContent.trim() ?? '');
}

function remainingStatus() {
  return screen.getByRole('status');
}

describe('TodosPage', () => {
  beforeEach(() => {
    useTodosStore.setState(initialTodosState);
  });

  it('is linked from the primary navigation', async () => {
    renderWithRouter({ initialEntries: ['/'] });
    await screen.findByRole('heading', { level: 1, name: /fe interview prep/i });

    const nav = screen.getByRole('navigation', { name: /primary/i });
    expect(within(nav).getByRole('link', { name: 'Todos' })).toHaveAttribute('href', '/todos');
  });

  it('adds a todo from the labelled form and clears the input', async () => {
    const { user } = await renderTodosPage();
    expect(screen.getByText(/nothing to do yet/i)).toBeInTheDocument();

    await addTodo(user, '  Buy milk  ');

    expect(visibleTitles()).toEqual(['Buy milk']);
    expect(screen.getByRole('textbox', { name: 'New todo' })).toHaveValue('');
    expect(remainingStatus()).toHaveTextContent('1 item left');
  });

  it('ignores a whitespace-only title', async () => {
    const { user } = await renderTodosPage();

    await addTodo(user, '   ');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(visibleTitles()).toEqual([]);
    expect(screen.getByText(/nothing to do yet/i)).toBeInTheDocument();
  });

  it('edits a todo inline, saving on Enter and on blur', async () => {
    const { user } = await renderTodosPage();
    await addTodo(user, 'Buy milk');

    await user.click(screen.getByRole('button', { name: 'Edit Buy milk' }));
    const editor = screen.getByRole('textbox', { name: 'Edit todo' });
    expect(editor).toHaveFocus();
    expect(editor).toHaveValue('Buy milk');

    await user.clear(editor);
    await user.type(editor, 'Buy oat milk{Enter}');
    expect(visibleTitles()).toEqual(['Buy oat milk']);
    expect(screen.queryByRole('textbox', { name: 'Edit todo' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit Buy oat milk' }));
    await user.type(screen.getByRole('textbox', { name: 'Edit todo' }), ' today');
    await user.tab();
    expect(visibleTitles()).toEqual(['Buy oat milk today']);
  });

  it('cancels an edit on Escape and ignores a blank edit', async () => {
    const { user } = await renderTodosPage();
    await addTodo(user, 'Buy milk');

    await user.click(screen.getByRole('button', { name: 'Edit Buy milk' }));
    await user.type(screen.getByRole('textbox', { name: 'Edit todo' }), ' and eggs{Escape}');
    expect(visibleTitles()).toEqual(['Buy milk']);

    await user.click(screen.getByRole('button', { name: 'Edit Buy milk' }));
    await user.clear(screen.getByRole('textbox', { name: 'Edit todo' }));
    await user.keyboard('{Enter}');
    expect(visibleTitles()).toEqual(['Buy milk']);
  });

  it('marks a todo complete or active again and updates the remaining count', async () => {
    const { user } = await renderTodosPage();
    await addTodo(user, 'Buy milk');
    await addTodo(user, 'Walk the dog');
    expect(remainingStatus()).toHaveTextContent('2 items left');

    await user.click(screen.getByRole('checkbox', { name: 'Buy milk' }));
    expect(screen.getByRole('checkbox', { name: 'Buy milk' })).toBeChecked();
    expect(remainingStatus()).toHaveTextContent('1 item left');

    await user.click(screen.getByRole('checkbox', { name: 'Buy milk' }));
    expect(screen.getByRole('checkbox', { name: 'Buy milk' })).not.toBeChecked();
    expect(remainingStatus()).toHaveTextContent('2 items left');
  });

  it('deletes a todo', async () => {
    const { user } = await renderTodosPage();
    await addTodo(user, 'Buy milk');
    await addTodo(user, 'Walk the dog');

    await user.click(screen.getByRole('button', { name: 'Delete Buy milk' }));

    expect(visibleTitles()).toEqual(['Walk the dog']);
  });

  it('filters by All, Active and Completed', async () => {
    const { user } = await renderTodosPage();
    await addTodo(user, 'Buy milk');
    await addTodo(user, 'Walk the dog');
    await user.click(screen.getByRole('checkbox', { name: 'Walk the dog' }));

    await user.click(screen.getByRole('radio', { name: 'Active' }));
    expect(screen.getByRole('radio', { name: 'Active' })).toBeChecked();
    expect(visibleTitles()).toEqual(['Buy milk']);

    await user.click(screen.getByRole('radio', { name: 'Completed' }));
    expect(visibleTitles()).toEqual(['Walk the dog']);

    await user.click(screen.getByRole('checkbox', { name: 'Walk the dog' }));
    expect(visibleTitles()).toEqual([]);
    expect(screen.getByText(/no todos match this filter/i)).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'All' }));
    expect(visibleTitles()).toEqual(['Buy milk', 'Walk the dog']);
  });

  it('clears every completed todo', async () => {
    const { user } = await renderTodosPage();
    await addTodo(user, 'Buy milk');
    await addTodo(user, 'Walk the dog');
    await addTodo(user, 'Read');
    const clearButton = screen.getByRole('button', { name: 'Clear completed' });
    expect(clearButton).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: 'Buy milk' }));
    await user.click(screen.getByRole('checkbox', { name: 'Read' }));
    expect(clearButton).toBeEnabled();

    await user.click(clearButton);

    expect(visibleTitles()).toEqual(['Walk the dog']);
    expect(clearButton).toBeDisabled();
  });

  it('keeps the todos and the selected filter across a page refresh', async () => {
    const { user, unmount } = await renderTodosPage();
    await addTodo(user, 'Buy milk');
    await addTodo(user, 'Walk the dog');
    await user.click(screen.getByRole('checkbox', { name: 'Walk the dog' }));
    await user.click(screen.getByRole('radio', { name: 'Active' }));
    unmount();

    // Simulate a refresh: the store singleton forgets everything and must read localStorage
    // again. Resetting the store also writes the empty state, so the saved entry is captured
    // first and put back before rehydration.
    const storageKey = useTodosStore.persist.getOptions().name;
    expect(storageKey).toBeDefined();
    const saved = localStorage.getItem(storageKey ?? '');
    expect(saved).not.toBeNull();
    useTodosStore.setState(initialTodosState);
    expect(useTodosStore.getState().todos).toEqual([]);
    localStorage.setItem(storageKey ?? '', saved ?? '');
    await useTodosStore.persist.rehydrate();

    await renderTodosPage();

    expect(screen.getByRole('radio', { name: 'Active' })).toBeChecked();
    expect(visibleTitles()).toEqual(['Buy milk']);
    expect(remainingStatus()).toHaveTextContent('1 item left');
  });
});
