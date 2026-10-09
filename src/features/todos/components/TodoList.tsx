import { useShallow } from 'zustand/react/shallow';

import { selectVisibleTodos, useTodosStore } from '../store/todos.store';
import { TodoItem } from './TodoItem';

export function TodoList() {
  const todos = useTodosStore(useShallow(selectVisibleTodos));
  const hasAnyTodo = useTodosStore((state) => state.todos.length > 0);

  if (todos.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {hasAnyTodo ? 'No todos match this filter.' : 'Nothing to do yet. Add your first todo.'}
      </p>
    );
  }

  return (
    <ul aria-label="Todos" className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
