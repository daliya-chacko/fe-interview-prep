import { beforeEach, describe, expect, it } from 'vitest';

import {
  initialTodosState,
  selectCompletedCount,
  selectRemainingCount,
  selectVisibleTodos,
  TODOS_STORAGE_KEY,
  useTodosStore,
} from './todos.store';

const { getState, setState } = useTodosStore;

function titles() {
  return getState().todos.map((todo) => todo.title);
}

function idOf(title: string): string {
  const todo = getState().todos.find((item) => item.title === title);
  if (!todo) {
    throw new Error(`No todo titled "${title}"`);
  }
  return todo.id;
}

describe('todos store', () => {
  beforeEach(() => {
    setState(initialTodosState);
  });

  it('adds a todo with a trimmed title and a unique id', () => {
    getState().addTodo('  Buy milk  ');
    getState().addTodo('Buy milk');

    const [first, second] = getState().todos;
    expect(titles()).toEqual(['Buy milk', 'Buy milk']);
    expect(first?.completed).toBe(false);
    expect(first?.id).not.toBe(second?.id);
  });

  it('ignores empty and whitespace-only titles', () => {
    getState().addTodo('');
    getState().addTodo('   ');
    getState().addTodo('\t\n');

    expect(getState().todos).toEqual([]);
  });

  it('updates a title and ignores a blank replacement', () => {
    getState().addTodo('Draft');
    const id = idOf('Draft');

    getState().updateTitle(id, '  Final  ');
    expect(titles()).toEqual(['Final']);

    getState().updateTitle(id, '   ');
    expect(titles()).toEqual(['Final']);

    getState().updateTitle('missing', 'Other');
    expect(titles()).toEqual(['Final']);
  });

  it('toggles completion', () => {
    getState().addTodo('Walk');
    const id = idOf('Walk');

    getState().toggleTodo(id);
    expect(getState().todos[0]?.completed).toBe(true);

    getState().toggleTodo(id);
    expect(getState().todos[0]?.completed).toBe(false);
  });

  it('removes a todo by id', () => {
    getState().addTodo('One');
    getState().addTodo('Two');

    getState().removeTodo(idOf('One'));

    expect(titles()).toEqual(['Two']);
  });

  it('clears every completed todo', () => {
    getState().addTodo('One');
    getState().addTodo('Two');
    getState().addTodo('Three');
    getState().toggleTodo(idOf('One'));
    getState().toggleTodo(idOf('Three'));

    getState().clearCompleted();

    expect(titles()).toEqual(['Two']);
  });

  it('sets the filter', () => {
    getState().setFilter('Completed');

    expect(getState().filter).toBe('Completed');
  });

  it('selects visible todos and counts by the current filter', () => {
    getState().addTodo('One');
    getState().addTodo('Two');
    getState().addTodo('Three');
    getState().toggleTodo(idOf('Two'));

    const visibleTitles = () => selectVisibleTodos(getState()).map((todo) => todo.title);

    expect(visibleTitles()).toEqual(['One', 'Two', 'Three']);
    getState().setFilter('Active');
    expect(visibleTitles()).toEqual(['One', 'Three']);
    getState().setFilter('Completed');
    expect(visibleTitles()).toEqual(['Two']);

    expect(selectRemainingCount(getState())).toBe(2);
    expect(selectCompletedCount(getState())).toBe(1);
  });

  it('writes only todos and filter to localStorage under a version', () => {
    getState().addTodo('Persist me');
    getState().setFilter('Active');

    const stored: unknown = JSON.parse(localStorage.getItem(TODOS_STORAGE_KEY) ?? 'null');

    expect(stored).toEqual({
      version: 1,
      state: { todos: getState().todos, filter: 'Active' },
    });
  });
});
