import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createValidatedStorage } from '@/shared/lib/storage';

import {
  type PersistedTodos,
  persistedTodosSchema,
  type Todo,
  type TodoFilter,
} from '../model/todo.schema';

export type TodosState = PersistedTodos & {
  /** Adds a todo; a title that is empty after trimming is ignored. */
  addTodo: (title: string) => void;
  /** Renames a todo; a title that is empty after trimming leaves it unchanged. */
  updateTitle: (id: string, title: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  clearCompleted: () => void;
  setFilter: (filter: TodoFilter) => void;
};

export const TODOS_STORAGE_KEY = 'todos';
const TODOS_STORAGE_VERSION = 1;

export const initialTodosState: PersistedTodos = { todos: [], filter: 'All' };

function createTodo(title: string): Todo {
  return { id: crypto.randomUUID(), title, completed: false, createdAt: Date.now() };
}

export const useTodosStore = create<TodosState>()(
  persist(
    (set) => ({
      ...initialTodosState,

      addTodo: (title) => {
        const trimmed = title.trim();
        if (trimmed === '') {
          return;
        }
        set((state) => ({ todos: [...state.todos, createTodo(trimmed)] }));
      },

      updateTitle: (id, title) => {
        const trimmed = title.trim();
        if (trimmed === '') {
          return;
        }
        set((state) => ({
          todos: state.todos.map((todo) => (todo.id === id ? { ...todo, title: trimmed } : todo)),
        }));
      },

      toggleTodo: (id) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo,
          ),
        }));
      },

      removeTodo: (id) => {
        set((state) => ({ todos: state.todos.filter((todo) => todo.id !== id) }));
      },

      clearCompleted: () => {
        set((state) => ({ todos: state.todos.filter((todo) => !todo.completed) }));
      },

      setFilter: (filter) => {
        set({ filter });
      },
    }),
    {
      name: TODOS_STORAGE_KEY,
      version: TODOS_STORAGE_VERSION,
      storage: createValidatedStorage({
        schema: persistedTodosSchema,
        version: TODOS_STORAGE_VERSION,
      }),
      partialize: (state) => ({ todos: state.todos, filter: state.filter }),
    },
  ),
);

export function filterTodos(todos: readonly Todo[], filter: TodoFilter): Todo[] {
  switch (filter) {
    case 'Active':
      return todos.filter((todo) => !todo.completed);
    case 'Completed':
      return todos.filter((todo) => todo.completed);
    case 'All':
      return [...todos];
  }
}

/** Todos that match the current filter. Pair with `useShallow` when used as a hook selector. */
export function selectVisibleTodos(state: PersistedTodos): Todo[] {
  return filterTodos(state.todos, state.filter);
}

export function selectRemainingCount(state: PersistedTodos): number {
  return state.todos.filter((todo) => !todo.completed).length;
}

export function selectCompletedCount(state: PersistedTodos): number {
  return state.todos.filter((todo) => todo.completed).length;
}
